-- Add color_base and color_base_hex to support grouped color filtering
-- color_base: canonical group name ('rojo', 'azul', etc.)
-- color_base_hex: hex code for the filter swatch

ALTER TABLE colores ADD COLUMN IF NOT EXISTS color_base text;
ALTER TABLE colores ADD COLUMN IF NOT EXISTS color_base_hex text;
