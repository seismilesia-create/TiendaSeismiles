-- Generic rate-limit ledger. One row per attempted action. The "bucket"
-- column names the thing being limited, typically composed as
--   "<feature>:<dimension>:<value>"
-- e.g. "arrepentimiento:ip:1.2.3.4" or "contact:email:foo@bar.com".
--
-- Consumed via src/lib/rate-limit/index.ts:checkRateLimit(bucket, limit,
-- windowSeconds). The helper counts hits inside the rolling window and
-- inserts a new row if under the limit.
--
-- Written exclusively through the service role client. anon and
-- authenticated are explicitly denied by RESTRICTIVE policies below, so
-- even if a future permissive policy gets added by mistake, end-user
-- clients can never read or spam this table directly.
--
-- Retention: rows live forever unless pruned. For low-traffic sites the
-- growth is negligible (a few thousand rows per month). If it ever becomes
-- an issue, schedule a job that runs:
--   DELETE FROM public.rate_limit_hits WHERE created_at < NOW() - INTERVAL '7 days';

CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary query pattern: "count rows in this bucket newer than X". The
-- composite index serves both the WHERE and the ORDER-BY-DESC case.
CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_bucket_recent
  ON public.rate_limit_hits (bucket, created_at DESC);

ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_deny_all" ON public.rate_limit_hits;
CREATE POLICY "anon_deny_all" ON public.rate_limit_hits AS RESTRICTIVE
  FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "authenticated_deny_all" ON public.rate_limit_hits;
CREATE POLICY "authenticated_deny_all" ON public.rate_limit_hits AS RESTRICTIVE
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

COMMENT ON TABLE public.rate_limit_hits IS
  'Rate-limit ledger. Bucket names the thing being limited, e.g. '
  '"arrepentimiento:ip:1.2.3.4". Written exclusively via service role.';
