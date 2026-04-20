import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/customer'
import { getOrderDetail } from '@/features/shop/services/orders'
import { OrderProgressBar } from '@/features/shop/components/customer/OrderProgressBar'
import { OrderProductCard } from '@/features/shop/components/customer/OrderProductCard'

export const metadata: Metadata = {
  title: 'Detalle de pedido | SEISMILES',
}

const PAYMENT_LABELS: Record<string, string> = {
  tarjeta: 'Tarjeta de crédito/débito',
  transferencia: 'Transferencia bancaria',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo',
}

const CANCEL_STYLES: Record<string, { label: string; className: string }> = {
  pendiente_pago: { label: 'Esperando confirmación de pago', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  cancelada: { label: 'Pedido cancelado', className: 'bg-red-100 text-red-700 border-red-200' },
  reembolsada: { label: 'Pedido reembolsado', className: 'bg-violet-100 text-violet-700 border-violet-200' },
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></svg>
  )
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAuth()
  if (!user) redirect('/login')

  const order = await getOrderDetail(user.id, id)
  if (!order) notFound()

  const cancelStatus = CANCEL_STYLES[order.estado]
  const isCancelledOrRefunded = !!cancelStatus

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-body-xs text-volcanic-500 mb-6">
        <Link href="/perfil" className="hover:text-terra-500 transition-colors">Mi perfil</Link>
        <span>/</span>
        <span className="text-volcanic-700 font-medium">{order.numero_pedido}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8">
        <Link
          href="/perfil"
          className="p-2 -ml-2 rounded-lg text-volcanic-500 hover:text-volcanic-900 hover:bg-sand-100 transition-all self-start"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-heading text-display-sm text-volcanic-900">
            Pedido {order.numero_pedido}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-body-xs text-volcanic-500">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              {new Date(order.created_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCardIcon className="w-3.5 h-3.5" />
              {PAYMENT_LABELS[order.metodo_pago] ?? order.metodo_pago}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar or cancel badge */}
      <div className="mb-8">
        {isCancelledOrRefunded ? (
          <div className={`rounded-2xl border p-5 text-center ${cancelStatus.className}`}>
            <p className="text-body-md font-semibold">{cancelStatus.label}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-8">
            <h3 className="text-body-xs uppercase tracking-widest text-volcanic-500 font-semibold mb-5">
              Estado del pedido
            </h3>
            <OrderProgressBar currentStatus={order.estado} />
          </div>
        )}
      </div>

      {/* Product card */}
      <div className="mb-6">
        <OrderProductCard order={order} />
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-body-sm font-medium text-volcanic-700 hover:text-volcanic-900 border border-sand-200 hover:border-volcanic-900/20 transition-all"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a mis pedidos
        </Link>
      </div>
    </div>
  )
}
