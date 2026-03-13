'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { mpPreference, mpPayment } from '@/lib/mercadopago'
import { sendOrderConfirmationEmails } from '@/lib/email/send-order-confirmation'

interface CheckoutItem {
  variantId: string
  productId: string
  productName: string
  cantidad: number
  precio: number
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

export async function createCheckout(items: CheckoutItem[], giftCardCodes?: string[]): Promise<CheckoutResult> {
  if (!items.length) return { error: 'El carrito esta vacio' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesion para comprar' }

  // Check for existing pending orders to avoid duplicates
  const service = createServiceClient()
  const { data: pendingOrders } = await service
    .from('compras')
    .select('mp_preference_id')
    .eq('user_id', user.id)
    .eq('estado', 'pendiente_pago')
    .not('mp_preference_id', 'is', null)
    .limit(1)

  if (pendingOrders && pendingOrders.length > 0) {
    // Cancel existing pending orders and restore stock before creating new ones
    const { data: pendingItems } = await service
      .from('compras')
      .select('id, variante_id, cantidad')
      .eq('user_id', user.id)
      .eq('estado', 'pendiente_pago')

    if (pendingItems) {
      // Restore stock for each pending order
      for (const item of pendingItems) {
        if (item.variante_id) {
          const { data: variant } = await service
            .from('variantes')
            .select('stock')
            .eq('id', item.variante_id)
            .single()

          if (variant) {
            await service
              .from('variantes')
              .update({ stock: variant.stock + item.cantidad })
              .eq('id', item.variante_id)
          }
        }
      }

      // Delete the pending orders
      await service
        .from('compras')
        .delete()
        .eq('user_id', user.id)
        .eq('estado', 'pendiente_pago')
    }
  }

  // 1. Create orders in DB via existing RPC (decrements stock atomically)
  const rpcItems = items.map((i) => ({
    variant_id: i.variantId,
    product_id: i.productId,
    cantidad: i.cantidad,
    precio: i.precio,
  }))

  const { data: pedidos, error: orderError } = await supabase.rpc('place_order', {
    p_user_id: user.id,
    p_items: rpcItems,
  })

  if (orderError) {
    if (orderError.message.includes('Stock insuficiente')) {
      return { error: 'Algunos productos no tienen stock suficiente. Actualiza tu carrito.' }
    }
    return { error: 'Error al procesar el pedido. Intenta de nuevo.' }
  }

  const orderNumbers = (pedidos as { numero_pedido: string; variant_id: string }[])
    .map((p) => p.numero_pedido)

  const externalRef = orderNumbers.join(',')

  // 2. Calculate total and check gift cards
  const totalPedido = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const gcList: GcApplied[] = []
  let descuentoTotal = 0

  if (giftCardCodes && giftCardCodes.length > 0) {
    let restante = totalPedido

    for (const code of giftCardCodes) {
      if (restante <= 0) break

      const { data: gc } = await service
        .from('gift_cards')
        .select('id, saldo_restante, estado')
        .eq('codigo', code.trim().toUpperCase())
        .eq('estado', 'activa')
        .single()

      if (gc && gc.saldo_restante && gc.saldo_restante > 0) {
        const descuento = Math.min(gc.saldo_restante, restante)
        gcList.push({ id: gc.id, descuento })
        descuentoTotal += descuento
        restante -= descuento
      }
    }
  }

  const totalAPagar = totalPedido - descuentoTotal

  // 3a. Gift cards cover the full amount — confirm directly without MP
  if (totalAPagar === 0 && gcList.length > 0) {
    // Deduct balance from each gift card
    for (const gc of gcList) {
      const { data: current } = await service
        .from('gift_cards')
        .select('saldo_restante')
        .eq('id', gc.id)
        .single()

      if (current) {
        await service
          .from('gift_cards')
          .update({ saldo_restante: Math.max(0, (current.saldo_restante ?? 0) - gc.descuento) })
          .eq('id', gc.id)
      }
    }

    // Confirm orders directly
    await service
      .from('compras')
      .update({
        estado: 'confirmado',
        metodo_pago: 'gift_card',
        gift_cards_applied: gcList,
      })
      .in('numero_pedido', orderNumbers)

    sendOrderConfirmationEmails(orderNumbers)

    revalidatePath('/catalogo')
    revalidatePath('/admin/inventario')
    revalidatePath('/perfil')

    return { directConfirm: true }
  }

  // 3b. Create Mercado Pago preference (full or partial after GC discount)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let preferenceId: string
  let initPoint: string

  // If GCs cover part, adjust item prices proportionally
  const ratio = totalAPagar / totalPedido
  const mpItems = items.map((item) => ({
    id: item.variantId,
    title: item.productName,
    quantity: item.cantidad,
    unit_price: descuentoTotal > 0
      ? Math.round(item.precio * ratio)
      : item.precio,
    currency_id: 'ARS' as const,
  }))

  try {
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
  } catch (mpError) {
    console.error('Mercado Pago error:', mpError)
    return { error: 'Error al conectar con Mercado Pago. Intenta de nuevo.' }
  }

  // 4. Update created orders: set estado to pendiente_pago, attach MP info and GC if used
  await service
    .from('compras')
    .update({
      estado: 'pendiente_pago',
      metodo_pago: gcList.length > 0 ? 'gift_card+mercadopago' : 'mercadopago',
      mp_preference_id: preferenceId,
      ...(gcList.length > 0 ? { gift_cards_applied: gcList } : {}),
    })
    .in('numero_pedido', orderNumbers)

  revalidatePath('/catalogo')
  revalidatePath('/admin/inventario')
  revalidatePath('/perfil')

  return { initPoint, externalRef }
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
    const orderNumbers = externalReference.split(',').map((n) => n.trim())

    const service = createServiceClient()

    await service
      .from('compras')
      .update({
        estado: newEstado,
        mp_payment_id: String(paymentId),
      })
      .in('numero_pedido', orderNumbers)

    // If rejected, restore stock
    if (newEstado === 'cancelada') {
      for (const num of orderNumbers) {
        const { data: order } = await service
          .from('compras')
          .select('variante_id, cantidad')
          .eq('numero_pedido', num)
          .single()

        if (order?.variante_id) {
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

    // If confirmed, deduct gift card balances and send email
    if (newEstado === 'confirmado') {
      // Read gift_cards_applied JSONB from the first order (all share the same data)
      const { data: orderWithGc } = await service
        .from('compras')
        .select('gift_cards_applied')
        .in('numero_pedido', orderNumbers)
        .not('gift_cards_applied', 'is', null)
        .limit(1)
        .single()

      if (orderWithGc?.gift_cards_applied) {
        const gcList = orderWithGc.gift_cards_applied as GcApplied[]
        for (const gc of gcList) {
          const { data: current } = await service
            .from('gift_cards')
            .select('saldo_restante')
            .eq('id', gc.id)
            .single()

          if (current) {
            await service
              .from('gift_cards')
              .update({ saldo_restante: Math.max(0, (current.saldo_restante ?? 0) - gc.descuento) })
              .eq('id', gc.id)
          }
        }
      }

      sendOrderConfirmationEmails(orderNumbers)
    }

    revalidatePath('/perfil')
    revalidatePath('/catalogo')
    revalidatePath('/admin/inventario')

    return { confirmed: newEstado === 'confirmado' }
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
