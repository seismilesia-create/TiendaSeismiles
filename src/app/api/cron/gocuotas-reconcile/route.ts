import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { confirmGocuotasPayment } from '@/actions/checkout'

/**
 * GoCuotas reconciliation sweep — safety net for missed webhooks.
 *
 * Scheduled by Supabase pg_cron (see 015_gocuotas_reconcile_cron migration).
 * The GoCuotas webhook is the primary confirmation path, but it has no
 * signature and could be lost (network blip, deploy, the 307 redirect dropping
 * the request). This cron re-checks still-pending GoCuotas orders directly
 * against GoCuotas and lets confirmGocuotasPayment resolve them — exactly the
 * same idempotent, server-verified path the webhook uses, so running both is
 * safe.
 *
 * Auth: bearer token in process.env.CRON_SECRET (shared with the abandoned-cart
 * cron). MUST be set in production — without it any caller could trigger sweeps.
 *
 * Scope per run: orders in 'pendiente_pago' paid via GoCuotas, created between
 * 2 minutes ago (give the live redirect flow time to settle) and 7 days ago
 * (don't re-query orders GoCuotas will never resolve forever). Deduplicated by
 * gocuotas_order_ref so each checkout is reconciled once, capped to keep the
 * run well under the time limit.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MIN_AGE_MINUTES = 2
const MAX_AGE_DAYS = 7
const MAX_REFS_PER_RUN = 40

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/gocuotas-reconcile] CRON_SECRET not set — rejecting')
    return unauthorized()
  }

  const auth = request.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${secret}`) return unauthorized()

  const service = createServiceClient()

  const olderThanIso = new Date(Date.now() - MIN_AGE_MINUTES * 60 * 1000).toISOString()
  const newerThanIso = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: pending, error } = await service
    .from('compras')
    .select('gocuotas_order_ref')
    .eq('estado', 'pendiente_pago')
    .ilike('metodo_pago', '%gocuotas%')
    .not('gocuotas_order_ref', 'is', null)
    .lte('created_at', olderThanIso)
    .gte('created_at', newerThanIso)
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) {
    console.error('[cron/gocuotas-reconcile] select error:', error)
    return NextResponse.json({ error: 'Select failed' }, { status: 500 })
  }

  // Dedupe by ref (one ref spans every compras row of a checkout) and cap.
  const refs = Array.from(
    new Set((pending ?? []).map((r) => r.gocuotas_order_ref as string).filter(Boolean)),
  ).slice(0, MAX_REFS_PER_RUN)

  let confirmed = 0
  let unresolved = 0

  for (const ref of refs) {
    try {
      // Re-queries GoCuotas and confirms approved / cancels verified denials,
      // idempotently. A still-undefined order is simply left pending.
      const result = await confirmGocuotasPayment(ref)
      if (result.confirmed) confirmed++
      else unresolved++
    } catch (err) {
      console.error('[cron/gocuotas-reconcile] confirm error for ref', ref, ':', err)
      unresolved++
    }
  }

  return NextResponse.json({ ok: true, scanned: refs.length, confirmed, unresolved })
}
