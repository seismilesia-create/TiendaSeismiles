-- Schedule the abandoned-cart cron.
--
-- This migration MUST be applied AFTER:
--   1. The Next.js app is deployed with /api/cron/abandoned-cart available.
--   2. The following secrets are set as Postgres GUCs via Vault or
--      ALTER DATABASE SET on the Supabase project:
--        * app.cron_secret         — bearer token matching process.env.CRON_SECRET
--        * app.abandoned_cart_url  — absolute URL of the endpoint
--          (e.g. https://seismilestextil.com.ar/api/cron/abandoned-cart)
--
--   In the Supabase dashboard under Settings → Vault, create:
--     - cron_secret  (random 32+ char string, also set as CRON_SECRET in Vercel)
--     - abandoned_cart_url  (the production URL above)
--
-- Runs every 15 minutes. That's fine-grained enough that a user who abandons
-- is reached at most 15 min past the 1h/24h/48h thresholds — acceptable given
-- the email cadence operates in hours.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule prior copies so reapplying the migration is idempotent.
DO $$
DECLARE
  job_id bigint;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'abandoned-cart-sweep';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END $$;

SELECT cron.schedule(
  'abandoned-cart-sweep',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'abandoned_cart_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
      ),
      body := '{}'::jsonb
    );
  $$
);
