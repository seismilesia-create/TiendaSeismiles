'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateVariantStock } from '@/features/shop/services/inventory'
import { backInStockEmail } from '@/lib/email/seismiles-templates'

export async function updateStockAction(
  varianteId: string,
  newStock: number
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  if (newStock < 0 || !Number.isInteger(newStock)) {
    return { error: 'El stock debe ser un numero entero >= 0' }
  }

  try {
    const { oldStock } = await updateVariantStock(varianteId, newStock)

    revalidatePath('/admin/inventario')
    revalidatePath('/admin/dashboard')
    revalidatePath('/catalogo')

    // Detect restocking: was 0, now > 0 → notify subscribers
    if (oldStock === 0 && newStock > 0) {
      const supabase = createServiceClient()
      const { data: variant } = await supabase
        .from('variantes')
        .select('producto_id, color_id, talle')
        .eq('id', varianteId)
        .single()

      if (variant) {
        notifyBackInStockForVariant(
          variant.producto_id,
          variant.color_id,
          variant.talle
        ).catch((err) =>
          console.error('Error sending back-in-stock emails:', err)
        )
      }
    }

    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

async function notifyBackInStockForVariant(
  productoId: string,
  colorId: string,
  talle: string
): Promise<void> {
  const supabase = createServiceClient()

  const { data: product } = await supabase
    .from('productos')
    .select('nombre, slug')
    .eq('id', productoId)
    .single()
  if (!product) return

  const { data: color } = await supabase
    .from('colores')
    .select('nombre, hex')
    .eq('id', colorId)
    .single()
  if (!color) return

  const { data: subscribers } = await supabase
    .from('stock_notifications')
    .select('id, email')
    .eq('producto_id', productoId)
    .eq('color_id', colorId)
    .eq('talle', talle)
    .eq('notificado', false)

  if (!subscribers || subscribers.length === 0) return

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'SEISMILES <onboarding@resend.dev>'

    const html = backInStockEmail({
      productName: product.nombre,
      talle,
      colorName: color.nombre,
      colorHex: color.hex,
      productSlug: product.slug,
      siteUrl,
    })

    for (const sub of subscribers) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: sub.email,
          subject: `Ya hay stock de ${product.nombre} en talle ${talle}`,
          html,
        })
      } catch (emailErr) {
        console.error(`Error sending to ${sub.email}:`, emailErr)
      }
    }
  }

  const ids = subscribers.map((s) => s.id)
  await supabase
    .from('stock_notifications')
    .update({ notificado: true, notificado_at: new Date().toISOString() })
    .in('id', ids)
}
