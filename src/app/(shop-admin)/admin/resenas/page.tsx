import type { Metadata } from 'next'
import { getAdminReviews } from '@/features/shop/services/product-lines'
import { AdminReviewsTable } from '@/features/shop/components/admin/AdminReviewsTable'

export const metadata: Metadata = {
  title: 'Reseñas - Admin',
}

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews(500)
  const hiddenCount = reviews.filter((r) => r.oculta).length

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-display-xs text-volcanic-900 mb-2">
          Reseñas
        </h1>
        <p className="text-body-sm text-volcanic-500">
          Moderación de reseñas publicadas por compradores verificados.
          Una reseña oculta deja de aparecer en la página del producto pero
          se conserva en la base por trazabilidad.
          {reviews.length > 0 && (
            <>
              {' '}Hay <strong>{reviews.length}</strong> en total
              {hiddenCount > 0 && (
                <> · <strong className="text-volcanic-700">{hiddenCount} oculta{hiddenCount === 1 ? '' : 's'}</strong></>
              )}
              .
            </>
          )}
        </p>
      </div>

      <AdminReviewsTable reviews={reviews} />
    </>
  )
}
