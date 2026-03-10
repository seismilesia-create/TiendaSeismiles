-- =============================================
-- SEED DATA: Datos iniciales - Seismiles Textil
-- =============================================

-- Lineas de producto
INSERT INTO product_lines (name, slug, description, display_order, is_active) VALUES
  ('Remeras Algodon', 'remeras-algodon', 'De basico a premium. Fibras seleccionadas para textura suave y duradera.', 1, true),
  ('Remeras Pique', 'remeras-pique', 'El tejido que marca la diferencia. Tacto superior, estructura que no pierde forma.', 2, true),
  ('Buzos Canguro', 'buzos-canguro', 'Super Premium. Confeccion superior con amplia gama de colores.', 3, true);

-- Colores base (ampliable - especialmente para Buzos Canguro)
INSERT INTO colors (name, slug, hex_code, display_order) VALUES
  ('Negro Volcanico', 'negro-volcanico', '#1A1614', 1),
  ('Blanco Nieve', 'blanco-nieve', '#FAFAFA', 2),
  ('Gris Ceniza', 'gris-ceniza', '#6B6B6B', 3),
  ('Terracotta', 'terracotta', '#C75B39', 4),
  ('Arena', 'arena', '#D4C5A9', 5),
  ('Azul Noche', 'azul-noche', '#1B2A4A', 6),
  ('Verde Cactus', 'verde-cactus', '#4A6741', 7),
  ('Bordo Andino', 'bordo-andino', '#722F37', 8),
  ('Mostaza Desierto', 'mostaza-desierto', '#C49B2A', 9),
  ('Rosa Viejo', 'rosa-viejo', '#C48B8B', 10),
  ('Celeste Cielo', 'celeste-cielo', '#87CEEB', 11),
  ('Marron Tierra', 'marron-tierra', '#6B4226', 12),
  ('Lila Crepusculo', 'lila-crepusculo', '#9B7DB8', 13),
  ('Salmon', 'salmon', '#E8967A', 14),
  ('Oliva', 'oliva', '#6B7B3A', 15);

-- Talles
INSERT INTO sizes (name, display_order) VALUES
  ('XS', 1),
  ('S', 2),
  ('M', 3),
  ('L', 4),
  ('XL', 5),
  ('XXL', 6);
