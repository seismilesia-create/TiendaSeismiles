'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { useCartHydrated } from '@/features/shop/hooks/useCartHydrated'
import { CartItemCard } from './CartItemCard'
import { CartSummary } from './CartSummary'
import { UpsellBanner } from './UpsellBanner'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { useCrossSell } from '@/features/shop/hooks/useCrossSell'
import type { CatalogProductFromDB } from '@/features/shop/services/product-lines'

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function CartSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-sand-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="mt-8 lg:mt-0">
        <div className="h-72 bg-sand-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="text-center py-16 lg:py-24">
      <ShoppingBagIcon className="w-16 h-16 mx-auto text-volcanic-300 mb-6" />
      <h2 className="font-heading text-display-xs text-volcanic-900 mb-3">
        Tu carrito está vacío
      </h2>
      <p className="text-body-md text-volcanic-500 mb-8 max-w-md mx-auto">
        Explorá nuestro catálogo y encontrá las prendas que te representan.
      </p>
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-md font-semibold rounded-xl transition-colors"
      >
        Ver catálogo
      </Link>
    </div>
  )
}

interface CartContentProps {
  allProducts: CatalogProductFromDB[]
  userId: string | null
}

export function CartContent({ allProducts, userId }: CartContentProps) {
  const items = useCartStore((s) => s.items)
  const hydrated = useCartHydrated()
  const { suggestion } = useCrossSell(items, allProducts)

  // Recomendaciones: buzos de distintas líneas. Mostramos un buzo por línea
  // primero (para que se vea variedad) y recién después completamos con el
  // resto si quedan slots libres.
  const recommendations = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.productId))

    const buzos = allProducts.filter(
      (p) => p.categoria === 'buzos' && !p.proximamente && !cartProductIds.has(p.id),
    )

    const seenLineas = new Set<string>()
    const oneacross: CatalogProductFromDB[] = []
    const rest: CatalogProductFromDB[] = []
    for (const p of buzos) {
      if (p.linea && !seenLineas.has(p.linea)) {
        seenLineas.add(p.linea)
        oneacross.push(p)
      } else {
        rest.push(p)
      }
    }

    return [...oneacross, ...rest].slice(0, 4)
  }, [items, allProducts])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-heading text-display-sm sm:text-display-md text-volcanic-900 mb-8 lg:mb-10">
        Mi carrito
      </h1>

      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <>
          <EmptyCart />
          {/* Carrito vacío: recomendaciones a todo el ancho, en grilla de 4. */}
          {recommendations.length > 0 && (
            <section className="mt-16 lg:mt-24">
              <h2 className="font-heading text-display-xs text-volcanic-900 mb-8">
                También te podría interesar
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {recommendations.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        // Orden del DOM (= orden en mobile): prendas → resumen/pago →
        // recomendaciones. En desktop el grid recoloca: prendas y buzos
        // apilados en la columna izquierda, y el resumen como panel propio a
        // la derecha. Ese panel es sticky con altura máxima = viewport y
        // scroll interno, así se desliza SOLO el resumen para llegar a pagar
        // sin mover toda la página.
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-x-10 lg:items-start">
          {/* Prendas — col izq, fila 1 */}
          <div className="space-y-4 lg:col-start-1 lg:row-start-1">
            {items.map((item) => (
              <CartItemCard key={item.variantId} item={item} />
            ))}
            {suggestion && <UpsellBanner suggestion={suggestion} />}
          </div>

          {/* Resumen — col der, panel deslizable (sticky + scroll interno) */}
          <div className="mt-8 lg:mt-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
            <CartSummary userId={userId} />
          </div>

          {/* Recomendaciones — col izq, fila 2 (debajo del pedido) */}
          {recommendations.length > 0 && (
            <section className="mt-12 lg:mt-10 lg:col-start-1 lg:row-start-2">
              <h2 className="font-heading text-display-xs text-volcanic-900 mb-6">
                También te podría interesar
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {recommendations.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
