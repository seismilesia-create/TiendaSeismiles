'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/features/shop/stores/cart-store'
import type { CartItem } from '@/features/shop/stores/cart-store'

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export function CartItemCard({ item }: { item: CartItem }) {
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const subtotal = item.precio * item.cantidad

  return (
    <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl border border-sand-200/60">
      {/* Image */}
      <Link
        href={`/catalogo/${item.productSlug}`}
        className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-sand-100 shrink-0 block"
      >
        {item.imagenUrl ? (
          <Image
            src={item.imagenUrl}
            alt={item.productName}
            width={96}
            height={112}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-volcanic-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top row: name + delete */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/catalogo/${item.productSlug}`}
            className="text-body-sm sm:text-body-md font-semibold text-volcanic-900 hover:text-terra-500 transition-colors truncate"
          >
            {item.productName}
          </Link>
          <button
            onClick={() => removeItem(item.variantId)}
            className="p-1.5 text-volcanic-400 hover:text-red-500 transition-colors shrink-0"
            aria-label="Eliminar"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Color + Talle */}
        <div className="flex items-center gap-3 text-body-xs text-volcanic-500 mb-2">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border border-sand-300 shrink-0"
              style={{ backgroundColor: item.colorHex }}
            />
            {item.colorName}
          </span>
          <span>·</span>
          <span>Talle {item.talle}</span>
        </div>

        {/* Price */}
        <p className="text-body-xs text-volcanic-500 mb-3 sm:mb-auto">
          ${item.precio.toLocaleString('es-AR')} c/u
        </p>

        {/* Bottom row: quantity controls + subtotal */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          {/* Quantity */}
          <div className="flex items-center border border-sand-200 rounded-lg">
            <button
              onClick={() => updateQuantity(item.variantId, item.cantidad - 1)}
              className="p-2 text-volcanic-500 hover:text-volcanic-900 transition-colors disabled:text-volcanic-300 disabled:cursor-not-allowed"
              disabled={item.cantidad <= 1}
              aria-label="Reducir cantidad"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-body-sm font-semibold text-volcanic-900 tabular-nums">
              {item.cantidad}
            </span>
            <button
              onClick={() => updateQuantity(item.variantId, item.cantidad + 1)}
              className="p-2 text-volcanic-500 hover:text-volcanic-900 transition-colors disabled:text-volcanic-300 disabled:cursor-not-allowed"
              disabled={item.cantidad >= item.maxStock}
              aria-label="Aumentar cantidad"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subtotal */}
          <p className="text-body-md font-semibold text-volcanic-900 tabular-nums">
            ${subtotal.toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  )
}
