import Image from 'next/image'
import Link from 'next/link'
import { shopConfig } from '../config'
import { MagneticButton } from './MagneticButton'
import type { CatalogProductFromDB } from '../services/product-lines'

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

interface ProductColor {
  hex: string
  nombre: string
}

interface DisplayProduct {
  slug: string
  href: string
  imageUrl: string
  imageUrlSecondary?: string
  name: string
  line: string
  price: string
  tag?: string
  colors?: ProductColor[]
}

function mapDBProducts(dbProducts: CatalogProductFromDB[]): DisplayProduct[] {
  return dbProducts.map((p) => {
    const firstImage = p.colores?.[0]?.imagen_url
    const secondImage = p.colores?.[1]?.imagen_url
    const colors: ProductColor[] = (p.colores ?? [])
      .filter((c) => c.hex)
      .map((c) => ({
        hex: c.color_base_hex || c.hex,
        nombre: c.nombre,
      }))

    return {
      slug: p.slug,
      href: `/catalogo/${p.slug}`,
      imageUrl: firstImage ?? '',
      imageUrlSecondary: secondImage ?? undefined,
      name: p.nombre,
      line: p.linea,
      price: `$${p.precio.toLocaleString('es-AR')}`,
      colors,
    }
  })
}

interface FeaturedProductsProps {
  dbProducts?: CatalogProductFromDB[]
  seasonSubtitle?: string
}

export function FeaturedProducts({ dbProducts, seasonSubtitle }: FeaturedProductsProps) {
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
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold">
              {featuredProducts.label}
            </span>
            <div className="w-8 h-px bg-terra-500" />
          </div>
          <h2 className="font-heading text-display-sm sm:text-display-md text-volcanic-900 mb-4">
            {featuredProducts.heading}
          </h2>
          <p className="text-body-md text-volcanic-500 max-w-2xl mx-auto">
            {seasonSubtitle || featuredProducts.subtitle}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <Link
              key={product.slug}
              href={product.href}
              data-stagger={index}
              className="group relative flex flex-col transition-transform duration-500 ease-out hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-sand-100 transition-shadow duration-500 group-hover:shadow-warm-lg">
                {product.imageUrl ? (
                  <>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${product.imageUrlSecondary ? 'group-hover:opacity-0' : ''}`}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {product.imageUrlSecondary && (
                      <Image
                        src={product.imageUrlSecondary}
                        alt={`${product.name} - alternativa`}
                        fill
                        className="object-cover absolute inset-0 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-volcanic-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}

                {/* Index badge top-right */}
                <span className="absolute top-3 right-3 text-[10px] font-mono text-white/85 bg-volcanic-900/35 backdrop-blur-sm px-2 py-1 rounded-full tracking-wider z-10">
                  0{index + 1}
                </span>

                {/* Tag top-left */}
                {product.tag && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-terra-500 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full z-10 shadow-sm">
                    {product.tag}
                  </span>
                )}

                {/* Hover overlay + CTA pill */}
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/95 backdrop-blur-sm text-volcanic-900 text-[11px] font-semibold rounded-full uppercase tracking-wider shadow-warm whitespace-nowrap">
                    Ver detalle
                    <ArrowRightIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5">
                <span className="text-body-xs text-volcanic-500 uppercase tracking-wide">
                  {product.line}
                </span>

                <h3 className="font-heading text-body-md sm:text-lg text-volcanic-900">
                  <span className="bg-left-bottom bg-gradient-to-r from-terra-500 to-terra-500 bg-[length:0%_1.5px] bg-no-repeat group-hover:bg-[length:100%_1.5px] transition-[background-size] duration-500 ease-out pb-0.5">
                    {product.name}
                  </span>
                </h3>

                {/* Price + color swatches */}
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-body-md font-semibold text-volcanic-800">
                    {product.price}
                  </span>
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-[3px]">
                      {product.colors.slice(0, 5).map((c, i) => (
                        <span
                          key={`${c.hex}-${i}`}
                          className="w-4 h-[6px] rounded-full border border-volcanic-900/10 transition-transform duration-300 group-hover:scale-x-110"
                          style={{ backgroundColor: c.hex }}
                          title={c.nombre}
                        />
                      ))}
                      {product.colors.length > 5 && (
                        <span className="text-[10px] text-volcanic-400 ml-1 font-medium">
                          +{product.colors.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 lg:mt-16 flex justify-center">
          <MagneticButton>
            <Link
              href={featuredProducts.cta.href}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-md font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg"
            >
              {featuredProducts.cta.text}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
