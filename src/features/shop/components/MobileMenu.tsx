'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '../stores/cart-store'
import { useCartHydrated } from '../hooks/useCartHydrated'
import type { ProductLineRow } from '../services/product-lines'

interface MobileMenuUser {
  email: string
  role: string
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  productLines: ProductLineRow[]
  user: MobileMenuUser | null
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  )
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9" /></svg>
  )
}

const NAV_CATEGORIES = [
  { label: 'Remeras', slug: 'remeras', catalogType: 'remeras-lisas' },
  { label: 'Buzos', slug: 'buzos', catalogType: 'buzos' },
]

export function MobileMenu({ open, onClose, productLines, user }: MobileMenuProps) {
  const totalItems = useCartStore((s) => s.getTotalItems())
  const hydrated = useCartHydrated()
  const cartCount = hydrated ? totalItems : 0
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setExpandedCategory(null)
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
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-modal animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand-200">
          <Image
            src="/images/logo-seismiles-v2.png"
            alt="SEISMILES"
            width={100}
            height={44}
            className="h-9 w-auto brightness-[0.35] contrast-[1.1]"
          />
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-volcanic-500 hover:text-volcanic-900 transition-colors"
            aria-label="Cerrar menú"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {NAV_CATEGORIES.map((cat) => {
            const lines = productLines.filter((l) => l.categoria === cat.catalogType)
            const isExpanded = expandedCategory === cat.slug
            const hasLines = lines.length > 0

            if (!hasLines) {
              return (
                <Link
                  key={cat.slug}
                  href={`/catalogo?type=${cat.catalogType}`}
                  onClick={onClose}
                  className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
                >
                  {cat.label}
                </Link>
              )
            }

            return (
              <div key={cat.slug}>
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.slug)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
                >
                  <span>{cat.label}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ease-out ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3 pb-2 space-y-0.5 border-l-2 border-sand-200 ml-1">
                      {lines.map((line) => (
                        <Link
                          key={line.slug}
                          href={`/catalogo?type=${cat.catalogType}&linea=${line.slug}`}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-lg text-body-sm font-medium text-volcanic-700 hover:bg-terra-100/70 hover:text-terra-600 transition-colors"
                        >
                          {line.name}
                        </Link>
                      ))}
                      <Link
                        href={`/catalogo?type=${cat.catalogType}`}
                        onClick={onClose}
                        className="block px-3 py-2 rounded-lg text-body-sm font-semibold text-terra-600 hover:bg-sand-100 transition-colors"
                      >
                        Ver todos →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="border-t border-sand-200 pt-3 space-y-1">
            <Link
              href="/carrito"
              onClick={onClose}
              className="flex items-center justify-between py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5" />
                Mi carrito
              </span>
              {cartCount > 0 && (
                <span className="bg-terra-500 text-white text-body-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/giftcards"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Gift Cards
            </Link>
            <Link
              href="/nosotros"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="/faq"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Preguntas Frecuentes
            </Link>
            <Link
              href="/contacto"
              onClick={onClose}
              className="block py-3 text-body-md font-medium text-volcanic-900 hover:text-terra-500 transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* Auth links */}
          <div className="border-t border-sand-200 pt-4 mt-2 space-y-3">
            {user ? (
              <div className="flex items-center gap-3 py-3 px-3 bg-sand-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-volcanic-900 text-white flex items-center justify-center text-body-sm font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-volcanic-900 truncate">{user.email}</p>
                  <Link
                    href={user.role === 'admin' ? '/admin/dashboard' : '/perfil'}
                    onClick={onClose}
                    className="text-body-xs text-terra-500 hover:text-terra-600 transition-colors"
                  >
                    {user.role === 'admin' ? 'Panel Admin' : 'Mi perfil'}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full py-3 text-center text-body-md font-medium text-volcanic-700 hover:text-terra-500 border border-sand-200 rounded-xl transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  onClick={onClose}
                  className="block w-full py-3 text-center text-body-md font-semibold text-white bg-volcanic-900 hover:bg-volcanic-800 rounded-xl transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
