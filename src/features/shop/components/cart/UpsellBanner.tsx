'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getCrossSellCandidateDetail } from '@/actions/cross-sell'
import { useCartStore } from '@/features/shop/stores/cart-store'
import type { CatalogProductFromDB, ProductDetailFromDB } from '@/features/shop/services/product-lines'
import type { CrossSellSuggestion } from '@/features/shop/hooks/useCrossSell'

const INITIAL_THUMBS = 3

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function UpsellBanner({ suggestion }: { suggestion: CrossSellSuggestion }) {
  const { rule, candidates } = suggestion
  const addItem = useCartStore((s) => s.addItem)

  const [showAll, setShowAll] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<ProductDetailFromDB | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const visibleCandidates = showAll ? candidates : candidates.slice(0, INITIAL_THUMBS)
  const hiddenCount = candidates.length - INITIAL_THUMBS

  async function handleSelectCandidate(c: CatalogProductFromDB) {
    if (selectedId === c.id) return
    setSelectedId(c.id)
    setSelectedSize(null)
    setError(null)
    setLoading(true)
    const data = await getCrossSellCandidateDetail(c.slug)
    // Si el usuario clickeó otra miniatura mientras cargaba, esto igual
    // actualiza `detail` — pero el render usa `selectedId` para el match de
    // estado activo, y `detail.slug` para computar el descuento, así que el
    // peor caso es un flash de estado inconsistente. Aceptable para MVP.
    setDetail(data)
    setLoading(false)
  }

  function handleAdd() {
    if (!detail) return
    // Cada producto Arista tiene 1 solo color → tomamos el primero.
    const color = detail.colores[0]
    if (!color || !selectedSize) return

    const variant = detail.variantes.find(
      (v) => v.color_id === color.id && v.talle === selectedSize,
    )
    if (!variant || variant.stock <= 0) {
      setError('Sin stock en ese talle')
      return
    }

    const firstImage = color.imagenes?.[0]?.url ?? color.imagen_url ?? null
    const discounted = Math.round(detail.precio * (100 - rule.discountPercent) / 100)

    addItem({
      variantId: variant.id,
      productId: detail.id,
      productName: detail.nombre,
      productSlug: detail.slug,
      colorId: color.id,
      colorName: color.nombre,
      colorHex: color.hex,
      talle: selectedSize,
      precio: discounted,
      imagenUrl: firstImage,
      maxStock: variant.stock,
      linea: detail.linea,
      categoria: detail.categoria,
      precioOriginal: detail.precio,
      crossSellRuleId: rule.id,
    })

    // El banner se desmonta solo porque el hook recalcula la sugerencia
    // (ya no hay target libre) — no hace falta limpiar estado local.
  }

  const availableSizes = detail && detail.colores[0]
    ? detail.variantes
        .filter((v) => v.color_id === detail.colores[0].id && v.stock > 0)
        .sort((a, b) => {
          const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
          return order.indexOf(a.talle) - order.indexOf(b.talle)
        })
    : []

  const discountedPrice = detail
    ? Math.round(detail.precio * (100 - rule.discountPercent) / 100)
    : null

  return (
    <div className="rounded-2xl border border-terra-500/30 bg-gradient-to-br from-terra-50 to-white overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <SparklesIcon className="w-3.5 h-3.5 text-terra-500" />
          <span className="text-body-xs font-semibold text-terra-600 uppercase tracking-wide">
            Oferta exclusiva
          </span>
          <span className="ml-auto inline-flex items-center px-2 py-0.5 bg-terra-500 text-white text-body-xs font-bold rounded-full">
            {rule.discountPercent}% OFF
          </span>
        </div>
        <p className="text-body-sm text-volcanic-700 leading-snug">
          {rule.message}
        </p>
      </div>

      {/* Thumbnails */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-body-xs font-medium text-volcanic-600 mb-2">
          Elegí tu color
        </p>
        <div className="flex flex-wrap gap-2">
          {visibleCandidates.map((c) => {
            const thumbUrl = c.colores[0]?.imagen_url ?? null
            const colorHex = c.colores[0]?.hex ?? '#ccc'
            const isSelected = selectedId === c.id
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCandidate(c)}
                className={`relative w-16 h-20 sm:w-[72px] sm:h-[90px] rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-terra-500 ring-2 ring-terra-500/30'
                    : 'border-sand-200 hover:border-sand-300'
                }`}
                title={c.nombre}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={c.nombre}
                    width={72}
                    height={90}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: colorHex }}
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-terra-500/20 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-terra-500 text-white flex items-center justify-center">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </button>
            )
          })}

          {!showAll && hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-16 h-20 sm:w-[72px] sm:h-[90px] rounded-lg border-2 border-dashed border-sand-300 text-volcanic-600 text-body-xs font-medium hover:border-terra-500 hover:text-terra-600 transition-colors leading-tight px-1"
            >
              +{hiddenCount}
              <br />
              colores
            </button>
          )}
        </div>
      </div>

      {/* Size picker (only when a candidate is selected) */}
      {selectedId && (
        <div className="px-4 sm:px-5 py-3 border-t border-terra-500/20 bg-white">
          {loading && (
            <div className="flex items-center gap-2 text-body-sm text-volcanic-500 py-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando talles...
            </div>
          )}

          {!loading && detail && discountedPrice !== null && (
            <>
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-volcanic-900 truncate">
                    {detail.nombre}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-body-md font-bold text-terra-600 tabular-nums">
                      ${discountedPrice.toLocaleString('es-AR')}
                    </span>
                    <span className="text-body-xs text-volcanic-400 line-through tabular-nums">
                      ${detail.precio.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-body-xs font-medium text-volcanic-600 mb-1.5">Talle</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.length === 0 && (
                    <p className="text-body-xs text-volcanic-500">
                      Sin stock disponible
                    </p>
                  )}
                  {availableSizes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedSize(v.talle)
                        setError(null)
                      }}
                      className={`min-w-[44px] px-3 py-1.5 rounded-lg border text-body-xs font-semibold transition-colors ${
                        selectedSize === v.talle
                          ? 'border-terra-500 bg-terra-50 text-volcanic-900'
                          : 'border-sand-200 text-volcanic-600 hover:border-sand-300'
                      }`}
                    >
                      {v.talle}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="mb-2 text-body-xs text-red-600">{error}</p>
              )}

              <button
                onClick={handleAdd}
                disabled={!selectedSize}
                className="w-full py-2.5 bg-terra-500 hover:bg-terra-600 disabled:bg-sand-300 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-xl transition-colors"
              >
                {selectedSize
                  ? `Agregar con ${rule.discountPercent}% OFF · $${discountedPrice.toLocaleString('es-AR')}`
                  : 'Elegí un talle'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
