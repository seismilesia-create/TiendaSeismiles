'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useCallback, useEffect } from 'react'

type MediaItem =
  | { type: 'video'; src: string }
  | { type: 'photo'; src: string; alt: string }

const photos = [
  { src: '/images/Idea.jpg', alt: 'Remera naranja en la montaña', color: 'Naranja Volcánico' },
  { src: '/images/Idea 1.jpg', alt: 'Polo rojo en el parque', color: 'Rojo Cumbre' },
  { src: '/images/Idea 2.jpg', alt: 'Remera blanca urbana', color: 'Blanco Salina' },
  { src: '/images/Idea 3.jpg', alt: 'Remera borgoña en la calle', color: 'Borgoña Andino' },
]

const videoSrc = '/images/Idea 4.mp4'
const TOTAL_SLIDES = photos.length + 1

const allMedia: MediaItem[] = [
  { type: 'video', src: videoSrc },
  ...photos.map(p => ({ type: 'photo' as const, src: p.src, alt: p.alt })),
]

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

export function LookbookSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const index = Math.round(scrollLeft / (clientWidth * 0.82))
    setActiveIndex(Math.min(index, TOTAL_SLIDES - 1))
  }, [])

  const openLightbox = useCallback((mediaIndex: number) => {
    setLightboxIndex(mediaIndex)
  }, [])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goNext = useCallback(() => {
    setLightboxIndex(prev => prev !== null && prev < allMedia.length - 1 ? prev + 1 : prev)
  }, [])

  const goPrev = useCallback(() => {
    setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)
  }, [])

  // Keyboard navigation + lock scroll
  useEffect(() => {
    if (lightboxIndex === null) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [lightboxIndex, closeLightbox, goNext, goPrev])

  return (
    <section className="py-20 lg:py-28 bg-sand-50 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold">
              Lookbook
            </span>
            <div className="w-8 h-px bg-terra-500" />
          </div>
          <h2 className="font-heading text-display-md lg:text-display-lg text-volcanic-900 mb-4">
            SEISMILES en las calles
          </h2>
          <p className="text-body-md text-volcanic-500 max-w-md mx-auto">
            Nuestra ropa en su hábitat natural. Diseñada en la montaña, hecha para la ciudad.
          </p>
        </div>

        {/* Desktop/Tablet: Solo fotos, sin video */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {photos.map((photo, i) => (
            <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer" onClick={() => openLightbox(i + 1)}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-volcanic-900/60 via-volcanic-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-body-xs text-white/90 uppercase tracking-widest font-semibold">
                  {photo.color}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Carousel con video + fotos, todo natural */}
        <div className="sm:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 items-start"
          >
            {/* Video slide */}
            <div className="relative flex-shrink-0 w-[78vw] aspect-[3/4] rounded-2xl overflow-hidden snap-center cursor-pointer" onClick={() => openLightbox(0)}>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5 text-white">
                  <path d="M4 2.5v11l9-5.5L4 2.5z" />
                </svg>
                <span className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">Video</span>
              </div>
            </div>

            {/* Photo slides */}
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-[78vw] aspect-[3/4] rounded-2xl overflow-hidden snap-center cursor-pointer"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="78vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-volcanic-900/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-body-xs text-white/90 uppercase tracking-widest font-semibold">
                    {photo.color}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
              <button
                key={index}
                aria-label={`Ir a slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-terra-500 w-6'
                    : 'bg-volcanic-900/20 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-2 px-8 py-4 border border-volcanic-900/10 bg-white hover:bg-volcanic-900 text-volcanic-900 hover:text-white text-body-md font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg"
          >
            Ver el catálogo completo
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-body-xs text-white/50 font-mono">
            {lightboxIndex + 1} / {allMedia.length}
          </div>

          {/* Prev arrow */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-3 sm:left-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Anterior"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {lightboxIndex < allMedia.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-3 sm:right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Siguiente"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Media content */}
          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {allMedia[lightboxIndex].type === 'video' ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="max-h-[90vh] max-w-[90vw] rounded-lg"
              >
                <source src={allMedia[lightboxIndex].src} type="video/mp4" />
              </video>
            ) : (
              <img
                src={(allMedia[lightboxIndex] as { src: string; alt: string }).src}
                alt={(allMedia[lightboxIndex] as { src: string; alt: string }).alt}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
