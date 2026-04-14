'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stockNotificationConfirmEmail, adminStockDigestEmail } from '@/lib/email/seismiles-templates'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribeToStock(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const productoId = formData.get('producto_id') as string
  const talle = formData.get('talle') as string
  const colorId = formData.get('color_id') as string
  const productName = formData.get('product_name') as string
  const colorName = formData.get('color_name') as string
  const colorHex = formData.get('color_hex') as string

  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: 'Ingresá un email válido.' }
  }

  if (!productoId || !talle || !colorId) {
    return { error: 'Faltan datos del producto.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('stock_notifications')
    .insert({
      email,
      producto_id: productoId,
      talle,
      color_id: colorId,
    })

  if (error) {
    if (error.code === '23505') {
      // Duplicate — check if the old record was already notified and can be re-activated
      const service = createServiceClient()
      const { data: existing } = await service
        .from('stock_notifications')
        .select('id, notificado')
        .eq('email', email)
        .eq('producto_id', productoId)
        .eq('talle', talle)
        .eq('color_id', colorId)
        .single()

      if (existing?.notificado) {
        // Reset: re-subscribe for the next restock cycle
        await service
          .from('stock_notifications')
          .update({ notificado: false, notificado_at: null })
          .eq('id', existing.id)
        // Continue to send emails below
      } else {
        return { error: 'Ya estas suscrito para este talle. Te avisaremos cuando haya stock.' }
      }
    } else {
      return { error: 'No se pudo registrar. Intenta de nuevo.' }
    }
  }

  // Send emails via Resend
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'SEISMILES Textil <onboarding@resend.dev>'

    // 1. Confirmation to customer
    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Te avisaremos cuando haya stock — ${productName}`,
        html: stockNotificationConfirmEmail({
          productName,
          talle,
          colorName,
          colorHex,
        }),
      })
    } catch (emailError) {
      console.error('Error sending stock notification email:', emailError)
    }

    // 2. Admin digest: send every 5 pending requests
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (adminEmail) {
      const service = createServiceClient()
      const { count } = await service
        .from('stock_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('notificado', false)

      if (count && count % 5 === 0) {
        // Fetch grouped demand for the digest
        const { data: pending } = await service
          .from('stock_notifications')
          .select('producto_id, talle, color_id, productos(nombre), colores(nombre, hex)')
          .eq('notificado', false)

        type PJoin = { nombre: string }
        type CJoin = { nombre: string; hex: string }

        const grouped = new Map<string, { productName: string; talle: string; colorName: string; colorHex: string; count: number }>()
        for (const row of pending ?? []) {
          const key = `${row.producto_id}-${row.talle}-${row.color_id}`
          const p = row.productos as unknown as PJoin
          const c = row.colores as unknown as CJoin
          const existing = grouped.get(key)
          if (existing) {
            existing.count += 1
          } else {
            grouped.set(key, {
              productName: p?.nombre ?? 'Eliminado',
              talle: row.talle,
              colorName: c?.nombre ?? '',
              colorHex: c?.hex ?? '#ccc',
              count: 1,
            })
          }
        }

        const items = Array.from(grouped.values()).sort((a, b) => b.count - a.count).slice(0, 10)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        try {
          await resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `${count} clientes esperando stock — SEISMILES`,
            html: adminStockDigestEmail({ totalPending: count, items, siteUrl }),
          })
        } catch (digestErr) {
          console.error('Error sending admin stock digest:', digestErr)
        }
      }
    }
  }

  return { success: true }
}
