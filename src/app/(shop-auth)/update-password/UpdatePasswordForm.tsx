'use client'

import { useState } from 'react'
import { updatePassword } from '@/actions/auth'

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError(null)
    const result = await updatePassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-body-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
          Nueva contraseña
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

      <div>
        <label htmlFor="confirm" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
          placeholder="Repeti tu contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 text-white text-body-md font-semibold rounded-xl transition-all duration-300"
      >
        {loading ? 'Actualizando...' : 'Actualizar contraseña'}
      </button>
    </form>
  )
}
