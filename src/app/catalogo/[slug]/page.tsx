import { notFound } from 'next/navigation'
import { getProductBySlug, getMostViewedProducts, getProductReviews } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProductDetail } from './ProductDetail'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  // Fetch most viewed products, reviews, and current user in parallel
  const [mostViewed, reviewData, supabase] = await Promise.all([
    getMostViewedProducts(product.id, 4),
    getProductReviews(product.id),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  // Check if product is in user's favorites
  let isFavorited = false
  if (user) {
    const { data: fav } = await supabase
      .from('favoritos')
      .select('id')
      .eq('user_id', user.id)
      .eq('producto_id', product.id)
      .maybeSingle()
    isFavorited = !!fav
  }

  // Determine if user can leave a review (admin or verified purchaser)
  let canReview = false
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      canReview = true
    } else {
      const { data: compra } = await service
        .from('compras')
        .select('id')
        .eq('user_id', user.id)
        .eq('producto_id', product.id)
        .maybeSingle()
      canReview = !!compra
    }
  }

  return (
    <ProductDetail
      product={product}
      mostViewedProducts={mostViewed}
      reviews={reviewData.reviews}
      reviewSummary={reviewData.summary}
      currentUserId={user?.id ?? null}
      canReview={canReview}
      isFavorited={isFavorited}
    />
  )
}
