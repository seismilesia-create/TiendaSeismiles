import Link from 'next/link'
import type { OrderListItem } from '@/features/shop/services/orders'

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pendiente_pago: { label: 'Pendiente de pago', className: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', className: 'bg-amber-100 text-amber-700' },
  en_preparacion: { label: 'En preparación', className: 'bg-blue-100 text-blue-700' },
  enviado: { label: 'Enviado', className: 'bg-sky-100 text-sky-700' },
  entregado: { label: 'Entregado', className: 'bg-emerald-100 text-emerald-700' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-600' },
  reembolsada: { label: 'Reembolsada', className: 'bg-violet-100 text-violet-600' },
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
  )
}

interface Props {
  orders: OrderListItem[]
}

export function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-volcanic-500"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
        </div>
        <p className="text-body-md font-medium text-volcanic-700 mb-1">Sin pedidos aun</p>
        <p className="text-body-sm text-volcanic-500">Cuando realices tu primera compra, aparecera aqui.</p>
        <Link
          href="/catalogo"
          className="inline-block mt-5 px-6 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-colors"
        >
          Explorar catalogo
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sand-200/60">
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">N° Pedido</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Fecha</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Producto</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Cant.</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Total</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Estado</th>
              <th className="px-5 lg:px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = STATUS_STYLES[order.estado] ?? STATUS_STYLES.confirmado
              return (
                <tr key={order.id} className="border-b border-sand-200/30 last:border-0 hover:bg-sand-100/30 transition-colors">
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm font-mono font-semibold text-volcanic-900">
                    {order.numero_pedido}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-xs text-volcanic-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm text-volcanic-900 font-medium truncate max-w-[200px]">
                    {order.producto_nombre}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm text-volcanic-700 text-center">
                    {order.cantidad}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-body-sm font-semibold text-volcanic-900 whitespace-nowrap">
                    ${order.total.toLocaleString('es-AR')}
                  </td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <Link
                      href={`/perfil/pedidos/${order.id}`}
                      className="text-terra-500 hover:text-terra-600 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {orders.map((order) => {
          const status = STATUS_STYLES[order.estado] ?? STATUS_STYLES.confirmado
          return (
            <Link
              key={order.id}
              href={`/perfil/pedidos/${order.id}`}
              className="block rounded-2xl bg-white border border-sand-200/60 p-4 hover:border-terra-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-mono font-semibold text-volcanic-900">{order.numero_pedido}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-body-sm text-volcanic-700 font-medium truncate">{order.producto_nombre}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-body-xs text-volcanic-500">
                  {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-body-sm font-semibold text-volcanic-900">
                  ${order.total.toLocaleString('es-AR')}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
