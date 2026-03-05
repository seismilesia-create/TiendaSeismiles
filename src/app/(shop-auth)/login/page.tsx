import type { Metadata } from 'next'
import { ShopLoginForm } from './ShopLoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesion',
}

export default function ShopLoginPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-display-sm text-volcanic-900">Iniciar sesion</h1>
        <p className="mt-2 text-body-md text-volcanic-500">Ingresa a tu cuenta para continuar</p>
      </div>

      <ShopLoginForm />

      <p className="text-center text-body-sm text-volcanic-500">
        No tenes cuenta?{' '}
        <a href="/registro" className="font-semibold text-terra-500 hover:text-terra-600 hover:underline">
          Registrate
        </a>
      </p>
    </div>
  )
}
