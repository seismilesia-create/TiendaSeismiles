import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductForm } from '@/features/shop/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Nuevo Producto | Admin SEISMILES' }

export default function NewProductPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/productos"
          className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
        >
          Productos
        </Link>
        <span className="text-volcanic-300">/</span>
        <span className="text-body-sm text-volcanic-900 font-medium">Nuevo producto</span>
      </div>

      <h1 className="font-heading text-2xl text-volcanic-900 mb-8">Crear producto</h1>

      <ProductForm />
    </div>
  )
}
