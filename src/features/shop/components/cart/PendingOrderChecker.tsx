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
      console.log('[PendingOrderChecker] Verifying:', pendingOrderRef)
      const result = await verifyPendingOrders(pendingOrderRef!)

      if (result.confirmed) {
        console.log('[PendingOrderChecker] Payment confirmed, clearing cart')
        clearCart()
        router.push('/carrito/resultado?status=approved')
      } else {
        console.log('[PendingOrderChecker] Payment not confirmed yet:', result)
      }
    }

    check()
  }, [pendingOrderRef, clearCart, router])

  return null
}
