-- Abandoned cart tracking.
--
-- One row per logged-in user. The row follows the user's cart lifecycle:
--   * items present → row exists with converted_at NULL, last_activity_at
--     bumped every time the client syncs.
--   * items empty → row deleted by the upsert action.
--   * order confirmed → converted_at set by checkout action.
--
-- The cron job picks up active rows whose last_activity_at crossed the
-- reminder, 10%, and 15% thresholds (1h / 24h / 48h respectively) and
-- bumps email_N_sent_at so each stage fires exactly once.

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  email_1_sent_at timestamptz,
  email_2_sent_at timestamptz,
  email_2_coupon_code text,
  email_3_sent_at timestamptz,
  email_3_coupon_code text,
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT abandoned_carts_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS abandoned_carts_active_activity_idx
  ON public.abandoned_carts (last_activity_at)
  WHERE converted_at IS NULL;

CREATE INDEX IF NOT EXISTS abandoned_carts_user_idx
  ON public.abandoned_carts (user_id);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.abandoned_carts IS
  'Server-side mirror of active logged-in user carts, used to drive abandoned-cart email flow. Deleted when the cart empties; converted_at set when the user completes an order.';
