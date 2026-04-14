'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitFaqQuestion } from '@/actions/faq'

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="m22 2-11 11" />
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

  // Not logged in - show register/login prompt
  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-body-md text-white/50 mb-6">
          Para enviarnos tu consulta, necesitás tener una cuenta.
        </p>
        <div className="flex items-center justify-center gap-4">
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
