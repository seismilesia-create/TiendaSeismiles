-- =============================================
-- MIGRACION 012: Sistema de resenas de productos
--
-- La tabla ya existe en el entorno remoto desde migraciones tempranas
-- aplicadas via el dashboard de Supabase (20260227221551 + 20260227232656).
-- Este archivo sincroniza el historial local con el estado real para que
-- cualquier entorno nuevo (dev local, branch preview) quede consistente.
--
-- Modelo: una resena por (user_id, producto_id). La puntuacion general es
-- obligatoria (1-5). Los detalles comodidad/calidad/ajuste/longitud son
-- opcionales y se muestran agregados en el resumen del producto.
--
-- Solo compradores verificados (hay registro en `compras`) o admins
-- pueden insertar; el control se hace server-side en el action
-- `submitReview` usando el service role. La policy INSERT a nivel RLS
-- unicamente exige que el autor coincida con auth.uid().
-- =============================================

CREATE TABLE IF NOT EXISTS resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Puntuacion general obligatoria (1-5 estrellas).
  puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),

  -- Detalles opcionales del producto.
  --   comodidad / calidad: escala 1-5 estrellas.
  --   ajuste: 1=muy ajustado ... 5=muy holgado (3 = perfecto).
  --   longitud: 1=corto ... 5=largo (3 = perfecto).
  comodidad SMALLINT CHECK (comodidad BETWEEN 1 AND 5),
  calidad SMALLINT CHECK (calidad BETWEEN 1 AND 5),
  ajuste SMALLINT CHECK (ajuste BETWEEN 1 AND 5),
  longitud SMALLINT CHECK (longitud BETWEEN 1 AND 5),

  comentario TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK adicional a profiles para poder hacer el join que usa getProductReviews.
-- PostgREST resuelve la relacion por esta FK en la query
-- `.select('..., profiles(full_name, email)')`.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'resenas_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE resenas
      ADD CONSTRAINT resenas_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Una resena por usuario y producto. Soporta el upsert con
-- onConflict='user_id,producto_id' de submitReview.
CREATE UNIQUE INDEX IF NOT EXISTS resenas_user_product_idx
  ON resenas(user_id, producto_id);

-- Indice para el listado por producto (getProductReviews).
CREATE INDEX IF NOT EXISTS resenas_producto_idx
  ON resenas(producto_id);

ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- Lectura publica: queremos que cualquiera pueda ver el social proof en
-- la pagina de producto, sin necesidad de login (perfil "Ballena"
-- emocional-lento que busca seguridad antes de comprar).
DROP POLICY IF EXISTS "Reviews are publicly readable" ON resenas;
CREATE POLICY "Reviews are publicly readable" ON resenas
  FOR SELECT USING (true);

-- Usuarios autenticados operan unicamente sobre su propia resena.
DROP POLICY IF EXISTS "Users can insert own review" ON resenas;
CREATE POLICY "Users can insert own review" ON resenas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own review" ON resenas;
CREATE POLICY "Users can update own review" ON resenas
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own review" ON resenas;
CREATE POLICY "Users can delete own review" ON resenas
  FOR DELETE USING (auth.uid() = user_id);

-- Belt-and-suspenders: denegar cualquier intento del rol anon (mismo
-- patron que migracion 006).
DROP POLICY IF EXISTS "anon_deny_insert" ON resenas;
CREATE POLICY "anon_deny_insert" ON resenas AS RESTRICTIVE
  FOR INSERT TO anon WITH CHECK (false);

DROP POLICY IF EXISTS "anon_deny_update" ON resenas;
CREATE POLICY "anon_deny_update" ON resenas AS RESTRICTIVE
  FOR UPDATE TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "anon_deny_delete" ON resenas;
CREATE POLICY "anon_deny_delete" ON resenas AS RESTRICTIVE
  FOR DELETE TO anon USING (false);
