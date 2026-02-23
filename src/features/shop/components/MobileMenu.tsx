'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
  )
}

const SUBCATEGORIES = [
  { label: 'Hombres', slug: 'hombres' },
  { label: 'Mujeres', slug: 'mujeres' },
  { label: 'Niños', slug: 'ninos' },
]

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setOpenDropdown(null)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  function toggleDropdown(key: string) {
    setOpenDropdown((prev) => (prev === key ? null : key))
  }

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
          <Image
            src="/images/logo-seismiles.png"
            alt="Seismiles Textil"
            width={100}
            height={44}
            className="h-9 w-auto brightness-[0.35] contrast-[1.1]"
          />
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-volcanic-400 hover:text-volcanic-900 transition-colors"
            aria-label="Cerrar menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          <Link
            href="/"
            onClick={onClose}
            className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
          >
            Inicio
          </Link>

          {/* Remeras lisas */}
          <div>
            <button
              onClick={() => toggleDropdown('lisas')}
              className="flex items-center justify-between w-full py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Remeras lisas
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === 'lisas' ? 'rotate-180 text-terra-500' : ''}`} />
            </button>
            {openDropdown === 'lisas' && (
              <div className="pl-4 pb-2 space-y-0.5">
                {SUBCATEGORIES.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/tienda/remeras-lisas/${sub.slug}`}
                    onClick={onClose}
                    className="block py-2.5 px-3 rounded-lg text-body-sm text-volcanic-600 hover:bg-sand-100 hover:text-terra-500 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Remeras personalizadas */}
          <div>
            <button
              onClick={() => toggleDropdown('personalizadas')}
              className="flex items-center justify-between w-full py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Remeras personalizadas
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === 'personalizadas' ? 'rotate-180 text-terra-500' : ''}`} />
            </button>
            {openDropdown === 'personalizadas' && (
              <div className="pl-4 pb-2 space-y-0.5">
                {SUBCATEGORIES.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/tienda/remeras-personalizadas/${sub.slug}`}
                    onClick={onClose}
                    className="block py-2.5 px-3 rounded-lg text-body-sm text-volcanic-600 hover:bg-sand-100 hover:text-terra-500 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-sand-200 pt-3">
            <Link
              href="/contacto"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Contacto
            </Link>
            <Link
              href="/quienes-somos"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Quienes Somos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
