import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mpPayment } from '@/lib/mercadopago'
import { sendOrderConfirmationEmails } from '@/lib/email/send-order-confirmation'
import { sendGiftcardEmail } from '@/lib/email/send-giftcard-email'

function verifyWebhookSignature(request: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // Skip verification if no secret configured (dev mode)

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')

  if (!xSignature || !xRequestId) return false

  // Parse ts and v1 from x-signature header
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [key, ...rest] = p.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
  )

  const ts = parts.ts
  const hash = parts.v1

  if (!ts || !hash) return false

  // Build manifest and compute HMAC-SHA256
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const computed = createHmac('sha256', secret).update(manifest).digest('hex')

  // Timing-safe comparison
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hash))
  } catch {
    return false
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MP sends different notification types; we only care about payments
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    // Verify webhook signature (HMAC-SHA256)
    if (!verifyWebhookSignature(request, String(paymentId))) {
      console.error('MP webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Fetch full payment details from MP API (verifies authenticity)
    const payment = await mpPayment.get({ id: paymentId })

    const externalRef = payment.external_reference
    const status = payment.status

    if (!externalRef) {
      return NextResponse.json({ error: 'No external reference' }, { status: 400 })
    }

    const service = createServiceClient()

    // ── Gift card payments (external_reference starts with "gc:") ──
    if (externalRef.startsWith('gc:')) {
      const giftcardId = externalRef.slice(3)
      const mpStatus = status ?? ''

      if (mpStatus === 'approved' || mpStatus === 'authorized') {
        // Get monto first to set saldo_restante
        const { data: existing } = await service
          .from('gift_cards')
          .select('monto')
          .eq('id', giftcardId)
          .single()

        const { data: gc } = await service
          .from('gift_cards')
          .update({ estado: 'activa', mp_payment_id: String(paymentId), saldo_restante: existing?.monto ?? 0 })
          .eq('id', giftcardId)
          .select('codigo, monto, titulo, user_id')
          .single()

        if (gc) {
          sendGiftcardEmail(gc.user_id, gc.codigo, gc.monto, gc.titulo)
        }
      } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
        await service
          .from('gift_cards')
          .update({ estado: 'cancelada', mp_payment_id: String(paymentId) })
          .eq('id', giftcardId)
      }

      return NextResponse.json({ received: true })
    }

    // ── Regular order payments ──
    const orderNumbers = externalRef.split(',').map((n: string) => n.trim())
    const newEstado = STATUS_MAP[status ?? ''] ?? 'pendiente_pago'

    // Update order status and payment ID
    await service
      .from('compras')
      .update({
        estado: newEstado,
        mp_payment_id: String(paymentId),
      })
      .in('numero_pedido', orderNumbers)

    // If payment was rejected/cancelled, restore stock
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

    // If confirmed, deduct gift card balances, register coupon usage, and send email
    if (newEstado === 'confirmado') {
      // Read gift_cards_applied and coupon info from the first order
      const { data: orderWithData } = await service
        .from('compras')
        .select('gift_cards_applied, cupon_id, cupon_descuento, user_id')
        .in('numero_pedido', orderNumbers)
        .limit(1)
        .single()

      if (orderWithData?.gift_cards_applied) {
        const gcList = orderWithData.gift_cards_applied as { id: string; descuento: number }[]
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

      // Register coupon usage on payment confirmation
      if (orderWithData?.cupon_id && orderWithData?.user_id) {
        await service
          .from('cupon_usos')
          .insert({
            cupon_id: orderWithData.cupon_id,
            user_id: orderWithData.user_id,
            compra_ids: orderNumbers,
            descuento_aplicado: Number(orderWithData.cupon_descuento) || 0,
          })

        const { data: couponCurrent } = await service
          .from('cupones')
          .select('usos_actuales')
          .eq('id', orderWithData.cupon_id)
          .single()

        if (couponCurrent) {
          await service
            .from('cupones')
            .update({ usos_actuales: (couponCurrent.usos_actuales ?? 0) + 1 })
            .eq('id', orderWithData.cupon_id)
        }
      }

      sendOrderConfirmationEmails(orderNumbers)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
