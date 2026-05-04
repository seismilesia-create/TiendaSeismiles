'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeartButton } from './HeartButton'
import { formatLineaLabel } from '../utils/linea'

export interface Product {
  id: string
  nombre: string
  slug: string
  precio: number
  linea: string
  destacado: boolean
  colores: { nombre: string; hex: string; imagen_url: string | null }[]
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

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className="group block bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1.5">
          {product.destacado && (
            <span className="bg-terra-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white rounded-md">
              Destacado
            </span>
          )}
        </div>

        {/* Favorite button */}
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10">
          <HeartButton
            productId={product.id}
            productSlug={product.slug}
            isFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
            size="sm"
          />
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

        {/* Colors */}
        {product.colores.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.colores.map((color) => (
              <span
                key={color.hex}
                className="h-3 w-3 rounded-full border border-sand-300"
                style={{ backgroundColor: color.hex }}
                aria-label={color.nombre}
              />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-body-lg font-semibold text-volcanic-900">
            {`$${product.precio.toLocaleString('es-AR')}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
