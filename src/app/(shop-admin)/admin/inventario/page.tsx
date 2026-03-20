import type { Metadata } from 'next'
import {
  getInventoryOverview,
  getAllVariantsWithProducts,
  getPendingStockNotifications,
  getStockHealth,
  getCriticalAlerts,
} from '@/features/shop/services/inventory'
import { InventoryKpiCards } from '@/features/shop/components/admin/InventoryKpiCards'
import { StockTable } from '@/features/shop/components/admin/StockTable'
import { StockHealthTable } from '@/features/shop/components/admin/StockHealthTable'
import { InventoryAlertsBanner } from '@/features/shop/components/admin/InventoryAlertsBanner'
import { StockRequestsCard } from '@/features/shop/components/admin/StockRequestsCard'

export const metadata: Metadata = { title: 'Inventario | Admin Seismiles' }

export default async function AdminInventarioPage() {
  const [overview, variants, notifications, stockHealth, alerts] =
    await Promise.all([
      getInventoryOverview(),
      getAllVariantsWithProducts(),
      getPendingStockNotifications(),
      getStockHealth(),
      getCriticalAlerts(),
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

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <InventoryAlertsBanner alerts={alerts} />
        </div>
      )}

      {/* KPI Cards */}
      <InventoryKpiCards overview={overview} />

      {/* Stock Health */}
      <div className="mb-8">
        <StockHealthTable data={stockHealth} />
      </div>

      {/* Stock Table */}
      <div className="mb-8">
        <StockTable variants={variants} />
      </div>

      {/* Stock Requests (unified) */}
      <StockRequestsCard notifications={notifications} />
    </div>
  )
}
