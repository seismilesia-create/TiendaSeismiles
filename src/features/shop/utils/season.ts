// ============================================================
// SEASON UTILITY - SEISMILES Textil
// Determina la temporada actual (hemisferio sur)
// y la prioridad de categorías para el home
// ============================================================

export type Season = 'verano' | 'otono' | 'invierno' | 'primavera'

/**
 * Determina la temporada actual basándose en el mes.
 * Hemisferio sur (Argentina):
 *   Dic-Feb → verano
 *   Mar-May → otoño
 *   Jun-Ago → invierno
 *   Sep-Nov → primavera
 */
export function getSeason(): Season {
  const month = new Date().getMonth() + 1
  if (month >= 12 || month <= 2) return 'verano'
  if (month >= 3 && month <= 5) return 'otono'
  if (month >= 6 && month <= 8) return 'invierno'
  return 'primavera'
}

/** Prioridad de categorías de producto por temporada */
const SEASON_CATEGORY_PRIORITY: Record<Season, string[]> = {
  verano: ['remeras-lisas', 'remeras-estampadas', 'buzos-camperas'],
  otono: ['buzos-camperas', 'remeras-lisas', 'remeras-estampadas'],
  invierno: ['buzos-camperas', 'remeras-lisas', 'remeras-estampadas'],
  primavera: ['remeras-lisas', 'remeras-estampadas', 'buzos-camperas'],
}

/** Tab ID default para el grid de categorías según la temporada */
const SEASON_DEFAULT_TAB: Record<Season, string> = {
  verano: 'remeras-lisas',
  otono: 'buzos-camperas',
  invierno: 'buzos-camperas',
  primavera: 'remeras-lisas',
}

/** Subtítulo estacional para la sección de destacados */
const SEASON_SUBTITLES: Record<Season, string> = {
  verano: 'Nuestra seleccion para los dias de calor. Frescura y estilo premium.',
  otono: 'Preparate para el frio con nuestras prendas mas elegidas.',
  invierno: 'Nuestra seleccion para los dias de frio. Abrigo con calidad de altura.',
  primavera: 'Las prendas que definen nuestro estandar. Calidad premium, confeccion catamarquena.',
}

/** Devuelve la prioridad de categorías para una temporada */
export function getSeasonCategoryPriority(season: Season): string[] {
  return SEASON_CATEGORY_PRIORITY[season]
}

/** Devuelve el tab default para el grid de categorías */
export function getSeasonDefaultTab(season: Season): string {
  return SEASON_DEFAULT_TAB[season]
}

/** Devuelve el subtítulo estacional para la sección de destacados */
export function getSeasonSubtitle(season: Season): string {
  return SEASON_SUBTITLES[season]
}
