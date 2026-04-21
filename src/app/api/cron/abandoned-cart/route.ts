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
 *   2. For each cart + stage, sends the email and stamps email_N_sent_at so
 *      the next run won't resend. Coupon codes are written back alongside.
 *
 * Idempotency: the UPDATE before send gates the send behind a row match. If
 * two invocations race, only one will flip email_N_sent_at from NULL to a
 * timestamp and win the send. The other sees 0 rows and skips.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type StageConfig = {
  stage: AbandonedCartStage
  column: 'email_1_sent_at' | 'email_2_sent_at' | 'email_3_sent_at'
  couponColumn: 'email_2_coupon_code' | 'email_3_coupon_code' | null
  triggerAfterHours: number
  // For stages 2 and 3 the trigger is "X hours after the previous stage",
  // so we measure from the previous email's sent_at column.
  measureFrom: 'last_activity_at' | 'email_1_sent_at' | 'email_2_sent_at'
}

const STAGES: StageConfig[] = [
  {
    stage: 'reminder',
    column: 'email_1_sent_at',
    couponColumn: null,
    triggerAfterHours: 1,
    measureFrom: 'last_activity_at',
  },
  {
    stage: 'discount10',
    column: 'email_2_sent_at',
    couponColumn: 'email_2_coupon_code',
    triggerAfterHours: 23,
    measureFrom: 'email_1_sent_at',
  },
  {
    stage: 'lastChance15',
    column: 'email_3_sent_at',
    couponColumn: 'email_3_coupon_code',
    triggerAfterHours: 24,
    measureFrom: 'email_2_sent_at',
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

    const { data: candidates, error: selErr } = await query

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

    let sent = 0

    for (const cart of candidates ?? []) {
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

    results[cfg.stage] = { candidates: candidates?.length ?? 0, sent }
  }

  return NextResponse.json({ ok: true, results })
}
