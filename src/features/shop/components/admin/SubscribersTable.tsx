'use client'

import type { SubscriberRow } from '@/features/shop/services/newsletter'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  subscribers: SubscriberRow[]
}

export function SubscribersTable({ subscribers }: Props) {
  if (subscribers.length === 0) {
    return (
      <p className="text-body-sm text-volcanic-400 text-center py-8">
        No hay suscriptores todavia.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-sand-200/60">
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Email
            </th>
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Cupon
            </th>
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Estado
            </th>
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id} className="border-b border-sand-100 last:border-0">
              <td className="py-3 pr-4">
                <span className="text-body-sm text-volcanic-900">{s.email}</span>
              </td>
              <td className="py-3 pr-4">
                {s.coupon_code ? (
                  <span className="font-mono text-body-xs text-volcanic-500 tracking-wider">
                    {s.coupon_code}
                  </span>
                ) : (
                  <span className="text-body-xs text-volcanic-300">—</span>
                )}
              </td>
              <td className="py-3 pr-4">
                {s.is_active ? (
                  <span className="inline-block px-2.5 py-1 text-body-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                    Activo
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 text-body-xs font-semibold rounded-full bg-volcanic-100 text-volcanic-500">
                    Desuscrito
                  </span>
                )}
              </td>
              <td className="py-3">
                <span className="text-body-xs text-volcanic-400">
                  {formatDate(s.subscribed_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
