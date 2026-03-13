'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { verifyPendingOrders } from '@/actions/checkout'

export function PendingOrderChecker() {
  const pendingOrderRef = useCartStore((s) => s.pendingOrderRef)
  const clearCart = useCartStore((s) => s.clearCart)
  const router = useRouter()
  const didCheck = useRef(false)

  useEffect(() => {
    if (!pendingOrderRef || didCheck.current) return
    didCheck.current = true

    async function check() {
      const result = await verifyPendingOrders(pendingOrderRef!)

      if (result.confirmed) {
        clearCart()
        router.push('/carrito/resultado?status=approved')
      }
    }

    check()
  }, [pendingOrderRef, clearCart, router])

  return null
}
