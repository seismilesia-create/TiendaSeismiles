-- Atomic operations for checkout side effects.
--
-- Why: the previous code did read-modify-write for gift card balances and
-- coupon usage counters, which is race-prone. Plus the same checkout's side
-- effects could be applied twice (once by confirmPayment on user return from
-- MP, once by the MP webhook) — this migration provides building blocks for
-- the idempotent refactor in src/actions/checkout.ts.

-- ─────────────────────────────────────────────────────────────────────────
-- deduct_gift_card: atomic balance decrement with guard.
-- Returns {ok: true, new_balance: N} on success.
-- Returns {ok: false, reason: '...'} if the card is inactive, not found, or
-- has insufficient balance. Never drives saldo_restante below 0.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deduct_gift_card(p_gc_id uuid, p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_amount');
  END IF;

  UPDATE gift_cards
  SET saldo_restante = saldo_restante - p_amount
  WHERE id = p_gc_id
    AND estado = 'activa'
    AND COALESCE(saldo_restante, 0) >= p_amount
  RETURNING saldo_restante INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_or_inactive');
  END IF;

  RETURN jsonb_build_object('ok', true, 'new_balance', v_new_balance);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- refund_gift_card: atomic balance increment. Used when a pending order that
-- had already deducted a gift card is rolled back. Today the code does not
-- call this (deduction happens at confirm time, not apply time), but it is
-- kept here because the intended future flow reserves balance at apply time.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refund_gift_card(p_gc_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN;
  END IF;

  UPDATE gift_cards
  SET saldo_restante = COALESCE(saldo_restante, 0) + p_amount
  WHERE id = p_gc_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- increment_coupon_usos: atomic increment of the denormalized usage counter
-- on the cupones row. The authoritative count is count(*) on cupon_usos, so
-- this counter is for admin display only; keeping it atomic prevents drift.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_coupon_usos(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE cupones
  SET usos_actuales = COALESCE(usos_actuales, 0) + 1
  WHERE id = p_coupon_id;
END;
$$;
