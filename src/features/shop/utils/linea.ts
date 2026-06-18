/**
 * Slugs whose pretty label can't be reconstructed from the slug alone
 * (accents, special casing). Falls back to the auto-titled version otherwise.
 */
const LABEL_OVERRIDES: Record<string, string> = {
  mistica: 'Mística',
}

/**
 * Líneas de edición limitada. Los productos de estas líneas muestran el badge
 * "Edición limitada" en el catálogo y el detalle. Agregá más slugs acá si en
 * el futuro hay otra línea limitada.
 */
const LIMITED_EDITION_LINEAS = new Set(['mistica'])

/** True si la línea es de edición limitada (no se basa en stock, sino en la línea). */
export function isLimitedEditionLinea(slug: string | null | undefined): boolean {
  return !!slug && LIMITED_EDITION_LINEAS.has(slug)
}

/**
 * Convert a línea slug into its display label.
 * Example: 'arista' → 'Línea Arista', 'tres-cruces' → 'Línea Tres Cruces',
 * 'mistica' → 'Línea Mística'.
 */
export function formatLineaLabel(slug: string | null | undefined): string {
  if (!slug) return ''
  const titled =
    LABEL_OVERRIDES[slug] ??
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  return `Línea ${titled}`
}
