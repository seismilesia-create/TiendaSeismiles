'use client'

import { useState, useTransition } from 'react'
import { updateStockAction } from '@/actions/inventory'
import type { CriticalAlert } from '@/features/shop/services/inventory'

interface Props {
  alerts: CriticalAlert[]
}

const severityStyles = {
  critical: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
  },
  warning: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  info: {
    dot: 'bg-volcanic-400',
    text: 'text-volcanic-600',
    bg: 'bg-sand-50',
  },
}

interface AlertGroup {
  productoNombre: string
  colorNombre: string
  colorHex: string
  worstSeverity: CriticalAlert['severity']
  alerts: CriticalAlert[]
}

function groupAlerts(alerts: CriticalAlert[]): AlertGroup[] {
  const groups = new Map<string, AlertGroup>()

  for (const alert of alerts) {
    const key = `${alert.productoNombre}::${alert.colorNombre}`
    const existing = groups.get(key)
    if (existing) {
      existing.alerts.push(alert)
      const order = { critical: 0, warning: 1, info: 2 }
      if (order[alert.severity] < order[existing.worstSeverity]) {
        existing.worstSeverity = alert.severity
      }
    } else {
      groups.set(key, {
        productoNombre: alert.productoNombre,
        colorNombre: alert.colorNombre,
        colorHex: alert.colorHex,
        worstSeverity: alert.severity,
        alerts: [alert],
      })
    }
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 }
  return Array.from(groups.values()).sort(
    (a, b) => severityOrder[a.worstSeverity] - severityOrder[b.worstSeverity]
  )
}

export function InventoryAlertsBanner({ alerts: initialAlerts }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (alerts.length === 0) return null

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length
  const infoCount = alerts.filter((a) => a.severity === 'info').length

  const hasCritical = criticalCount > 0
  const headerBg = hasCritical ? 'bg-red-50 border-red-200/60' : 'bg-amber-50 border-amber-200/60'
  const headerText = hasCritical ? 'text-red-800' : 'text-amber-800'

  const groups = groupAlerts(alerts)

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function startEdit(alert: CriticalAlert) {
    setEditingId(alert.varianteId)
    setEditValue(String(alert.stock))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  function saveEdit(varianteId: string) {
    const newStock = parseInt(editValue, 10)
    if (isNaN(newStock) || newStock < 0) {
      cancelEdit()
      return
    }

    const current = alerts.find((a) => a.varianteId === varianteId)
    if (current && current.stock === newStock) {
      cancelEdit()
      return
    }

    setSavingId(varianteId)
    setEditingId(null)

    // Optimistic: update stock and recalculate severity
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.varianteId !== varianteId) return a
        if (newStock > 3) {
          // No longer an alert — remove it
          return { ...a, stock: newStock }
        }
        const isLow = newStock > 0 && newStock <= 3
        return {
          ...a,
          stock: newStock,
          severity: isLow ? 'warning' as const : a.severity,
          type: isLow ? 'stock_bajo' as const : a.type,
          message: isLow ? `Solo ${newStock} unidad${newStock > 1 ? 'es' : ''}` : a.message,
        }
      }).filter((a) => a.stock <= 3) // Remove resolved alerts
    )

    startTransition(async () => {
      const result = await updateStockAction(varianteId, newStock)
      if (result.error) {
        // Revert on error
        setAlerts((prev) =>
          prev.map((a) =>
            a.varianteId === varianteId ? { ...a, stock: current?.stock ?? 0 } : a
          )
        )
      }
      setSavingId(null)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent, varianteId: string) {
    if (e.key === 'Enter') saveEdit(varianteId)
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div className={`rounded-2xl border ${headerBg} overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center gap-3 ${headerText}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
        <p className="text-body-sm font-semibold">
          {criticalCount > 0 && <span>{criticalCount} critica{criticalCount > 1 ? 's' : ''}</span>}
          {criticalCount > 0 && warningCount > 0 && <span className="mx-1.5 opacity-40">&middot;</span>}
          {warningCount > 0 && <span>{warningCount} advertencia{warningCount > 1 ? 's' : ''}</span>}
          {(criticalCount > 0 || warningCount > 0) && infoCount > 0 && <span className="mx-1.5 opacity-40">&middot;</span>}
          {infoCount > 0 && <span>{infoCount} sin stock</span>}
        </p>
      </div>

      {/* Grouped alert list */}
      <div className="bg-white px-5 py-3 divide-y divide-sand-100">
        {groups.map((group) => {
          const key = `${group.productoNombre}::${group.colorNombre}`
          const isExpanded = expanded.has(key)
          const style = severityStyles[group.worstSeverity]

          return (
            <div key={key} className="py-2 first:pt-0 last:pb-0">
              {/* Product row (clickable) */}
              <button
                onClick={() => toggleGroup(key)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <span
                  className="w-3 h-3 rounded-full border border-sand-200 shrink-0"
                  style={{ backgroundColor: group.colorHex }}
                  title={group.colorNombre}
                />
                <span className="text-body-sm font-medium text-volcanic-900 truncate flex-1">
                  {group.productoNombre}
                  <span className="text-volcanic-500 font-normal"> &middot; {group.colorNombre}</span>
                </span>
                <span className={`text-body-xs font-medium px-2 py-0.5 rounded-lg ${style.bg} ${style.text} shrink-0`}>
                  {group.alerts.length} talle{group.alerts.length > 1 ? 's' : ''}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-volcanic-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Expanded: individual size alerts with stock edit */}
              {isExpanded && (
                <div className="mt-2 ml-5 pl-3 border-l-2 border-sand-100 space-y-1.5">
                  {group.alerts.map((alert) => {
                    const alertStyle = severityStyles[alert.severity]
                    const isSaving = savingId === alert.varianteId
                    const isEditing = editingId === alert.varianteId

                    return (
                      <div key={alert.varianteId} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alertStyle.dot}`} />
                        <span className="text-body-xs text-volcanic-700 font-medium w-10">
                          {alert.talle}
                        </span>
                        <span className={`text-body-xs ${alertStyle.text} flex-1`}>
                          {alert.message}
                        </span>
                        {/* Inline stock edit */}
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, alert.varianteId)}
                            onBlur={() => saveEdit(alert.varianteId)}
                            autoFocus
                            className="w-16 px-2 py-0.5 rounded-lg border border-terra-500 text-body-xs text-volcanic-900 text-center focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => startEdit(alert)}
                            disabled={isSaving}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-body-xs font-medium transition-colors shrink-0 ${
                              isSaving
                                ? 'text-volcanic-400 cursor-wait'
                                : 'text-terra-600 hover:bg-terra-50 cursor-pointer'
                            }`}
                          >
                            {isSaving ? (
                              '...'
                            ) : (
                              <>
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                  <path d="M8 3.5v9M3.5 8h9" />
                                </svg>
                                Stock
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
