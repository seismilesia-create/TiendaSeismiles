'use client'

import { useState, useMemo, useTransition, useRef, useEffect } from 'react'
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
  mercadopago: 'Mercado Pago',
  gift_card: 'Gift Card',
  'gift_card+mercadopago': 'Gift Card + MP',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

function getStatusStyle(estado: string) {
  return STATUS_OPTIONS.find((s) => s.value === estado) ?? STATUS_OPTIONS[0]
}

function getPaymentLabel(metodo: string) {
  return PAYMENT_LABELS[metodo] ?? metodo
}

interface Props {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const [filterEstado, setFilterEstado] = useState('')
  const [filterPago, setFilterPago] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Tracking number popover state
  const [trackingPopover, setTrackingPopover] = useState<{ orderId: string; tracking: string } | null>(null)
  const trackingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (trackingPopover && trackingInputRef.current) {
      trackingInputRef.current.focus()
    }
  }, [trackingPopover])

  // Collect unique payment methods from actual data
  const paymentMethods = useMemo(() => {
    const methods = new Set(orders.map((o) => o.metodo_pago))
    return Array.from(methods).sort()
  }, [orders])

  const filteredOrders = useMemo(() => {
    let result = orders
    if (filterEstado) {
      result = result.filter((o) => o.estado === filterEstado)
    }
    if (filterPago) {
      result = result.filter((o) => o.metodo_pago === filterPago)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (o) =>
          o.producto_nombre.toLowerCase().includes(q) ||
          o.user_email.toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, filterEstado, filterPago, searchQuery])

  function handleStatusChange(orderId: string, newStatus: string) {
    const oldOrder = orders.find((o) => o.id === orderId)
    if (!oldOrder || oldOrder.estado === newStatus) return

    // If changing to "enviado", show tracking popover instead of immediate action
    if (newStatus === 'enviado') {
      setTrackingPopover({ orderId, tracking: oldOrder.numero_seguimiento ?? '' })
      // Optimistic update of the select value
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
      )
      return
    }

    executeStatusChange(orderId, newStatus, oldOrder.estado)
  }

  function executeStatusChange(orderId: string, newStatus: string, oldStatus: string, trackingNumber?: string) {
    setUpdatingId(orderId)

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o
        return {
          ...o,
          estado: newStatus,
          numero_seguimiento: trackingNumber !== undefined ? (trackingNumber || null) : o.numero_seguimiento,
        }
      })
    )

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus, trackingNumber)
      if (result.error) {
        // Revert on error
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, estado: oldStatus } : o))
        )
      }
      setUpdatingId(null)
    })
  }

  function confirmTracking() {
    if (!trackingPopover) return
    const order = orders.find((o) => o.id === trackingPopover.orderId)
    if (!order) return

    const oldStatus = initialOrders.find((o) => o.id === trackingPopover.orderId)?.estado ?? order.estado
    executeStatusChange(trackingPopover.orderId, 'enviado', oldStatus, trackingPopover.tracking)
    setTrackingPopover(null)
  }

  function cancelTracking() {
    if (!trackingPopover) return
    // Revert the optimistic status change
    const original = initialOrders.find((o) => o.id === trackingPopover.orderId)
    if (original) {
      setOrders((prev) =>
        prev.map((o) => (o.id === trackingPopover.orderId ? { ...o, estado: original.estado } : o))
      )
    }
    setTrackingPopover(null)
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 text-center">
        <p className="text-body-sm text-volcanic-500">Sin ventas registradas aún.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
      <div className="p-5 lg:p-6 pb-0">
        <h3 className="font-heading text-lg text-volcanic-900 mb-4">Últimas ventas</h3>
      </div>

      {/* Filters */}
      <div className="px-5 lg:px-6 pb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-sand-200 text-body-xs text-volcanic-700 bg-white focus:outline-none focus:ring-2 focus:ring-terra-500/30"
        >
          <option value="">Estado: Todos</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filterPago}
          onChange={(e) => setFilterPago(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-sand-200 text-body-xs text-volcanic-700 bg-white focus:outline-none focus:ring-2 focus:ring-terra-500/30"
        >
          <option value="">Pago: Todos</option>
          {paymentMethods.map((m) => (
            <option key={m} value={m}>{getPaymentLabel(m)}</option>
          ))}
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar producto o cliente..."
          className="px-3 py-1.5 rounded-lg border border-sand-200 text-body-xs text-volcanic-700 bg-white placeholder:text-volcanic-400 focus:outline-none focus:ring-2 focus:ring-terra-500/30 w-full sm:w-56"
        />

        <span className="text-body-xs text-volcanic-500 ml-auto">
          {filteredOrders.length === orders.length
            ? `${orders.length} pedidos`
            : `${filteredOrders.length} de ${orders.length}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sand-200/60">
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Fecha</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Producto</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Cliente</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Cant.</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Total</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Pago</th>
              <th className="px-5 lg:px-6 py-3 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 lg:px-6 py-8 text-center text-body-sm text-volcanic-500">
                  No se encontraron pedidos con esos filtros.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const status = getStatusStyle(order.estado)
                const isUpdating = updatingId === order.id
                const isTrackingOpen = trackingPopover?.orderId === order.id
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
                      {getPaymentLabel(order.metodo_pago)}
                    </td>
                    <td className="px-5 lg:px-6 py-3.5">
                      <div className="relative">
                        <select
                          value={order.estado}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={isUpdating || isTrackingOpen}
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

                        {/* Tracking number display for shipped orders */}
                        {order.estado === 'enviado' && order.numero_seguimiento && !isTrackingOpen && (
                          <p className="text-[10px] text-sky-600 mt-1 truncate max-w-[120px]" title={order.numero_seguimiento}>
                            #{order.numero_seguimiento}
                          </p>
                        )}

                        {/* Tracking popover */}
                        {isTrackingOpen && (
                          <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-xl border border-sand-200 shadow-lg p-3 w-64">
                            <p className="text-body-xs font-semibold text-volcanic-900 mb-2">Confirmar envio</p>
                            <input
                              ref={trackingInputRef}
                              type="text"
                              value={trackingPopover.tracking}
                              onChange={(e) => setTrackingPopover((prev) => prev ? { ...prev, tracking: e.target.value } : null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmTracking()
                                if (e.key === 'Escape') cancelTracking()
                              }}
                              placeholder="N° de seguimiento (opcional)"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-200 text-body-xs text-volcanic-700 placeholder:text-volcanic-400 focus:outline-none focus:ring-2 focus:ring-terra-500/30 mb-2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={confirmTracking}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-body-xs font-semibold hover:bg-sky-700 transition-colors"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={cancelTracking}
                                className="px-3 py-1.5 rounded-lg border border-sand-200 text-body-xs text-volcanic-600 hover:bg-sand-50 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
