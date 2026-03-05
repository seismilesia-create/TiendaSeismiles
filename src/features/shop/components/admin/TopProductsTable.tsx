import type { TopProduct } from '@/features/shop/services/analytics'

interface Props {
  products: TopProduct[]
}

export function TopProductsTable({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 text-center">
        <p className="text-body-sm text-volcanic-400">Sin ventas registradas este ano.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
      <h3 className="font-heading text-lg text-volcanic-900 mb-4">Productos mas vendidos</h3>
      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={product.producto_id} className="flex items-center gap-4">
            <span className="w-7 h-7 rounded-lg bg-sand-100 flex items-center justify-center text-body-xs font-bold text-volcanic-500">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-volcanic-900 truncate">
                {product.nombre}
              </p>
              <p className="text-body-xs text-volcanic-400">
                {product.totalUnits} unid. — {product.totalOrders} ventas
              </p>
            </div>
            <span className="text-body-sm font-semibold text-volcanic-900 shrink-0">
              ${product.totalRevenue.toLocaleString('es-AR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
