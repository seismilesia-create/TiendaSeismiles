-- Move coupon reservation from payment-confirm time to checkout-apply time.
--
-- Why: before this, the coupon usage was only inserted into cupon_usos when
-- the order was confirmed. That left a window where two concurrent checkouts
-- (same user, or different users racing for the last max_usos slot) would
-- both pass validation and both confirm — over-consuming the coupon.
--
-- The fix: reserve atomically under a row-level lock on cupones.id at the
-- moment the user applies the coupon, and release the reservation if the
-- order is canceled or the pending-cleanup path deletes the order.

-- ─────────────────────────────────────────────────────────────────────────
-- reserve_coupon: atomically validate + insert cupon_usos + bump counter.
--
-- Locks the cupones row (FOR UPDATE), re-runs every validation against the
-- authoritative cupon_usos count, and on success inserts the reservation row
-- with the given compra_ids. Concurrent attempts serialize on the row lock,
-- so max_usos and per-user limits are enforced exactly.
--
-- Returns:
--   {ok: true}  on success
--   {ok: false, reason: '...'} on any validation failure
--     reasons: 'not_found' | 'inactive' | 'expired' | 'not_started'
--            | 'below_minimum' | 'maxed' | 'already_used'
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reserve_coupon(
  p_coupon_id uuid,
  p_user_id uuid,
  p_total_pedido numeric,
  p_compra_ids text[],
  p_descuento numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_coupon RECORD;
  v_total_uses INTEGER;
  v_user_uses INTEGER;
BEGIN
  -- Lock the coupon row; concurrent reservations serialize here.
  SELECT * INTO v_coupon FROM cupones WHERE id = p_coupon_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF v_coupon.activo IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'inactive');
  END IF;

  IF v_coupon.fecha_fin IS NOT NULL AND v_coupon.fecha_fin < NOW() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  IF v_coupon.fecha_inicio IS NOT NULL AND v_coupon.fecha_inicio > NOW() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_started');
  END IF;

  IF v_coupon.minimo_compra IS NOT NULL AND p_total_pedido < v_coupon.minimo_compra THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'below_minimum');
  END IF;

  IF v_coupon.max_usos IS NOT NULL THEN
    SELECT COUNT(*) INTO v_total_uses FROM cupon_usos WHERE cupon_id = p_coupon_id;
    IF v_total_uses >= v_coupon.max_usos THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'maxed');
    END IF;
  END IF;

  IF v_coupon.un_uso_por_usuario THEN
    SELECT COUNT(*) INTO v_user_uses
    FROM cupon_usos
    WHERE cupon_id = p_coupon_id AND user_id = p_user_id;
    IF v_user_uses > 0 THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'already_used');
    END IF;
  END IF;

  INSERT INTO cupon_usos (cupon_id, user_id, compra_ids, descuento_aplicado)
  VALUES (p_coupon_id, p_user_id, p_compra_ids, p_descuento);

  UPDATE cupones
  SET usos_actuales = COALESCE(usos_actuales, 0) + 1
  WHERE id = p_coupon_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- release_coupon: undo a previous reservation. Deletes the cupon_usos row
-- whose compra_ids overlap the given array, and decrements the display
-- counter by however many rows were deleted. Idempotent — calling twice
-- just no-ops the second time (0 rows deleted, no counter change).
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.release_coupon(
  p_coupon_id uuid,
  p_compra_ids text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM cupon_usos
  WHERE cupon_id = p_coupon_id
    AND compra_ids && p_compra_ids;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE cupones
    SET usos_actuales = GREATEST(0, COALESCE(usos_actuales, 0) - v_deleted)
    WHERE id = p_coupon_id;
  END IF;
END;
$$;
