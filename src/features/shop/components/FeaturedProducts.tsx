import Image from 'next/image'
import Link from 'next/link'
import { shopConfig } from '../config'
import type { CatalogProductFromDB } from '../services/product-lines'

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

interface DisplayProduct {
  slug: string
  href: string
  imageUrl: string
  name: string
  line: string
  price: string
  tag?: string
}

function mapDBProducts(dbProducts: CatalogProductFromDB[]): DisplayProduct[] {
  return dbProducts.map((p) => {
    const firstImage = p.colores?.[0]?.imagen_url
    return {
      slug: p.slug,
      href: `/catalogo/${p.slug}`,
      imageUrl: firstImage ?? '',
      name: p.nombre,
      line: p.linea,
      price: `$${p.precio.toLocaleString('es-AR')}`,
    }
  })
}

interface FeaturedProductsProps {
  dbProducts?: CatalogProductFromDB[]
}

export function FeaturedProducts({ dbProducts }: FeaturedProductsProps) {
  const { featuredProducts } = shopConfig

  // Use DB products if available, otherwise fallback to config
  const products: DisplayProduct[] =
    dbProducts && dbProducts.length > 0
      ? mapDBProducts(dbProducts)
      : featuredProducts.products.map((p) => ({
          slug: p.slug,
          href: p.href,
          imageUrl: p.imageUrl,
          name: p.name,
          line: p.line,
          price: p.price,
          tag: p.tag,
        }))

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-3 block">
            {featuredProducts.label}
          </span>
          <h2 className="font-heading text-display-sm sm:text-display-md text-volcanic-900 mb-4">
            {featuredProducts.heading}
          </h2>
          <p className="text-body-md text-volcanic-500 max-w-2xl mx-auto">
            {featuredProducts.subtitle}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={product.href}
              className="group flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-sand-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-volcanic-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-volcanic-900/0 group-hover:bg-volcanic-900/10 transition-colors duration-300" />
                {/* Tag */}
                {product.tag && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-terra-500 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <span className="text-body-xs text-volcanic-500 uppercase tracking-wide">
                  {product.line}
                </span>
                <h3 className="font-heading text-body-md sm:text-lg text-volcanic-900 group-hover:text-terra-500 transition-colors duration-300">
                  {product.name}
                </h3>
                <span className="text-body-md font-semibold text-volcanic-800">
                  {product.price}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href={featuredProducts.cta.href}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-md font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg"
          >
            {featuredProducts.cta.text}
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}
