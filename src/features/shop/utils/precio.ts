/** Formatea un número como precio en pesos argentinos: 49100 → "$49.100". */
export function formatPrecio(n: number): string {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

/**
 * % de descuento entre el precio de lista (tachado) y el precio actual (lanzamiento).
 * Devuelve null si no hay un descuento válido para mostrar.
 */
export function descuentoPct(precio: number, precioLista?: number | null): number | null {
  if (!precioLista || precioLista <= precio) return null
  return Math.round((1 - precio / precioLista) * 100)
}
