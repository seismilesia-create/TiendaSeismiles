/**
 * Convert a línea slug into its display label.
 * Example: 'arista' → 'Línea Arista', 'tres-cruces' → 'Línea Tres Cruces'.
 */
export function formatLineaLabel(slug: string | null | undefined): string {
  if (!slug) return ''
  const titled = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  return `Línea ${titled}`
}
