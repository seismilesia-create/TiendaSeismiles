import { DashboardKpiCard } from './DashboardKpiCard'
import type { InventoryOverview } from '@/features/shop/services/inventory'

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 12 15 22 5" className="hidden" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}

function formatARS(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString('es-AR')}`
}

interface Props {
  overview: InventoryOverview
}

export function InventoryKpiCards({ overview }: Props) {
  const requierenAtencion = overview.sinStock + overview.stockBajo

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <DashboardKpiCard
        title="Valor inventario"
        value={formatARS(overview.valorInventario)}
        icon={<DollarIcon />}
      />
      <DashboardKpiCard
        title="Total unidades"
        value={overview.totalUnidades.toLocaleString('es-AR')}
        icon={<BoxIcon />}
      />
      <DashboardKpiCard
        title="Cobertura"
        value={`${overview.coberturaPorcentaje}%`}
        icon={<ShieldIcon />}
      />
      <DashboardKpiCard
        title="Requieren atencion"
        value={`${requierenAtencion}`}
        icon={<AlertTriangleIcon />}
      />
    </div>
  )
}
