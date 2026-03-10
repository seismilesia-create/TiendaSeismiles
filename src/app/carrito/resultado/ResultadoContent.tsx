'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { confirmPayment } from '@/actions/checkout'

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

interface Props {
  status?: string
  paymentId?: string
  externalReference?: string
}

export function ResultadoContent({ status, paymentId, externalReference }: Props) {
  const clearCart = useCartStore((s) => s.clearCart)
  const didRun = useRef(false)

  const isApproved = status === 'approved'
  const isPending = status === 'pending'

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    async function processPayment() {
      console.log('[Resultado] params:', { status, paymentId, externalReference })

      // Verify payment with MP API and update order status in DB
      if (paymentId && externalReference) {
        const result = await confirmPayment(paymentId, externalReference)
        console.log('[Resultado] confirmPayment result:', result)
      }

      // Clear cart on approved or pending (stock already reserved)
      if (isApproved || isPending) {
        clearCart()
      }
    }

    processPayment()
  }, [status, paymentId, externalReference, isApproved, isPending, clearCart])

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {isApproved && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            Pago confirmado!
          </h1>
          <p className="text-body-md text-volcanic-500 mb-8">
            Tu pedido fue procesado correctamente. Podes ver el estado en tu perfil.
          </p>
          <Link
            href="/perfil"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Ver mis pedidos
          </Link>
        </>
      )}

      {isPending && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
            <ClockIcon className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            Pago pendiente
          </h1>
          <p className="text-body-md text-volcanic-500 mb-8">
            Tu pago esta siendo procesado. Te notificaremos cuando se confirme.
          </p>
          <Link
            href="/perfil"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Ver mis pedidos
          </Link>
        </>
      )}

      {!isApproved && !isPending && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            El pago no fue aprobado
          </h1>
          <p className="text-body-md text-volcanic-500 mb-8">
            Hubo un problema con tu pago. Podes intentar de nuevo desde el carrito.
          </p>
          <Link
            href="/carrito"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Volver al carrito
          </Link>
        </>
      )}

      <div className="mt-6">
        <Link
          href="/catalogo"
          className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
