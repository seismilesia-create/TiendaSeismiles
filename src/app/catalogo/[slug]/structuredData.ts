import type { ProductDetailFromDB, ReviewFromDB, ReviewSummary } from '@/features/shop/services/product-lines'

export const LINEA_LABELS: Record<string, string> = {
  arista: 'Línea Arista',
  pissis: 'Línea Pissis',
  origen: 'Línea Origen',
  terreno: 'Línea Terreno',
  veta: 'Línea Veta',
  'tres-cruces': 'Línea Tres Cruces',
  nacimiento: 'Línea Nacimiento',
  veladero: 'Línea Veladero',
  'san-francisco': 'Línea San Francisco',
}

/**
 * Escape `<` in JSON so the payload cannot close the surrounding <script> tag.
 * Required whenever embedding JSON via dangerouslySetInnerHTML.
 */
function toScriptSafeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function absoluteImageUrl(url: string, siteUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? `${siteUrl}${url}` : `${siteUrl}/${url}`
}

function collectImages(product: ProductDetailFromDB, siteUrl: string, max = 6): string[] {
  const images: string[] = []
  for (const color of product.colores) {
    const colorImages = [...(color.imagenes ?? [])].sort((a, b) => a.orden - b.orden)
    for (const img of colorImages) {
      if (images.length >= max) break
      images.push(absoluteImageUrl(img.url, siteUrl))
    }
    if (color.imagen_url && (color.imagenes?.length ?? 0) === 0 && images.length < max) {
      images.push(absoluteImageUrl(color.imagen_url, siteUrl))
    }
    if (images.length >= max) break
  }
  return images
}

// ── Product + offers + aggregateRating + review ──

interface ProductJsonLdInput {
  product: ProductDetailFromDB
  reviews: ReviewFromDB[]
  summary: ReviewSummary
  siteUrl: string
}

export function productJsonLd({ product, reviews, summary, siteUrl }: ProductJsonLdInput): string {
  const canonicalUrl = `${siteUrl}/catalogo/${product.slug}`
  const images = collectImages(product, siteUrl)
  const totalStock = product.variantes.reduce((sum, v) => sum + (v.stock ?? 0), 0)
  const availability = totalStock > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'

  // Offers validity — give Google a year out. Google requires priceValidUntil for
  // Merchant listings; without it, snippets may be suppressed.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const lineLabel = LINEA_LABELS[product.linea] ?? product.linea

  // Include up to 5 reviews with comments — enough for Google's review snippet
  // without bloating the HTML payload.
  const reviewItems = reviews
    .filter((r) => r.comentario && r.comentario.trim().length > 0)
    .slice(0, 5)
    .map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.puntuacion,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        '@type': 'Person',
        name: r.profiles?.full_name
          ?? r.profiles?.email?.split('@')[0]
          ?? 'Cliente verificado',
      },
      datePublished: r.created_at,
      reviewBody: r.comentario,
    }))

  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': canonicalUrl,
    name: product.nombre,
    description: product.descripcion?.trim() || `${product.nombre} — ${lineLabel}. Indumentaria premium SEISMILES.`,
    sku: product.slug,
    category: lineLabel,
    brand: { '@type': 'Brand', name: 'SEISMILES' },
    url: canonicalUrl,
    ...(images.length > 0 && { image: images }),
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'ARS',
      price: product.precio.toFixed(2),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil,
      seller: { '@type': 'Organization', name: 'SEISMILES' },
    },
    ...(summary.total > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: summary.average.toFixed(2),
        reviewCount: summary.total,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviewItems.length > 0 && { review: reviewItems }),
  }

  return toScriptSafeJson(payload)
}

// ── Breadcrumb ──

interface BreadcrumbInput {
  product: ProductDetailFromDB
  siteUrl: string
}

export function productBreadcrumbJsonLd({ product, siteUrl }: BreadcrumbInput): string {
  const lineLabel = LINEA_LABELS[product.linea] ?? product.linea
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Catálogo',
        item: `${siteUrl}/catalogo`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: lineLabel,
        item: `${siteUrl}/catalogo?linea=${encodeURIComponent(product.linea)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.nombre,
        item: `${siteUrl}/catalogo/${product.slug}`,
      },
    ],
  }
  return toScriptSafeJson(payload)
}
