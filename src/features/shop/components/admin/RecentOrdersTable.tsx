'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatusAction } from '@/actions/admin-orders'
import type { RecentOrder } from '@/features/shop/services/analytics'

const STATUS_OPTIONS = [
  { value: 'pendiente_pago', label: 'Pendiente pago', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmado', label: 'Confirmado', className: 'bg-amber-100 text-amber-700' },
  { value: 'en_preparacion', label: 'En preparación', className: 'bg-blue-100 text-blue-700' },
  { value: 'enviado', label: 'Enviado', className: 'bg-sky-100 text-sky-700' },
  { value: 'entregado', label: 'Entregado', className: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelada', label: 'Cancelada', className: 'bg-red-100 text-red-600' },
  { value: 'reembolsada', label: 'Reembolsada', className: 'bg-violet-100 text-violet-600' },
]

const PAYMENT_LABELS: Record<string, string> = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo',
}

function getStatusStyle(estado: string) {
  return STATUS_OPTIONS.find((s) => s.value === estado) ?? STATUS_OPTIONS[0]
}

interface Props {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleStatusChange(orderId: string, newStatus: string) {
    const oldOrder = orders.find((o) => o.id === orderId)
    if (!oldOrder || oldOrder.estado === newStatus) return

    setUpdatingId(orderId)

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
    )

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus)
      if (result.error) {
        // Revert on error
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, estado: oldOrder.estado } : o))
        )
      }
      setUpdatingId(null)
    })
  }

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
              const status = getStatusStyle(order.estado)
              const isUpdating = updatingId === order.id
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
                    <select
                      value={order.estado}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={isUpdating}
                      className={`appearance-none cursor-pointer px-2.5 py-1 pr-6 rounded-full text-[11px] font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-terra-500/30 transition-colors ${status.className} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 6px center',
                        backgroundSize: '12px',
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
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
