'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { confirmPayment } from '@/actions/checkout'
import { trackPurchase } from '@/features/analytics/lib/fbq'
import { gtag } from '@/features/analytics/lib/gtag'
import { OFFLINE_PAYMENT_INFO } from '@/lib/payments-offline'

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
  /** Set to 'gocuotas' when returning from GoCuotas. There is no payment_id to
   * verify client-side; the order is confirmed asynchronously by the webhook.
   * For 'efectivo'/'transferencia' (status='offline') the order is reserved in
   * pendiente_pago and confirmed by an admin once the payment arrives. */
  provider?: 'mercadopago' | 'gocuotas' | 'efectivo' | 'transferencia'
}

export function ResultadoContent({ status, paymentId, externalReference, provider }: Props) {
  const clearCart = useCartStore((s) => s.clearCart)
  const pendingPurchase = useCartStore((s) => s.pendingPurchase)
  const clearPendingPurchase = useCartStore((s) => s.clearPendingPurchase)
  const didRun = useRef(false)

  const isApproved = status === 'approved'
  const isPending = status === 'pending'
  const isOffline = status === 'offline'

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    async function processPayment() {
      // Offline (efectivo/transferencia): nothing to verify or track — the
      // payment hasn't happened yet. Just make sure the cart/snapshot are
      // cleared (also covers a direct navigation / refresh of this URL).
      if (isOffline) {
        clearCart()
        clearPendingPurchase()
        return
      }

      // Verify payment with MP API and update order status in DB
      if (paymentId && externalReference) {
        await confirmPayment(paymentId, externalReference)
      }

      // Clear cart on approved or pending (stock already reserved)
      if (isApproved || isPending) {
        clearCart()
      }

      // Disparar Purchase (Meta Pixel + GA4) sólo en aprobados, una vez. Si
      // no hay snapshot (refresh tras vaciar, navegación directa) no se
      // dispara. Si el estado es final no aprobado, igual limpiamos el
      // snapshot para no arrastrarlo entre checkouts.
      if (pendingPurchase) {
        if (isApproved) {
          const transactionId = externalReference || pendingPurchase.externalRef

          trackPurchase(
            {
              content_ids: pendingPurchase.items.map((i) => i.productId),
              contents: pendingPurchase.items.map((i) => ({
                id: i.productId,
                quantity: i.quantity,
                item_price: i.unitPrice,
              })),
              content_type: 'product',
              num_items: pendingPurchase.numItems,
              value: pendingPurchase.value,
              currency: pendingPurchase.currency,
            },
            transactionId,
          )

          gtag.trackPurchase({
            transaction_id: transactionId,
            currency: pendingPurchase.currency,
            value: pendingPurchase.value,
            items: pendingPurchase.items.map((it, idx) => ({
              item_id: it.productId,
              item_name: it.productName,
              item_category: it.category,
              price: it.unitPrice,
              quantity: it.quantity,
              index: idx,
            })),
          })

          clearPendingPurchase()
        } else if (!isPending) {
          clearPendingPurchase()
        }
      }
    }

    processPayment()
  }, [status, paymentId, externalReference, isApproved, isPending, isOffline, clearCart, pendingPurchase, clearPendingPurchase])

  const isTransfer = provider === 'transferencia'

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {isApproved && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            ¡Pago confirmado!
          </h1>
          <p className="text-body-md text-volcanic-500 mb-8">
            {provider === 'gocuotas'
              ? 'Recibimos tu pago con GoCuotas. Apenas se acredite te enviamos la confirmación por mail. Podés ver el estado en tu perfil.'
              : 'Tu pedido fue procesado correctamente. Podés ver el estado en tu perfil.'}
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
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </p>
          <Link
            href="/perfil"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Ver mis pedidos
          </Link>
        </>
      )}

      {isOffline && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            ¡Pedido registrado!
          </h1>
          <p className="text-body-md text-volcanic-500 mb-6">
            {isTransfer
              ? 'Reservamos tu pedido. Para confirmarlo, transferí el total y enviános el comprobante.'
              : 'Reservamos tu pedido. Pagás en efectivo al retirarlo en el local.'}
          </p>

          <div className="text-left bg-sand-50 border border-sand-200 rounded-2xl p-5 mb-6">
            {isTransfer ? (
              <>
                <p className="text-body-xs font-semibold uppercase tracking-wide text-terra-600 mb-3">
                  Datos para transferir
                </p>
                <dl className="space-y-1.5 text-body-sm">
                  {OFFLINE_PAYMENT_INFO.bank.alias && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-volcanic-500">Alias</dt>
                      <dd className="font-semibold text-volcanic-900 text-right">{OFFLINE_PAYMENT_INFO.bank.alias}</dd>
                    </div>
                  )}
                  {OFFLINE_PAYMENT_INFO.bank.cbu && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-volcanic-500">CBU/CVU</dt>
                      <dd className="font-semibold text-volcanic-900 text-right break-all">{OFFLINE_PAYMENT_INFO.bank.cbu}</dd>
                    </div>
                  )}
                  {OFFLINE_PAYMENT_INFO.bank.titular && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-volcanic-500">Titular</dt>
                      <dd className="font-semibold text-volcanic-900 text-right">{OFFLINE_PAYMENT_INFO.bank.titular}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-3 text-body-xs text-volcanic-500">
                  Cuando hagas la transferencia, enviános el comprobante por WhatsApp y confirmamos tu pedido. También te mandamos estos datos por email.
                </p>
              </>
            ) : (
              <>
                <p className="text-body-xs font-semibold uppercase tracking-wide text-terra-600 mb-2">
                  Pago en efectivo al retirar
                </p>
                <p className="text-body-sm text-volcanic-600">
                  Coordinamos el día y horario del retiro en {OFFLINE_PAYMENT_INFO.pickup.zona} por WhatsApp. Tu pedido queda reservado mientras tanto.
                </p>
              </>
            )}
          </div>

          <a
            href={OFFLINE_PAYMENT_INFO.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            {isTransfer ? 'Enviar comprobante por WhatsApp' : 'Coordinar retiro por WhatsApp'}
          </a>
          <div className="mt-4">
            <Link href="/perfil" className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors">
              Ver mis pedidos
            </Link>
          </div>
        </>
      )}

      {!isApproved && !isPending && !isOffline && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            El pago no fue aprobado
          </h1>
          <p className="text-body-md text-volcanic-500 mb-8">
            Hubo un problema con tu pago. Podés intentar de nuevo desde el carrito.
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
