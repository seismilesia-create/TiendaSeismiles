import type { Metadata } from 'next'
import { CouponForm } from '@/features/shop/components/admin/CouponForm'

export const metadata: Metadata = { title: 'Nuevo Cupon | Admin Seismiles' }

export default function NuevoCuponPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Nuevo cupon</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Crea un codigo de descuento para promos o newsletter
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-sand-200/60 p-6">
        <CouponForm />
      </div>
    </div>
  )
}
