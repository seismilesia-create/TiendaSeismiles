'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { confirmGiftcardPayment } from '@/actions/giftcard-checkout'

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

export function ResultadoGiftcard({ status, paymentId, externalReference }: Props) {
  const didRun = useRef(false)
  const [codigo, setCodigo] = useState<string | null>(null)

  const isApproved = status === 'approved'
  const isPending = status === 'pending'

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    async function process() {
      if (!paymentId || !externalReference) return

      // Extract giftcard ID from external_reference (format: "gc:uuid")
      const giftcardId = externalReference.startsWith('gc:')
        ? externalReference.slice(3)
        : externalReference

      const result = await confirmGiftcardPayment(paymentId, giftcardId)

      if (result.codigo) {
        setCodigo(result.codigo)
      }
    }

    process()
  }, [status, paymentId, externalReference])

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {isApproved && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-heading text-display-sm text-volcanic-900 mb-3">
            Gift Card activada!
          </h1>
          <p className="text-body-md text-volcanic-500 mb-6">
            Tu gift card fue procesada correctamente. Tambien te la enviamos por email.
          </p>

          {codigo && (
            <div className="mb-8 p-6 bg-volcanic-900 rounded-2xl">
              <p className="text-body-xs text-white/50 uppercase tracking-widest mb-2">
                Tu codigo
              </p>
              <p className="font-mono text-2xl font-bold text-white tracking-widest">
                {codigo}
              </p>
            </div>
          )}

          <Link
            href="/perfil"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Ir a mi perfil
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
            Tu pago esta siendo procesado. Te enviaremos la gift card por email cuando se confirme.
          </p>
          <Link
            href="/perfil"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Ir a mi perfil
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
            Hubo un problema con tu pago. Podes intentar de nuevo.
          </p>
          <Link
            href="/giftcards"
            className="inline-flex px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white font-semibold rounded-xl transition-colors"
          >
            Volver a Gift Cards
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
