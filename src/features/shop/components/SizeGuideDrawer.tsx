'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { shopConfig } from '../config'

const CATEGORIES = [
  { id: 'hombre', label: 'Hombre', image: '/images/Talles Hombre.jpg', alt: 'Tabla de talles molderia hombre' },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

function RulerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
    </svg>
  )
}

interface SizeGuideDrawerProps {
  open: boolean
  onClose: () => void
  /** Pre-seleccionar el género de la tabla */
  defaultCategory?: CategoryId
}

export function SizeGuideDrawer({ open, onClose, defaultCategory = 'hombre' }: SizeGuideDrawerProps) {
  const [activeId, setActiveId] = useState<CategoryId>(defaultCategory)

  useEffect(() => {
    setActiveId(defaultCategory)
  }, [defaultCategory])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const activeCategory = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0]

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-between px-6 py-5 border-b border-sand-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-terra-500/10 flex items-center justify-center">
                <RulerIcon className="w-[18px] h-[18px] text-terra-500" />
              </div>
              <h2 className="font-heading text-lg text-volcanic-900">Guía de talles</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-sand-100 transition-colors"
              aria-label="Cerrar guía de talles"
            >
              <CloseIcon className="w-5 h-5 text-volcanic-500" />
            </button>
          </div>

          <div className="px-6 py-8 space-y-8">
            <div>
              <p className="text-body-sm text-volcanic-600 leading-relaxed">
                Consultá las medidas de <span className="font-semibold text-volcanic-900">largo</span> y <span className="font-semibold text-volcanic-900">ancho</span> para encontrar tu talle ideal.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-sand-200 bg-sand-50">
              <Image
                src={activeCategory.image}
                alt={activeCategory.alt}
                width={600}
                height={600}
                className="w-full h-auto"
                priority={open}
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-terra-500/5 border border-terra-500/15 p-4">
              <span className="text-lg leading-none mt-0.5">&#128161;</span>
              <p className="text-body-sm text-volcanic-700 leading-relaxed">
                <span className="font-semibold">Tip:</span> Si estás entre dos talles, te recomendamos elegir el más grande para un calce más cómodo.
              </p>
            </div>

            <div className="rounded-xl bg-sand-50 border border-sand-200 p-5">
              <p className="text-body-sm text-volcanic-600 leading-relaxed">
                <span className="font-semibold text-volcanic-900">¿Dudas con tu talle?</span>{' '}
                Escribinos por{' '}
                <a
                  href={shopConfig.brand.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terra-500 hover:underline font-semibold"
                >
                  WhatsApp
                </a>{' '}
                con tu altura y peso y te asesoramos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
