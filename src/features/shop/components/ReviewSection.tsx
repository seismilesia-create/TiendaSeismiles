'use client'

import { useState, useTransition } from 'react'
import { submitReview, deleteReview } from '@/actions/reviews'
import type { ReviewFromDB, ReviewSummary } from '@/features/shop/services/product-lines'

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
        <span className="text-[10px] text-volcanic-400">{labels[0]}</span>
        <span className="text-[10px] text-volcanic-400">{labels[2]}</span>
        <span className="text-[10px] text-volcanic-400">{labels[4]}</span>
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
        <span className="text-body-xs text-volcanic-400">{average.toFixed(1)}</span>
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
      <span className="w-6 text-volcanic-400 text-right">{count}</span>
    </div>
  )
}

// ── Review Card ──

function ReviewCard({ review, isOwn, slug }: { review: ReviewFromDB; isOwn: boolean; slug: string }) {
  const [isPending, startTransition] = useTransition()
  const displayName = review.profiles?.full_name || review.profiles?.email?.split('@')[0] || 'Usuario'
  const date = new Date(review.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleDelete() {
    if (!confirm('Seguro que queres eliminar tu resena?')) return
    const fd = new FormData()
    fd.set('review_id', review.id)
    fd.set('slug', slug)
    startTransition(() => { deleteReview(fd) })
  }

  return (
    <div className={`py-6 ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StarRating rating={review.puntuacion} size="sm" />
            <span className="text-body-sm font-semibold text-volcanic-900">{displayName}</span>
          </div>
          <p className="text-body-xs text-volcanic-400">{date}</p>
        </div>
        {isOwn && (
          <button onClick={handleDelete} disabled={isPending} className="text-body-xs text-volcanic-400 hover:text-red-500 transition-colors">
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
          Tu comentario <span className="text-volcanic-400 normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Conta tu experiencia con este producto..."
          className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-body-sm text-volcanic-900 placeholder:text-volcanic-400 focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-colors resize-none"
        />
        <p className="text-body-xs text-volcanic-400 mt-1 text-right">{comentario.length}/1000</p>
      </div>

      {error && <p className="text-body-sm text-red-500">{error}</p>}
      {success && (
        <p className="text-body-sm text-green-600">
          {existingReview ? 'Resena actualizada.' : 'Gracias por tu resena!'}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
      >
        {isPending ? 'Enviando...' : existingReview ? 'Actualizar resena' : 'Enviar resena'}
      </button>
    </form>
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
  const existingReview = currentUserId ? reviews.find((r) => r.user_id === currentUserId) : undefined

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
                <span className="text-body-sm text-volcanic-400">de 5</span>
              </div>
              <StarRating rating={summary.average} />
              <p className="text-body-xs text-volcanic-400 mt-2">
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
              <p className="text-body-xs text-volcanic-400">Se el primero en opinar!</p>
            </div>
          )}

          {/* Write review CTA */}
          {!currentUserId ? (
            <p className="text-body-sm text-volcanic-500 text-center py-3">
              <a href="/login" className="text-terra-500 hover:underline font-semibold">Inicia sesion</a> para dejar una resena.
            </p>
          ) : canReview ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full py-3 px-4 border-2 border-volcanic-900 hover:bg-volcanic-900 hover:text-white text-volcanic-900 text-body-sm font-semibold rounded-xl transition-all duration-300"
            >
              {existingReview ? 'Editar tu reseña' : 'Escribir una resena'}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 text-center">
              <p className="text-body-sm text-volcanic-500">
                Solo compradores verificados pueden dejar resenas.
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

          {reviews.length > 0 ? (
            <div className="divide-y divide-sand-200">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} isOwn={review.user_id === currentUserId} slug={slug} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 text-volcanic-400 text-body-sm">
              Todavia no hay resenas para este producto.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
