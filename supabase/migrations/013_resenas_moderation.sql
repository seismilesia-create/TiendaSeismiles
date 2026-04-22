-- =============================================
-- MIGRACION 013: Moderacion de resenas
--
-- Permite al admin ocultar resenas (comentarios fuera de lugar, spam,
-- o contenido que no aporta valor) sin perder el registro historico.
-- La columna `oculta` agrega un filtro a la policy publica de SELECT
-- — el admin ve todo via service role que bypasea RLS.
-- =============================================

ALTER TABLE resenas
  ADD COLUMN IF NOT EXISTS oculta BOOLEAN NOT NULL DEFAULT false;

-- Reemplazar la policy publica para ocultar resenas moderadas.
-- El autor pierde visibilidad de su propia resena cuando queda oculta
-- — es una decision deliberada: si el admin oculta por contenido
-- inapropiado, mostrarsela al autor envia senales contradictorias.
-- Si el autor crea una resena nueva, el upsert la sobrescribe y queda
-- visible de nuevo hasta que el admin la oculte otra vez.
DROP POLICY IF EXISTS "Reviews are publicly readable" ON resenas;
CREATE POLICY "Reviews are publicly readable" ON resenas
  FOR SELECT USING (oculta = false);

-- Indice parcial para acelerar el listado publico (que siempre filtra
-- por oculta = false). El indice `resenas_producto_idx` de la migracion
-- 012 cubre la variante admin que mira todas.
CREATE INDEX IF NOT EXISTS resenas_visible_idx
  ON resenas(producto_id) WHERE oculta = false;
