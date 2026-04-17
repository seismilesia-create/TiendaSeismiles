'use client'

import { useState } from 'react'
import { MountainIcon } from './MountainIcon'
import { subscribeNewsletter } from '@/actions/newsletter'

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4z" /><path d="m22 2-11 11" /></svg>
  )
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = email.trim().toLowerCase()

    // Validacion basica de email
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
      } else {
        setState('success')
      }
    } catch {
      setState('error')
      setErrorMsg('Algo salió mal. Intentá de nuevo.')
    }
  }

  return (
    <section className="relative py-20 lg:py-28 bg-volcanic-900 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Mountain icon */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-terra-500/10 flex items-center justify-center">
            <MountainIcon className="w-7 h-7 text-terra-400" />
          </div>
        </div>

        {/* Label */}
        <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-4">
          Unite a la expedición
        </p>

        {/* Heading */}
        <h2 className="font-heading text-display-md lg:text-display-lg text-white mb-4">
          10% en tu primera compra
        </h2>

        {/* Subtitle */}
        <p className="text-body-md text-white/60 leading-relaxed mb-10 max-w-lg mx-auto">
          Suscribite y recibí tu cupón de descuento. Sé el primero en conocer nuevos colores,
          lanzamientos exclusivos y novedades desde la altura.
        </p>

        {/* Form */}
        {state === 'success' ? (
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-terra-500/15 border border-terra-500/20">
              <CheckIcon className="w-5 h-5 text-terra-400" />
              <div className="text-left">
                <p className="text-body-sm font-semibold text-white">
                  Ya sos parte de la expedición
                </p>
                <p className="text-body-xs text-white/50">
                  Revisá tu email para encontrar tu cupón del 10%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (state === 'error') setState('idle')
                  }}
                  placeholder="Tu email"
                  className="w-full px-5 py-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 text-body-md focus:outline-none focus:border-terra-500/40 focus:bg-white/[0.08] transition-all duration-300"
                  disabled={state === 'loading'}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="flex items-center gap-2 px-6 py-4 bg-terra-500 hover:bg-terra-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-terra-500/20 whitespace-nowrap"
              >
                {state === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <SendIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Suscribirse</span>
                  </>
                )}
              </button>
            </div>

            {/* Error message */}
            {state === 'error' && errorMsg && (
              <p className="mt-3 text-body-xs text-red-400 animate-fade-in">
                {errorMsg}
              </p>
            )}

            {/* Disclaimer */}
            <p className="mt-4 text-body-xs text-white/20">
              Al suscribirte aceptás nuestra <a href="/politica-de-privacidad" className="underline hover:text-white/40 transition-colors">política de privacidad</a>.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
