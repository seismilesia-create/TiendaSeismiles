import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/customer'
import { getMyOrders } from '@/features/shop/services/orders'
import { OrdersTable } from '@/features/shop/components/customer/OrdersTable'
import { signout } from '@/actions/auth'
import { ProfileNav } from './ProfileNav'

export const metadata: Metadata = {
  title: 'Mi perfil | Seismiles Textil',
  description: 'Gestiona tu cuenta y revisa tus pedidos en Seismiles Textil.',
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  )
}

export default async function PerfilPage() {
  const user = await requireAuth()
  if (!user) redirect('/login')

  const orders = await getMyOrders(user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10">
        <div className="w-14 h-14 rounded-full bg-volcanic-900 text-white flex items-center justify-center text-xl font-semibold shrink-0">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {user.fullName && (
            <h1 className="font-heading text-display-sm text-volcanic-900">{user.fullName}</h1>
          )}
          <p className="text-body-md text-volcanic-500">{user.email}</p>
        </div>
        <form action={signout}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm text-volcanic-500 hover:text-red-500 hover:bg-red-50 border border-sand-200 transition-all">
            <LogoutIcon className="w-4 h-4" />
            Cerrar sesion
          </button>
        </form>
      </div>

      <ProfileNav active="pedidos" />

      <OrdersTable orders={orders} />
    </div>
  )
}
