-- Agrupa las filas de compras que pertenecen a un mismo checkout.
--
-- place_order crea una fila por producto, cada una con su propio numero_pedido
-- (SM-YYYYMMDD-XXXX). Hasta ahora no había forma de saber qué filas eran de la
-- misma compra, así que cada producto generaba su propio email de confirmación.
--
-- compra_grupo es un código compartido por todas las filas del mismo checkout
-- (lo setea checkout.ts justo después de place_order). Sirve para:
--   • mandar UN solo email por compra (con todos los productos y el total real)
--   • mostrar un número de compra único al cliente
--
-- Nullable: las compras viejas (anteriores a esta feature) quedan en NULL y el
-- email cae al comportamiento legacy (agrupa por numero_pedido = 1 por fila).

ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS compra_grupo text;

CREATE INDEX IF NOT EXISTS idx_compras_compra_grupo
  ON compras (compra_grupo);
