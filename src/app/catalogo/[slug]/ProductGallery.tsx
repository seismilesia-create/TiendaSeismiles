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

// ── Zoomable Image (desktop hover zoom) ──

const DESKTOP_ZOOM = 1.8

function ZoomableImage({
  src, alt, sizes, priority, onClick, children, className,
}: {
  src: string; alt: string; sizes: string; priority?: boolean
  onClick: () => void; children?: React.ReactNode; className?: string
}) {
  const containerRef = useRef<HTMLButtonElement>(null)
  const [zooming, setZooming] = useState(false)
  const [origin, setOrigin] = useState('center center')

  function handleMouseMove(e: React.MouseEvent) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <button
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setZooming(true)}
      onMouseLeave={() => setZooming(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden bg-sand-100 group cursor-zoom-in ${className ?? ''}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 ease-out"
        style={{
          transformOrigin: origin,
          transform: zooming ? `scale(${DESKTOP_ZOOM})` : 'scale(1)',
        }}
        sizes={sizes}
        priority={priority}
      />
      {children}
    </button>
  )
}

// ── Pinch-to-zoom Image (mobile) ──

const MOBILE_MAX_ZOOM = 3
const MOBILE_MIN_ZOOM = 1

function getTouchDistance(t1: React.Touch, t2: React.Touch) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function PinchZoomImage({
  src, alt, sizes, priority, destacado, onClick,
}: {
  src: string; alt: string; sizes: string; priority?: boolean
  destacado?: boolean; onClick: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState('center center')
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  // Refs for gesture tracking (avoid re-renders during gestures)
  const pinching = useRef(false)
  const startDist = useRef(0)
  const startScale = useRef(1)
  const lastTouchCenter = useRef({ x: 0, y: 0 })
  const startTranslate = useRef({ x: 0, y: 0 })
  const panning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault()
      pinching.current = true
      panning.current = false
      startDist.current = getTouchDistance(e.touches[0], e.touches[1])
      startScale.current = scale
      // Set transform-origin to midpoint between fingers
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100
        const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100
        setOrigin(`${cx}% ${cy}%`)
      }
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
      startTranslate.current = { ...translate }
    } else if (e.touches.length === 1 && scale > 1) {
      // Single finger pan when zoomed
      panning.current = true
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      startTranslate.current = { ...translate }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (pinching.current && e.touches.length === 2) {
      e.preventDefault()
      const dist = getTouchDistance(e.touches[0], e.touches[1])
      const newScale = Math.min(MOBILE_MAX_ZOOM, Math.max(MOBILE_MIN_ZOOM, startScale.current * (dist / startDist.current)))
      setScale(newScale)

      // Pan while pinching
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      setTranslate({
        x: startTranslate.current.x + (cx - lastTouchCenter.current.x),
        y: startTranslate.current.y + (cy - lastTouchCenter.current.y),
      })
    } else if (panning.current && e.touches.length === 1 && scale > 1) {
      e.preventDefault()
      setTranslate({
        x: startTranslate.current.x + (e.touches[0].clientX - panStart.current.x),
        y: startTranslate.current.y + (e.touches[0].clientY - panStart.current.y),
      })
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) {
      pinching.current = false
    }
    if (e.touches.length === 0) {
      panning.current = false
      // Snap back to 1x if close enough
      if (scale < 1.15) {
        setScale(1)
        setTranslate({ x: 0, y: 0 })
      }
    }
  }

  const isZoomed = scale > 1

  // Allow normal vertical scroll when not zoomed/pinching
  const touchAction = isZoomed || pinching.current ? 'none' : 'pan-y'

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={isZoomed ? () => { setScale(1); setTranslate({ x: 0, y: 0 }) } : onClick}
      className="relative aspect-[3/4] overflow-hidden bg-sand-100"
      style={{ touchAction }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${isZoomed ? '' : 'transition-transform duration-200'}`}
        style={{
          transformOrigin: origin,
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        }}
        sizes={sizes}
        priority={priority}
        draggable={false}
      />
      {destacado && (
        <span className="absolute top-4 left-4 z-10 bg-terra-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg pointer-events-none">
          Destacado
        </span>
      )}
    </div>
  )
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

  // Badge overlay (rendered inside ZoomableImage)
  const destacadoBadge = destacado ? (
    <span className="absolute top-4 left-4 z-10 bg-terra-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg pointer-events-none">
      Destacado
    </span>
  ) : null

  // Single image: full width
  if (images.length === 1) {
    return (
      <ZoomableImage
        src={images[0].url}
        alt={`${productName} - ${colorName}`}
        sizes="(max-width: 1024px) 100vw, 55vw"
        priority
        onClick={() => onImageClick(0)}
        className="w-full aspect-[3/4]"
      >
        {destacadoBadge}
      </ZoomableImage>
    )
  }

  // 3 images: first one spans 2 rows
  if (images.length === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1">
        {displayImages.map((img, index) => (
          <ZoomableImage
            key={img.id}
            src={img.url}
            alt={`${productName} - ${colorName} ${index + 1}`}
            sizes="28vw"
            priority={index === 0}
            onClick={() => onImageClick(index)}
            className={`aspect-[3/4] ${index === 0 ? 'row-span-2 aspect-auto' : ''}`}
          >
            {index === 0 && destacadoBadge}
          </ZoomableImage>
        ))}
      </div>
    )
  }

  // 2 or 4+ images: standard grid
  return (
    <div className="grid grid-cols-2 gap-1">
      {displayImages.map((img, index) => (
        <ZoomableImage
          key={img.id}
          src={img.url}
          alt={`${productName} - ${colorName} ${index + 1}`}
          sizes="28vw"
          priority={index === 0}
          onClick={() => onImageClick(index)}
          className="aspect-[3/4]"
        >
          {index === 0 && destacadoBadge}
          {/* "+N" overlay on the 4th image */}
          {extraCount > 0 && index === 3 && (
            <div className="absolute inset-0 z-10 bg-volcanic-900/40 flex items-center justify-center pointer-events-none">
              <span className="text-white text-display-xs font-semibold">+{extraCount}</span>
            </div>
          )}
        </ZoomableImage>
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
          <div key={img.id} className="flex-shrink-0 w-full snap-center">
            <PinchZoomImage
              src={img.url}
              alt={`${productName} - ${colorName} ${index + 1}`}
              sizes="100vw"
              priority={index === 0}
              destacado={index === 0 && destacado}
              onClick={() => onImageClick(index)}
            />
          </div>
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
