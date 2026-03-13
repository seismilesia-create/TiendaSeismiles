'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { trackProductView } from '@/actions/track-view'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { HeartButton } from '@/features/shop/components/HeartButton'
import { ReviewSection } from '@/features/shop/components/ReviewSection'
import { SizeGuideDrawer } from '@/features/shop/components/SizeGuideDrawer'
import { ProductGallery } from './ProductGallery'
import { ImageLightbox } from './ImageLightbox'
import { StockNotifyModal } from './StockNotifyModal'
import type { ProductDetailFromDB, CatalogProductFromDB, ReviewFromDB, ReviewSummary } from '@/features/shop/services/product-lines'

// ── Constants ──

const LINEA_LABELS: Record<string, string> = {
  arista: 'Linea Arista',
  pissis: 'Linea Pissis',
  origen: 'Linea Origen',
  terreno: 'Linea Terreno',
  veta: 'Linea Veta',
  'tres-cruces': 'Linea Tres Cruces',
  nacimiento: 'Linea Nacimiento',
  veladero: 'Linea Veladero',
  'san-francisco': 'Linea San Francisco',
}

const TALLE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

// CSS fabric texture patterns per product line
const FABRIC_TEXTURES: Record<string, { pattern: string; size: string; opacity: number }> = {
  // Piqué — diamond waffle weave
  arista: {
    pattern: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 0L8 4L4 8L0 4Z' fill='%23000' fill-opacity='0.12'/%3E%3C/svg%3E")`,
    size: '6px 6px',
    opacity: 1,
  },
  // Algodón pesado — horizontal ribbed
  pissis: {
    pattern: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='4' height='1' fill='%23000' fill-opacity='0.08'/%3E%3C/svg%3E")`,
    size: '4px 4px',
    opacity: 1,
  },
  // Algodón suave — subtle grain
  origen: {
    pattern: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.6' fill='%23000' fill-opacity='0.06'/%3E%3C/svg%3E")`,
    size: '4px 4px',
    opacity: 1,
  },
  // Algodón resistente — crosshatch
  terreno: {
    pattern: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L8 8M8 0L0 8' stroke='%23000' stroke-opacity='0.08' stroke-width='0.8'/%3E%3C/svg%3E")`,
    size: '6px 6px',
    opacity: 1,
  },
  // Estampadas — sin textura especial
  veta: {
    pattern: 'none',
    size: '0',
    opacity: 0,
  },
  // Frisa invisible peinada — diagonal suave
  'tres-cruces': {
    pattern: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6L6 0' stroke='%23000' stroke-opacity='0.07' stroke-width='1.2'/%3E%3C/svg%3E")`,
    size: '5px 5px',
    opacity: 1,
  },
  // Frisa cardada — puntos suaves
  nacimiento: {
    pattern: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1' fill='%23000' fill-opacity='0.06'/%3E%3Ccircle cx='4.5' cy='4.5' r='1' fill='%23000' fill-opacity='0.06'/%3E%3C/svg%3E")`,
    size: '6px 6px',
    opacity: 1,
  },
  // Rústico peinado pesado
  veladero: {
    pattern: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L6 6M6 0L0 6' stroke='%23000' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")`,
    size: '5px 5px',
    opacity: 1,
  },
  'san-francisco': {
    pattern: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L6 6M6 0L0 6' stroke='%23000' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")`,
    size: '5px 5px',
    opacity: 1,
  },
  // Fallback — liso
  _default: {
    pattern: 'none',
    size: '0',
    opacity: 0,
  },
}

// ── Icons ──

function ChevronIcon({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={`${className} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  )
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

// ── Accordion ──

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-sand-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 group"
      >
        <span className="text-body-sm font-semibold text-volcanic-900 group-hover:text-terra-500 transition-colors">
          {title}
        </span>
        <ChevronIcon className="w-4 h-4 text-volcanic-500" open={open} />
      </button>
      {open && (
        <div className="pb-5 text-body-sm text-volcanic-600 leading-relaxed whitespace-pre-line">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main Component ──

interface ProductDetailProps {
  product: ProductDetailFromDB
  mostViewedProducts: CatalogProductFromDB[]
  reviews: ReviewFromDB[]
  reviewSummary: ReviewSummary
  currentUserId: string | null
  canReview: boolean
  isFavorited?: boolean
}

export function ProductDetail({ product, mostViewedProducts, reviews, reviewSummary, currentUserId, canReview, isFavorited = false }: ProductDetailProps) {
  const { user } = useAuth()
  const [selectedColorId, setSelectedColorId] = useState(product.colores[0]?.id ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [notifyTalle, setNotifyTalle] = useState<string | null>(null)
  const [showAddedToast, setShowAddedToast] = useState(false)

  const addItem = useCartStore((s) => s.addItem)

  // Track product view (once per mount)
  const tracked = useRef(false)
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackProductView(product.id)
    }
  }, [product.id])

  const selectedColor = product.colores.find((c) => c.id === selectedColorId)
  const lineLabel = LINEA_LABELS[product.linea] ?? product.linea

  // Derive gallery images: use imagenes table, fallback to imagen_url
  const colorImages = selectedColor?.imagenes?.length
    ? [...selectedColor.imagenes].sort((a, b) => a.orden - b.orden)
    : selectedColor?.imagen_url
      ? [{ id: 'legacy', url: selectedColor.imagen_url, orden: 0 }]
      : []

  function handleGalleryImageClick(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Show ALL standard sizes — sizes without variants appear as out-of-stock
  const allTalles = TALLE_ORDER

  function getStock(colorId: string, talle: string): number {
    return product.variantes.find((v) => v.color_id === colorId && v.talle === talle)?.stock ?? 0
  }

  function handleColorChange(colorId: string) {
    setSelectedColorId(colorId)
    if (selectedSize && getStock(colorId, selectedSize) === 0) {
      setSelectedSize(null)
    }
  }

  const canAddToCart = selectedColorId && selectedSize && getStock(selectedColorId, selectedSize) > 0

  function handleAddToCart() {
    if (!selectedColorId || !selectedSize || !selectedColor) return

    const variant = product.variantes.find(
      (v) => v.color_id === selectedColorId && v.talle === selectedSize
    )
    if (!variant || variant.stock <= 0) return

    const firstImage = selectedColor.imagenes?.[0]?.url
      ?? selectedColor.imagen_url
      ?? null

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.nombre,
      productSlug: product.slug,
      colorId: selectedColorId,
      colorName: selectedColor.nombre,
      colorHex: selectedColor.hex,
      talle: selectedSize,
      precio: product.precio,
      imagenUrl: firstImage,
      maxStock: variant.stock,
    })

    setShowAddedToast(true)
    setTimeout(() => setShowAddedToast(false), 3500)
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-body-xs text-volcanic-500 mb-6 lg:mb-10">
          <Link href="/catalogo" className="hover:text-terra-500 transition-colors">Catalogo</Link>
          <span className="text-volcanic-300">/</span>
          <Link href={`/catalogo?linea=${product.linea}`} className="hover:text-terra-500 transition-colors">{lineLabel}</Link>
          <span className="text-volcanic-300">/</span>
          <span className="text-volcanic-900 font-medium">{product.nombre}</span>
        </nav>

        {/* Main layout: 2 columns desktop, stacked mobile */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-12 xl:gap-16">

          {/* ── Left: Image Gallery ── */}
          <ProductGallery
            key={selectedColorId}
            images={colorImages}
            productName={product.nombre}
            colorName={selectedColor?.nombre ?? ''}
            destacado={product.destacado}
            onImageClick={handleGalleryImageClick}
          />

          {/* ── Right: Product Info ── */}
          <div className="mt-8 lg:mt-0">
            {/* Line + Name + Price */}
            <p className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-2">
              {lineLabel}
            </p>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-heading text-display-xs sm:text-display-sm text-volcanic-900">
                {product.nombre}
              </h1>
              <HeartButton
                productId={product.id}
                productSlug={product.slug}
                isFavorited={isFavorited}
                isLoggedIn={!!currentUserId}
                size="md"
              />
            </div>
            {/* Mini star rating */}
            {reviewSummary.total > 0 && (
              <button
                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mb-4 group"
              >
                <div className="flex items-center gap-0.5 text-terra-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={reviewSummary.average >= star ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinejoin="round"
                      />
                    </svg>
                  ))}
                </div>
                <span className="text-body-xs text-volcanic-500 group-hover:text-terra-500 transition-colors">
                  {reviewSummary.average.toFixed(1)} ({reviewSummary.total})
                </span>
              </button>
            )}
            <div className="mb-1">
              <span className="text-display-xs font-semibold text-volcanic-900">
                ${product.precio.toLocaleString('es-AR')}
              </span>
            </div>
            <p className="text-body-sm text-volcanic-500 mb-8">
              3 cuotas sin interes de ${Math.round(product.precio / 3).toLocaleString('es-AR')}
            </p>

            {/* Color selector */}
            {product.colores.length > 0 && (
              <div className="mb-8">
                <p className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-3">
                  Color: <span className="text-volcanic-900">{selectedColor?.nombre}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colores.map((color) => {
                    const isActive = selectedColorId === color.id
                    const texture = FABRIC_TEXTURES[product.linea] ?? FABRIC_TEXTURES._default
                    return (
                      <button
                        key={color.id}
                        onClick={() => handleColorChange(color.id)}
                        title={color.nombre}
                        className={`relative w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${
                          isActive
                            ? 'border-terra-500 ring-2 ring-terra-500/20 scale-110'
                            : 'border-sand-300 hover:border-volcanic-400 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundImage: texture.pattern, backgroundSize: texture.size, opacity: texture.opacity }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {allTalles.length > 0 && (
              <div className="mb-8">
                <p className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-3">
                  Talle
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {allTalles.map((talle) => {
                    const stock = selectedColorId ? getStock(selectedColorId, talle) : 0
                    const isSelected = selectedSize === talle
                    const isAvailable = stock > 0
                    return (
                      <div key={talle} className="relative">
                        <button
                          onClick={() => isAvailable ? setSelectedSize(isSelected ? null : talle) : setNotifyTalle(talle)}
                          className={`relative w-full py-3 rounded-xl text-body-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-volcanic-900 text-white'
                              : isAvailable
                                ? 'bg-sand-100 text-volcanic-700 hover:bg-sand-200 hover:text-volcanic-900'
                                : 'bg-sand-50 text-volcanic-300 hover:bg-sand-100 hover:text-volcanic-500 cursor-pointer'
                          }`}
                        >
                          {talle}
                          {!isAvailable && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="w-[70%] h-px bg-volcanic-200 rotate-[-20deg]" />
                            </span>
                          )}
                        </button>
                        {!isAvailable && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-terra-500 flex items-center justify-center pointer-events-none">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="mt-3 flex items-center gap-1.5 text-body-xs text-volcanic-500 hover:text-terra-500 transition-colors group"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
                    <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
                  </svg>
                  <span className="underline underline-offset-2 group-hover:decoration-terra-500">Guia de talles</span>
                </button>
              </div>
            )}

            {/* Add to cart — desktop */}
            <div className="hidden lg:block mb-8">
              <button
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 py-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 disabled:cursor-not-allowed text-white text-body-md font-semibold rounded-xl transition-all duration-300"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {!selectedSize ? 'Selecciona un talle' : 'Agregar al carrito'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-3 py-6 border-t border-sand-200 mb-6">
              <div className="flex items-center gap-3">
                <TruckIcon className="w-5 h-5 text-terra-500 flex-shrink-0" />
                <span className="text-body-sm text-volcanic-600">Envio gratis a todo el pais</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-5 h-5 text-terra-500 flex-shrink-0" />
                <span className="text-body-sm text-volcanic-600">3 cuotas sin interes</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshIcon className="w-5 h-5 text-terra-500 flex-shrink-0" />
                <span className="text-body-sm text-volcanic-600">Cambios faciles por 30 dias</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-b border-sand-200">
              {product.descripcion && (
                <Accordion title="Descripcion">
                  {product.descripcion}
                </Accordion>
              )}
              {product.detalles && (
                <Accordion title="Detalles y composicion">
                  {product.detalles}
                </Accordion>
              )}
              {product.cuidado && (
                <Accordion title="Cuidado">
                  {product.cuidado}
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <ReviewSection
          productoId={product.id}
          slug={product.slug}
          reviews={reviews}
          summary={reviewSummary}
          currentUserId={currentUserId}
          canReview={canReview}
        />

        {/* ── Most Viewed Products ── */}
        {mostViewedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <h2 className="font-heading text-display-xs text-volcanic-900 mb-8">
              Tambien te podria interesar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {mostViewedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile Sticky Bar ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-body-lg font-semibold text-volcanic-900 truncate">
            ${product.precio.toLocaleString('es-AR')}
          </p>
          <p className="text-body-xs text-volcanic-500 truncate">
            {selectedColor?.nombre}{selectedSize ? ` · ${selectedSize}` : ''}
          </p>
        </div>
        <button
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="flex items-center gap-2 px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-xl transition-all flex-shrink-0"
        >
          <ShoppingBagIcon className="w-4 h-4" />
          {!selectedSize ? 'Elegir talle' : 'Agregar'}
        </button>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="lg:hidden h-20" />

      {/* Size Guide Drawer */}
      <SizeGuideDrawer
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        defaultCategory={product.categoria === 'buzos-camperas' ? 'buzos' : 'remeras'}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={colorImages}
        initialIndex={lightboxIndex}
        productName={product.nombre}
        colorName={selectedColor?.nombre ?? ''}
      />

      {/* Stock Notify Modal */}
      <StockNotifyModal
        open={!!notifyTalle}
        onClose={() => setNotifyTalle(null)}
        productId={product.id}
        productName={product.nombre}
        colorId={selectedColor?.id ?? ''}
        colorName={selectedColor?.nombre ?? ''}
        colorHex={selectedColor?.hex ?? '#000'}
        talle={notifyTalle ?? ''}
        userEmail={user?.email ?? null}
      />

      {/* Added to cart toast */}
      {showAddedToast && (
        <div className="fixed top-24 right-4 z-50 animate-fade-in">
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-elevated border border-sand-200 px-4 py-3.5 max-w-sm">
            <div className="w-12 h-14 rounded-lg overflow-hidden bg-sand-100 shrink-0">
              {(() => {
                const toastImg = selectedColor?.imagenes?.[0]?.url ?? selectedColor?.imagen_url ?? null
                return toastImg ? (
                  <Image src={toastImg} alt="" width={48} height={56} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-volcanic-300">
                    <ShoppingBagIcon className="w-5 h-5" />
                  </div>
                )
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-volcanic-900 truncate">
                Agregado al carrito
              </p>
              <p className="text-body-xs text-volcanic-500 truncate">
                {product.nombre} · {selectedColor?.nombre} · {selectedSize}
              </p>
            </div>
            <Link
              href="/carrito"
              className="text-body-xs font-semibold text-terra-500 hover:text-terra-600 whitespace-nowrap transition-colors"
            >
              Ver carrito
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
