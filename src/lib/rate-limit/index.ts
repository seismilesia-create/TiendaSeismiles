import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Lightweight rolling-window rate limiter backed by the public.rate_limit_hits
 * table. Each allowed call records a row; each check counts rows in the
 * bucket that are newer than `windowSeconds` ago.
 *
 * Known limitation: the "count then insert" sequence is not atomic, so two
 * concurrent requests could both see count=N-1 and both be allowed, going
 * one over the limit. For the forms this is used on (contact, arrepentimiento,
 * etc.) that's acceptable slack — a single extra request is not an abuse
 * vector. If you ever need strict limits, wrap both in a SECURITY DEFINER
 * RPC that runs inside a single transaction.
 */

export interface RateLimitResult {
  allowed: boolean
  /** Seconds the caller should wait before retrying (equal to windowSeconds). */
  retryAfterSec?: number
}

export async function checkRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  if (!bucket || limit < 1 || windowSeconds < 1) {
    // Misconfigured call — fail open so we don't block legitimate traffic on
    // a developer mistake. The warning surfaces it in server logs.
    console.warn('[rate-limit] invalid config', { bucket, limit, windowSeconds })
    return { allowed: true }
  }

  const service = createServiceClient()
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

  const { count, error: countErr } = await service
    .from('rate_limit_hits')
    .select('id', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .gte('created_at', windowStart)

  if (countErr) {
    // DB down — fail open rather than locking users out. The user would
    // rather see a degraded experience than a false "rate limit" page.
    console.error('[rate-limit] count failed', countErr)
    return { allowed: true }
  }

  if ((count ?? 0) >= limit) {
    return { allowed: false, retryAfterSec: windowSeconds }
  }

  // Record the hit. If this insert fails we still allow the request — the
  // user shouldn't be blocked because our ledger is broken.
  const { error: insertErr } = await service
    .from('rate_limit_hits')
    .insert({ bucket })
  if (insertErr) {
    console.error('[rate-limit] insert failed', insertErr)
  }

  return { allowed: true }
}

/**
 * Best-effort client IP extraction. Next.js (and most hosts) put the real
 * client address in `x-forwarded-for`, possibly as a comma-separated chain
 * of hops — the leftmost entry is the original client. Falls back to
 * `x-real-ip` and finally to a synthetic "unknown" which still works as a
 * bucket key (everyone with no IP shares a limit; acceptable for tiny
 * shares of traffic, which is what that usually is).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = h.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
