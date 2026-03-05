'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface LightboxImage {
  id: string
  url: string
  orden: number
}

interface ImageLightboxProps {
  open: boolean
  onClose: () => void
  images: LightboxImage[]
  initialIndex: number
  productName: string
  colorName: string
}

// ── Icons ──

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

// ── Main Component ──

export function ImageLightbox({ open, onClose, images, initialIndex, productName, colorName }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Sync when lightbox opens at a new index
  useEffect(() => {
    if (open) setCurrentIndex(initialIndex)
  }, [open, initialIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, goToNext, goToPrev])

  if (!open || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Top bar: counter + close */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4">
        <span className="text-body-sm text-white/70 font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
        >
          <CloseIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main image area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-16 min-h-0">
        {/* Left arrow */}
        {images.length > 1 && (
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Image */}
        <div key={currentImage.id} className="relative w-full max-w-3xl aspect-[3/4] animate-fade-in">
          <Image
            src={currentImage.url}
            alt={`${productName} - ${colorName} ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>

        {/* Right arrow */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Bottom thumbnail strip */}
      {images.length > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-white ring-1 ring-white/30'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={img.url}
                alt={`Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
