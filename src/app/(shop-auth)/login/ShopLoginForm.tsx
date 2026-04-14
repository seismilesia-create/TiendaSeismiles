'use client'

import { useState } from 'react'
import { login, resetPassword } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function ShopLoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset' | 'reset-sent'>('login')
  const [resetEmail, setResetEmail] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleReset(formData: FormData) {
    setLoading(true)
    setError(null)
    setResetEmail(formData.get('email') as string)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setMode('reset-sent')
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  if (mode === 'reset-sent') {
    return (
      <div className="text-center py-4">
        <MailIcon className="w-14 h-14 mx-auto text-terra-500 mb-5" />
        <h2 className="font-heading text-display-xs text-volcanic-900 mb-3">
          Revisá tu email
        </h2>
        <p className="text-body-md text-volcanic-500 mb-2">
          Enviamos un link para restablecer tu contraseña a:
        </p>
        <p className="text-body-md font-semibold text-volcanic-900 mb-6">
          {resetEmail}
        </p>
        <p className="text-body-sm text-volcanic-500 mb-8">
          Hacé click en el link del email para elegir una nueva contraseña. Si no lo ves, revisá la carpeta de spam.
        </p>
        <button
          onClick={() => { setMode('login'); setError(null) }}
          className="text-body-sm font-medium text-volcanic-600 hover:text-volcanic-900 transition-colors"
        >
          Volver al inicio de sesión
        </button>
      </div>
    )
  }

  if (mode === 'reset') {
    return (
      <div className="space-y-5">
        <div className="text-center mb-2">
          <h2 className="font-heading text-display-xs text-volcanic-900 mb-2">
            Recuperar contraseña
          </h2>
          <p className="text-body-sm text-volcanic-500">
            Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
          </p>
        </div>

        <form action={handleReset} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 text-white text-body-md font-semibold rounded-xl transition-all duration-300"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperación'}
          </button>
        </form>

        <button
          onClick={() => { setMode('login'); setError(null) }}
          className="w-full text-center text-body-sm font-medium text-volcanic-500 hover:text-volcanic-900 transition-colors"
        >
          Volver al inicio de sesión
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-3">
        <h1 className="font-heading text-display-sm text-volcanic-900">Iniciar sesión</h1>
        <p className="mt-2 text-body-md text-volcanic-500">Ingresá a tu cuenta para continuar</p>
      </div>

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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-body-sm font-medium text-volcanic-700">
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(null) }}
              className="text-body-xs text-terra-500 hover:text-terra-600 font-medium transition-colors"
            >
              Olvidé mi contraseña
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 text-white text-body-md font-semibold rounded-xl transition-all duration-300"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-sand-200" />
        <span className="text-body-xs text-volcanic-500">o</span>
        <div className="flex-1 h-px bg-sand-200" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-sand-50 disabled:opacity-50 border border-sand-200 text-volcanic-700 text-body-md font-medium rounded-xl transition-all duration-300"
      >
        <GoogleIcon className="w-5 h-5" />
        {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
      </button>

      <p className="text-center text-body-sm text-volcanic-500">
        ¿No tenés cuenta?{' '}
        <a href="/registro" className="font-semibold text-terra-500 hover:text-terra-600 hover:underline">
          Registrate
        </a>
      </p>
    </div>
  )
}
