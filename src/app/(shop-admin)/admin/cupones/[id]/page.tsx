import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCoupon } from '@/features/shop/services/admin-coupons'
import { CouponForm } from '@/features/shop/components/admin/CouponForm'

export const metadata: Metadata = { title: 'Editar Cupon | Admin Seismiles' }

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const coupon = await getCoupon(id)

  if (!coupon) notFound()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Editar cupon</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          <span className="font-mono font-semibold tracking-wider">{coupon.codigo}</span> · {coupon.usos_actuales} usos
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-sand-200/60 p-6">
        <CouponForm existing={coupon} />
      </div>
    </div>
  )
}
