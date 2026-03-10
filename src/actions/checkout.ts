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
  error?: string
}

export async function createCheckout(items: CheckoutItem[]): Promise<CheckoutResult> {
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

  // 2. Create Mercado Pago preference
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let preferenceId: string
  let initPoint: string

  try {
    const response = await mpPreference.create({
      body: {
        items: items.map((item) => ({
          id: item.variantId,
          title: item.productName,
          quantity: item.cantidad,
          unit_price: item.precio,
          currency_id: 'ARS',
        })),
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

  // 3. Update created orders: set estado to pendiente_pago, attach MP info
  await service
    .from('compras')
    .update({
      estado: 'pendiente_pago',
      metodo_pago: 'mercadopago',
      mp_preference_id: preferenceId,
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

    // Send confirmation email when payment is approved
    if (newEstado === 'confirmado') {
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
