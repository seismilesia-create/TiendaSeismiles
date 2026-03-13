import type { Metadata } from 'next'
import { UpdatePasswordForm } from './UpdatePasswordForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña',
}

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-display-sm text-volcanic-900">Nueva contraseña</h1>
        <p className="mt-2 text-body-md text-volcanic-500">Ingresa tu nueva contraseña</p>
      </div>

      <UpdatePasswordForm />
    </div>
  )
}
