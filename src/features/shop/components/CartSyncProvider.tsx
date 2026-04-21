'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { syncAbandonedCart } from '@/actions/abandoned-cart'

/**
 * Mirrors the client cart to the abandoned_carts table so the cron flow has
 * something to target. Subscribes to the zustand store and debounces writes
 * by 3s — a user rapidly adding items shouldn't fire one server action per
 * click.
 *
 * Only syncs when the user is logged in (the server action checks auth and
 * no-ops otherwise, so the component stays dumb about auth state).
 */
export function CartSyncProvider() {
  const items = useCartStore((s) => s.items)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      const snapshot = items.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        productName: i.productName,
        productSlug: i.productSlug,
        colorName: i.colorName,
        colorHex: i.colorHex,
        talle: i.talle,
        precio: i.precio,
        cantidad: i.cantidad,
        imagenUrl: i.imagenUrl,
      }))
      const subtotal = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
      void syncAbandonedCart(snapshot, subtotal)
    }, 3000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [items])

  return null
}
