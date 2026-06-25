import { NextRequest, NextResponse } from 'next/server'
import { confirmGocuotasPayment } from '@/actions/checkout'

/**
 * GoCuotas webhook — NO SIGNATURE.
 *
 * Unlike the MP webhook (HMAC-verified), GoCuotas sends an unsigned POST whose
 * only "auth" is a forgeable user_agent header. So the body is treated as a
 * mere notification and is NEVER trusted: we extract our reference AND the
 * order_id GoCuotas includes, and hand them to confirmGocuotasPayment, which
 * re-queries GoCuotas server-side (GET /orders/{order_id}) with the API key and
 * decides based solely on what GoCuotas reports (status 'approved' + matching
 * amount). That function is idempotent, so duplicate webhooks (and the
 * 30-minute denial webhook) don't double-confirm or double-release stock.
 *
 * Real GoCuotas payload (documented): { order_reference_id, status, order_id,
 * number_of_installments, amount_in_cents }. Only 'approved' and 'denied' are
 * sent (never 'undefined'); for an abandoned-cart 'denied', order_id/amount
 * come as nil. The order_id is the KEY field: GET /orders/{order_id} works for
 * a freshly-paid order, whereas GET /orders by reference returns [] until the
 * order is settled — so we must verify by id, not by ref.
 *
 * We always answer 200 once the body parses, so GoCuotas doesn't retry-storm on
 * transient verification hiccups (a later webhook or the reconciliation cron
 * will catch up). The only 4xx is for an unparseable / reference-less body.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    // GoCuotas identifies the sale by order_reference_id (our externalRef). Be
    // lenient about field naming/nesting since the body is only a hint anyway.
    const ref: string | undefined =
      body.order_reference_id ??
      body.orderReferenceId ??
      body.order?.order_reference_id

    // GoCuotas sends the order id as `order_id`. This is what drives the
    // reliable GET /orders/{order_id} verification. (The ref match inside
    // confirmGocuotasPayment is still what authenticates against our orders.)
    // Fallbacks cover any aliasing; nil on abandoned-cart denials.
    const orderId: string | undefined =
      body.order_id != null ? String(body.order_id)
        : body.id != null ? String(body.id)
          : body.order?.id != null ? String(body.order.id)
            : undefined

    if (!ref) {
      return NextResponse.json({ error: 'Missing order_reference_id' }, { status: 400 })
    }

    // Re-query GoCuotas and confirm/cancel server-side. Body status is ignored.
    await confirmGocuotasPayment(String(ref), orderId)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('GoCuotas webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
