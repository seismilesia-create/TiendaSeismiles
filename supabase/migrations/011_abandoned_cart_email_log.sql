-- Append-only log of every abandoned-cart email actually delivered. Used by
-- the cron to enforce cross-cycle cooldowns: once a user has received any
-- abandoned-cart email, they cannot enter a new cycle for COOLDOWN_DAYS
-- (currently 30, hardcoded in the route). Without this log, a user could
-- empty + re-add their cart to reset email_N_sent_at on the abandoned_carts
-- row and farm fresh discount codes indefinitely.
--
-- Conversion wipes the log for a user (see markAbandonedCartConverted): a
-- legitimate buyer who completes an order earns a fresh cycle.

CREATE TABLE IF NOT EXISTS public.abandoned_cart_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('reminder', 'discount10', 'lastChance15')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  coupon_code text,
  cart_subtotal numeric
);

CREATE INDEX IF NOT EXISTS abandoned_cart_email_log_user_sent_idx
  ON public.abandoned_cart_email_log (user_id, sent_at DESC);

ALTER TABLE public.abandoned_cart_email_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.abandoned_cart_email_log IS
  'Append-only audit of abandoned-cart emails sent. Outlives abandoned_carts deletions, so the cron can enforce 30-day cooldown across cart wipe/recreate cycles.';
