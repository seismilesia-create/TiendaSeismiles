'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScrolled } from '../hooks/useScrolled'
import { MountainIcon } from './MountainIcon'
import { MobileMenu } from './MobileMenu'
import type { ProductLineRow } from '../services/product-lines'

interface NavbarProps {
  productLines: ProductLineRow[]
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
  )
}

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

export function Navbar({ productLines }: NavbarProps) {
  const scrolled = useScrolled(10)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
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
            <Link href="/" className="flex items-center gap-2.5 group">
              <MountainIcon className="w-7 h-7 text-terra-500 group-hover:text-terra-600 transition-colors" />
              <div className="flex flex-col leading-none">
                <span className="font-heading text-lg lg:text-xl text-volcanic-900 tracking-tight">
                  SEISMILES
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-volcanic-400 font-medium">
                  Ruta Nacional 60
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                Inicio
              </Link>

              {/* Tienda dropdown - dinamico desde product_lines */}
              <div className="relative group">
                <Link
                  href="/tienda"
                  className="flex items-center gap-1 px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
                >
                  Tienda
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
                </Link>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-elevated border border-sand-200/60 py-2">
                    {productLines.map((line) => (
                      <Link
                        key={line.id}
                        href={`/tienda/${line.slug}`}
                        className="block px-4 py-2.5 text-body-sm text-volcanic-700 hover:bg-sand-100 hover:text-terra-500 transition-colors"
                      >
                        {line.name}
                      </Link>
                    ))}
                    <div className="border-t border-sand-200 my-1" />
                    <Link
                      href="/tienda"
                      className="block px-4 py-2.5 text-body-sm font-medium text-terra-500 hover:bg-sand-100 transition-colors"
                    >
                      Ver todo
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/empresas"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                Empresas
              </Link>
              <Link
                href="#origen"
                className="px-4 py-2 text-body-sm font-medium text-volcanic-700 hover:text-terra-500 transition-colors"
              >
                Nuestro Origen
              </Link>
            </div>

            {/* Actions: Search + Cart */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-volcanic-700 hover:text-terra-500 transition-colors"
                aria-label="Buscar"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <button
                className="relative p-2 text-volcanic-700 hover:text-terra-500 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-terra-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        productLines={productLines}
      />
    </>
  )
}
