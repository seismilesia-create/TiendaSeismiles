-- Schedule the GoCuotas reconciliation sweep.
--
-- Safety net for missed GoCuotas webhooks (the webhook is unsigned and can be
-- lost). Re-checks still-pending GoCuotas orders directly against GoCuotas via
-- the app endpoint, which runs the same idempotent, server-verified
-- confirmGocuotasPayment path the webhook uses.
--
-- This migration MUST be applied AFTER:
--   1. The Next.js app is deployed with /api/cron/gocuotas-reconcile available.
--   2. These secrets exist in Supabase Vault (Settings → Vault):
--        * cron_secret             — bearer token matching process.env.CRON_SECRET
--                                    (the SAME secret the abandoned-cart cron uses)
--        * gocuotas_reconcile_url  — absolute URL of the endpoint, e.g.
--          https://www.seismilestextil.com.ar/api/cron/gocuotas-reconcile
--          (use the www canonical host so the 307 redirect doesn't drop the
--          Authorization header).
--
-- Runs every 10 minutes. The webhook is still the primary path; this only
-- backstops the rare miss, so sub-10-minute latency is unnecessary.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule prior copies so reapplying the migration is idempotent.
DO $$
DECLARE
  job_id bigint;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'gocuotas-reconcile-sweep';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END $$;

SELECT cron.schedule(
  'gocuotas-reconcile-sweep',
  '*/10 * * * *',
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'gocuotas_reconcile_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
      ),
      body := '{}'::jsonb
    );
  $$
);
