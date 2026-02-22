-- =============================================
-- MIGRACION 001: Catalogo de Productos - Seismiles Textil
-- Modelo: lineas > productos > variantes (color+talle) > fotos
-- =============================================

-- =============================================
-- 1. LINEAS DE PRODUCTO
-- =============================================
CREATE TABLE product_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PRODUCTOS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_line_id UUID NOT NULL REFERENCES product_lines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. COLORES (catalogo maestro)
-- =============================================
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

-- =============================================
-- 4. TALLES (catalogo maestro)
-- =============================================
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

-- =============================================
-- 5. VARIANTES DE PRODUCTO (color + talle)
-- =============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES colors(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  sku TEXT UNIQUE,
  price_override DECIMAL(10,2),
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color_id, size_id)
);

-- =============================================
-- 6. FOTOS POR VARIANTE DE COLOR
-- color_id NULL = foto general del producto
-- color_id NOT NULL = foto especifica de esa variante
-- =============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id UUID REFERENCES colors(id),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. NEWSLETTER
-- =============================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  coupon_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE product_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Lectura publica para catalogo
CREATE POLICY "Public read product_lines" ON product_lines FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Public read products" ON products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Public read colors" ON colors FOR SELECT TO anon USING (true);
CREATE POLICY "Public read sizes" ON sizes FOR SELECT TO anon USING (true);
CREATE POLICY "Public read variants" ON product_variants FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Public read images" ON product_images FOR SELECT TO anon USING (true);

-- Newsletter: solo insert publico
CREATE POLICY "Public insert newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);

-- =============================================
-- INDICES
-- =============================================
CREATE INDEX idx_products_line ON products(product_line_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_color ON product_variants(color_id);
CREATE INDEX idx_images_product_color ON product_images(product_id, color_id);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
