'use client'

import { useState } from 'react'
import type { StockNotificationRow } from '@/features/shop/services/inventory'

interface Props {
  notifications: StockNotificationRow[]
}

interface GroupedRequest {
  key: string
  productoNombre: string
  talle: string
  colorNombre: string
  colorHex: string
  pending: StockNotificationRow[]
  notified: StockNotificationRow[]
}

function groupNotifications(notifications: StockNotificationRow[]): GroupedRequest[] {
  const groups = new Map<string, GroupedRequest>()

  for (const n of notifications) {
    const key = `${n.producto_nombre}::${n.talle}::${n.color_nombre}`
    const existing = groups.get(key)
    if (existing) {
      if (n.notificado) existing.notified.push(n)
      else existing.pending.push(n)
    } else {
      groups.set(key, {
        key,
        productoNombre: n.producto_nombre,
        talle: n.talle,
        colorNombre: n.color_nombre,
        colorHex: n.color_hex,
        pending: n.notificado ? [] : [n],
        notified: n.notificado ? [n] : [],
      })
    }
  }

  // Sort: most pending first, then by oldest request
  return Array.from(groups.values()).sort((a, b) => b.pending.length - a.pending.length)
}

function daysSince(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'hoy'
  return `hace ${days}d`
}

export function StockRequestsCard({ notifications }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const pendingTotal = notifications.filter((n) => !n.notificado).length

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 text-center">
        <h3 className="font-heading text-lg text-volcanic-900 mb-2">Solicitudes de restock</h3>
        <p className="text-body-sm text-volcanic-500">No hay solicitudes de reposicion.</p>
      </div>
    )
  }

  const groups = groupNotifications(notifications)

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-heading text-lg text-volcanic-900">Solicitudes de restock</h3>
        {pendingTotal > 0 && (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
            {pendingTotal} pendiente{pendingTotal !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {groups.map((group) => {
          const isExpanded = expanded.has(group.key)
          const total = group.pending.length + group.notified.length
          const allEmails = [...group.pending, ...group.notified].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )

          return (
            <div key={group.key}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-sand-50 transition-colors text-left"
              >
                <span
                  className="w-3 h-3 rounded-full border border-sand-200 shrink-0"
                  style={{ backgroundColor: group.colorHex }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-body-sm font-medium text-volcanic-900 truncate block">
                    {group.productoNombre}
                  </span>
                  <span className="text-body-xs text-volcanic-500">
                    Talle {group.talle} · {group.colorNombre}
                  </span>
                </div>
                {group.pending.length > 0 && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 shrink-0">
                    {group.pending.length}
                  </span>
                )}
                {group.notified.length > 0 && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 shrink-0">
                    {group.notified.length} notif.
                  </span>
                )}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-volcanic-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Expanded: email list */}
              {isExpanded && (
                <div className="ml-5 pl-3 border-l-2 border-sand-100 mt-1 mb-2 space-y-1.5">
                  {allEmails.map((n) => (
                    <div key={n.id} className="flex items-center gap-2 text-body-xs">
                      {n.notificado ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                      <span className="text-volcanic-700 truncate flex-1">{n.email}</span>
                      <span className="text-volcanic-400 shrink-0">{daysSince(n.created_at)}</span>
                      {n.notificado ? (
                        <span className="text-emerald-600 shrink-0">notificado</span>
                      ) : (
                        <span className="text-amber-600 shrink-0">pendiente</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
