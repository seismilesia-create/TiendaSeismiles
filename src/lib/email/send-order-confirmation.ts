import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { orderConfirmationEmail } from '@/lib/email/seismiles-templates'

/**
 * Sends order confirmation emails for the given order numbers.
 * Call this after a payment is confirmed (from confirmPayment or webhook).
 * Errors are logged but never thrown — email failure should not break the checkout flow.
 */
export async function sendOrderConfirmationEmails(orderNumbers: string[]): Promise<void> {
  console.log('[order-email] fn entered with orders:', orderNumbers)
  console.log('[order-email] env check - has RESEND_API_KEY:', !!process.env.RESEND_API_KEY, 'has RESEND_FROM_EMAIL:', !!process.env.RESEND_FROM_EMAIL)
  try {
    const service = createServiceClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data: orders, error: fetchError } = await service
      .from('compras')
      .select(
        'numero_pedido, cantidad, precio_unitario, total, metodo_pago, user_id, variante_id, productos(nombre), profiles(email, full_name)'
      )
      .in('numero_pedido', orderNumbers)

    if (fetchError) console.error('[order-email] fetch error:', fetchError)
    console.log('[order-email] orders fetched:', orders?.length ?? 0)
    if (!orders?.length) return

    // Fetch variant details (talle + color) for each order
    const variantIds = orders
      .map((o) => o.variante_id)
      .filter(Boolean) as string[]

    let variantMap = new Map<string, { talle: string; color_nombre: string; color_hex: string }>()

    if (variantIds.length > 0) {
      const { data: variants } = await service
        .from('variantes')
        .select('id, talle, colores(nombre, hex)')
        .in('id', variantIds)

      if (variants) {
        for (const v of variants) {
          const color = v.colores as unknown as { nombre: string; hex: string } | null
          variantMap.set(v.id, {
            talle: v.talle,
            color_nombre: color?.nombre ?? '',
            color_hex: color?.hex ?? '#ccc',
          })
        }
      }
    }

    const resend = getResend()

    for (const order of orders) {
      const profile = order.profiles as unknown as { email: string; full_name: string | null } | null
      const producto = order.productos as unknown as { nombre: string } | null
      const variant = order.variante_id ? variantMap.get(order.variante_id) : null

      if (!profile?.email) continue

      const html = orderConfirmationEmail({
        customerName: profile.full_name,
        numeroPedido: order.numero_pedido,
        productName: producto?.nombre ?? 'Producto',
        talle: variant?.talle ?? null,
        colorName: variant?.color_nombre ?? null,
        colorHex: variant?.color_hex ?? null,
        cantidad: order.cantidad,
        precioUnitario: Number(order.precio_unitario),
        total: Number(order.total),
        metodoPago: order.metodo_pago ?? 'mercadopago',
        siteUrl,
      })

      console.log('[order-email] Sending to:', profile.email, 'from:', EMAIL_CONFIG.from, 'orden:', order.numero_pedido)
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: profile.email,
        subject: `Pedido ${order.numero_pedido} confirmado — SEISMILES Textil`,
        html,
      })

      if (result.error) {
        console.error('[order-email] Resend returned error:', JSON.stringify(result.error))
      } else {
        console.log('[order-email] Sent ok, id:', result.data?.id)
      }
    }
  } catch (err) {
    // Log but don't throw — email should never break checkout
    console.error('[order-email] Exception:', err)
  }
}
