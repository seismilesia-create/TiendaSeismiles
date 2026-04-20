'use client'

import { useEffect, useState } from 'react'
import { MountainIcon } from './MountainIcon'
import { subscribeNewsletter } from '@/actions/newsletter'

const STORAGE_KEY = 'seismiles_welcome_modal_dismissed'
const DELAY_MS = 8000 // 8 seconds

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

type FormState = 'idle' | 'loading' | 'success' | 'already' | 'error'

export function WelcomeDiscountModal() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return

    const timer = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch { }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState('error')
      setErrorMsg('Ingresá un email válido')
      return
    }

    setState('loading')
    setErrorMsg('')

    try {
      const result = await subscribeNewsletter(trimmed)
      if (result.error) {
        setState('error')
        setErrorMsg(result.error)
      } else if (result.alreadySubscribed) {
        setState('already')
        try {
          localStorage.setItem(STORAGE_KEY, '1')
        } catch { }
        setTimeout(() => setVisible(false), 4000)
      } else {
        setState('success')
        try {
          localStorage.setItem(STORAGE_KEY, '1')
        } catch { }
        // Auto-dismiss after 4s on success
        setTimeout(() => setVisible(false), 4000)
      }
    } catch {
      setState('error')
      setErrorMsg('Algo salió mal. Intentá de nuevo.')
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 z-50 sm:max-w-sm animate-fade-in-up"
      role="dialog"
      aria-labelledby="welcome-toast-title"
    >
      <div className="relative bg-volcanic-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-terra-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>

        {state === 'success' ? (
          <div className="relative p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terra-500/15 border border-terra-500/20 flex items-center justify-center shrink-0">
              <CheckIcon className="w-5 h-5 text-terra-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold text-white">¡Listo!</p>
              <p className="text-body-xs text-white/50">Revisá tu email para encontrar el cupón.</p>
            </div>
          </div>
        ) : state === 'already' ? (
          <div className="relative p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terra-500/15 border border-terra-500/20 flex items-center justify-center shrink-0">
              <CheckIcon className="w-5 h-5 text-terra-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold text-white">Ya estás suscripto</p>
              <p className="text-body-xs text-white/50">Buscá tu cupón del 10% en los emails que te enviamos.</p>
            </div>
          </div>
        ) : !expanded ? (
          /* Collapsed — compact teaser */
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="relative w-full text-left p-4 pr-12 flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-terra-500/15 border border-terra-500/20 flex items-center justify-center shrink-0">
              <MountainIcon className="w-5 h-5 text-terra-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-0.5">
                ¡Bienvenido!
              </p>
              <p className="text-body-sm font-semibold text-white leading-snug">
                10% en tu primera compra
              </p>
            </div>
            <ChevronIcon className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-terra-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ) : (
          /* Expanded — form */
          <div className="relative p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-terra-500/15 border border-terra-500/20 flex items-center justify-center shrink-0">
                <MountainIcon className="w-5 h-5 text-terra-400" />
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-0.5">
                  ¡Bienvenido!
                </p>
                <p id="welcome-toast-title" className="text-body-md font-semibold text-white leading-snug mb-1">
                  10% en tu primera compra
                </p>
                <p className="text-body-xs text-white/50 leading-relaxed">
                  Suscribite y recibí tu cupón por email.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (state === 'error') setState('idle')
                }}
                placeholder="Tu email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 text-body-sm focus:outline-none focus:border-terra-500/40 focus:bg-white/[0.08] transition-all"
                disabled={state === 'loading'}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full px-4 py-2.5 bg-terra-500 hover:bg-terra-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-lg transition-all"
              >
                {state === 'loading' ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Quiero mi 10%'
                )}
              </button>

              {state === 'error' && errorMsg && (
                <p className="text-body-xs text-red-400">{errorMsg}</p>
              )}

              <p className="text-body-xs text-white/20 pt-1">
                Al suscribirte aceptás nuestra{' '}
                <a href="/politica-de-privacidad" className="underline hover:text-white/40 transition-colors">
                  política de privacidad
                </a>.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
