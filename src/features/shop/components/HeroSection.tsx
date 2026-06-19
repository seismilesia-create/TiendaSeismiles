'use client'

import { useState, useEffect, useCallback, useRef, type TouchEvent } from 'react'
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6" /></svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
  )
}

function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="22" /><path d="m20 16-4-4 4-4" /><path d="m4 8 4 4-4 4" /><path d="m16 4-4 4-4-4" /><path d="m8 20 4-4 4 4" /></svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.5l1.9 5.6a4 4 0 0 0 2.5 2.5l5.6 1.9-5.6 1.9a4 4 0 0 0-2.5 2.5L12 22.5l-1.9-5.6a4 4 0 0 0-2.5-2.5L2 12.5l5.6-1.9a4 4 0 0 0 2.5-2.5z" /></svg>
  )
}

// `light` switches the control to dark tones for the light-themed first slide.
function NavButton({ side, onClick, label, light }: {
  side: 'left' | 'right'
  onClick: () => void
  label: string
  light: boolean
}) {
  const pos = side === 'left' ? 'left-2 sm:left-4 lg:left-6' : 'right-2 sm:right-4 lg:right-6'
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute ${pos} top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
        light
          ? 'bg-white/60 hover:bg-white/90 border-volcanic-900/10 text-volcanic-900'
          : 'bg-white/10 hover:bg-white/25 border-white/20 text-white'
      }`}
    >
      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
    </button>
  )
}

const INTERVAL = 6000

export function HeroSection() {
  const { hero } = shopConfig
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(Date.now())

  const SLIDES_COUNT = 5

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES_COUNT)
    startRef.current = Date.now()
    setProgress(0)
  }, [])

  const prev = useCallback(() => {
    setActive((p) => (p - 1 + SLIDES_COUNT) % SLIDES_COUNT)
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

  // Touch swipe (mobile): horizontal drag past the threshold changes slide.
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only react to deliberate horizontal swipes, never to taps or vertical scroll.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next()
      else prev()
    }
  }

  return (
    <section
      className="relative min-h-[90vh] lg:min-h-screen overflow-hidden bg-[#FAFAF8]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

      {/* ── SLIDE 0: Buzos (nueva línea) — split layout, image left, dark theme ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 0}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#243443] via-[#1A2430] to-[#0F161E]" />
        <div className="absolute inset-x-0 top-0 h-[38vh] lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1/2">
          <Image
            src="/images/Hero Buzos 1.jpg"
            alt="Buzos canguro SEISMILES"
            fill
            priority
            className="object-cover object-[50%_50%] lg:object-[50%_60%]"
          />
          {/* Cool wintry wash over the photo */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3A6B8C]/25 via-transparent to-[#1A2430]/30 mix-blend-multiply" />
          <div className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#1A2430] to-transparent" />
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1A2430] to-transparent" />
        </div>

        {/* Wintry frost: cool glow from the top + faint ice speckle texture */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(143,194,224,0.14),_transparent_60%)]" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, white 1px, transparent 1.5px), radial-gradient(circle at 65% 35%, white 1px, transparent 1.5px), radial-gradient(circle at 40% 75%, white 1px, transparent 1.5px), radial-gradient(circle at 85% 60%, white 1px, transparent 1.5px)',
            backgroundSize: '120px 120px, 90px 90px, 150px 150px, 70px 70px',
          }}
        />

        <div className="relative z-10 flex min-h-[90vh] lg:min-h-screen flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-[38vh] lg:h-auto lg:min-h-0" />
          <div className="flex items-center w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 xl:px-20 pt-6 pb-32 lg:py-0">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-[#8FC2E0]/10 backdrop-blur-sm border border-[#8FC2E0]/25 mb-5 lg:mb-8">
                <SnowflakeIcon className="w-4 h-4 text-[#9FD0EC]" />
                <span className="text-body-xs uppercase tracking-widest font-semibold text-[#CFE6F3]">
                  Temporada de frío
                </span>
              </div>
              <h1 className="font-display text-[2.25rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] leading-[0.95] tracking-[0.04em] uppercase text-white mb-4 lg:mb-6">
                Lo mejor para<br />esta temporada
              </h1>
              <p className="text-body-md lg:text-xl leading-relaxed text-white/60 max-w-lg mb-6 lg:mb-10">
                Abrigo, identidad y calidad de altura. Descubrí nuestros buzos, pensados para acompañarte en los días más fríos sin perder el estilo.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
                <MagneticButton>
                  <Link
                    href="/catalogo?type=buzos"
                    className="group flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl bg-white hover:bg-sand-100 text-volcanic-900 transition-all duration-300 hover:shadow-warm-lg"
                  >
                    Ver buzos
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SLIDE 1: Línea Mística (mujeres · edición limitada) — tríptico de 3 fotos ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 1}
      >
        {/* Negro elegante con un sutil brillo mauve/rosa arriba */}
        <div className="absolute inset-0 bg-[#150E12]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A1C24] via-transparent to-[#0A0608]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(196,140,176,0.16),_transparent_60%)]" />

        {/* Tríptico: arriba en mobile, mitad derecha en desktop. Línea fina clara entre fotos. */}
        <div className="absolute inset-x-0 top-0 h-[40vh] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[56%]">
          <div className="flex h-full w-full">
            {['Hero 2.0.webp', 'Hero 1.webp', 'Hero 2.webp'].map((src, i) => (
              <div
                key={src}
                className={`relative flex-1 overflow-hidden ${i > 0 ? 'border-l border-white/30' : ''}`}
              >
                <Image
                  src={`/images/${src}`}
                  alt={`Línea Mística — buzo crop ${i + 1}`}
                  fill
                  // Paneles altos con object-cover: la imagen se escala por altura,
                  // así que pedimos bastante más resolución que el ancho del panel
                  // para que no se vea borrosa.
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
          {/* Difuminado hacia el fondo en el borde interno */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#150E12] to-transparent" />
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#150E12] to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[90vh] lg:min-h-screen flex-col lg:flex-row-reverse">
          <div className="w-full lg:w-[56%] h-[40vh] lg:h-auto lg:min-h-0" />
          <div className="flex items-center w-full lg:w-[44%] px-6 sm:px-10 lg:px-16 xl:px-20 pt-6 pb-28 lg:py-0">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-5 lg:mb-8">
                <SparkleIcon className="w-3.5 h-3.5 text-[#E9C8DC]" />
                <span className="text-body-xs uppercase tracking-widest font-semibold text-[#EBD7E4]">
                  Mujeres · Edición limitada
                </span>
              </div>
              <h1 className="font-display text-[2.25rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] leading-[0.95] tracking-[0.04em] uppercase text-white mb-4 lg:mb-6">
                Línea Mística
              </h1>
              <p className="text-body-md lg:text-xl leading-relaxed text-white/65 max-w-lg mb-6 lg:mb-10">
                Buzo crop de frisa premium. Diseño de autor para la mujer que no elige entre abrigarse y verse bien. Pocas unidades, edición limitada.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
                <MagneticButton>
                  <Link
                    href="/catalogo?type=buzos&linea=mistica"
                    className="group flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl bg-white hover:bg-sand-100 text-volcanic-900 transition-all duration-300 hover:shadow-warm-lg"
                  >
                    Ver Línea Mística
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SLIDE 3: Split layout (dark theme) — Línea Origen ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 3}
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

      {/* ── SLIDE 2: Línea Arista — split layout, image right ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 2}
      >
        <div className="absolute inset-0 bg-volcanic-900" />
        <div className="absolute inset-x-0 top-0 h-[42vh] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-1/2">
          <Image
            src="/images/Hero.jpg"
            alt="Ropa de temporada — línea Arista"
            fill
            className="object-cover object-[50%_30%] lg:object-center"
          />
          <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-volcanic-900 to-transparent" />
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-volcanic-900 to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[90vh] lg:min-h-screen flex-col lg:flex-row-reverse">
          <div className="w-full lg:w-1/2 h-[42vh] lg:h-auto lg:min-h-0" />
          <div className="flex items-center w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 xl:px-20 pt-6 pb-28 lg:py-0">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5 lg:mb-8">
                <MountainIcon className="w-4 h-4 text-terra-400" />
                <span className="text-body-xs uppercase tracking-widest font-semibold text-white/70">
                  Nueva temporada
                </span>
              </div>
              <h1 className="font-display text-[2.25rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] leading-[0.95] tracking-[0.04em] uppercase text-white mb-4 lg:mb-6">
                Elegancia en<br />cada detalle
              </h1>
              <p className="text-body-md lg:text-xl leading-relaxed text-white/60 max-w-lg mb-6 lg:mb-10">
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
      </div>

      {/* ── SLIDE 4: Fullscreen landscape (light theme) ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={active !== 4}
      >
        <Image
          src="/images/Hero section.png"
          alt="Paisaje andino con volcanes y salares"
          fill
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

      {/* ── Arrow navigation (left/right) ── */}
      <NavButton side="left" onClick={prev} label="Slide anterior" light={active === 4} />
      <NavButton side="right" onClick={next} label="Slide siguiente" light={active === 4} />

      {/* ── Progress bars (fixed at bottom of hero) ── */}
      <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {Array.from({ length: SLIDES_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative h-[3px] w-[60px] cursor-pointer"
            aria-label={`Slide ${i + 1}`}
          >
            <div className={`absolute inset-0 rounded-full transition-colors duration-700 ${active === 4 ? 'bg-volcanic-900/20' : 'bg-white/25'
              }`} />
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-700 ${active === 4 ? 'bg-volcanic-900' : 'bg-white'
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
