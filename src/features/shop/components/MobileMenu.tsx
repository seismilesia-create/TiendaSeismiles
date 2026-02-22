'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MountainIcon } from './MountainIcon'
import type { ProductLineRow } from '../services/product-lines'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  productLines: ProductLineRow[]
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

export function MobileMenu({ open, onClose, productLines }: MobileMenuProps) {
  // Bloquear scroll del body cuando el menu esta abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-volcanic-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-modal animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand-200">
          <div className="flex items-center gap-2">
            <MountainIcon className="w-6 h-6 text-terra-500" />
            <span className="font-heading text-lg text-volcanic-900">SEISMILES</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-volcanic-400 hover:text-volcanic-900 transition-colors"
            aria-label="Cerrar menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          <Link
            href="/"
            onClick={onClose}
            className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
          >
            Inicio
          </Link>

          {/* Lineas de producto - DINAMICAS desde Supabase */}
          <div className="pt-3 pb-2">
            <p className="text-body-xs uppercase tracking-widest text-volcanic-400 font-semibold mb-3">
              Tienda
            </p>
            <div className="space-y-0.5">
              {productLines.map((line) => (
                <Link
                  key={line.id}
                  href={`/tienda/${line.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl text-body-md text-volcanic-700 hover:bg-sand-100 hover:text-terra-500 transition-colors group"
                >
                  <div>
                    <span className="font-medium">{line.name}</span>
                    {line.description && (
                      <p className="text-body-xs text-volcanic-400 mt-0.5">{line.description}</p>
                    )}
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-volcanic-300 group-hover:text-terra-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-sand-200 pt-3">
            <Link
              href="/empresas"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Empresas & DTF
            </Link>
            <Link
              href="#origen"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Nuestro Origen
            </Link>
            <Link
              href="/contacto"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>

        {/* Footer del menu */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5 border-t border-sand-200 bg-sand-50">
          <Link
            href="/tienda"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 bg-terra-500 hover:bg-terra-600 text-white text-body-sm font-semibold rounded-xl transition-colors"
          >
            Ver toda la coleccion
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
