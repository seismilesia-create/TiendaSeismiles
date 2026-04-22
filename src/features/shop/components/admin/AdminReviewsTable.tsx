'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { setReviewHidden } from '@/actions/reviews'
import type { AdminReviewRow } from '@/features/shop/services/product-lines'

// ── Star icon ──

function StarIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-terra-500">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={value >= s} className="w-3.5 h-3.5" />
      ))}
    </div>
  )
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

type Filter = 'todas' | 'visibles' | 'ocultas' | '1' | '2' | '3' | '4' | '5'

export function AdminReviewsTable({ reviews }: { reviews: AdminReviewRow[] }) {
  const [filter, setFilter] = useState<Filter>('todas')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => ({
    todas: reviews.length,
    visibles: reviews.filter((r) => !r.oculta).length,
    ocultas: reviews.filter((r) => r.oculta).length,
    1: reviews.filter((r) => r.puntuacion === 1).length,
    2: reviews.filter((r) => r.puntuacion === 2).length,
    3: reviews.filter((r) => r.puntuacion === 3).length,
    4: reviews.filter((r) => r.puntuacion === 4).length,
    5: reviews.filter((r) => r.puntuacion === 5).length,
  }), [reviews])

  const filtered = useMemo(() => {
    let list = reviews
    if (filter === 'visibles') list = list.filter((r) => !r.oculta)
    else if (filter === 'ocultas') list = list.filter((r) => r.oculta)
    else if (filter !== 'todas') list = list.filter((r) => r.puntuacion === Number(filter))

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter((r) =>
        r.productos.nombre.toLowerCase().includes(q) ||
        (r.profiles?.full_name ?? '').toLowerCase().includes(q) ||
        (r.profiles?.email ?? '').toLowerCase().includes(q) ||
        r.comentario.toLowerCase().includes(q)
      )
    }
    return list
  }, [reviews, filter, query])

  return (
    <div className="space-y-4">
      {/* Filtros + busqueda */}
      <div className="bg-white rounded-2xl border border-sand-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(['todas', 'visibles', 'ocultas'] as const).map((f) => {
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
                {f === 'todas' ? 'Todas' : f === 'visibles' ? 'Visibles' : 'Ocultas'}
                <span className="ml-1.5 opacity-60">({counts[f]})</span>
              </button>
            )
          })}
          <span className="w-px bg-sand-200 mx-1" />
          {([5, 4, 3, 2, 1] as const).map((n) => {
            const key = String(n) as Filter
            const active = filter === key
            return (
              <button
                key={n}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-all border ${
                  active
                    ? 'bg-volcanic-900 text-white border-volcanic-900'
                    : 'bg-white text-volcanic-700 border-sand-200 hover:border-volcanic-300'
                }`}
              >
                {n}
                <StarIcon filled className="w-3 h-3 text-terra-500" />
                <span className="opacity-60">({counts[n]})</span>
              </button>
            )
          })}
        </div>

        <input
          type="search"
          placeholder="Buscar por producto, usuario o comentario..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-body-sm text-volcanic-900 placeholder:text-volcanic-400 focus:outline-none focus:ring-2 focus:ring-terra-500/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200 p-12 text-center">
          <p className="text-body-sm text-volcanic-500">
            No hay reseñas que coincidan con los filtros.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewRow({ review }: { review: AdminReviewRow }) {
  const [hidden, setHidden] = useState(review.oculta)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const author = review.profiles?.full_name
    ?? review.profiles?.email?.split('@')[0]
    ?? 'Usuario'

  function toggle() {
    setError(null)
    const next = !hidden
    startTransition(async () => {
      const result = await setReviewHidden(review.id, next)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setHidden(next)
      }
    })
  }

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${
      hidden ? 'border-volcanic-300 bg-sand-50/60' : 'border-sand-200'
    }`}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="min-w-0">
          <Link
            href={`/catalogo/${review.productos.slug}#reviews`}
            target="_blank"
            className="text-body-sm font-semibold text-volcanic-900 hover:text-terra-500 transition-colors"
          >
            {review.productos.nombre}
          </Link>
          <p className="text-body-xs text-volcanic-500 mt-0.5">
            {author} · {review.profiles?.email ?? 's/ email'} · {formatDate(review.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Stars value={review.puntuacion} />
          <span className="text-body-xs font-semibold text-volcanic-700">
            {review.puntuacion}/5
          </span>
          {hidden && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-volcanic-900 text-white text-[10px] font-semibold uppercase tracking-wide">
              Oculta
            </span>
          )}
        </div>
      </div>

      {/* Detalles */}
      {(review.comodidad || review.calidad || review.ajuste || review.longitud) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-body-xs text-volcanic-500">
          {review.comodidad != null && <span>Comodidad: <strong className="text-volcanic-700">{review.comodidad}/5</strong></span>}
          {review.calidad != null && <span>Calidad: <strong className="text-volcanic-700">{review.calidad}/5</strong></span>}
          {review.ajuste != null && <span>Ajuste: <strong className="text-volcanic-700">{review.ajuste}/5</strong></span>}
          {review.longitud != null && <span>Longitud: <strong className="text-volcanic-700">{review.longitud}/5</strong></span>}
        </div>
      )}

      {review.comentario ? (
        <p className="text-body-sm text-volcanic-900 whitespace-pre-wrap bg-sand-50 rounded-lg p-3 border border-sand-100">
          {review.comentario}
        </p>
      ) : (
        <p className="text-body-xs text-volcanic-400 italic">Sin comentario.</p>
      )}

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={toggle}
          disabled={isPending}
          className={`px-4 py-2 text-body-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            hidden
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-volcanic-900 hover:bg-volcanic-800 text-white'
          }`}
        >
          {isPending ? 'Guardando...' : hidden ? 'Mostrar reseña' : 'Ocultar reseña'}
        </button>
        {error && (
          <span className="text-body-xs text-red-700 font-semibold">{error}</span>
        )}
      </div>
    </div>
  )
}
