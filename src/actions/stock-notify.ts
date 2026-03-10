'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stockNotificationConfirmEmail } from '@/lib/email/seismiles-templates'

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
    return { error: 'Ingresa un email valido.' }
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
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Seismiles Textil <onboarding@resend.dev>'

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

    // Admin stock requests are managed from the admin dashboard
  }

  return { success: true }
}
