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
              aria-label="Abrir menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/images/logo-seismiles.png"
                alt="SEISMILES Textil"
                width={140}
                height={60}
                className="h-10 lg:h-12 w-auto brightness-[0.35] contrast-[1.1] group-hover:brightness-[0.25] transition-all duration-300"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Remeras flyout dropdown */}
              <div className="relative group">
                <Link
                  href="/catalogo"
                  className="flex items-center gap-1 px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
                >
                  Remeras
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
                </Link>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-elevated border border-sand-200/60 py-2">
                    {REMERA_TYPES.map((type) => (
                      <div key={type.slug} className="relative group/sub">
                        <span className="flex items-center justify-between px-4 py-2.5 text-body-sm text-volcanic-700 hover:bg-sand-100 hover:text-terra-500 transition-colors cursor-pointer">
                          {type.label}
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 6 6 6-6 6" /></svg>
                        </span>
                        <div className="absolute left-full top-0 pl-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                          <div className="w-44 bg-white/95 backdrop-blur-xl rounded-xl shadow-elevated border border-sand-200/60 py-2">
                            {AUDIENCES.map((aud) => (
                              <Link key={aud.slug} href={`/catalogo?type=${type.catalogType}&genero=${aud.slug}`} className="block px-4 py-2.5 text-body-sm text-volcanic-700 hover:bg-sand-100 hover:text-terra-500 transition-colors">{aud.label}</Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buzos & Camperas simple dropdowns */}
              {SIMPLE_CATEGORIES.map((cat) => (
                <div key={cat.slug} className="relative group">
                  <Link
                    href={`/catalogo?type=${cat.catalogType}`}
                    className="flex items-center gap-1 px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
                  >
                    {cat.label}
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
                  </Link>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-elevated border border-sand-200/60 py-2">
                      {AUDIENCES.map((aud) => (
                        <Link key={aud.slug} href={`/catalogo?type=${cat.catalogType}&genero=${aud.slug}`} className="block px-4 py-2.5 text-body-sm text-volcanic-700 hover:bg-sand-100 hover:text-terra-500 transition-colors">{aud.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

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
