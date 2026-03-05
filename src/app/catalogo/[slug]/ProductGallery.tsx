'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface GalleryImage {
  id: string
  url: string
  orden: number
}

interface ProductGalleryProps {
  images: GalleryImage[]
  productName: string
  colorName: string
  destacado: boolean
  onImageClick: (index: number) => void
}

// ── Placeholder for empty gallery ──

function EmptyPlaceholder() {
  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand-100 flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-16 h-16 text-volcanic-300">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  )
}

// ── Desktop Grid ──

function DesktopGrid({ images, productName, colorName, destacado, onImageClick }: ProductGalleryProps) {
  const displayImages = images.slice(0, 4)
  const extraCount = images.length - 4

  if (images.length === 0) return <EmptyPlaceholder />

  // Single image: full width
  if (images.length === 1) {
    return (
      <button
        onClick={() => onImageClick(0)}
        className="relative aspect-[3/4] overflow-hidden bg-sand-100 group cursor-pointer"
      >
        <Image
          src={images[0].url}
          alt={`${productName} - ${colorName}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />
        <div className="absolute inset-0 bg-volcanic-900/0 group-hover:bg-volcanic-900/10 transition-colors duration-300" />
        {destacado && (
          <span className="absolute top-4 left-4 bg-terra-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white rounded-lg">
            Destacado
          </span>
        )}
      </button>
    )
  }

  // 3 images: first one spans 2 rows
  if (images.length === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1">
        {displayImages.map((img, index) => (
          <button
            key={img.id}
            onClick={() => onImageClick(index)}
            className={`relative aspect-[3/4] overflow-hidden bg-sand-100 group cursor-pointer ${
              index === 0 ? 'row-span-2 aspect-auto' : ''
            }`}
          >
            <Image
              src={img.url}
              alt={`${productName} - ${colorName} ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={index === 0 ? '28vw' : '28vw'}
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-volcanic-900/0 group-hover:bg-volcanic-900/10 transition-colors duration-300" />
            {index === 0 && destacado && (
              <span className="absolute top-4 left-4 bg-terra-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white rounded-lg">
                Destacado
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  // 2 or 4+ images: standard grid
  return (
    <div className="grid grid-cols-2 gap-1">
      {displayImages.map((img, index) => (
        <button
          key={img.id}
          onClick={() => onImageClick(index)}
          className="relative aspect-[3/4] overflow-hidden bg-sand-100 group cursor-pointer"
        >
          <Image
            src={img.url}
            alt={`${productName} - ${colorName} ${index + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="28vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-volcanic-900/0 group-hover:bg-volcanic-900/10 transition-colors duration-300" />
          {index === 0 && destacado && (
            <span className="absolute top-4 left-4 bg-terra-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white rounded-lg">
              Destacado
            </span>
          )}
          {/* "+N" overlay on the 4th image */}
          {extraCount > 0 && index === 3 && (
            <div className="absolute inset-0 bg-volcanic-900/40 flex items-center justify-center transition-opacity group-hover:bg-volcanic-900/50">
              <span className="text-white text-display-xs font-semibold">+{extraCount}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Mobile Carousel ──

function MobileCarousel({ images, productName, colorName, destacado, onImageClick }: ProductGalleryProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return
    const scrollLeft = carouselRef.current.scrollLeft
    const width = carouselRef.current.offsetWidth
    const newIndex = Math.round(scrollLeft / width)
    setActiveIndex(newIndex)
  }, [])

  function scrollToImage(index: number) {
    if (!carouselRef.current) return
    const width = carouselRef.current.offsetWidth
    carouselRef.current.scrollTo({ left: width * index, behavior: 'smooth' })
  }

  if (images.length === 0) return <EmptyPlaceholder />

  return (
    <div>
      {/* Scroll-snap carousel */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => onImageClick(index)}
            className="flex-shrink-0 w-full snap-center"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-sand-100">
              <Image
                src={img.url}
                alt={`${productName} - ${colorName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
              {index === 0 && destacado && (
                <span className="absolute top-4 left-4 bg-terra-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white rounded-lg">
                  Destacado
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToImage(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'w-6 bg-volcanic-900'
                  : 'w-2 bg-volcanic-300'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Export ──

export function ProductGallery(props: ProductGalleryProps) {
  return (
    <>
      {/* Desktop: 2x2 grid */}
      <div className="hidden lg:block">
        <DesktopGrid {...props} />
      </div>
      {/* Mobile: swipe carousel */}
      <div className="lg:hidden">
        <MobileCarousel {...props} />
      </div>
    </>
  )
}
