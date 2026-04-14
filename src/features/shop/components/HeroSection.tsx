'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { shopConfig } from '../config'
import { MountainIcon } from './MountainIcon'
import { MagneticButton } from './MagneticButton'

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

const INTERVAL = 6000

export function HeroSection() {
  const { hero } = shopConfig
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(Date.now())

  const SLIDES_COUNT = 3

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES_COUNT)
    startRef.current = Date.now()
    setProgress(0)
  }, [])

  useEffect(() => {
    startRef.current = Date.now()
    function tick() {
      const elapsed = Date.now() - startRef.current
      setProgress(Math.min(elapsed / INTERVAL, 1))
      if (elapsed >= INTERVAL) {
        next()
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, next])

  const goTo = (i: number) => {
    setActive(i)
    startRef.current = Date.now()
    setProgress(0)
  }

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen overflow-hidden bg-[#FAFAF8]">

      {/* ── SLIDE 0: Fullscreen landscape (light theme) ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 0}
      >
        <Image
          src="/images/Hero section.png"
          alt="Paisaje andino con volcanes y salares"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAF8] to-transparent" />

        <div className="relative z-10 flex items-center min-h-[90vh] lg:min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 lg:py-0">
          <div className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/60 backdrop-blur-sm border border-volcanic-900/5 mb-5 lg:mb-8">
              <MountainIcon className="w-4 h-4 text-terra-500" />
              <span className="text-body-xs uppercase tracking-widest font-semibold text-volcanic-600">
                {hero.badge}
              </span>
            </div>
            <h1 className="font-display text-[2.5rem] sm:text-[3.75rem] md:text-[5rem] lg:text-[7rem] leading-[0.95] tracking-[0.04em] uppercase text-volcanic-900 mb-4 lg:mb-6">
              {hero.headline}
            </h1>
            <p className="text-body-md lg:text-xl leading-relaxed text-volcanic-700 max-w-2xl mb-6 lg:mb-10">
              {hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 lg:gap-4">
              <MagneticButton>
                <Link
                  href={hero.ctaPrimary.href}
                  className="group flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl bg-volcanic-900 hover:bg-volcanic-800 text-white transition-all duration-300 hover:shadow-warm-lg"
                >
                  {hero.ctaPrimary.text}
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href={hero.ctaSecondary.href}
                  className="group flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white text-volcanic-900 border border-volcanic-900/10 transition-all duration-300 hover:shadow-warm"
                >
                  {hero.ctaSecondary.text}
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── SLIDE 1: Split layout (dark theme) ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 1}
      >
        <div className="absolute inset-0 bg-volcanic-900" />
        <div className="absolute inset-x-0 top-0 h-[35vh] lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1/2">
          <Image
            src="/images/Idea 7.jpg"
            alt="SEISMILES streetwear"
            fill
            className="object-cover"
          />
          <div className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-volcanic-900 to-transparent" />
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-volcanic-900 to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[90vh] lg:min-h-screen flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-[35vh] lg:h-auto lg:min-h-0" />
          <div className="flex items-center w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 xl:px-20 pt-6 pb-28 lg:py-0">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5 lg:mb-8">
                <MountainIcon className="w-4 h-4 text-terra-400" />
                <span className="text-body-xs uppercase tracking-widest font-semibold text-white/70">
                  Línea Origen
                </span>
              </div>
              <h1 className="font-display text-[2.25rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] leading-[0.95] tracking-[0.04em] uppercase text-white mb-4 lg:mb-6">
                Donde empieza todo
              </h1>
              <p className="text-body-md lg:text-xl leading-relaxed text-white/60 max-w-lg mb-6 lg:mb-10">
                Suavidad, frescura y equilibrio. Algodón premium pensado para acompañarte en cada movimiento, todos los días.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
                <MagneticButton>
                  <Link
                    href="/catalogo?linea=origen"
                    className="group flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl bg-white hover:bg-sand-100 text-volcanic-900 transition-all duration-300 hover:shadow-warm-lg"
                  >
                    Ver Colección
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SLIDE 2: Seasonal collection (Arista line) ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 2}
      >
        <Image
          src="/images/Temporada.jpg"
          alt="Ropa de temporada — línea Arista"
          fill
          className="object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-volcanic-900/85 via-volcanic-900/60 to-volcanic-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-volcanic-900/70 via-transparent to-transparent" />

        <div className="relative z-10 flex items-center min-h-[90vh] lg:min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 lg:py-0">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5 lg:mb-8">
              <MountainIcon className="w-4 h-4 text-terra-400" />
              <span className="text-body-xs uppercase tracking-widest font-semibold text-white/70">
                Nueva temporada
              </span>
            </div>
            <h1 className="font-display text-[2.25rem] sm:text-[3.25rem] md:text-[4.5rem] lg:text-[6rem] leading-[0.95] tracking-[0.04em] uppercase text-white mb-4 lg:mb-6">
              Lo mejor para<br />esta temporada
            </h1>
            <p className="text-body-md lg:text-xl leading-relaxed text-white/70 max-w-xl mb-6 lg:mb-10">
              Descubrí la Línea Arista. Piezas pensadas para acompañarte en cada aventura.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
              <MagneticButton>
                <Link
                  href="/catalogo?linea=arista"
                  className="group flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl bg-white hover:bg-sand-100 text-volcanic-900 transition-all duration-300 hover:shadow-warm-lg"
                >
                  Ver colección
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress bars (fixed at bottom of hero) ── */}
      <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {Array.from({ length: SLIDES_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative h-[3px] w-[60px] cursor-pointer"
            aria-label={`Slide ${i + 1}`}
          >
            <div className={`absolute inset-0 rounded-full transition-colors duration-700 ${active === 0 ? 'bg-volcanic-900/20' : 'bg-white/25'
              }`} />
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-700 ${active === 0 ? 'bg-volcanic-900' : 'bg-white'
                }`}
              style={{
                width: i === active ? `${progress * 100}%` : i < active ? '100%' : '0%',
              }}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
