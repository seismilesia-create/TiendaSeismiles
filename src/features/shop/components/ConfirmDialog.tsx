'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'neutral'
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape to cancel.
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, isPending, onCancel])

  if (!open) return null

  const confirmClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-volcanic-900 hover:bg-volcanic-800 text-white'

  const iconClass = variant === 'danger'
    ? 'bg-red-100 text-red-600'
    : 'bg-terra-500/10 text-terra-500'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={isPending ? undefined : onCancel}
      />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-modal animate-scale-in overflow-hidden">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="absolute top-3 right-3 p-2 text-volcanic-500 hover:text-volcanic-900 transition-colors rounded-lg hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Cerrar"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <div className="px-8 py-8 text-center">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${iconClass}`}>
            <AlertIcon className="w-6 h-6" />
          </div>

          <h3 id="confirm-dialog-title" className="font-heading text-lg text-volcanic-900 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-body-sm text-volcanic-500 leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 py-3 bg-sand-100 hover:bg-sand-200 text-volcanic-700 text-body-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`flex-1 py-3 text-body-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${confirmClass}`}
            >
              {isPending ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
