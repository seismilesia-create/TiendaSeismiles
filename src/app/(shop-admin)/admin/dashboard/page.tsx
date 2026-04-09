import type { Metadata } from 'next'
import {
  getRevenueByMonth,
  getRevenueSummary,
  getAvailableYears,
  getTopProducts,
  getRecentOrders,
} from '@/features/shop/services/analytics'
import { DashboardKpiCard } from '@/features/shop/components/admin/DashboardKpiCard'
import { RevenueChart } from '@/features/shop/components/admin/RevenueChart'
import { TopProductsTable } from '@/features/shop/components/admin/TopProductsTable'
import { RecentOrdersTable } from '@/features/shop/components/admin/RecentOrdersTable'

export const metadata: Metadata = { title: 'Dashboard | Admin SEISMILES' }

function formatARS(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${value.toLocaleString('es-AR')}`
}

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

export default async function AdminDashboardPage() {
  const currentYear = new Date().getFullYear()

  const [summary, years, topProducts, recentOrders] = await Promise.all([
    getRevenueSummary(),
    getAvailableYears(),
    getTopProducts(5),
    getRecentOrders(10),
  ])

  // Preload revenue data for all available years
  const allYearsData: Record<number, Awaited<ReturnType<typeof getRevenueByMonth>>> = {}
  await Promise.all(
    years.map(async (y) => {
      allYearsData[y] = await getRevenueByMonth(y)
    })
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Dashboard</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Resumen de ingresos y ventas
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardKpiCard
          title="Ingresos hoy"
          value={formatARS(summary.today)}
          icon={<DollarIcon />}
        />
        <DashboardKpiCard
          title="Esta semana"
          value={formatARS(summary.thisWeek)}
          icon={<CalendarIcon />}
        />
        <DashboardKpiCard
          title="Este mes"
          value={formatARS(summary.thisMonth)}
          icon={<TrendingIcon />}
          change={summary.monthChange}
        />
        <DashboardKpiCard
          title={`Ventas ${currentYear}`}
          value={`${summary.totalOrders}`}
          icon={<ShoppingBagIcon />}
        />
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart
            initialData={allYearsData[currentYear] ?? []}
            years={years}
            allYearsData={allYearsData}
          />
        </div>
        <div>
          <TopProductsTable products={topProducts} />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={recentOrders} />
    </div>
  )
}
