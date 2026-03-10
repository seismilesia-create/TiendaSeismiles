import type { Metadata } from 'next'
import { getRecentOrders } from '@/features/shop/services/analytics'
import { RecentOrdersTable } from '@/features/shop/components/admin/RecentOrdersTable'

export const metadata: Metadata = {
  title: 'Pedidos - Admin',
}

export default async function PedidosPage() {
  const orders = await getRecentOrders(100)

  return (
    <>
      <h1 className="font-heading text-display-xs text-volcanic-900 mb-8">Pedidos</h1>
      <RecentOrdersTable orders={orders} />
    </>
  )
}
