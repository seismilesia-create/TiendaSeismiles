-- Shipping fields on compras.
--
-- Soft-launch scope: two shipping methods — pickup in Catamarca capital ($0)
-- and local courier in Valle Central (fixed cost, validated server-side).
-- "Envío al resto del país" is announced as coming-soon and does NOT create
-- an order, so it is not represented in the enum.

ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS metodo_envio text
    CHECK (metodo_envio IN ('retiro', 'cadeteria')),
  ADD COLUMN IF NOT EXISTS costo_envio numeric NOT NULL DEFAULT 0
    CHECK (costo_envio >= 0),
  ADD COLUMN IF NOT EXISTS direccion_envio text;

-- Require an address only when the method is cadeteria. Pickup orders leave
-- direccion_envio NULL on purpose.
ALTER TABLE compras
  ADD CONSTRAINT compras_direccion_envio_cadeteria
    CHECK (
      metodo_envio IS DISTINCT FROM 'cadeteria'
      OR (direccion_envio IS NOT NULL AND length(trim(direccion_envio)) > 0)
    );
