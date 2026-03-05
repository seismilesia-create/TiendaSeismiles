import { notFound } from 'next/navigation'
import { getProductBySlug, getCatalogProducts, getProductReviews } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProductDetail } from './ProductDetail'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  // Fetch related products, reviews, and current user in parallel
  const [allProducts, reviewData, supabase] = await Promise.all([
    getCatalogProducts(),
    getProductReviews(product.id),
    createClient(),
  ])

  const related = allProducts
    .filter((p) => p.linea === product.linea && p.id !== product.id)
    .slice(0, 4)

  const { data: { user } } = await supabase.auth.getUser()

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
      relatedProducts={related}
      reviews={reviewData.reviews}
      reviewSummary={reviewData.summary}
      currentUserId={user?.id ?? null}
      canReview={canReview}
    />
  )
}
