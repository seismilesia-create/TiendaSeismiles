import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mpPayment } from '@/lib/mercadopago'
import { sendOrderConfirmationEmails } from '@/lib/email/send-order-confirmation'
import { sendGiftcardEmail } from '@/lib/email/send-giftcard-email'

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
        const { data: gc } = await service
          .from('gift_cards')
          .update({ estado: 'activa', mp_payment_id: String(paymentId) })
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

    // Send confirmation email when payment is approved
    if (newEstado === 'confirmado') {
      sendOrderConfirmationEmails(orderNumbers)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
