import type { RecentOrder } from '@/features/shop/services/analytics'

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  completada: { label: 'Completada', className: 'bg-emerald-100 text-emerald-700' },
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-600' },
  reembolsada: { label: 'Reembolsada', className: 'bg-violet-100 text-violet-600' },
}

const PAYMENT_LABELS: Record<string, string> = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo',
}

interface Props {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 text-center">
        <p className="text-body-sm text-volcanic-400">Sin ventas registradas aun.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
      <div className="p-5 lg:p-6 pb-0">
        <h3 className="font-heading text-lg text-volcanic-900 mb-4">Ultimas ventas</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sand-200/60">
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Fecha</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Producto</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Cliente</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Cant.</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Total</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Pago</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-400 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = STATUS_STYLES[order.estado] ?? STATUS_STYLES.pendiente
              return (
                <tr key={order.id} className="border-b border-sand-200/30 last:border-0 hover:bg-sand-100/30 transition-colors">
                  <td className="px-5 lg:px-6 py-3.5 text-body-xs text-volcanic-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm text-volcanic-900 font-medium truncate max-w-[200px]">
                    {order.producto_nombre}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-xs text-volcanic-500 truncate max-w-[180px]">
                    {order.user_email}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm text-volcanic-700 text-center">
                    {order.cantidad}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm font-semibold text-volcanic-900 whitespace-nowrap">
                    ${order.total.toLocaleString('es-AR')}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-xs text-volcanic-500 whitespace-nowrap">
                    {PAYMENT_LABELS[order.metodo_pago] ?? order.metodo_pago}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
