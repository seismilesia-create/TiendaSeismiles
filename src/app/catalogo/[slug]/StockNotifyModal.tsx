'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { subscribeToStock } from '@/actions/stock-notify'

interface StockNotifyModalProps {
  open: boolean
  onClose: () => void
  productId: string
  productName: string
  colorId: string
  colorName: string
  colorHex: string
  talle: string
  userEmail: string | null
}

// ── Icons ──

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ── Main Component ──

export function StockNotifyModal({
  open,
  onClose,
  productId,
  productName,
  colorId,
  colorName,
  colorHex,
  talle,
  userEmail,
}: StockNotifyModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isLoggedIn = !!userEmail

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setError(null)
      setSuccess(false)
      setSubmitting(false)
    }
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  async function handleSubmit() {
    if (!userEmail) return
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('email', userEmail)
    formData.set('producto_id', productId)
    formData.set('talle', talle)
    formData.set('color_id', colorId)
    formData.set('product_name', productName)
    formData.set('color_name', colorName)
    formData.set('color_hex', colorHex)

    const result = await subscribeToStock(formData)

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSuccess(true)
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-modal animate-scale-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-volcanic-500 hover:text-volcanic-900 transition-colors rounded-lg hover:bg-sand-100"
          aria-label="Cerrar"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {success ? (
          /* ── Success state ── */
          <div className="px-8 py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
              <CheckIcon className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-heading text-lg text-volcanic-900 mb-2">
              Listo, te avisamos
            </h3>
            <p className="text-body-sm text-volcanic-500 leading-relaxed mb-2">
              Te enviaremos un email a <span className="font-semibold text-volcanic-700">{userEmail}</span> cuando <span className="font-semibold text-volcanic-700">{productName}</span> en talle <span className="font-semibold text-volcanic-700">{talle}</span> vuelva a estar disponible.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : !isLoggedIn ? (
          /* ── Guest state — must create account ── */
          <div className="px-8 py-10 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-terra-500/10 flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-terra-500" />
            </div>
            <h3 className="font-heading text-lg text-volcanic-900 mb-2">
              Crea una cuenta para recibir alertas de stock
            </h3>
            <p className="text-body-sm text-volcanic-500 leading-relaxed mb-8">
              Registrate o inicia sesion para que te avisemos cuando <span className="font-semibold text-volcanic-700">{productName}</span> en talle <span className="font-semibold text-volcanic-700">{talle}</span> vuelva a estar disponible.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-colors"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/registro"
                className="w-full flex items-center justify-center py-3.5 bg-sand-100 hover:bg-sand-200 text-volcanic-700 text-body-sm font-semibold rounded-xl transition-colors"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        ) : (
          /* ── Logged-in user — confirm subscription ── */
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-terra-500/10 flex items-center justify-center flex-shrink-0">
                <BellIcon className="w-5 h-5 text-terra-500" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-volcanic-900">
                  Avisame cuando haya stock
                </h3>
                <p className="text-body-xs text-volcanic-500">
                  Te enviamos un email cuando este disponible.
                </p>
              </div>
            </div>

            {/* Product info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-sand-50 border border-sand-200/60 mb-6">
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-volcanic-900 truncate">
                  {productName}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-sand-300 flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="text-body-xs text-volcanic-500">{colorName}</span>
                  </div>
                  <span className="text-volcanic-300">&middot;</span>
                  <span className="text-body-xs font-semibold text-volcanic-700">
                    Talle {talle}
                  </span>
                </div>
              </div>
            </div>

            {/* Email display */}
            <div className="mb-4">
              <p className="text-body-xs text-volcanic-500 mb-1">Te notificamos a:</p>
              <p className="text-body-sm font-semibold text-volcanic-900">{userEmail}</p>
            </div>

            {error && (
              <p className="mb-4 text-body-xs text-red-600">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-xl transition-all"
            >
              <BellIcon className="w-4 h-4" />
              {submitting ? 'Registrando...' : 'Avisame'}
            </button>

            <p className="mt-4 text-center text-body-xs text-volcanic-500">
              Solo te enviaremos un email cuando haya stock. Sin spam.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
