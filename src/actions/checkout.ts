'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { mpPreference, mpPayment } from '@/lib/mercadopago'
import { sendOrderConfirmationEmails } from '@/lib/email/send-order-confirmation'
import { markAbandonedCartConverted } from '@/actions/abandoned-cart'
import { SHIPPING_OPTIONS, isValidShippingMethod, type ShippingMethod } from '@/lib/shipping'
import { shopConfig } from '@/features/shop/config'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

interface CheckoutItem {
  variantId: string
  productId: string
  productName: string
  cantidad: number
  precio: number
  /**
   * Si está seteado, el cliente declara que este item fue agregado vía una
   * regla de cross-sell y debería recibir el descuento correspondiente. El
   * servidor re-valida contra shopConfig.crossSellRules y contra el resto
   * del carrito antes de aplicar el descuento.
   */
  crossSellRuleId?: string
}

export interface CheckoutShipping {
  method: ShippingMethod
  address?: string
}

interface CheckoutResult {
  initPoint?: string
  externalRef?: string
  directConfirm?: boolean
  error?: string
}

interface GcApplied {
  id: string
  descuento: number
}

/**
 * Atomically deduct a gift card balance. Returns true on success. Fails (and
 * returns false) if the card is inactive or has insufficient balance — this
 * is the race-safe replacement for the previous read-modify-write pattern.
 */
async function deductGiftCard(
  service: ReturnType<typeof createServiceClient>,
  gcId: string,
  amount: number,
): Promise<boolean> {
  const { data } = await service.rpc('deduct_gift_card', {
    p_gc_id: gcId,
    p_amount: amount,
  })
  return (data as { ok?: boolean } | null)?.ok === true
}

/** Atomic refund. Used when a pending order is canceled or cleaned up. */
async function refundGiftCard(
  service: ReturnType<typeof createServiceClient>,
  gcId: string,
  amount: number,
) {
  await service.rpc('refund_gift_card', { p_gc_id: gcId, p_amount: amount })
}

/**
 * Release a previously-reserved coupon. Deletes the cupon_usos row whose
 * compra_ids overlap the given order numbers, and decrements the counter.
 * Idempotent. Called on order cancellation or pending-cleanup.
 */
async function releaseCoupon(
  service: ReturnType<typeof createServiceClient>,
  couponId: string,
  compraIds: string[],
) {
  await service.rpc('release_coupon', {
    p_coupon_id: couponId,
    p_compra_ids: compraIds,
  })
}

/**
 * Unwind everything a failed createCheckout did AFTER place_order: release
 * the coupon reservation (if any), refund the gift card deductions (if
 * any), delete the compras rows, and restore stock.
 *
 * Why: without this, a failure between apply-time (which already mutated
 * cupon_usos and gift_cards saldo) and the final UPDATE would leave an
 * orphan — compras rows in 'confirmado' state (the default from place_order)
 * with no cupon_id or gift_cards_applied linkage, and real deductions
 * stranded in cupon_usos / gift_cards. Pending-cleanup wouldn't find them
 * because it filters on estado = 'pendiente_pago'.
 */
async function rollbackCheckout(
  service: ReturnType<typeof createServiceClient>,
  orderNumbers: string[],
  cuponId: string | null,
  gcList: GcApplied[],
) {
  if (cuponId) {
    await releaseCoupon(service, cuponId, orderNumbers)
  }
  for (const gc of gcList) {
    await refundGiftCard(service, gc.id, gc.descuento)
  }
  const { data: deleted } = await service
    .from('compras')
    .delete()
    .in('numero_pedido', orderNumbers)
    .select('variante_id, cantidad')
  if (deleted) {
    for (const order of deleted) {
      if (!order.variante_id) continue
      const { data: variant } = await service
        .from('variantes')
        .select('stock')
        .eq('id', order.variante_id)
        .single()
      if (variant) {
        await service
          .from('variantes')
          .update({ stock: variant.stock + order.cantidad })
          .eq('id', order.variante_id)
      }
    }
  }
}

/**
 * Refund GCs and release coupons tied to a set of orders. Used by both the
 * pending-cleanup path (in createCheckout) and the cancelada branch (in
 * confirmPayment). Groups coupons by id so one release call covers a whole
 * checkout that might span multiple compras rows.
 */
async function releaseOrderReservations(
  service: ReturnType<typeof createServiceClient>,
  orders: Array<{
    numero_pedido: string
    cupon_id: string | null
    gift_cards_applied: GcApplied[] | null
  }>,
) {
  // Refund GCs per order (each order stores its own subset of GCs used).
  for (const order of orders) {
    if (!order.gift_cards_applied) continue
    for (const gc of order.gift_cards_applied) {
      await refundGiftCard(service, gc.id, gc.descuento)
    }
  }

  // Release coupons: one cupon_usos row covers all compras of a checkout, so
  // call release once per unique coupon with ALL the relevant compra_ids.
  const compraIdsByCoupon = new Map<string, string[]>()
  for (const order of orders) {
    if (!order.cupon_id) continue
    const arr = compraIdsByCoupon.get(order.cupon_id) ?? []
    arr.push(order.numero_pedido)
    compraIdsByCoupon.set(order.cupon_id, arr)
  }
  for (const [couponId, compraIds] of compraIdsByCoupon) {
    await releaseCoupon(service, couponId, compraIds)
  }
}

export async function createCheckout(
  items: CheckoutItem[],
  giftCardCodes?: string[],
  couponCode?: string,
  shipping?: CheckoutShipping,
): Promise<CheckoutResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debés iniciar sesión para comprar' }

  return runCheckout(user.id, items, giftCardCodes, couponCode, shipping)
}

/**
 * Inner checkout pipeline that takes an explicit user_id. Used by both
 * `createCheckout` (for authed users) and `createGuestCheckout` (for guests
 * whose account was just provisioned). All DB operations go through the
 * service client; `place_order` is SECURITY DEFINER and uses `p_user_id`
 * directly, so it doesn't matter that we're not running in the user's auth
 * context.
 */
async function runCheckout(
  userId: string,
  items: CheckoutItem[],
  giftCardCodes?: string[],
  couponCode?: string,
  shipping?: CheckoutShipping,
): Promise<CheckoutResult> {
  if (!items.length) return { error: 'El carrito está vacío' }

  // Validate shipping selection. Method is required and must be a known value;
  // cadeteria additionally requires a non-empty address. Cost is ALWAYS taken
  // from the server-side table — never trust a client-supplied amount.
  if (!shipping || !isValidShippingMethod(shipping.method)) {
    return { error: 'Seleccioná un método de envío' }
  }
  const shippingOption = SHIPPING_OPTIONS[shipping.method]
  const direccionEnvio = shipping.address?.trim() ?? ''
  if (shippingOption.requiresAddress && !direccionEnvio) {
    return { error: 'Ingresá una dirección de entrega' }
  }
  const costoEnvio = shippingOption.cost

  // Cleanup of abandoned checkouts. DELETE … RETURNING claims the rows
  // atomically, so two concurrent createCheckout calls by the same user
  // can't both "release" the same reservations.
  const service = createServiceClient()
  const { data: reclaimed } = await service
    .from('compras')
    .delete()
    .eq('user_id', userId)
    .eq('estado', 'pendiente_pago')
    .select('numero_pedido, variante_id, cantidad, cupon_id, gift_cards_applied')

  if (reclaimed && reclaimed.length > 0) {
    // Restore stock per reclaimed order.
    for (const order of reclaimed) {
      if (!order.variante_id) continue
      const { data: variant } = await service
        .from('variantes')
        .select('stock')
        .eq('id', order.variante_id)
        .single()
      if (variant) {
        await service
          .from('variantes')
          .update({ stock: variant.stock + order.cantidad })
          .eq('id', order.variante_id)
      }
    }

    // Refund GCs and release coupon reservations tied to those orders.
    await releaseOrderReservations(
      service,
      reclaimed as Array<{
        numero_pedido: string
        cupon_id: string | null
        gift_cards_applied: GcApplied[] | null
      }>,
    )
  }

  // 1. Re-fetch authoritative prices from DB. NEVER trust the precio sent
  // by the client — it would let an attacker buy expensive items for $1.
  // linea/categoria are fetched alongside so the cross-sell validator below
  // can verify trigger/target matches without trusting the client.
  const productIds = Array.from(new Set(items.map((i) => i.productId)))
  const { data: dbProducts, error: priceError } = await service
    .from('productos')
    .select('id, precio, activo, linea, categoria')
    .in('id', productIds)

  if (priceError || !dbProducts || dbProducts.length !== productIds.length) {
    return { error: 'No se pudieron validar los precios. Intentá de nuevo.' }
  }

  interface ProductInfo {
    precio: number
    linea: string
    categoria: string
  }
  const productMap = new Map<string, ProductInfo>()
  for (const p of dbProducts) {
    if (!p.activo) {
      return { error: 'Algunos productos ya no están disponibles.' }
    }
    productMap.set(p.id, {
      precio: Number(p.precio),
      linea: p.linea,
      categoria: p.categoria,
    })
  }

  // 1a. Replace each item's precio with the server-side value. Downstream code
  // (totalPedido, MP unit_price, RPC payload) must read from pricedItems.
  const pricedItems = items.map((i) => {
    const info = productMap.get(i.productId)
    if (!info) {
      throw new Error(`Producto ${i.productId} no encontrado`)
    }
    return { ...i, precio: info.precio, linea: info.linea, categoria: info.categoria }
  })

  // 1b. Cross-sell validation. Client tags items with crossSellRuleId; server
  // verifies the rule exists, the item's taxonomy matches rule.target, and
  // some other item in the cart matches rule.trigger. Only then does the
  // discount land on the item's precio. Invalid tags are silently stripped
  // (item keeps full price) — we never reject the whole checkout.
  const discountedVariantIds = new Map<string, { ruleId: string; originalPrice: number }>()
  for (const [idx, item] of pricedItems.entries()) {
    if (!item.crossSellRuleId) continue
    const rule = shopConfig.crossSellRules.find((r) => r.id === item.crossSellRuleId)
    if (!rule) continue

    const matchesTarget =
      (!rule.targetLinea || item.linea === rule.targetLinea) &&
      (!rule.targetCategoria || item.categoria === rule.targetCategoria) &&
      Boolean(rule.targetLinea || rule.targetCategoria)
    if (!matchesTarget) continue

    const hasTrigger = pricedItems.some((other, otherIdx) => {
      if (otherIdx === idx) return false
      if (other.crossSellRuleId) return false
      const tLineaOk = !rule.triggerLinea || other.linea === rule.triggerLinea
      const tCatOk = !rule.triggerCategoria || other.categoria === rule.triggerCategoria
      return tLineaOk && tCatOk && Boolean(rule.triggerLinea || rule.triggerCategoria)
    })
    if (!hasTrigger) continue

    const originalPrice = item.precio
    pricedItems[idx] = {
      ...item,
      precio: Math.round(item.precio * (100 - rule.discountPercent) / 100),
    }
    discountedVariantIds.set(item.variantId, { ruleId: rule.id, originalPrice })
  }

  // 1b. Create orders in DB via existing RPC (decrements stock atomically).
  // The RPC also re-derives precio from productos as a defense in depth.
  const rpcItems = pricedItems.map((i) => ({
    variant_id: i.variantId,
    product_id: i.productId,
    cantidad: i.cantidad,
    precio: i.precio,
  }))

  const { data: pedidos, error: orderError } = await service.rpc('place_order', {
    p_user_id: userId,
    p_items: rpcItems,
  })

  if (orderError) {
    if (orderError.message.includes('Stock insuficiente')) {
      return { error: 'Algunos productos no tienen stock suficiente. Actualizá tu carrito.' }
    }
    return { error: 'Error al procesar el pedido. Intentá de nuevo.' }
  }

  const orderRows = pedidos as { numero_pedido: string; variant_id: string }[]
  const orderNumbers = orderRows.map((p) => p.numero_pedido)

  const externalRef = orderNumbers.join(',')

  // 1c. Overwrite precio_unitario/total on compras rows that got a cross-sell
  // discount. place_order writes full DB price by design; the discount has to
  // be applied AFTER, per-variant. Without this, the UI would show the order
  // at full price despite the client having been charged the discounted one.
  if (discountedVariantIds.size > 0) {
    for (const row of orderRows) {
      const discount = discountedVariantIds.get(row.variant_id)
      if (!discount) continue
      const item = pricedItems.find((i) => i.variantId === row.variant_id)
      if (!item) continue
      await service
        .from('compras')
        .update({
          precio_unitario: item.precio,
          total: item.precio * item.cantidad,
        })
        .eq('numero_pedido', row.numero_pedido)
    }
  }

  // 2. Calculate total from server-side prices (never client-supplied)
  const totalPedido = pricedItems.reduce((sum, i) => sum + i.precio * i.cantidad, 0)

  // Track mutable state that the rollback handler needs to unwind on failure.
  let cuponId: string | null = null
  let descuentoCupon = 0
  const gcList: GcApplied[] = []

  try {
  // 2a. Reserve coupon atomically at apply time. The RPC locks the cupones
  // row, re-validates every condition against the authoritative cupon_usos
  // count, and inserts the usage row — so concurrent checkouts racing for
  // the last max_usos slot (or the same per-user coupon) can't both win.
  // Silent failures mean "coupon not applied" and the UI sees no discount.

  if (couponCode) {
    const normalizedCode = couponCode.trim().toUpperCase()
    const { data: coupon } = await service
      .from('cupones')
      .select('id, tipo, valor')
      .eq('codigo', normalizedCode)
      .eq('activo', true)
      .single()

    if (coupon) {
      const tentativeDescuento = coupon.tipo === 'porcentaje'
        ? Math.round(totalPedido * Number(coupon.valor) / 100)
        : Math.min(Number(coupon.valor), totalPedido)

      const { data: reserved } = await service.rpc('reserve_coupon', {
        p_coupon_id: coupon.id,
        p_user_id: userId,
        p_total_pedido: totalPedido,
        p_compra_ids: orderNumbers,
        p_descuento: tentativeDescuento,
      })

      if ((reserved as { ok?: boolean } | null)?.ok === true) {
        cuponId = coupon.id
        descuentoCupon = tentativeDescuento
      }
    }
  }

  const totalDespuesCupon = totalPedido - descuentoCupon

  // 2b. Apply gift cards (on amount after coupon). Balance is deducted
  // atomically HERE, not at confirmation, so two parallel checkouts that
  // each "apply" the same gift card can't both end up with the discount —
  // the first atomic deduction wins, the second fails and the card is
  // simply not applied to that checkout. If the order is later canceled or
  // cleaned up, the deduction is refunded.
  let descuentoGc = 0

  if (giftCardCodes && giftCardCodes.length > 0) {
    // Dedup: without this, passing the same code twice would apply the card
    // twice (same id appears in gift_cards_applied with two descuento
    // entries, draining the saldo beyond its real value).
    const uniqueCodes = Array.from(
      new Set(giftCardCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)),
    )
    const seenGcIds = new Set<string>()
    let restante = totalDespuesCupon

    for (const code of uniqueCodes) {
      if (restante <= 0) break

      const { data: gc } = await service
        .from('gift_cards')
        .select('id, saldo_restante, estado')
        .eq('codigo', code)
        .eq('estado', 'activa')
        .single()

      if (!gc || seenGcIds.has(gc.id) || !gc.saldo_restante || gc.saldo_restante <= 0) continue
      seenGcIds.add(gc.id)

      const descuento = Math.min(gc.saldo_restante, restante)
      const deducted = await deductGiftCard(service, gc.id, descuento)
      if (!deducted) continue

      gcList.push({ id: gc.id, descuento })
      descuentoGc += descuento
      restante -= descuento
    }
  }

  // Discounts apply only to products — shipping is added AFTER.
  const totalProductosAPagar = totalDespuesCupon - descuentoGc
  const totalAPagar = totalProductosAPagar + costoEnvio

  // Persist shipping info on every compras row of this checkout. Apply to
  // all rows (one per variant) — easier than deciding which row "owns" the
  // shipping, and lets admin reports aggregate per-order shipping costs
  // consistently. Also attach coupon info while we're at it.
  {
    const update: Record<string, unknown> = {
      metodo_envio: shipping.method,
      costo_envio: costoEnvio,
      direccion_envio: shippingOption.requiresAddress ? direccionEnvio : null,
    }
    if (cuponId) {
      update.cupon_id = cuponId
      update.cupon_descuento = descuentoCupon
    }
    await service.from('compras').update(update).in('numero_pedido', orderNumbers)
  }

  // 3a. Discounts cover the full amount — confirm directly without MP.
  // Coupon and GCs were already reserved/deducted at apply time, so the
  // direct-confirm path just attaches metadata and fires the email.
  if (totalAPagar <= 0) {
    let metodoPago = 'gift_card'
    if (cuponId && gcList.length === 0) metodoPago = 'cupon'
    else if (cuponId && gcList.length > 0) metodoPago = 'cupon+gift_card'

    await service
      .from('compras')
      .update({
        estado: 'confirmado',
        metodo_pago: metodoPago,
        gift_cards_applied: gcList.length > 0 ? gcList : null,
      })
      .in('numero_pedido', orderNumbers)

    await sendOrderConfirmationEmails(orderNumbers)
    await markAbandonedCartConverted(userId)

    revalidatePath('/catalogo')
    revalidatePath('/admin/inventario')
    revalidatePath('/perfil')

    return { directConfirm: true }
  }

  // 3b. Create Mercado Pago preference (remaining after coupon + GC discounts)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let preferenceId: string
  let initPoint: string

  // Prorate product prices by the product-side discount ratio. Shipping is
  // NOT discounted and goes through as a separate line item, so the ratio
  // uses totalPedido (products only) as both numerator base and denominator.
  const ratio = totalProductosAPagar / totalPedido
  const mpItems: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    currency_id: 'ARS'
  }> = pricedItems.map((item) => ({
    id: item.variantId,
    title: item.productName,
    quantity: item.cantidad,
    unit_price: (descuentoCupon > 0 || descuentoGc > 0)
      ? Math.round(item.precio * ratio)
      : item.precio,
    currency_id: 'ARS',
  }))

  if (costoEnvio > 0) {
    mpItems.push({
      id: `shipping-${shipping.method}`,
      title: `Envío - ${shippingOption.label}`,
      quantity: 1,
      unit_price: costoEnvio,
      currency_id: 'ARS',
    })
  }

  // MP preference creation. Any failure throws up to the outer catch, which
  // runs the full rollback (release coupon, refund GCs, delete compras,
  // restore stock).
  const response = await mpPreference.create({
    body: {
      items: mpItems,
      back_urls: {
        success: `${siteUrl}/carrito/resultado`,
        failure: `${siteUrl}/carrito/resultado`,
        pending: `${siteUrl}/carrito/resultado`,
      },
      // auto_return only works with non-localhost URLs
      ...(siteUrl.includes('localhost') ? {} : { auto_return: 'approved' as const }),
      // notification_url only works with publicly accessible URLs
      ...(siteUrl.includes('localhost') ? {} : { notification_url: `${siteUrl}/api/mercadopago/webhook` }),
      external_reference: externalRef,
    },
  })

  preferenceId = response.id!
  initPoint = response.init_point!

  // Determine payment method label
  let metodoPago = 'mercadopago'
  if (gcList.length > 0 && cuponId) metodoPago = 'cupon+gift_card+mercadopago'
  else if (gcList.length > 0) metodoPago = 'gift_card+mercadopago'
  else if (cuponId) metodoPago = 'cupon+mercadopago'

  // 4. Update created orders: set estado to pendiente_pago, attach MP info, GC and coupon
  await service
    .from('compras')
    .update({
      estado: 'pendiente_pago',
      metodo_pago: metodoPago,
      mp_preference_id: preferenceId,
      ...(gcList.length > 0 ? { gift_cards_applied: gcList } : {}),
    })
    .in('numero_pedido', orderNumbers)

  revalidatePath('/catalogo')
  revalidatePath('/admin/inventario')
  revalidatePath('/perfil')

  return { initPoint, externalRef }
  } catch (err) {
    console.error('[createCheckout] rolling back due to error:', err)
    await rollbackCheckout(service, orderNumbers, cuponId, gcList)
    return { error: 'Error al procesar el pedido. Intentá de nuevo.' }
  }
}

/* ─── Guest checkout (auto-provisions an account) ─── */

interface GuestCheckoutInput {
  email: string
  fullName: string
  items: CheckoutItem[]
  giftCardCodes?: string[]
  couponCode?: string
  shipping?: CheckoutShipping
}

interface GuestCheckoutResult extends CheckoutResult {
  /** True iff the email already belongs to a registered user. The client
   * should redirect to /login (cart persists in localStorage). */
  emailExists?: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Same flow as createCheckout, but for visitors without an account: silently
 * provisions a Supabase user from email + name, then runs the standard
 * checkout pipeline against that new user. The user is created with
 * `email_confirm: true` and no password, so the customer can later access
 * their account via "forgot password" on /login.
 *
 * Why we don't allow checkout when the email already exists: re-using a
 * known email under the guest path would let an attacker spawn orders
 * attached to someone else's account. We surface emailExists=true and the
 * client redirects to /login.
 */
export async function createGuestCheckout(
  input: GuestCheckoutInput,
): Promise<GuestCheckoutResult> {
  const email = input.email?.trim().toLowerCase()
  const fullName = input.fullName?.trim()

  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: 'Ingresá un email válido' }
  }
  if (!fullName || fullName.length < 2) {
    return { error: 'Ingresá tu nombre completo' }
  }
  if (fullName.length > 100) {
    return { error: 'El nombre es demasiado largo' }
  }

  // Rate limits: per-IP to throttle scrapers, per-email to throttle attempts
  // to spawn accounts under a target address. Both fail open if the rate
  // limit table is broken (consistent with the rest of the codebase).
  const ip = await getClientIp()
  const ipLimit = await checkRateLimit(`guest-checkout:ip:${ip}`, 10, 3600)
  if (!ipLimit.allowed) {
    return { error: 'Demasiados intentos. Probá en unos minutos.' }
  }
  const emailLimit = await checkRateLimit(`guest-checkout:email:${email}`, 3, 3600)
  if (!emailLimit.allowed) {
    return { error: 'Demasiados intentos para este email. Probá más tarde.' }
  }

  const service = createServiceClient()

  // Account-existence check via profiles (mirrors auth.users.email through
  // the handle_new_user trigger). If the email is already registered we
  // refuse to spawn a guest order under it — the client will redirect to
  // login. This is a known account-enumeration vector, but the existing
  // signup flow leaks the same signal, so we're not making things worse.
  const { data: existingProfile } = await service
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    return { emailExists: true }
  }

  // Create the auth user. email_confirm:true skips the verification email —
  // we don't want to block checkout on a click-the-link step. The customer
  // can still set a password later via /login → "Olvidé mi contraseña".
  // The handle_new_user trigger inserts profiles(id, email, full_name) for
  // us using raw_user_meta_data.full_name, so no extra insert is needed.
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createErr || !created.user) {
    // If somehow another call raced us between the existence check and the
    // create call, surface emailExists rather than a generic error.
    if (createErr?.message?.toLowerCase().includes('already')) {
      return { emailExists: true }
    }
    console.error('[createGuestCheckout] createUser failed:', createErr)
    return { error: 'No se pudo crear tu cuenta. Intentá de nuevo.' }
  }

  return runCheckout(
    created.user.id,
    input.items,
    input.giftCardCodes,
    input.couponCode,
    input.shipping,
  )
}

/* ─── Verify payment when user returns from MP ─── */

const STATUS_MAP: Record<string, string> = {
  approved: 'confirmado',
  authorized: 'confirmado',
  pending: 'pendiente_pago',
  in_process: 'pendiente_pago',
  rejected: 'cancelada',
  cancelled: 'cancelada',
  refunded: 'reembolsada',
  charged_back: 'reembolsada',
}

interface ConfirmResult {
  confirmed: boolean
  error?: string
}

export async function confirmPayment(paymentId: string, externalReference: string): Promise<ConfirmResult> {
  if (!paymentId || !externalReference) return { confirmed: false, error: 'Datos incompletos' }

  try {
    // Verify payment with MP API
    const payment = await mpPayment.get({ id: Number(paymentId) })

    const mpStatus = payment.status ?? ''
    const newEstado = STATUS_MAP[mpStatus] ?? 'pendiente_pago'
    const orderNumbers = externalReference.split(',').map((n) => n.trim()).filter(Boolean)

    if (orderNumbers.length === 0) {
      return { confirmed: false, error: 'Referencia externa vacia' }
    }

    const service = createServiceClient()

    // Cohesion check: every order named in external_reference must exist
    // AND share the same mp_preference_id. external_reference is set by
    // our own server when the checkout is created, so a legitimate payment
    // always satisfies this. If a forged webhook body (or a forged MP
    // preference created by an attacker with the access token) points at
    // unrelated orders belonging to a different checkout session, at least
    // one numero_pedido won't match our known mp_preference_id and we
    // reject the whole batch before mutating anything.
    const { data: cohesion } = await service
      .from('compras')
      .select('mp_preference_id')
      .in('numero_pedido', orderNumbers)

    if (!cohesion || cohesion.length !== orderNumbers.length) {
      console.error('[confirmPayment] unknown orders in external_reference:', orderNumbers)
      return { confirmed: false, error: 'Órdenes no encontradas' }
    }
    const preferenceIds = new Set(cohesion.map((o) => o.mp_preference_id).filter(Boolean))
    if (preferenceIds.size !== 1) {
      console.error(
        '[confirmPayment] inconsistent mp_preference_id across orders:',
        Array.from(preferenceIds),
      )
      return { confirmed: false, error: 'Ordenes inconsistentes' }
    }

    // ── Confirmation path (idempotent) ────────────────────────────────
    // Both confirmPayment (called from the MP return page) AND the MP
    // webhook run for a successful payment. The atomic state transition
    // gates the email: whichever caller wins the UPDATE sends the email,
    // the loser sees 0 affected rows and silently returns.
    //
    // Under the reserve-at-apply model, the coupon and gift-card side
    // effects already happened in createCheckout, so confirmation just
    // flips the state and notifies the user.
    if (newEstado === 'confirmado') {
      const { data: transitioned } = await service
        .from('compras')
        .update({ estado: 'confirmado', mp_payment_id: String(paymentId) })
        .in('numero_pedido', orderNumbers)
        .neq('estado', 'confirmado')
        .select('numero_pedido, user_id')

      if (!transitioned || transitioned.length === 0) {
        // Another caller already confirmed. Report success so UI agrees.
        return { confirmed: true }
      }

      await sendOrderConfirmationEmails(orderNumbers)
      const buyerId = transitioned[0]?.user_id
      if (buyerId) await markAbandonedCartConverted(buyerId)

      revalidatePath('/perfil')
      revalidatePath('/catalogo')
      revalidatePath('/admin/inventario')
      return { confirmed: true }
    }

    // ── Cancellation path (idempotent) ────────────────────────────────
    // Only roll back reservations for rows actually transitioning from
    // pendiente_pago to cancelada. A second caller finding the rows
    // already cancelada returns 0 affected rows and skips.
    //
    // Roll back order: stock → GC balance → coupon usage. The atomic
    // transition gate above guarantees this runs exactly once per order.
    if (newEstado === 'cancelada') {
      const { data: transitioned } = await service
        .from('compras')
        .update({ estado: 'cancelada', mp_payment_id: String(paymentId) })
        .in('numero_pedido', orderNumbers)
        .eq('estado', 'pendiente_pago')
        .select('numero_pedido, variante_id, cantidad, cupon_id, gift_cards_applied')

      if (transitioned && transitioned.length > 0) {
        // Restore stock.
        for (const order of transitioned) {
          if (!order.variante_id) continue
          const { data: variant } = await service
            .from('variantes')
            .select('stock')
            .eq('id', order.variante_id)
            .single()
          if (variant) {
            await service
              .from('variantes')
              .update({ stock: variant.stock + order.cantidad })
              .eq('id', order.variante_id)
          }
        }

        // Refund GCs + release coupon reservations tied to these orders.
        await releaseOrderReservations(
          service,
          transitioned as Array<{
            numero_pedido: string
            cupon_id: string | null
            gift_cards_applied: GcApplied[] | null
          }>,
        )
      }

      revalidatePath('/perfil')
      revalidatePath('/catalogo')
      revalidatePath('/admin/inventario')
      return { confirmed: false }
    }

    // ── Intermediate states (pending / in_process / reembolsada) ──────
    // No side effects; just update the status tag.
    await service
      .from('compras')
      .update({ estado: newEstado, mp_payment_id: String(paymentId) })
      .in('numero_pedido', orderNumbers)

    revalidatePath('/perfil')
    revalidatePath('/catalogo')
    revalidatePath('/admin/inventario')
    return { confirmed: false }
  } catch (err) {
    console.error('confirmPayment error:', err)
    return { confirmed: false, error: 'Error al verificar el pago' }
  }
}

/* ─── Verify pending orders by searching MP payments ─── */

export async function verifyPendingOrders(externalRef: string): Promise<ConfirmResult> {
  if (!externalRef) return { confirmed: false }

  try {
    // Search MP for payments with this external_reference
    const searchResult = await mpPayment.search({
      options: {
        criteria: 'desc',
        sort: 'date_created',
      },
    })

    // Find a payment matching our external_reference
    const matchingPayment = searchResult.results?.find(
      (p) => p.external_reference === externalRef
    )

    if (!matchingPayment) return { confirmed: false }

    // Use confirmPayment to update the DB
    return confirmPayment(String(matchingPayment.id), externalRef)
  } catch (err) {
    console.error('verifyPendingOrders error:', err)
    return { confirmed: false }
  }
}
