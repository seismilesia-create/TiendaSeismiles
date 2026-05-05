'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useScrolled } from '../hooks/useScrolled'
import { useCartStore } from '../stores/cart-store'
import { useCartHydrated } from '../hooks/useCartHydrated'
import { MobileMenu } from './MobileMenu'
import type { ProductLineRow } from '../services/product-lines'

interface NavbarUser {
  email: string
  role: string
}

interface NavbarProps {
  productLines: ProductLineRow[]
  user: NavbarUser | null
}

interface NavCategory {
  label: string
  slug: string
  catalogType: string
  comingSoon?: boolean
}

const NAV_CATEGORIES: NavCategory[] = [
  { label: 'Remeras', slug: 'remeras', catalogType: 'remeras-lisas' },
  { label: 'Buzos', slug: 'buzos', catalogType: 'buzos', comingSoon: true },
]

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9" /></svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  )
}

export function Navbar({ productLines, user }: NavbarProps) {
  const scrolled = useScrolled(10)
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalItems = useCartStore((s) => s.getTotalItems())
  const hydrated = useCartHydrated()
  const cartCount = hydrated ? totalItems : 0

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-elevated border-b border-sand-200/50'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-volcanic-900 hover:text-terra-500 transition-colors"
              aria-label="Abrir menú"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/images/logo-seismiles-v2.png"
                alt="SEISMILES"
                width={140}
                height={60}
                className="logo-hover-rise h-10 lg:h-12 w-auto brightness-[0.35] contrast-[1.1] group-hover:brightness-[0.25] transition-[filter] duration-300"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_CATEGORIES.map((cat) => {
                if (cat.comingSoon) {
                  return (
                    <span
                      key={cat.slug}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-volcanic-400 cursor-not-allowed select-none"
                      title="Próximamente"
                    >
                      {cat.label}
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-terra-100 text-terra-600">
                        Pronto
                      </span>
                    </span>
                  )
                }
                const lines = productLines.filter((l) => l.categoria === cat.catalogType)
                return (
                  <div key={cat.slug} className="relative group">
                    <Link
                      href={`/catalogo?type=${cat.catalogType}`}
                      className="inline-flex items-center gap-1 px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
                    >
                      {cat.label}
                      {lines.length > 0 && (
                        <ChevronDownIcon className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:rotate-180" />
                      )}
                    </Link>
                    {lines.length > 0 && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                        <div className="min-w-[240px] bg-white/95 backdrop-blur-xl shadow-elevated rounded-xl border border-sand-200/60 py-2 overflow-hidden">
                          {lines.map((line) => (
                            <Link
                              key={line.slug}
                              href={`/catalogo?type=${cat.catalogType}&linea=${line.slug}`}
                              className="block px-4 py-2 text-body-sm font-medium text-volcanic-900 border-l-2 border-transparent hover:border-terra-500 hover:bg-terra-100/70 hover:pl-5 hover:text-terra-600 transition-all duration-200"
                            >
                              {line.name}
                            </Link>
                          ))}
                          <Link
                            href={`/catalogo?type=${cat.catalogType}`}
                            className="block px-4 py-2.5 mt-1 border-t border-sand-200/60 text-body-xs font-semibold text-volcanic-700 hover:text-terra-600 hover:bg-sand-100 transition-colors"
                          >
                            Ver todos →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              <Link
                href="/giftcards"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                Gift Cards
              </Link>
              <Link
                href="/nosotros"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                Nosotros
              </Link>
              <Link
                href="/faq"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/contacto"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                Contacto
              </Link>
            </div>

            {/* Actions: Cart + Auth */}
            <div className="flex items-center gap-1">
              <Link
                href="/carrito"
                className="relative p-2 text-volcanic-700 hover:text-terra-500 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-terra-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <div className="hidden sm:flex items-center gap-2 ml-3 pl-3 border-l border-sand-200">
                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/admin/dashboard' : '/perfil'}
                    className="p-2 text-volcanic-700 hover:text-terra-500 transition-colors"
                    title={user.email}
                  >
                    <UserIcon className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3 py-1.5 text-body-xs font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
                    >
                      Ingresar
                    </Link>
                    <Link
                      href="/registro"
                      className="px-4 py-1.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-xs font-semibold rounded-lg transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        productLines={productLines}
        user={user}
      />
    </>
  )
}
