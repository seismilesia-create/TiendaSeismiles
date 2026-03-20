'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCouponAction } from '@/actions/admin-coupons'

interface Coupon {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  minimo_compra: number
  max_usos: number | null
  usos_actuales: number
  un_uso_por_usuario: boolean
  activo: boolean
  fecha_inicio: string
  fecha_fin: string | null
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
  )
}

export function CouponsTable({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este cupon?')) return
    setDeleting(id)
    const result = await deleteCouponAction(id)
    if (result.error) {
      alert(result.error)
    }
    setDeleting(null)
    router.refresh()
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  if (!coupons.length) {
    return (
      <div className="text-center py-16 text-body-md text-volcanic-500">
        No hay cupones creados. Crea el primero.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="border-b border-sand-200 text-volcanic-500 text-left">
            <th className="pb-3 font-medium">Codigo</th>
            <th className="pb-3 font-medium">Descuento</th>
            <th className="pb-3 font-medium">Min. compra</th>
            <th className="pb-3 font-medium">Usos</th>
            <th className="pb-3 font-medium">Estado</th>
            <th className="pb-3 font-medium">Vencimiento</th>
            <th className="pb-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {coupons.map((coupon) => {
            const isExpired = coupon.fecha_fin && new Date(coupon.fecha_fin) < new Date()
            const isMaxed = coupon.max_usos !== null && coupon.usos_actuales >= coupon.max_usos
            const effectiveActive = coupon.activo && !isExpired && !isMaxed

            return (
              <tr key={coupon.id} className="hover:bg-sand-50/50">
                {/* Codigo */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-volcanic-900 tracking-wider">
                      {coupon.codigo}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.codigo)}
                      className="p-1 rounded hover:bg-sand-100 text-volcanic-400 hover:text-volcanic-600 transition-colors"
                      title="Copiar codigo"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                    </button>
                    {copied === coupon.codigo && (
                      <span className="text-body-xs text-emerald-600">Copiado</span>
                    )}
                  </div>
                  {coupon.un_uso_por_usuario && (
                    <p className="text-body-xs text-volcanic-400 mt-0.5">1 uso por cliente</p>
                  )}
                </td>

                {/* Descuento */}
                <td className="py-3 pr-4 font-semibold text-volcanic-900">
                  {coupon.tipo === 'porcentaje'
                    ? `${coupon.valor}%`
                    : `$${Number(coupon.valor).toLocaleString('es-AR')}`}
                </td>

                {/* Minimo */}
                <td className="py-3 pr-4 text-volcanic-500 tabular-nums">
                  {Number(coupon.minimo_compra) > 0
                    ? `$${Number(coupon.minimo_compra).toLocaleString('es-AR')}`
                    : '—'}
                </td>

                {/* Usos */}
                <td className="py-3 pr-4 tabular-nums">
                  <span className="text-volcanic-900 font-medium">{coupon.usos_actuales}</span>
                  <span className="text-volcanic-400">
                    {coupon.max_usos !== null ? ` / ${coupon.max_usos}` : ' / ∞'}
                  </span>
                </td>

                {/* Estado */}
                <td className="py-3 pr-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-body-xs font-semibold ${
                    effectiveActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : isExpired
                        ? 'bg-amber-50 text-amber-700'
                        : isMaxed
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-volcanic-100 text-volcanic-500'
                  }`}>
                    {effectiveActive ? 'Activo' : isExpired ? 'Vencido' : isMaxed ? 'Agotado' : 'Inactivo'}
                  </span>
                </td>

                {/* Vencimiento */}
                <td className="py-3 pr-4 text-volcanic-500 text-body-xs">
                  {coupon.fecha_fin
                    ? new Date(coupon.fecha_fin).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Sin vencimiento'}
                </td>

                {/* Acciones */}
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/cupones/${coupon.id}`}
                      className="p-2 rounded-lg hover:bg-sand-100 text-volcanic-500 hover:text-volcanic-700 transition-colors"
                      title="Editar"
                    >
                      <EditIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deleting === coupon.id}
                      className="p-2 rounded-lg hover:bg-red-50 text-volcanic-500 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
