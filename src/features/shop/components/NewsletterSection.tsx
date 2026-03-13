'use client'

import { useState } from 'react'
import { MountainIcon } from './MountainIcon'

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
      setErrorMsg('Ingresa un email valido')
      return
    }

    setState('loading')
    setErrorMsg('')

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const couponCode = `SEISMILES10-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: trimmed, coupon_code: couponCode })

      if (error) {
        if (error.code === '23505') {
          // Email ya registrado - no revelar info, mostrar exito igual
          setState('success')
        } else {
          throw error
        }
      } else {
        setState('success')
      }
    } catch {
      setState('error')
      setErrorMsg('Algo salio mal. Intenta de nuevo.')
    }
  }

  return (
    <section className="relative py-20 lg:py-28 bg-volcanic-900 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Dot texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Mountain icon */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-terra-500/10 flex items-center justify-center">
            <MountainIcon className="w-7 h-7 text-terra-400" />
          </div>
        </div>

        {/* Label */}
        <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-4">
          Unite a la expedicion
        </p>

        {/* Heading */}
        <h2 className="font-heading text-display-md lg:text-display-lg text-white mb-4">
          10% en tu primera compra
        </h2>

        {/* Subtitle */}
        <p className="text-body-md text-white/60 leading-relaxed mb-10 max-w-lg mx-auto">
          Suscribite y recibi tu cupon de descuento. Se el primero en conocer nuevos colores,
          lanzamientos exclusivos y novedades desde la altura.
        </p>

        {/* Form */}
        {state === 'success' ? (
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-terra-500/15 border border-terra-500/20">
              <CheckIcon className="w-5 h-5 text-terra-400" />
              <div className="text-left">
                <p className="text-body-sm font-semibold text-white">
                  Ya sos parte de la expedicion
                </p>
                <p className="text-body-xs text-white/50">
                  Revisa tu email para encontrar tu cupon del 10%
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
              Al suscribirte aceptas nuestra politica de privacidad.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
