-- =============================================
-- MIGRACION 007: Boton de Arrepentimiento
-- Resolucion 424/2020 - Secretaria de Comercio Interior (Argentina)
--
-- Permite al consumidor ejercer el derecho de arrepentimiento previsto
-- en el art. 34 de la Ley 24.240 dentro de los 10 dias corridos desde
-- la celebracion del contrato o la recepcion del producto.
--
-- Requisitos legales cubiertos por esta tabla:
--  - Registrar la solicitud con un codigo unico (constancia).
--  - Conservar todos los datos que el consumidor declaro.
--  - Permitir al comercio procesarla dentro de las 24 hs.
--
-- El formulario publico acepta solicitudes aunque el numero de pedido
-- no matchee una compra existente: la ley no permite trabar la
-- recepcion de la solicitud. La validacion se hace despues, en admin.
-- =============================================

CREATE TABLE arrepentimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Codigo unico de constancia, formato ARR-YYYYMMDD-XXXX.
  -- Se entrega al consumidor y se referencia en cualquier comunicacion.
  codigo TEXT NOT NULL UNIQUE,

  -- Datos declarados por el consumidor (sin validar).
  nombre TEXT NOT NULL,
  dni TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,

  numero_pedido TEXT NOT NULL,
  fecha_compra DATE,
  metodo_pago TEXT,
  motivo TEXT,

  -- Link opcional a la compra si se encontro un match por numero_pedido.
  -- Puede quedar NULL si el consumidor ingresa un numero que no existe
  -- (por ejemplo, una compra off-line o mal tipeada) — igualmente hay
  -- que registrarla y procesarla.
  compra_id UUID REFERENCES compras(id) ON DELETE SET NULL,

  -- Estado del tramite interno.
  --   pendiente: recibida, sin procesar
  --   en_proceso: contactado al cliente, iniciando reembolso
  --   reembolsado: devolucion del dinero completada
  --   rechazado: fuera de plazo o producto ya usado (con motivo)
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_proceso', 'reembolsado', 'rechazado')),

  -- Notas internas del admin (no visibles al consumidor).
  nota_admin TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_arrepentimientos_estado ON arrepentimientos(estado);
CREATE INDEX idx_arrepentimientos_created_at ON arrepentimientos(created_at DESC);
CREATE INDEX idx_arrepentimientos_numero_pedido ON arrepentimientos(numero_pedido);
CREATE INDEX idx_arrepentimientos_compra_id ON arrepentimientos(compra_id)
  WHERE compra_id IS NOT NULL;

-- RLS: sin policies permisivas. Todas las escrituras pasan por server
-- actions con service role (ver src/lib/supabase/server.ts). El formulario
-- publico es anonimo — no queremos dar INSERT directo desde el cliente.
ALTER TABLE arrepentimientos ENABLE ROW LEVEL SECURITY;

-- Belt-and-suspenders: mismo patron que migracion 006.
CREATE POLICY "anon_deny_insert" ON arrepentimientos AS RESTRICTIVE
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "anon_deny_update" ON arrepentimientos AS RESTRICTIVE
  FOR UPDATE TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_deny_delete" ON arrepentimientos AS RESTRICTIVE
  FOR DELETE TO anon USING (false);
CREATE POLICY "anon_deny_select" ON arrepentimientos AS RESTRICTIVE
  FOR SELECT TO anon USING (false);

COMMENT ON TABLE arrepentimientos IS
  'Solicitudes del Boton de Arrepentimiento (Res. 424/2020). Todas las '
  'mutaciones pasan por server actions con service role. El formulario '
  'publico acepta solicitudes aun cuando el numero_pedido no matchee '
  'una compra existente — la ley no permite trabar la recepcion.';
