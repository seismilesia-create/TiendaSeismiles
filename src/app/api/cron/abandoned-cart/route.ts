import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  sendAbandonedCartEmail,
  type AbandonedCartStage,
} from '@/lib/email/send-abandoned-cart'

/**
 * Scheduled by Supabase pg_cron (see 010_abandoned_carts_cron migration).
 *
 * Auth: bearer token. The token lives in process.env.CRON_SECRET and MUST be
 * set in production — without it any caller could trigger email sends.
 *
 * Per run it:
 *   1. Selects active carts (converted_at NULL) that crossed a stage threshold
 *      without having already received that stage's email.
 *   2. Applies anti-abuse guardrails:
 *        - Stage 1 (reminder): skip users who received any abandoned-cart
 *          email in the last COOLDOWN_DAYS. Prevents farming via wipe + readd.
 *        - Stages 2 and 3: skip carts whose subtotal is below
 *          MIN_SUBTOTAL_FOR_DISCOUNT. Protects margin on tiny carts.
 *        - Stages 2 and 3: skip users who already received
 *          MAX_COUPONS_PER_MONTH coupons in the rolling COOLDOWN_DAYS window.
 *          Default cap = 1, so stage 2 fires once per cycle and stage 3 is
 *          suppressed unless the cap is bumped to 2.
 *   3. For each surviving candidate, sends the email and stamps
 *      email_N_sent_at so the next run won't resend. Coupon codes are written
 *      back alongside.
 *
 * Idempotency: the UPDATE before send gates the send behind a row match. If
 * two invocations race, only one will flip email_N_sent_at from NULL to a
 * timestamp and win the send. The other sees 0 rows and skips.
 *
 * Cooldown reset: markAbandonedCartConverted (called from checkout) wipes
 * the user's log rows on order confirmation, so a real buyer earns a fresh
 * cycle on their next abandonment.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Tuning knobs. Adjust here and redeploy — kept as constants rather than env
// vars so the values live next to the logic that consumes them.
const COOLDOWN_DAYS = 30
const MIN_SUBTOTAL_FOR_DISCOUNT = 30000
// Cap on coupon-issuing emails per user inside the rolling COOLDOWN_DAYS
// window. With cap = 1, only one of stage 2 / stage 3 fires per cycle.
const MAX_COUPONS_PER_MONTH = 1

type StageConfig = {
  stage: AbandonedCartStage
  column: 'email_1_sent_at' | 'email_2_sent_at' | 'email_3_sent_at'
  couponColumn: 'email_2_coupon_code' | 'email_3_coupon_code' | null
  triggerAfterHours: number
  // For stages 2 and 3 the trigger is "X hours after the previous stage",
  // so we measure from the previous email's sent_at column.
  measureFrom: 'last_activity_at' | 'email_1_sent_at' | 'email_2_sent_at'
  // Stages 2 and 3 are gated by a minimum cart subtotal so we don't burn
  // discount codes on $500 carts.
  requiresMinSubtotal: boolean
}

const STAGES: StageConfig[] = [
  {
    stage: 'reminder',
    column: 'email_1_sent_at',
    couponColumn: null,
    triggerAfterHours: 1,
    measureFrom: 'last_activity_at',
    requiresMinSubtotal: false,
  },
  {
    stage: 'discount10',
    column: 'email_2_sent_at',
    couponColumn: 'email_2_coupon_code',
    triggerAfterHours: 48,
    measureFrom: 'email_1_sent_at',
    requiresMinSubtotal: true,
  },
  {
    stage: 'lastChance15',
    column: 'email_3_sent_at',
    couponColumn: 'email_3_coupon_code',
    triggerAfterHours: 72,
    measureFrom: 'email_2_sent_at',
    requiresMinSubtotal: true,
  },
]

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/abandoned-cart] CRON_SECRET not set — rejecting')
    return unauthorized()
  }

  const auth = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  if (auth !== expected) return unauthorized()

  const service = createServiceClient()
  const results: Record<string, { candidates: number; sent: number }> = {}

  for (const cfg of STAGES) {
    const thresholdIso = new Date(
      Date.now() - cfg.triggerAfterHours * 60 * 60 * 1000,
    ).toISOString()

    // Candidates: active carts where the stage email has not fired and the
    // measured-from timestamp is older than the trigger threshold.
    const query = service
      .from('abandoned_carts')
      .select('id, user_id, email, items, subtotal')
      .is('converted_at', null)
      .is(cfg.column, null)
      .not(cfg.measureFrom, 'is', null)
      .lte(cfg.measureFrom, thresholdIso)
      .limit(50)

    const { data: rawCandidates, error: selErr } = await query

    if (selErr) {
      console.error(
        '[cron/abandoned-cart] select error for stage',
        cfg.stage,
        ':',
        selErr,
      )
      results[cfg.stage] = { candidates: 0, sent: 0 }
      continue
    }

    let candidates = rawCandidates ?? []

    // Gate A — minimum subtotal for discount stages. A cart sitting below the
    // floor stays in the table; if the user adds more items later, the next
    // sweep picks it up automatically.
    if (cfg.requiresMinSubtotal) {
      candidates = candidates.filter(
        (c) => Number(c.subtotal) >= MIN_SUBTOTAL_FOR_DISCOUNT,
      )
    }

    // Gate D — monthly coupon cap. For stages that issue a coupon, count
    // recent coupon-issuing log entries for each candidate user across the
    // COOLDOWN_DAYS window. If the user is at or above the cap, drop them.
    // The reminder stage has no coupon column and is exempt.
    if (cfg.couponColumn && candidates.length > 0) {
      const cutoffIso = new Date(
        Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString()
      const userIds = candidates.map((c) => c.user_id)

      const { data: recentCoupons } = await service
        .from('abandoned_cart_email_log')
        .select('user_id')
        .in('user_id', userIds)
        .in('stage', ['discount10', 'lastChance15'])
        .gte('sent_at', cutoffIso)

      const couponCount = new Map<string, number>()
      for (const r of recentCoupons ?? []) {
        couponCount.set(r.user_id, (couponCount.get(r.user_id) ?? 0) + 1)
      }

      candidates = candidates.filter(
        (c) => (couponCount.get(c.user_id) ?? 0) < MAX_COUPONS_PER_MONTH,
      )
    }

    // Gate B — cooldown at stage 1 only. Stages 2 and 3 are already implicitly
    // gated by email_1_sent_at being non-null on the cart row, so they only
    // fire inside an active cycle the cooldown already cleared.
    if (cfg.stage === 'reminder' && candidates.length > 0) {
      const cooldownThresholdIso = new Date(
        Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString()
      const userIds = candidates.map((c) => c.user_id)

      const { data: recentLog } = await service
        .from('abandoned_cart_email_log')
        .select('user_id')
        .in('user_id', userIds)
        .gte('sent_at', cooldownThresholdIso)

      const blocked = new Set((recentLog ?? []).map((r) => r.user_id))
      candidates = candidates.filter((c) => !blocked.has(c.user_id))
    }

    let sent = 0

    for (const cart of candidates) {
      // Atomic claim: flip email_N_sent_at from NULL to NOW() gated on NULL.
      // If another run grabbed it first, select returns 0 rows and we skip.
      const nowIso = new Date().toISOString()
      const { data: claimed } = await service
        .from('abandoned_carts')
        .update({ [cfg.column]: nowIso })
        .eq('id', cart.id)
        .is(cfg.column, null)
        .select('id')

      if (!claimed || claimed.length === 0) continue

      try {
        const result = await sendAbandonedCartEmail(
          cart as {
            id: string
            user_id: string
            email: string
            items: unknown
            subtotal: number | string
          },
          cfg.stage,
        )

        if (result.sent) {
          sent++
          if (cfg.couponColumn && result.couponCode) {
            await service
              .from('abandoned_carts')
              .update({ [cfg.couponColumn]: result.couponCode })
              .eq('id', cart.id)
          }
        } else {
          // Send failed (Resend error). Roll back the claim so a later run
          // retries instead of permanently skipping this stage.
          await service
            .from('abandoned_carts')
            .update({ [cfg.column]: null })
            .eq('id', cart.id)
        }
      } catch (err) {
        console.error(
          '[cron/abandoned-cart] send crash for cart',
          cart.id,
          'stage',
          cfg.stage,
          ':',
          err,
        )
        // Roll back so retries can happen.
        await service
          .from('abandoned_carts')
          .update({ [cfg.column]: null })
          .eq('id', cart.id)
      }
    }

    results[cfg.stage] = { candidates: candidates.length, sent }
  }

  return NextResponse.json({ ok: true, results })
}
