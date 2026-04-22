import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getProductBySlug, getMostViewedProducts, getProductReviews } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProductDetail } from './ProductDetail'
import { productJsonLd, productBreadcrumbJsonLd, LINEA_LABELS } from './structuredData'

// Dedupe the product fetch between generateMetadata and the page render.
const loadProduct = cache(getProductBySlug)

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await loadProduct(slug)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'

  if (!product) {
    return { title: 'Producto no encontrado' }
  }

  const primaryImage = product.colores[0]?.imagenes?.[0]?.url
    ?? product.colores[0]?.imagen_url
    ?? null

  const lineLabel = LINEA_LABELS[product.linea] ?? product.linea
  const rawDescription = product.descripcion?.trim()
    || `${product.nombre} — ${lineLabel} · Indumentaria premium SEISMILES, Catamarca.`
  const description = rawDescription.length > 160
    ? rawDescription.slice(0, 157).trimEnd() + '...'
    : rawDescription

  const canonicalUrl = `${siteUrl}/catalogo/${product.slug}`

  return {
    title: `${product.nombre} — ${lineLabel}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: product.nombre,
      description,
      siteName: 'SEISMILES',
      locale: 'es_AR',
      ...(primaryImage && {
        images: [{ url: primaryImage, alt: product.nombre }],
      }),
    },
    twitter: {
      card: primaryImage ? 'summary_large_image' : 'summary',
      title: product.nombre,
      description,
      ...(primaryImage && { images: [primaryImage] }),
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await loadProduct(slug)

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'
  const productLd = productJsonLd({ product, reviews: reviewData.reviews, summary: reviewData.summary, siteUrl })
  const breadcrumbLd = productBreadcrumbJsonLd({ product, siteUrl })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
      />
      <ProductDetail
        product={product}
        mostViewedProducts={mostViewed}
        reviews={reviewData.reviews}
        reviewSummary={reviewData.summary}
        currentUserId={user?.id ?? null}
        canReview={canReview}
        isFavorited={isFavorited}
      />
    </>
  )
}
