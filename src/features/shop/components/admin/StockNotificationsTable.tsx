import type { StockNotificationRow } from '@/features/shop/services/inventory'

interface Props {
  notifications: StockNotificationRow[]
}

export function StockNotificationsTable({ notifications }: Props) {
  const pending = notifications.filter((n) => !n.notificado)
  const notified = notifications.filter((n) => n.notificado)
  const sorted = [...pending, ...notified]

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 text-center">
        <p className="text-body-sm text-volcanic-500">No hay solicitudes de notificacion de stock.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
      <div className="p-5 lg:p-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-heading text-lg text-volcanic-900">Solicitudes de stock</h3>
          {pending.length > 0 && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sand-200/60">
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Email</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Producto</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Talle</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Color</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Fecha</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((n) => (
              <tr key={n.id} className="border-b border-sand-200/30 last:border-0 hover:bg-sand-100/30 transition-colors">
                <td className="px-5 lg:px-6 py-3.5 text-body-xs text-volcanic-700 truncate max-w-[180px]">
                  {n.email}
                </td>
                <td className="px-5 lg:px-6 py-3.5 text-body-sm font-medium text-volcanic-900 truncate max-w-[180px]">
                  {n.producto_nombre}
                </td>
                <td className="px-5 lg:px-6 py-3.5">
                  <span className="inline-block bg-volcanic-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {n.talle}
                  </span>
                </td>
                <td className="px-5 lg:px-6 py-3.5">
                  <span className="inline-flex items-center gap-2 text-body-sm text-volcanic-700">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-sand-300 shrink-0"
                      style={{ backgroundColor: n.color_hex }}
                    />
                    {n.color_nombre}
                  </span>
                </td>
                <td className="px-5 lg:px-6 py-3.5 text-body-xs text-volcanic-500 whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 lg:px-6 py-3.5">
                  {n.notificado ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                      Notificado
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                      Pendiente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
