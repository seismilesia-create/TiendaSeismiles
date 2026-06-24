/**
 * Cuotas sin interés que se anuncian en el sitio.
 *
 * IMPORTANTE: este número es solo el texto que se MUESTRA en las tarjetas y el
 * detalle. El financiamiento real lo define tu cuenta de MercadoPago. Para que
 * "sin interés" sea verdad, tenés que activar esa promoción en el panel de MP
 * (vos absorbés el costo). Mantené este número igual al que configures allá.
 *
 * Poné 0 (o 1) para ocultar el mensaje de cuotas en todo el sitio.
 */
export const CUOTAS_SIN_INTERES = 3

/**
 * Devuelve el texto de cuotas para un precio (ej. "3 cuotas sin interés de $16.633"),
 * o null si no corresponde mostrarlo.
 */
export function cuotasLabel(precio: number): string | null {
  if (!precio || precio <= 0 || CUOTAS_SIN_INTERES < 2) return null
  const monto = Math.round(precio / CUOTAS_SIN_INTERES)
  return `${CUOTAS_SIN_INTERES} cuotas sin interés de $${monto.toLocaleString('es-AR')}`
}
