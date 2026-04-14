'use client'

import { useState, useTransition } from 'react'
import { updateArrepentimientoEstado } from '@/actions/arrepentimientos'
import type { ArrepentimientoRow, ArrepentimientoEstado } from '@/features/shop/services/arrepentimientos'

const ESTADOS: { value: ArrepentimientoEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'reembolsado', label: 'Reembolsado' },
  { value: 'rechazado', label: 'Rechazado' },
]

const ESTADO_STYLES: Record<ArrepentimientoEstado, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
  reembolsado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rechazado: 'bg-red-100 text-red-800 border-red-200',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Tiempo restante para cumplir el plazo legal de 24hs desde la solicitud.
function deadlineBadge(createdAtIso: string, estado: ArrepentimientoEstado) {
  if (estado !== 'pendiente') return null
  const deadline = new Date(createdAtIso).getTime() + 24 * 60 * 60 * 1000
  const diff = deadline - Date.now()
  if (diff <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
        Plazo vencido
      </span>
    )
  }
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      {hours}h {mins}m restantes
    </span>
  )
}

export function ArrepentimientosTable({ items }: { items: ArrepentimientoRow[] }) {
  const [filter, setFilter] = useState<'todos' | ArrepentimientoEstado>('todos')

  const filtered = filter === 'todos' ? items : items.filter((i) => i.estado === filter)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(['todos', 'pendiente', 'en_proceso', 'reembolsado', 'rechazado'] as const).map((f) => {
          const count = f === 'todos' ? items.length : items.filter((i) => i.estado === f).length
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-all border ${
                active
                  ? 'bg-volcanic-900 text-white border-volcanic-900'
                  : 'bg-white text-volcanic-700 border-sand-200 hover:border-volcanic-300'
              }`}
            >
              {f === 'todos' ? 'Todos' : ESTADOS.find((e) => e.value === f)?.label}
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200 p-12 text-center">
          <p className="text-body-sm text-volcanic-500">
            No hay solicitudes en esta categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ item }: { item: ArrepentimientoRow }) {
  const [expanded, setExpanded] = useState(false)
  const [estado, setEstado] = useState(item.estado)
  const [nota, setNota] = useState(item.nota_admin ?? '')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  function save() {
    setMessage(null)
    startTransition(async () => {
      const result = await updateArrepentimientoEstado(item.id, estado, nota)
      if ('error' in result) {
        setMessage({ kind: 'error', text: result.error })
      } else {
        setMessage({ kind: 'ok', text: 'Cambios guardados.' })
      }
    })
  }

  const hasChanges = estado !== item.estado || nota !== (item.nota_admin ?? '')

  return (
    <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-sand-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="font-mono text-body-sm font-bold text-volcanic-900">
              {item.codigo}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${ESTADO_STYLES[item.estado]}`}
            >
              {ESTADOS.find((e) => e.value === item.estado)?.label}
            </span>
            {deadlineBadge(item.created_at, item.estado)}
            {item.compra_id ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                Pedido encontrado
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold uppercase">
                Pedido sin match
              </span>
            )}
          </div>
          <p className="text-body-sm text-volcanic-900 truncate">
            <strong>{item.nombre}</strong> · {item.email} · Pedido{' '}
            <span className="font-mono">{item.numero_pedido}</span>
          </p>
          <p className="text-body-xs text-volcanic-500 mt-0.5">
            Recibida {formatDate(item.created_at)}
          </p>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-volcanic-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-sand-200 p-5 space-y-5 bg-sand-50/40">
          {/* Datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
            <Info label="Nombre" value={item.nombre} />
            <Info label="DNI" value={item.dni} />
            <Info label="Email" value={item.email} />
            <Info label="Telefono" value={item.telefono || 'No proporcionado'} />
            <Info label="N° de pedido" value={item.numero_pedido} mono />
            <Info label="Fecha de compra" value={item.fecha_compra || 'No informada'} />
            <Info label="Medio de pago" value={item.metodo_pago || 'No informado'} />
            <Info
              label="Procesada"
              value={item.processed_at ? formatDate(item.processed_at) : '—'}
            />
          </div>

          {item.motivo && (
            <div>
              <p className="text-body-xs font-semibold uppercase tracking-wide text-volcanic-500 mb-1">
                Motivo declarado
              </p>
              <p className="text-body-sm text-volcanic-900 italic whitespace-pre-wrap bg-white rounded-lg p-3 border border-sand-200">
                &quot;{item.motivo}&quot;
              </p>
            </div>
          )}

          {/* Admin controls */}
          <div className="pt-4 border-t border-sand-200 space-y-3">
            <div>
              <label className="block text-body-xs font-semibold text-volcanic-900 mb-1.5">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as ArrepentimientoEstado)}
                className="w-full sm:w-auto px-3 py-2 bg-white border border-sand-200 rounded-lg text-body-sm text-volcanic-900 focus:outline-none focus:ring-2 focus:ring-terra-500/30"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-body-xs font-semibold text-volcanic-900 mb-1.5">
                Nota interna (no se envia al consumidor)
              </label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                maxLength={3000}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-body-sm text-volcanic-900 focus:outline-none focus:ring-2 focus:ring-terra-500/30 resize-none"
                placeholder="Ej: contactado el 13/04, coordinada retiro por correo argentino..."
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={save}
                disabled={!hasChanges || isPending}
                className="px-4 py-2 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-lg transition-all"
              >
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <a
                href={`mailto:${item.email}?subject=${encodeURIComponent(`Tu solicitud de arrepentimiento ${item.codigo}`)}`}
                className="px-4 py-2 bg-white border border-sand-200 hover:border-volcanic-300 text-volcanic-900 text-body-sm font-semibold rounded-lg transition-all"
              >
                Responder por email
              </a>
              {message && (
                <span
                  className={`text-body-xs font-semibold ${
                    message.kind === 'ok' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {message.text}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-body-xs font-semibold uppercase tracking-wide text-volcanic-500 mb-0.5">
        {label}
      </p>
      <p className={`text-body-sm text-volcanic-900 ${mono ? 'font-mono' : ''} break-words`}>
        {value}
      </p>
    </div>
  )
}
