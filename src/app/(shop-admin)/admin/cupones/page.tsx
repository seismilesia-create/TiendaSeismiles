import type { Metadata } from 'next'
import Link from 'next/link'
import { getCoupons } from '@/features/shop/services/admin-coupons'
import { CouponsTable } from '@/features/shop/components/admin/CouponsTable'

export const metadata: Metadata = { title: 'Cupones | Admin SEISMILES' }

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  )
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl text-volcanic-900">Cupones de descuento</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            {coupons.length} cupon{coupons.length !== 1 ? 'es' : ''} creado{coupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/cupones/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo cupon
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-sand-200/60 p-6">
        <CouponsTable coupons={coupons} />
      </div>
    </div>
  )
}
