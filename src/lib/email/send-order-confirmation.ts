import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { orderConfirmationEmail } from '@/lib/email/seismiles-templates'

/**
 * Sends order confirmation emails for the given order numbers.
 * Call this after a payment is confirmed (from confirmPayment or webhook).
 * Errors are logged but never thrown — email failure should not break the checkout flow.
 */
export async function sendOrderConfirmationEmails(orderNumbers: string[]): Promise<void> {
  try {
    const service = createServiceClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data: orders } = await service
      .from('compras')
      .select(
        'numero_pedido, cantidad, precio_unitario, total, metodo_pago, user_id, variante_id, productos(nombre), profiles(email, full_name)'
      )
      .in('numero_pedido', orderNumbers)

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

    // Detect guest checkouts and generate one-click sign-in links. A
    // "guest" here is a user who never completed an interactive sign-in,
    // i.e. last_sign_in_at IS NULL. We generate one magic link per unique
    // user (not per order) — Supabase invalidates previously-issued tokens
    // on each generateLink call, so issuing N links for one user inside a
    // loop would only leave the last one usable.
    const userIds = Array.from(new Set(orders.map((o) => o.user_id).filter(Boolean) as string[]))
    const magicLinkByUser = new Map<string, string>()
    for (const uid of userIds) {
      const { data: userResp } = await service.auth.admin.getUserById(uid)
      const u = userResp?.user
      if (!u || u.last_sign_in_at) continue
      if (!u.email) continue

      const { data: linkResp, error: linkErr } = await service.auth.admin.generateLink({
        type: 'magiclink',
        email: u.email,
        options: {
          // Land them on /perfil (the orders list) — they may have multiple
          // compras rows from this checkout, so pointing at one specific
          // order would be arbitrary.
          redirectTo: `${siteUrl}/auth/callback?next=/perfil`,
        },
      })
      if (linkErr) {
        console.error('[order-confirmation] generateLink failed for', uid, linkErr)
        continue
      }
      const link = linkResp?.properties?.action_link
      if (link) magicLinkByUser.set(uid, link)
    }

    const resend = getResend()

    for (const order of orders) {
      const profile = order.profiles as unknown as { email: string; full_name: string | null } | null
      const producto = order.productos as unknown as { nombre: string } | null
      const variant = order.variante_id ? variantMap.get(order.variante_id) : null

      if (!profile?.email) continue

      const magicLink = order.user_id ? magicLinkByUser.get(order.user_id) ?? null : null

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
        magicLink,
      })

      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: profile.email,
        subject: `Pedido ${order.numero_pedido} confirmado — SEISMILES`,
        html,
      })

      if (result.error) {
        console.error('Resend error for order', order.numero_pedido, ':', result.error)
      }
    }
  } catch (err) {
    // Log but don't throw — email should never break checkout
    console.error('Error sending order confirmation emails:', err)
  }
}
