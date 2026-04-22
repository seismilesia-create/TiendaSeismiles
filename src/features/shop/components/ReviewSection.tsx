'use client'

import { useMemo, useState, useTransition } from 'react'
import { submitReview, deleteReview } from '@/actions/reviews'
import { ConfirmDialog } from '@/features/shop/components/ConfirmDialog'
import type { ReviewFromDB, ReviewSummary } from '@/features/shop/services/product-lines'

// ── Filter / sort types ──

type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5
type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest' | 'longest'

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Más recientes',
  oldest: 'Más antiguas',
  highest: 'Mejor puntuadas',
  lowest: 'Peor puntuadas',
  longest: 'Más detalladas',
}

// ── Star Icons ──

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

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5 text-terra-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={rating >= star - 0.25} className={sizeClass} />
      ))}
    </div>
  )
}

// ── Interactive star picker ──

function StarPicker({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div>
      <p className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-2">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="text-terra-500 transition-transform hover:scale-110"
          >
            <StarIcon filled={star <= (hover || value)} className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Scale picker (for ajuste / longitud) ──

const AJUSTE_LABELS = ['Muy ajustado', 'Algo ajustado', 'Perfecto', 'Algo holgado', 'Muy holgado']
const LONGITUD_LABELS = ['Corto', 'Algo corto', 'Perfecto', 'Algo largo', 'Largo']

function ScalePicker({ value, onChange, label, labels }: {
  value: number
  onChange: (v: number) => void
  label: string
  labels: string[]
}) {
  return (
    <div>
      <p className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-3">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${value === v
                ? 'bg-volcanic-900 text-white'
                : 'bg-sand-100 text-volcanic-500 hover:bg-sand-200'
              }`}
          >
            {labels[v - 1]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Scale bar display (for summary) ──

function ScaleBar({ average, labels, label }: { average: number; labels: string[]; label: string }) {
  if (average === 0) return null
  // Position: average 1-5 maps to 0%-100%
  const pct = ((average - 1) / 4) * 100
  return (
    <div>
      <p className="text-body-xs font-semibold text-volcanic-700 mb-2">{label}</p>
      <div className="relative h-2 bg-sand-100 rounded-full mb-1.5">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-volcanic-900 border-2 border-white shadow-sm transition-all duration-500"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-volcanic-500">{labels[0]}</span>
        <span className="text-[10px] text-volcanic-500">{labels[2]}</span>
        <span className="text-[10px] text-volcanic-500">{labels[4]}</span>
      </div>
    </div>
  )
}

// ── Star bar display (for comodidad/calidad summary) ──

function StarBar({ average, label }: { average: number; label: string }) {
  if (average === 0) return null
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-xs font-semibold text-volcanic-700 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-0.5 text-terra-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} filled={average >= s - 0.25} className="w-3.5 h-3.5" />
          ))}
        </div>
        <span className="text-body-xs text-volcanic-500">{average.toFixed(1)}</span>
      </div>
    </div>
  )
}

// ── Distribution bar ──

function DistributionBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-body-xs">
      <span className="w-3 text-volcanic-500 text-right">{star}</span>
      <StarIcon filled className="w-3.5 h-3.5 text-terra-500 flex-shrink-0" />
      <div className="flex-1 h-2 bg-sand-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-terra-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-volcanic-500 text-right">{count}</span>
    </div>
  )
}

// ── Review Card ──

function ReviewCard({ review, isOwn, slug }: { review: ReviewFromDB; isOwn: boolean; slug: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const displayName = review.profiles?.full_name || review.profiles?.email?.split('@')[0] || 'Usuario'
  const date = new Date(review.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleDelete() {
    const fd = new FormData()
    fd.set('review_id', review.id)
    fd.set('slug', slug)
    startTransition(async () => {
      await deleteReview(fd)
      setConfirmOpen(false)
    })
  }

  return (
    <div className={`py-6 ${isPending ? 'opacity-50' : ''}`}>
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar tu reseña"
        description="Tu reseña se eliminará definitivamente. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        cancelLabel="Volver"
        variant="danger"
        isPending={isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StarRating rating={review.puntuacion} size="sm" />
            <span className="text-body-sm font-semibold text-volcanic-900">{displayName}</span>
          </div>
          <p className="text-body-xs text-volcanic-500">{date}</p>
        </div>
        {isOwn && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="text-body-xs text-volcanic-500 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Detail ratings inline */}
      {(review.comodidad || review.calidad || review.ajuste || review.longitud) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 mb-3">
          {review.comodidad && (
            <span className="text-body-xs text-volcanic-500">
              Comodidad: <span className="font-semibold text-volcanic-700">{review.comodidad}/5</span>
            </span>
          )}
          {review.calidad && (
            <span className="text-body-xs text-volcanic-500">
              Calidad: <span className="font-semibold text-volcanic-700">{review.calidad}/5</span>
            </span>
          )}
          {review.ajuste && (
            <span className="text-body-xs text-volcanic-500">
              Ajuste: <span className="font-semibold text-volcanic-700">{AJUSTE_LABELS[review.ajuste - 1]}</span>
            </span>
          )}
          {review.longitud && (
            <span className="text-body-xs text-volcanic-500">
              Longitud: <span className="font-semibold text-volcanic-700">{LONGITUD_LABELS[review.longitud - 1]}</span>
            </span>
          )}
        </div>
      )}

      {review.comentario && (
        <p className="text-body-sm text-volcanic-600 leading-relaxed mt-2">
          {review.comentario}
        </p>
      )}
    </div>
  )
}

// ── Review Form ──

function ReviewForm({ productoId, slug, existingReview }: {
  productoId: string
  slug: string
  existingReview?: ReviewFromDB
}) {
  const [puntuacion, setPuntuacion] = useState(existingReview?.puntuacion ?? 0)
  const [comodidad, setComodidad] = useState(existingReview?.comodidad ?? 0)
  const [calidad, setCalidad] = useState(existingReview?.calidad ?? 0)
  const [ajuste, setAjuste] = useState(existingReview?.ajuste ?? 0)
  const [longitud, setLongitud] = useState(existingReview?.longitud ?? 0)
  const [comentario, setComentario] = useState(existingReview?.comentario ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (puntuacion === 0) {
      setError('Selecciona una puntuacion general.')
      return
    }

    const fd = new FormData()
    fd.set('producto_id', productoId)
    fd.set('puntuacion', String(puntuacion))
    if (comodidad) fd.set('comodidad', String(comodidad))
    if (calidad) fd.set('calidad', String(calidad))
    if (ajuste) fd.set('ajuste', String(ajuste))
    if (longitud) fd.set('longitud', String(longitud))
    fd.set('comentario', comentario)
    fd.set('slug', slug)

    startTransition(async () => {
      const result = await submitReview(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        if (!existingReview) {
          setPuntuacion(0)
          setComodidad(0)
          setCalidad(0)
          setAjuste(0)
          setLongitud(0)
          setComentario('')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General rating — required */}
      <StarPicker value={puntuacion} onChange={setPuntuacion} label="Puntuacion general *" />

      {/* Comodidad + Calidad side by side */}
      <div className="grid grid-cols-2 gap-4">
        <StarPicker value={comodidad} onChange={setComodidad} label="Comodidad" />
        <StarPicker value={calidad} onChange={setCalidad} label="Calidad" />
      </div>

      {/* Ajuste scale */}
      <ScalePicker value={ajuste} onChange={setAjuste} label="Como valoras el ajuste?" labels={AJUSTE_LABELS} />

      {/* Longitud scale */}
      <ScalePicker value={longitud} onChange={setLongitud} label="Como valoras la longitud?" labels={LONGITUD_LABELS} />

      {/* Comment */}
      <div>
        <label htmlFor="comentario" className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-3 block">
          Tu comentario <span className="text-volcanic-500 normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Conta tu experiencia con este producto..."
          className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-body-sm text-volcanic-900 placeholder:text-volcanic-500 focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-colors resize-none"
        />
        <p className="text-body-xs text-volcanic-500 mt-1 text-right">{comentario.length}/1000</p>
      </div>

      {error && <p className="text-body-sm text-red-500">{error}</p>}
      {success && (
        <p className="text-body-sm text-green-600">
          {existingReview ? 'Reseña actualizada.' : 'Gracias por tu reseña!'}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
      >
        {isPending ? 'Enviando...' : existingReview ? 'Actualizar reseña' : 'Enviar reseña'}
      </button>
    </form>
  )
}

// ── Filter bar ──

interface FilterBarProps {
  total: number
  visibleCount: number
  distribution: Record<number, number>
  commentsCount: number
  ratingFilter: RatingFilter
  onRatingChange: (f: RatingFilter) => void
  onlyWithComment: boolean
  onToggleComments: () => void
  sortBy: SortOption
  onSortChange: (s: SortOption) => void
  hasActiveFilter: boolean
  onClear: () => void
}

function FilterBar({
  total, visibleCount, distribution, commentsCount,
  ratingFilter, onRatingChange,
  onlyWithComment, onToggleComments,
  sortBy, onSortChange,
  hasActiveFilter, onClear,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-3">
      {/* Rating chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onRatingChange('all')}
          className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-all border ${
            ratingFilter === 'all'
              ? 'bg-volcanic-900 text-white border-volcanic-900'
              : 'bg-white text-volcanic-700 border-sand-200 hover:border-volcanic-300'
          }`}
        >
          Todas <span className="opacity-60">({total})</span>
        </button>
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const count = distribution[n] ?? 0
          const active = ratingFilter === n
          const disabled = count === 0
          return (
            <button
              key={n}
              onClick={() => !disabled && onRatingChange(n)}
              disabled={disabled}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-all border ${
                active
                  ? 'bg-volcanic-900 text-white border-volcanic-900'
                  : disabled
                    ? 'bg-white text-volcanic-300 border-sand-200 cursor-not-allowed'
                    : 'bg-white text-volcanic-700 border-sand-200 hover:border-volcanic-300'
              }`}
            >
              {n}
              <StarIcon filled className={`w-3 h-3 ${active ? 'text-white' : disabled ? 'text-volcanic-300' : 'text-terra-500'}`} />
              <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Comment filter + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className={`inline-flex items-center gap-2 text-body-xs font-semibold cursor-pointer select-none ${
          commentsCount === 0 ? 'opacity-40 cursor-not-allowed' : 'text-volcanic-700'
        }`}>
          <input
            type="checkbox"
            checked={onlyWithComment}
            disabled={commentsCount === 0}
            onChange={onToggleComments}
            className="w-4 h-4 rounded border-sand-300 text-volcanic-900 focus:ring-terra-500/30 cursor-pointer disabled:cursor-not-allowed"
          />
          Solo con comentario ({commentsCount})
        </label>

        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              onClick={onClear}
              className="text-body-xs font-semibold text-volcanic-500 hover:text-terra-500 underline underline-offset-2 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
          <label className="inline-flex items-center gap-2 text-body-xs text-volcanic-500">
            Ordenar:
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="px-2.5 py-1.5 bg-white border border-sand-200 rounded-lg text-body-xs font-semibold text-volcanic-900 focus:outline-none focus:ring-2 focus:ring-terra-500/30"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Count hint when filtered */}
      {hasActiveFilter && visibleCount > 0 && (
        <p className="text-body-xs text-volcanic-500">
          Mostrando <strong>{visibleCount}</strong> de {total} reseñas.
        </p>
      )}
    </div>
  )
}

// ── Main Section ──

interface ReviewSectionProps {
  productoId: string
  slug: string
  reviews: ReviewFromDB[]
  summary: ReviewSummary
  currentUserId: string | null
  canReview: boolean
}

export function ReviewSection({ productoId, slug, reviews, summary, currentUserId, canReview }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  const [onlyWithComment, setOnlyWithComment] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const existingReview = currentUserId ? reviews.find((r) => r.user_id === currentUserId) : undefined

  const visibleReviews = useMemo(() => {
    let list = reviews
    if (ratingFilter !== 'all') list = list.filter((r) => r.puntuacion === ratingFilter)
    if (onlyWithComment) list = list.filter((r) => r.comentario && r.comentario.trim().length > 0)

    const sorted = [...list]
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        break
      case 'oldest':
        sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
        break
      case 'highest':
        sorted.sort((a, b) => b.puntuacion - a.puntuacion || +new Date(b.created_at) - +new Date(a.created_at))
        break
      case 'lowest':
        sorted.sort((a, b) => a.puntuacion - b.puntuacion || +new Date(b.created_at) - +new Date(a.created_at))
        break
      case 'longest':
        sorted.sort((a, b) => (b.comentario?.length ?? 0) - (a.comentario?.length ?? 0))
        break
    }
    return sorted
  }, [reviews, ratingFilter, onlyWithComment, sortBy])

  const hasActiveFilter = ratingFilter !== 'all' || onlyWithComment
  const commentsCount = useMemo(
    () => reviews.filter((r) => r.comentario && r.comentario.trim().length > 0).length,
    [reviews]
  )

  return (
    <section id="reviews" className="mt-16 lg:mt-24 scroll-mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-display-xs text-volcanic-900">
          Valoraciones
        </h2>
        {summary.total > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={summary.average} />
            <span className="text-body-sm text-volcanic-500">
              {summary.average.toFixed(1)} ({summary.total})
            </span>
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-12">
        {/* Left: Summary + Write CTA */}
        <div>
          {summary.total > 0 ? (
            <div className="mb-8">
              {/* Overall score */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-heading text-display-md text-volcanic-900">
                  {summary.average.toFixed(1)}
                </span>
                <span className="text-body-sm text-volcanic-500">de 5</span>
              </div>
              <StarRating rating={summary.average} />
              <p className="text-body-xs text-volcanic-500 mt-2">
                {summary.total} {summary.total === 1 ? 'valoracion' : 'valoraciones'}
              </p>

              {/* Star distribution */}
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <DistributionBar key={star} star={star} count={summary.distribution[star] ?? 0} total={summary.total} />
                ))}
              </div>

              {/* Detail averages */}
              <div className="mt-8 pt-6 border-t border-sand-200 space-y-3">
                <StarBar average={summary.avgComodidad} label="Comodidad" />
                <StarBar average={summary.avgCalidad} label="Calidad" />
              </div>

              {/* Scale averages */}
              <div className="mt-6 space-y-5">
                <ScaleBar average={summary.avgAjuste} labels={AJUSTE_LABELS} label="Ajuste" />
                <ScaleBar average={summary.avgLongitud} labels={LONGITUD_LABELS} label="Longitud" />
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 rounded-2xl bg-sand-50 text-center">
              <p className="text-body-sm text-volcanic-500 mb-1">Sin valoraciones aun</p>
              <p className="text-body-xs text-volcanic-500">Se el primero en opinar!</p>
            </div>
          )}

          {/* Write review CTA */}
          {!currentUserId ? (
            <p className="text-body-sm text-volcanic-500 text-center py-3">
              <a href="/login" className="text-terra-500 hover:underline font-semibold">Inicia sesion</a> para dejar una reseña.
            </p>
          ) : canReview ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full py-3 px-4 border-2 border-volcanic-900 hover:bg-volcanic-900 hover:text-white text-volcanic-900 text-body-sm font-semibold rounded-xl transition-all duration-300"
            >
              {existingReview ? 'Editar tu reseña' : 'Escribir una reseña'}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 text-center">
              <p className="text-body-sm text-volcanic-500">
                Solo compradores verificados pueden dejar reseñas.
              </p>
            </div>
          )}
        </div>

        {/* Right: Review form (when open) + Review list */}
        <div>
          {/* Review form — opens at the top of the right column */}
          {showForm && canReview && (
            <div className="mb-8 p-6 rounded-2xl bg-sand-50 border border-sand-200">
              <ReviewForm productoId={productoId} slug={slug} existingReview={existingReview} />
            </div>
          )}

          {reviews.length > 0 && (
            <FilterBar
              total={reviews.length}
              visibleCount={visibleReviews.length}
              distribution={summary.distribution}
              commentsCount={commentsCount}
              ratingFilter={ratingFilter}
              onRatingChange={setRatingFilter}
              onlyWithComment={onlyWithComment}
              onToggleComments={() => setOnlyWithComment((v) => !v)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasActiveFilter={hasActiveFilter}
              onClear={() => { setRatingFilter('all'); setOnlyWithComment(false) }}
            />
          )}

          {reviews.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-volcanic-500 text-body-sm">
              Todavia no hay reseñas para este producto.
            </div>
          ) : visibleReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-volcanic-500 text-body-sm gap-3">
              <p>Ninguna reseña coincide con el filtro seleccionado.</p>
              <button
                onClick={() => { setRatingFilter('all'); setOnlyWithComment(false) }}
                className="text-body-sm text-terra-500 hover:text-terra-600 font-semibold underline underline-offset-2"
              >
                Mostrar todas las reseñas
              </button>
            </div>
          ) : (
            <div className="divide-y divide-sand-200">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} isOwn={review.user_id === currentUserId} slug={slug} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
