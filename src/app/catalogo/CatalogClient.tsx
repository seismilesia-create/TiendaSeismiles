'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { MountainIcon } from '@/features/shop/components'
import { CatalogHeader } from './CatalogHeader'
import { MobileFilters, DesktopFilters, DesktopToolbar, type FilterColor, type FilterLine } from './CatalogFilters'
import { formatLineaLabel } from '@/features/shop/utils/linea'
import type { CatalogProductFromDB } from '@/features/shop/services/product-lines'

/* ─── Derive available filter options from products ─── */

const TALLE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

function deriveColors(products: CatalogProductFromDB[]): FilterColor[] {
  // Group by color_base. Each entry: base slug → { hex: color_base_hex, label: capitalized }
  const map = new Map<string, { hex: string; label: string }>()
  for (const p of products) {
    for (const c of p.colores) {
      if (c.color_base && c.color_base_hex && !map.has(c.color_base)) {
        const label = c.color_base.charAt(0).toUpperCase() + c.color_base.slice(1)
        map.set(c.color_base, { hex: c.color_base_hex, label })
      }
    }
  }
  return Array.from(map.entries()).map(([, { hex, label }]) => ({ hex, label }))
}

function deriveLines(products: CatalogProductFromDB[]): FilterLine[] {
  const map = new Map<string, string>() // linea slug → categoria
  for (const p of products) {
    if (p.linea && !map.has(p.linea)) {
      map.set(p.linea, p.categoria)
    }
  }
  return Array.from(map.entries())
    .map(([value, type]) => ({ value, label: formatLineaLabel(value), type }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

function deriveSizes(products: CatalogProductFromDB[]): string[] {
  const set = new Set<string>()
  for (const p of products) {
    for (const v of p.variantes) {
      set.add(v.talle)
    }
  }
  return Array.from(set).sort((a, b) => {
    const ia = TALLE_ORDER.indexOf(a)
    const ib = TALLE_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

/* ─── Filter & sort ─── */

function filterProducts(
  products: CatalogProductFromDB[],
  type: string,
  line: string,
  color: string | null,
  sizes: string[],
): CatalogProductFromDB[] {
  return products.filter((p) => {
    if (type !== 'todos' && p.categoria !== type) return false
    if (line !== 'todos' && p.linea !== line) return false
    if (color && !p.colores.some((c) => c.color_base_hex === color)) return false
    if (sizes.length > 0 && !p.variantes.some((v) => sizes.includes(v.talle))) return false
    return true
  })
}

function sortProducts(products: CatalogProductFromDB[], sort: string): CatalogProductFromDB[] {
  const sorted = [...products]
  switch (sort) {
    case 'precio-asc':
      return sorted.sort((a, b) => a.precio - b.precio)
    case 'precio-desc':
      return sorted.sort((a, b) => b.precio - a.precio)
    case 'nuevos':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'destacados':
      return sorted.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
    default:
      return sorted
  }
}

/* ─── Main Component ─── */

interface CatalogClientProps {
  products: CatalogProductFromDB[]
  favoriteProductIds?: string[]
  isLoggedIn?: boolean
}

/* Valid type param values that map to catalog filter */
const VALID_TYPES = ['remeras-lisas']

function CatalogInner({ products, favoriteProductIds = [], isLoggedIn = false }: CatalogClientProps) {
  const favoriteSet = useMemo(() => new Set(favoriteProductIds), [favoriteProductIds])
  const searchParams = useSearchParams()
  const paramType = searchParams.get('type')
  const paramLinea = searchParams.get('linea')

  const [activeType, setActiveType] = useState(() =>
    paramType && VALID_TYPES.includes(paramType) ? paramType : 'todos'
  )
  const [activeLine, setActiveLine] = useState(() =>
    paramLinea ?? 'todos'
  )
  const [activeSort, setActiveSort] = useState('destacados')
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [activeSizes, setActiveSizes] = useState<string[]>([])

  // Sync filters when URL search params change (e.g. clicking a new navbar link)
  useEffect(() => {
    const t = searchParams.get('type')
    const l = searchParams.get('linea')
    setActiveType(t && VALID_TYPES.includes(t) ? t : 'todos')
    setActiveLine(l ?? 'todos')
    setActiveColor(null)
    setActiveSizes([])
  }, [searchParams])

  const availableColors = useMemo(() => deriveColors(products), [products])
  const availableSizes = useMemo(() => deriveSizes(products), [products])
  const availableLines = useMemo(() => deriveLines(products), [products])

  function handleTypeChange(type: string) {
    setActiveType(type)
    setActiveLine('todos')
  }

  function handleColorChange(color: string) {
    // Click el mismo color → limpia. Click otro → reemplaza.
    setActiveColor((prev) => (prev === color ? null : color))
  }

  function handleSizeToggle(size: string) {
    setActiveSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  function handleClearAll() {
    setActiveType('todos')
    setActiveLine('todos')
    setActiveColor(null)
    setActiveSizes([])
  }

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, activeType, activeLine, activeColor, activeSizes)
    return sortProducts(filtered, activeSort)
  }, [products, activeType, activeLine, activeSort, activeColor, activeSizes])

  const filterProps = {
    activeType,
    onTypeChange: handleTypeChange,
    activeLine,
    onLineChange: setActiveLine,
    activeSort,
    onSortChange: setActiveSort,
    activeColor,
    onColorChange: handleColorChange,
    activeSizes,
    onSizeToggle: handleSizeToggle,
    totalProducts: filteredProducts.length,
    onClearAll: handleClearAll,
    availableColors,
    availableSizes,
    availableLines,
  }

  return (
    <>
      <CatalogHeader
        title="Nuestras Prendas"
        subtitle="Cada prenda nace de la inmensidad del altiplano. Algodones premium, estampas únicas, la confianza que vestís."
      />

      <section className="bg-sand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Mobile filters */}
        <MobileFilters {...filterProps} />

        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <DesktopFilters {...filterProps} />

          {/* Product grid */}
          <div>
            <DesktopToolbar
              activeSort={activeSort}
              onSortChange={setActiveSort}
              totalProducts={filteredProducts.length}
            />

            {filteredProducts.length > 0 ? (
              <div className="mt-6 lg:mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorited={favoriteSet.has(product.id)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <MountainIcon className="mb-4 h-10 w-10 text-volcanic-300" />
                <p className="font-heading text-display-xs text-volcanic-900">
                  No encontramos productos
                </p>
                <p className="mt-2 text-body-sm text-volcanic-500 text-center">
                  {products.length === 0
                    ? 'Todavía no hay productos cargados. Pronto estarán disponibles.'
                    : 'Probá ajustando los filtros para explorar nuestra colección.'}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="mt-6 px-6 py-2.5 border border-volcanic-900 text-[11px] font-bold uppercase tracking-[0.15em] text-volcanic-900 rounded-xl transition-colors hover:bg-volcanic-900 hover:text-white"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {/* Bottom stats */}
            {filteredProducts.length > 0 && (
              <div className="mt-16 border-t border-sand-200 pt-10">
                <div className="flex flex-col items-center gap-4">
                  <MountainIcon className="h-5 w-5 text-terra-500" />
                  <p className="text-center text-body-xs font-semibold uppercase tracking-widest text-volcanic-500">
                    {`Mostrando ${filteredProducts.length} de ${products.length} productos`}
                  </p>
                  <p className="max-w-md text-center text-body-sm leading-relaxed text-volcanic-500">
                    Todas nuestras prendas están hechas con materiales premium de primera calidad.
                    Retiro gratis en Catamarca capital y cadetería en el Valle Central.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </section>
    </>
  )
}

export function CatalogClient({ products, favoriteProductIds, isLoggedIn }: CatalogClientProps) {
  return (
    <Suspense>
      <CatalogInner products={products} favoriteProductIds={favoriteProductIds} isLoggedIn={isLoggedIn} />
    </Suspense>
  )
}
