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

const AUDIENCES = [
  { label: 'Hombres', slug: 'hombres' },
  { label: 'Mujeres', slug: 'mujeres' },
  { label: 'Ninos', slug: 'ninos' },
]

const REMERA_TYPES = [
  { label: 'Lisas', slug: 'lisas' },
  { label: 'Personalizadas', slug: 'personalizadas' },
]

const SIMPLE_CATEGORIES = [
  { label: 'Buzos', slug: 'buzos' },
  { label: 'Camperas', slug: 'camperas' },
]

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openSub, setOpenSub] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setOpenDropdown(null)
      setOpenSub(null)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  function toggleDropdown(key: string) {
    setOpenDropdown((prev) => (prev === key ? null : key))
    setOpenSub(null)
  }

  function toggleSub(key: string) {
    setOpenSub((prev) => (prev === key ? null : key))
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
          {/* Remeras - nested accordion */}
          <div>
            <button
              onClick={() => toggleDropdown('remeras')}
              className="flex items-center justify-between w-full py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Remeras
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === 'remeras' ? 'rotate-180 text-terra-500' : ''}`} />
            </button>
            {openDropdown === 'remeras' && (
              <div className="pl-4 pb-2 space-y-0.5">
                {REMERA_TYPES.map((type) => (
                  <div key={type.slug}>
                    <button
                      onClick={() => toggleSub(type.slug)}
                      className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-body-sm text-volcanic-700 hover:text-terra-500 transition-colors"
                    >
                      {type.label}
                      <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${openSub === type.slug ? 'rotate-180 text-terra-500' : ''}`} />
                    </button>
                    {openSub === type.slug && (
                      <div className="pl-4 pb-1 space-y-0.5">
                        {AUDIENCES.map((aud) => (
                          <Link
                            key={aud.slug}
                            href={`/remeras/${type.slug}/${aud.slug}`}
                            onClick={onClose}
                            className="block py-2 px-3 rounded-lg text-body-sm text-volcanic-500 hover:bg-sand-100 hover:text-terra-500 transition-colors"
                          >
                            {aud.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buzos & Camperas - simple accordions */}
          {SIMPLE_CATEGORIES.map((cat) => (
            <div key={cat.slug}>
              <button
                onClick={() => toggleDropdown(cat.slug)}
                className="flex items-center justify-between w-full py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
              >
                {cat.label}
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === cat.slug ? 'rotate-180 text-terra-500' : ''}`} />
              </button>
              {openDropdown === cat.slug && (
                <div className="pl-4 pb-2 space-y-0.5">
                  {AUDIENCES.map((aud) => (
                    <Link
                      key={aud.slug}
                      href={`/${cat.slug}/${aud.slug}`}
                      onClick={onClose}
                      className="block py-2.5 px-3 rounded-lg text-body-sm text-volcanic-600 hover:bg-sand-100 hover:text-terra-500 transition-colors"
                    >
                      {aud.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="border-t border-sand-200 pt-3">
            <Link
              href="/tienda"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
