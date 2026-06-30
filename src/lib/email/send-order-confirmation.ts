import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import {
  orderConfirmationEmail,
  orderPendingPaymentEmail,
  type OrderEmailItem,
} from '@/lib/email/seismiles-templates'

interface SendOrderEmailOptions {
  /** When true, sends the "pedido registrado, completá tu pago" email with
   * offline payment instructions (efectivo/transferencia) instead of the
   * "pedido confirmado" one. Used at checkout time for offline methods. */
  pending?: boolean
}

interface GcApplied {
  id: string
  descuento: number
}

interface CompraRow {
  numero_pedido: string
  compra_grupo: string | null
  cantidad: number
  precio_unitario: number | string
  total: number | string
  metodo_pago: string | null
  costo_envio: number | string | null
  cupon_descuento: number | string | null
  gift_cards_applied: GcApplied[] | null
  user_id: string | null
  variante_id: string | null
  productos: { nombre: string } | null
  profiles: { email: string; full_name: string | null } | null
}

/**
 * Sends ONE confirmation (or pending-payment) email per PURCHASE for the given
 * order numbers. A purchase groups all `compras` rows that share a
 * `compra_grupo` (one row per product). Call the default after a payment is
 * confirmed (confirmPayment / webhook / admin); call with { pending: true } at
 * checkout for offline methods.
 *
 * The caller may pass a single numero_pedido (e.g. the admin confirming one
 * product row) — we expand it to its full group so the customer still gets a
 * single email covering the whole purchase. Idempotency (not sending twice for
 * the same purchase) is the CALLER's responsibility; see admin-orders.ts.
 *
 * Errors are logged but never thrown — email failure should not break checkout.
 */
export async function sendOrderConfirmationEmails(
  orderNumbers: string[],
  options?: SendOrderEmailOptions,
): Promise<void> {
  const pending = options?.pending === true
  try {
    const service = createServiceClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const SELECT =
      'numero_pedido, compra_grupo, cantidad, precio_unitario, total, metodo_pago, costo_envio, cupon_descuento, gift_cards_applied, user_id, variante_id, productos(nombre), profiles(email, full_name)'

    // 1. Fetch the rows we were given, then expand to the full purchase group:
    //    a caller may pass only one numero_pedido but we want to email the whole
    //    purchase. Rows without a compra_grupo (legacy) are kept as-is.
    const { data: seedRows } = await service
      .from('compras')
      .select(SELECT)
      .in('numero_pedido', orderNumbers)

    if (!seedRows?.length) return

    const grupos = Array.from(
      new Set(
        (seedRows as unknown as CompraRow[])
          .map((r) => r.compra_grupo)
          .filter((g): g is string => Boolean(g)),
      ),
    )

    let rows = seedRows as unknown as CompraRow[]
    if (grupos.length > 0) {
      const { data: groupRows } = await service
        .from('compras')
        .select(SELECT)
        .in('compra_grupo', grupos)
      if (groupRows?.length) {
        // Merge: group rows + any seed rows without a grupo (legacy), deduped.
        const byKey = new Map<string, CompraRow>()
        for (const r of groupRows as unknown as CompraRow[]) byKey.set(r.numero_pedido, r)
        for (const r of rows) if (!r.compra_grupo) byKey.set(r.numero_pedido, r)
        rows = Array.from(byKey.values())
      }
    }

    // 2. Group rows into purchases. Legacy rows (no compra_grupo) fall back to
    //    their own numero_pedido → one email per row, the old behaviour.
    const purchases = new Map<string, CompraRow[]>()
    for (const r of rows) {
      const key = r.compra_grupo ?? r.numero_pedido
      const arr = purchases.get(key) ?? []
      arr.push(r)
      purchases.set(key, arr)
    }

    // 3. Variant details (talle + color) for every row, in one query.
    const variantIds = rows.map((r) => r.variante_id).filter(Boolean) as string[]
    const variantMap = new Map<string, { talle: string; color_nombre: string; color_hex: string }>()
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

    // 4. One magic sign-in link per guest user (last_sign_in_at IS NULL).
    //    Supabase invalidates prior tokens on each generateLink call, so we
    //    issue at most one per user.
    const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean) as string[]))
    const magicLinkByUser = new Map<string, string>()
    for (const uid of userIds) {
      const { data: userResp } = await service.auth.admin.getUserById(uid)
      const u = userResp?.user
      if (!u || u.last_sign_in_at || !u.email) continue
      const { data: linkResp, error: linkErr } = await service.auth.admin.generateLink({
        type: 'magiclink',
        email: u.email,
        options: { redirectTo: `${siteUrl}/auth/callback?next=/perfil` },
      })
      if (linkErr) {
        console.error('[order-confirmation] generateLink failed for', uid, linkErr)
        continue
      }
      const link = linkResp?.properties?.action_link
      if (link) magicLinkByUser.set(uid, link)
    }

    const resend = getResend()

    // 5. One email per purchase group.
    for (const [grupo, groupRows] of purchases) {
      const first = groupRows[0]
      const profile = first.profiles
      if (!profile?.email) continue

      const items: OrderEmailItem[] = groupRows.map((r) => {
        const variant = r.variante_id ? variantMap.get(r.variante_id) : null
        return {
          productName: r.productos?.nombre ?? 'Producto',
          talle: variant?.talle ?? null,
          colorName: variant?.color_nombre ?? null,
          colorHex: variant?.color_hex ?? null,
          cantidad: r.cantidad,
          precioUnitario: Number(r.precio_unitario),
          total: Number(r.total),
        }
      })

      // Reconstruct the real paid amount. cupon_descuento, costo_envio and
      // gift_cards_applied are checkout-level values stored identically on every
      // row of the purchase, so read them from the first row (NOT summed).
      const subtotalProductos = groupRows.reduce((s, r) => s + Number(r.total), 0)
      const cupon = Number(first.cupon_descuento ?? 0)
      const gc = (first.gift_cards_applied ?? []).reduce((s, g) => s + Number(g.descuento), 0)
      const costoEnvio = Number(first.costo_envio ?? 0)
      const descuentos = cupon + gc
      const total = subtotalProductos - descuentos + costoEnvio

      // Display number: the grouped code when present, else the single
      // numero_pedido (legacy purchases).
      const numeroCompra = first.compra_grupo ?? first.numero_pedido

      const emailData = {
        customerName: profile.full_name,
        numeroCompra,
        items,
        subtotalProductos,
        descuentos,
        costoEnvio,
        total,
        metodoPago: first.metodo_pago ?? 'mercadopago',
        siteUrl,
        magicLink: first.user_id ? magicLinkByUser.get(first.user_id) ?? null : null,
      }

      const html = pending ? orderPendingPaymentEmail(emailData) : orderConfirmationEmail(emailData)
      const subject = pending
        ? `Compra ${numeroCompra} registrada — completá tu pago — SEISMILES`
        : `Compra ${numeroCompra} confirmada — SEISMILES`

      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: profile.email,
        subject,
        html,
      })

      if (result.error) {
        console.error('Resend error for purchase', grupo, ':', result.error)
      }
    }
  } catch (err) {
    // Log but don't throw — email should never break checkout
    console.error('Error sending order confirmation emails:', err)
  }
}
