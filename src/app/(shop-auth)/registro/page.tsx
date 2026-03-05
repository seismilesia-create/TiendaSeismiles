import type { Metadata } from 'next'
import { ShopSignupForm } from './ShopSignupForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
}

export default function ShopSignupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-display-sm text-volcanic-900">Crear cuenta</h1>
        <p className="mt-2 text-body-md text-volcanic-500">Registrate para acceder a tu panel</p>
      </div>

      <ShopSignupForm />

      <p className="text-center text-body-sm text-volcanic-500">
        Ya tenes cuenta?{' '}
        <a href="/login" className="font-semibold text-terra-500 hover:text-terra-600 hover:underline">
          Inicia sesion
        </a>
      </p>
    </div>
  )
}
