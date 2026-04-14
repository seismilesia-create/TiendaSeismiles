import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mpPayment } from '@/lib/mercadopago'
import { sendGiftcardEmail } from '@/lib/email/send-giftcard-email'
import { confirmPayment } from '@/actions/checkout'

function verifyWebhookSignature(request: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    // Fail-closed in production: a missing webhook secret in prod is a
    // misconfiguration, not a legitimate "dev mode". Without this guard a
    // single forgotten env var would let anyone on the internet replay
    // webhooks with crafted payment IDs. In development, accept unsigned
    // webhooks so local flows still work.
    if (process.env.NODE_ENV === 'production') {
      console.error('[mp-webhook] MP_WEBHOOK_SECRET missing in production — rejecting')
      return false
    }
    console.warn('[mp-webhook] MP_WEBHOOK_SECRET not set — accepting unsigned (dev only)')
    return true
  }

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
        // Read monto to seed saldo_restante.
        const { data: existing } = await service
          .from('gift_cards')
          .select('monto')
          .eq('id', giftcardId)
          .single()

        // Idempotent activation: only transition and email if the card was
        // NOT already active. MP retries the webhook and this endpoint can
        // also be hit by confirmGiftcardPayment from the return page —
        // without this gate the user would get multiple gift card emails.
        const { data: gc } = await service
          .from('gift_cards')
          .update({
            estado: 'activa',
            mp_payment_id: String(paymentId),
            saldo_restante: existing?.monto ?? 0,
          })
          .eq('id', giftcardId)
          .neq('estado', 'activa')
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
          .neq('estado', 'cancelada')
      }

      return NextResponse.json({ received: true })
    }

    // ── Regular order payments ──
    // Delegate to confirmPayment so the idempotent state-transition gate
    // applies to BOTH callers (webhook + user-return page). Whichever fires
    // first runs the side effects exactly once; the second sees the rows
    // already transitioned and becomes a no-op.
    await confirmPayment(String(paymentId), externalRef)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MP webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
