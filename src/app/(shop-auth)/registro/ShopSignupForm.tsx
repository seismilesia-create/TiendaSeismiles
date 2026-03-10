'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/actions/auth'

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function ShopSignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSubmittedEmail(formData.get('email') as string)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setEmailSent(true)
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <MailIcon className="w-14 h-14 mx-auto text-terra-500 mb-5" />
        <h2 className="font-heading text-display-xs text-volcanic-900 mb-3">
          Revisa tu email
        </h2>
        <p className="text-body-md text-volcanic-500 mb-2">
          Enviamos un link de confirmacion a:
        </p>
        <p className="text-body-md font-semibold text-volcanic-900 mb-6">
          {submittedEmail}
        </p>
        <p className="text-body-sm text-volcanic-400 mb-8">
          Hace click en el link del email para activar tu cuenta. Si no lo ves, revisa la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 text-body-sm font-medium text-volcanic-600 hover:text-volcanic-900 transition-colors"
        >
          Volver al inicio de sesion
        </Link>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-body-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
          placeholder="Minimo 6 caracteres"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 text-white text-body-md font-semibold rounded-xl transition-all duration-300"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
