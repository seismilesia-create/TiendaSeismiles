import type { Metadata } from 'next'
import { ShopLoginForm } from './ShopLoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

export default function ShopLoginPage() {
  return <ShopLoginForm />
}
