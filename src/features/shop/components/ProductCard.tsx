'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeartButton } from './HeartButton'
import { formatLineaLabel, isLimitedEditionLinea } from '../utils/linea'
import { cuotasLabel } from '../utils/cuotas'
import { descuentoPct, formatPrecio } from '../utils/precio'

export interface Product {
  id: string
  nombre: string
  slug: string
  precio: number
  precio_lista?: number | null
  linea: string
  destacado: boolean
  proximamente?: boolean
  colores: { nombre: string; hex: string; imagen_url: string | null }[]
  variantes?: { talle: string; stock: number }[]
}

/** Umbral de "pocas unidades" para el aviso de urgencia en la card. */
const LOW_STOCK_CARD = 5

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
    </svg>
  )
}

interface ProductCardProps {
  product: Product
  isFavorited?: boolean
  isLoggedIn?: boolean
}

export function ProductCard({ product, isFavorited = false, isLoggedIn = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const imageUrl = product.colores[0]?.imagen_url
  const lineLabel = formatLineaLabel(product.linea) || product.linea
  const isLimitedEdition = isLimitedEditionLinea(product.linea)
  const off = descuentoPct(product.precio, product.precio_lista)
  const totalStock = (product.variantes ?? []).reduce((sum, v) => sum + (v.stock || 0), 0)
  const hasStockData = !!product.variantes && product.variantes.length > 0
  const lowStock = hasStockData && totalStock > 0 && totalStock <= LOW_STOCK_CARD
  const outOfStock = hasStockData && totalStock === 0

  // ── Producto "Próximamente": foto difuminada, cartel, NO clickeable ──
  if (product.proximamente) {
    return (
      <div className="group relative bg-white rounded-2xl p-3 shadow-card">
        <div className="relative aspect-[3/5] overflow-hidden rounded-xl bg-sand-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.nombre}
              fill
              className="object-cover scale-105 blur-sm"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-volcanic-700 to-volcanic-900" />
          )}
          {/* Velo oscuro para resaltar el texto */}
          <div className="absolute inset-0 bg-volcanic-900/35" />
          {/* Cartel central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Próximamente
            </span>
          </div>
        </div>

        {/* Info: línea + nombre, sin precio */}
        <div className="mt-4 flex flex-col gap-1.5">
          <p className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-500">
            {lineLabel}
          </p>
          <h3 className="text-body-md font-medium text-volcanic-900">
            {product.nombre}
          </h3>
          <p className="text-body-sm text-volcanic-400 pt-1">Disponible pronto</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/catalogo/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/5] overflow-hidden rounded-xl bg-sand-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.nombre}
              fill
              className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-volcanic-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}

          {/* Tags */}
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col items-start gap-1.5">
            {off && (
              <span className="bg-gradient-to-br from-terra-400 to-terra-600 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white rounded-md shadow-md ring-1 ring-white/15">
                {off}% OFF
              </span>
            )}
            {isLimitedEdition && (
              <span className="bg-volcanic-900 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white rounded-md">
                Edición limitada
              </span>
            )}
            {product.destacado && (
              <span className="bg-terra-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white rounded-md">
                Destacado
              </span>
            )}
          </div>

          {/* Quick view overlay */}
          <div
            className={`absolute inset-x-0 bottom-0 flex items-center justify-center bg-volcanic-900/80 py-3 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              Ver producto
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="mt-4 flex flex-col gap-1.5">
          <p className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-500">
            {lineLabel}
          </p>
          <h3 className="text-body-md font-medium text-volcanic-900 transition-colors group-hover:text-terra-500">
            {product.nombre}
          </h3>

          {/* Stock / urgencia — o, si hay stock normal, el nombre del color */}
          {lowStock ? (
            <p className="flex items-center gap-1 pt-0.5 text-body-xs font-semibold text-terra-600">
              <FlameIcon className="h-3.5 w-3.5 shrink-0" />
              {totalStock === 1 ? '¡Última unidad!' : `¡Últimas ${totalStock} unidades!`}
            </p>
          ) : outOfStock ? (
            <p className="pt-0.5 text-body-xs font-medium text-volcanic-400">Sin stock</p>
          ) : product.colores[0]?.nombre ? (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className="h-2.5 w-2.5 rounded-full border border-sand-300 shrink-0"
                style={{ backgroundColor: product.colores[0].hex }}
              />
              <span className="text-body-xs text-volcanic-500">
                {product.colores[0].nombre}
              </span>
            </div>
          ) : null}

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1 flex-wrap">
            <span className="text-body-lg font-bold text-volcanic-900">
              {formatPrecio(product.precio)}
            </span>
            {off && (
              <span className="text-body-xs text-volcanic-600 line-through">
                {formatPrecio(product.precio_lista!)}
              </span>
            )}
          </div>
          {cuotasLabel(product.precio) && (
            <p className="text-body-xs font-medium text-terra-600">
              {cuotasLabel(product.precio)}
            </p>
          )}
        </div>
      </Link>

      {/* Favorite button — sibling del Link (no descendiente) para que el click
          no burbujee a la navegación. Anidar <button> dentro de <a> es HTML
          inválido y el navegador re-arma el DOM, ignorando stopPropagation. */}
      <div className="absolute right-5 top-5 sm:right-6 sm:top-6 z-10">
        <HeartButton
          productId={product.id}
          productSlug={product.slug}
          isFavorited={isFavorited}
          isLoggedIn={isLoggedIn}
          size="sm"
        />
      </div>
    </div>
  )
}
