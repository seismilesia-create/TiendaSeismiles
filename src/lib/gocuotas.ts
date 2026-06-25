/**
 * GoCuotas API Redirect V1 client — SERVER ONLY.
 *
 * Mirror of `src/lib/mercadopago.ts`, used behind the `provider` flag in
 * `src/actions/checkout.ts`. GoCuotas uses the same "create checkout → redirect
 * → confirm by webhook" pattern as MP Checkout Pro.
 *
 * Auth: the branch's API key is sent directly as `Authorization: Bearer
 * <API_KEY>` on every request. No `/authentication` call, no token caching,
 * no expiry to manage. The key is secret and must never reach the browser —
 * this module has no 'use client' and is only imported from server code.
 *
 * Base URL comes from GOCUOTAS_BASE_URL (sandbox by default). The API path
 * `/api_redirect/v1` is appended here. Amounts are ALWAYS in CENTS.
 */

const API_PATH = '/api_redirect/v1'

function baseUrl(): string {
  const url = process.env.GOCUOTAS_BASE_URL || 'https://sandbox.gocuotas.com'
  return `${url.replace(/\/+$/, '')}${API_PATH}`
}

function authHeader(): string {
  const key = process.env.GOCUOTAS_API_KEY
  if (!key) {
    throw new Error('GOCUOTAS_API_KEY no está configurada')
  }
  return `Bearer ${key}`
}

/** Format a Date as 'YYYY-MM-DD HH:mm' (UTC) for GET /orders date filters. */
function formatRangeDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
  )
}

export type GocuotasStatus = 'undefined' | 'approved' | 'denied' | string

/** Shape we rely on from GoCuotas order responses. Extra fields are ignored. */
export interface GocuotasOrder {
  id: string | number
  order_reference_id: string
  status: GocuotasStatus
  amount_in_cents: number
  number_of_installments?: number
  delivered_at?: string | null
  discarded_at?: string | null
}

interface CreateCheckoutArgs {
  amountInCents: number
  urlSuccess: string
  urlFailure: string
  orderReferenceId: string
  webhookUrl: string
  email?: string
  phone?: string
}

/**
 * POST /checkouts — create a checkout and get the hosted-payment URL.
 * Params travel as query string (per the API Redirect V1 spec). Returns the
 * `url_init` the customer must be redirected to.
 */
export async function createCheckout(
  args: CreateCheckoutArgs,
): Promise<{ urlInit: string }> {
  const qs = new URLSearchParams({
    amount_in_cents: String(args.amountInCents),
    url_success: args.urlSuccess,
    url_failure: args.urlFailure,
    order_reference_id: args.orderReferenceId,
    webhook_url: args.webhookUrl,
  })
  if (args.email) qs.set('email', args.email)
  if (args.phone) qs.set('phone_number', args.phone)

  const res = await fetch(`${baseUrl()}/checkouts?${qs.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GoCuotas POST /checkouts failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { url_init?: string }
  if (!data.url_init) {
    throw new Error('GoCuotas POST /checkouts: respuesta sin url_init')
  }
  return { urlInit: data.url_init }
}

/**
 * GET /orders/{id} — authoritative status of a single order. Used by the
 * webhook verification when the notification carries an order id.
 */
export async function getOrder(id: string | number): Promise<GocuotasOrder | null> {
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(String(id))}`, {
    method: 'GET',
    headers: { Authorization: authHeader(), Accept: 'application/json' },
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GoCuotas GET /orders/${id} failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as GocuotasOrder | null
  return data ?? null
}

/**
 * GET /orders?order_reference_id=... — look up an order by OUR reference within
 * a delivered date range. Returns the matching order or null.
 *
 * IMPORTANT: this endpoint only lists orders that GoCuotas has already
 * delivered/settled — a freshly-paid order returns `[]` here (confirmed in
 * production). So this is NOT used to confirm a fresh payment; that goes through
 * getOrder(order_id) with the order_id from the webhook. Use this only for
 * historical reconciliation of orders old enough to be settled.
 */
export async function getOrderByRef(ref: string): Promise<GocuotasOrder | null> {
  const now = new Date()
  const start = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000)
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const qs = new URLSearchParams({
    order_reference_id: ref,
    delivered_start: formatRangeDate(start),
    delivered_end: formatRangeDate(end),
  })

  const res = await fetch(`${baseUrl()}/orders?${qs.toString()}`, {
    method: 'GET',
    headers: { Authorization: authHeader(), Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GoCuotas GET /orders failed: ${res.status} ${text}`)
  }

  // The endpoint may return an array of orders or a single object. Normalize
  // and pick the order whose order_reference_id matches exactly.
  const data = (await res.json()) as unknown
  const list: GocuotasOrder[] = Array.isArray(data)
    ? (data as GocuotasOrder[])
    : Array.isArray((data as { orders?: GocuotasOrder[] })?.orders)
      ? (data as { orders: GocuotasOrder[] }).orders
      : data
        ? [data as GocuotasOrder]
        : []

  return list.find((o) => o.order_reference_id === ref) ?? null
}

/**
 * DELETE /orders/{id} — refund. No amount = full refund; with amountInCents =
 * partial. An order can't be refunded twice. Nice-to-have for the admin.
 */
export async function refundOrder(
  id: string | number,
  amountInCents?: number,
): Promise<void> {
  const qs = new URLSearchParams()
  if (typeof amountInCents === 'number') {
    qs.set('amount_in_cents', String(amountInCents))
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(String(id))}${suffix}`, {
    method: 'DELETE',
    headers: { Authorization: authHeader(), Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GoCuotas DELETE /orders/${id} failed: ${res.status} ${text}`)
  }
}
