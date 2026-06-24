-- GoCuotas payment provider fields on compras.
--
-- GoCuotas runs in parallel to Mercado Pago behind a `provider` flag. It uses
-- the same "create checkout at provider → redirect → confirm by webhook"
-- pattern, so it mirrors the MP columns (mp_preference_id / mp_payment_id):
--
--   gocuotas_order_ref       our externalRef (= order_reference_id we send to
--                            GoCuotas). Conciliation key, shared by every
--                            compras row of one checkout — mirrors
--                            mp_preference_id and is used for the cohesion
--                            check in confirmGocuotasPayment.
--   gocuotas_order_id        the order id GoCuotas returns (known only once the
--                            webhook fires / after GET /orders).
--   gocuotas_amount_in_cents the exact amount (in CENTS) we charged through
--                            GoCuotas. Stored so the webhook can verify the
--                            amount_in_cents returned by GET /orders matches
--                            what we expected, without recomputing coupon + GC.
--
-- The GoCuotas webhook has NO signature, so confirmation relies 100% on
-- re-querying GET /orders and matching status='approved' AND this amount.
ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS gocuotas_order_ref text,
  ADD COLUMN IF NOT EXISTS gocuotas_order_id text,
  ADD COLUMN IF NOT EXISTS gocuotas_amount_in_cents bigint
    CHECK (gocuotas_amount_in_cents IS NULL OR gocuotas_amount_in_cents >= 0);

CREATE INDEX IF NOT EXISTS idx_compras_gocuotas_order_ref
  ON compras (gocuotas_order_ref);
