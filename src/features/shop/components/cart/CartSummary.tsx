'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { createCheckout } from '@/actions/checkout'

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

interface CartSummaryProps {
  userId: string | null
}

export function CartSummary({ userId }: CartSummaryProps) {
  const items = useCartStore((s) => s.items)
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const setPendingOrderRef = useCartStore((s) => s.setPendingOrderRef)
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const cuotas = Math.round(totalPrice / 3)

  async function handleCheckout() {
    if (!userId) {
      router.push('/login?redirect=/carrito')
      return
    }

    setLoading(true)
    setError(null)

    const checkoutItems = items.map((i) => ({
      variantId: i.variantId,
      productId: i.productId,
      productName: i.productName,
      cantidad: i.cantidad,
      precio: i.precio,
    }))

    const result = await createCheckout(checkoutItems)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Save reference to verify payment when user returns
    if (result.externalRef) {
      setPendingOrderRef(result.externalRef)
    }

    // Redirect to Mercado Pago hosted checkout
    window.location.href = result.initPoint!
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200/60 p-5 lg:p-6">
      <h3 className="font-heading text-lg text-volcanic-900 mb-5">Resumen del pedido</h3>

      <div className="space-y-3 text-body-sm">
        <div className="flex items-center justify-between">
          <span className="text-volcanic-500">
            Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
          </span>
          <span className="font-semibold text-volcanic-900 tabular-nums">
            ${totalPrice.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-volcanic-500">Envio</span>
          <span className="font-semibold text-emerald-600">Gratis</span>
        </div>
      </div>

      <div className="border-t border-sand-200 my-4" />

      <div className="flex items-center justify-between mb-1">
        <span className="text-body-md font-semibold text-volcanic-900">Total</span>
        <span className="text-body-lg font-bold text-volcanic-900 tabular-nums">
          ${totalPrice.toLocaleString('es-AR')}
        </span>
      </div>
      <p className="text-body-xs text-volcanic-500 mb-6">
        3 cuotas sin interes de ${cuotas.toLocaleString('es-AR')}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-body-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-md font-semibold rounded-xl transition-colors mb-3"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <CreditCardIcon className="w-5 h-5" />
            {userId ? 'Pagar con Mercado Pago' : 'Ingresar para comprar'}
          </>
        )}
      </button>

      <Link
        href="/catalogo"
        className="w-full flex items-center justify-center py-3.5 border border-sand-200 text-volcanic-700 hover:text-terra-500 hover:border-terra-500/30 text-body-sm font-medium rounded-xl transition-colors"
      >
        Seguir comprando
      </Link>

      <div className="flex items-center gap-2 mt-5 pt-5 border-t border-sand-200">
        <ShieldIcon className="w-4 h-4 text-terra-500 shrink-0" />
        <p className="text-body-xs text-volcanic-400">
          Compra segura · Envio gratis · Cambios por 30 dias
        </p>
      </div>
    </div>
  )
}
