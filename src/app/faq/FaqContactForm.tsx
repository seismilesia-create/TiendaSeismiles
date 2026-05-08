'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitFaqQuestion } from '@/actions/faq'
import { shopConfig } from '@/features/shop/config'

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="m22 2-11 11" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

interface FaqContactFormProps {
  user: { email: string } | null
}

export function FaqContactForm({ user }: FaqContactFormProps) {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('message', message)

    const result = await submitFaqQuestion(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terra-500/20 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-terra-400">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-heading text-lg text-white mb-2">Consulta enviada</h3>
        <p className="text-body-sm text-white/50">Te responderemos a la brevedad a tu email.</p>
      </div>
    )
  }

  // Not logged in - show register/login prompt with WhatsApp alternative
  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-body-md text-white/50 mb-6">
          Para enviarnos tu consulta, necesitás tener una cuenta.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-terra-500 hover:bg-terra-600 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
          >
            Registrate
          </Link>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-body-xs text-white/40 uppercase tracking-widest">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <a
          href={`${shopConfig.brand.whatsapp}?text=${encodeURIComponent('Hola SEISMILES! Tengo una consulta:')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
        >
          <WhatsAppIcon className="w-4 h-4" />
          Escribinos por WhatsApp
        </a>
      </div>
    )
  }

  // Logged in - show question form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-body-xs text-white/60">
        Enviando como <span className="text-white/70 font-medium">{user.email}</span>
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-body-sm">
          {error}
        </div>
      )}

      <textarea
        placeholder="Escribí tu pregunta..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        minLength={10}
        maxLength={2000}
        rows={4}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 text-body-sm focus:outline-none focus:border-terra-500/50 focus:bg-white/[0.08] transition-all duration-300 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="group inline-flex items-center gap-2 px-6 py-3 bg-terra-500 hover:bg-terra-600 text-white text-body-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-warm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando...' : 'Enviar consulta'}
        {!loading && <SendIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />}
      </button>
    </form>
  )
}
