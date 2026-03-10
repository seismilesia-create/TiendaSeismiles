import type { Metadata } from 'next'
import {
  getInventoryOverview,
  getAllVariantsWithProducts,
  getPendingStockNotifications,
} from '@/features/shop/services/inventory'
import { InventoryKpiCards } from '@/features/shop/components/admin/InventoryKpiCards'
import { StockTable } from '@/features/shop/components/admin/StockTable'
import { StockNotificationsTable } from '@/features/shop/components/admin/StockNotificationsTable'

export const metadata: Metadata = { title: 'Inventario | Admin Seismiles' }

export default async function AdminInventarioPage() {
  const [overview, variants, notifications] = await Promise.all([
    getInventoryOverview(),
    getAllVariantsWithProducts(),
    getPendingStockNotifications(),
  ])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Inventario</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Gestion de stock y notificaciones de reposicion
        </p>
      </div>

      {/* KPI Cards */}
      <InventoryKpiCards overview={overview} />

      {/* Stock Table */}
      <div className="mb-8">
        <StockTable variants={variants} />
      </div>

      {/* Stock Notifications */}
      <StockNotificationsTable notifications={notifications} />
    </div>
  )
}
