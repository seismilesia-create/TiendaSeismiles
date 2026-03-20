import type { StockHealthRow } from '@/features/shop/services/inventory'

interface Props {
  data: StockHealthRow[]
}

function getUrgencyBadge(row: StockHealthRow) {
  if (row.totalStock === 0) return { label: 'Agotado', className: 'bg-red-100 text-red-600' }
  if (row.diasRestantes !== null && row.diasRestantes <= 7) return { label: `${row.diasRestantes}d`, className: 'bg-red-100 text-red-600' }
  if (row.diasRestantes !== null && row.diasRestantes <= 14) return { label: `${row.diasRestantes}d`, className: 'bg-amber-100 text-amber-700' }
  if (row.diasRestantes !== null) return { label: `${row.diasRestantes}d`, className: 'bg-emerald-100 text-emerald-700' }
  return { label: 'Sin ventas', className: 'bg-sand-100 text-volcanic-500' }
}

export function StockHealthTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 text-center">
        <h3 className="font-heading text-lg text-volcanic-900 mb-2">Salud de stock</h3>
        <p className="text-body-sm text-volcanic-500">Sin productos registrados.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
      <div className="mb-4">
        <h3 className="font-heading text-lg text-volcanic-900">Salud de stock</h3>
        <p className="text-body-xs text-volcanic-500 mt-1">Velocidad de venta y dias de stock restante</p>
      </div>

      <div className="space-y-3">
        {data.map((row) => {
          const badge = getUrgencyBadge(row)
          // Progress bar: percentage of stock "consumed" based on 30d sales
          const maxStock = Math.max(row.totalStock, row.ventasUltimos30d, 1)
          const stockPct = Math.min((row.totalStock / maxStock) * 100, 100)

          return (
            <div key={row.productoId}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-body-sm font-medium text-volcanic-900 truncate flex-1">
                  {row.nombre}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              {/* Stock bar */}
              <div className="h-2 bg-sand-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    row.totalStock === 0
                      ? 'bg-red-400'
                      : row.diasRestantes !== null && row.diasRestantes <= 7
                        ? 'bg-red-400'
                        : row.diasRestantes !== null && row.diasRestantes <= 14
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                  }`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-body-xs text-volcanic-500">
                <span>{row.totalStock} unid.</span>
                <span>{row.velocidadDiaria} ventas/dia</span>
                <span>{row.ventasUltimos30d} vendidas (30d)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
