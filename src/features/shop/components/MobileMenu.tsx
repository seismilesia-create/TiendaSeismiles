'use client'

import { useState, useEffect } from 'react'
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
  )
}

const AUDIENCES = [
  { label: 'Hombres', slug: 'hombres' },
  { label: 'Mujeres', slug: 'mujeres' },
  { label: 'Niños', slug: 'ninos' },
]

const REMERA_TYPES = [
  { label: 'Lisas', slug: 'lisas', catalogType: 'remeras-lisas' },
  { label: 'Estampadas', slug: 'estampadas', catalogType: 'estampadas' },
]

const SIMPLE_CATEGORIES = [
  { label: 'Buzos', slug: 'buzos', catalogType: 'buzos-camperas' },
  { label: 'Camperas', slug: 'camperas', catalogType: 'buzos-camperas' },
]

export function MobileMenu({ open, onClose, user }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openSub, setOpenSub] = useState<string | null>(null)
  const totalItems = useCartStore((s) => s.getTotalItems())
  const hydrated = useCartHydrated()
  const cartCount = hydrated ? totalItems : 0

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
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-modal animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand-200">
          <Image
            src="/images/logo-seismiles.png"
            alt="SEISMILES Textil"
            width={100}
            height={44}
            className="h-9 w-auto brightness-[0.35] contrast-[1.1]"
          />
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-volcanic-500 hover:text-volcanic-900 transition-colors"
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
                            href={`/catalogo?type=${type.catalogType}&genero=${aud.slug}`}
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
                      href={`/catalogo?type=${cat.catalogType}&genero=${aud.slug}`}
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
