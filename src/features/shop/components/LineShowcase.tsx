'use client'

import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { MagneticButton } from './MagneticButton'
import type { ShowcaseLine } from './showcase-lines'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip)
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

// Same aspect ratio (3:4) in active + thumb at every breakpoint so Flip scales uniformly.
// Mobile uses a stacked layout (image top / text below); on desktop the active card is
// BOTTOM-anchored to the rule above the product list so every line/product shares a baseline.
// The "top/bottom" + "max-width" portions are parameterized per-product (overridable via product.activeTop / activeMaxWidth).
const ACTIVE_TOP_DEFAULT = 'top-[15%] sm:top-auto sm:bottom-[100px] lg:bottom-[120px]'
const ACTIVE_MAX_W_DEFAULT = 'max-w-[480px]'
const ACTIVE_CLASS_BASE =
  'line-card absolute left-1/2 -translate-x-1/2 w-[68%] sm:w-[52%] lg:w-[38%] aspect-[3/4] z-10 cursor-default pointer-events-none focus:outline-none'

const THUMB_CLASS =
  'line-card absolute bottom-4 right-4 sm:bottom-24 sm:right-6 lg:bottom-28 lg:right-12 w-[90px] sm:w-[120px] lg:w-[150px] aspect-[3/4] z-30 rounded-sm overflow-hidden ring-1 ring-white/25 hover:ring-white/60 transition-shadow hover:shadow-warm-lg focus:outline-none focus:ring-2 focus:ring-white/70 cursor-pointer'

const HIDDEN_CLASS =
  'line-card absolute bottom-4 right-4 sm:bottom-24 sm:right-6 lg:bottom-28 lg:right-12 w-[90px] sm:w-[120px] lg:w-[150px] aspect-[3/4] z-20 rounded-sm overflow-hidden opacity-0 pointer-events-none'

interface LineShowcaseProps {
  lines: ShowcaseLine[]
  onUserInteract?: () => void
}

export function LineShowcase({ lines, onUserInteract }: LineShowcaseProps) {
  const [activeLineId, setActiveLineId] = useState(lines[0].id)
  const [activeProductByLine, setActiveProductByLine] = useState<Record<string, number>>(
    () => Object.fromEntries(lines.map((l) => [l.id, 0]))
  )

  const stageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const bottomBarRef = useRef<HTMLDivElement>(null)

  const activeLine = lines.find((l) => l.id === activeLineId) ?? lines[0]
  const activeProductIdx = activeProductByLine[activeLine.id] ?? 0
  const active = activeLine.products[activeProductIdx]
  const nextIdx = (activeProductIdx + 1) % activeLine.products.length
  const next = activeLine.products[nextIdx]
  const isLightLeft = active.lightSide === 'left'
  const isLightRight = active.lightSide === 'right'

  const tabColorClass = (isActive: boolean) => {
    if (isActive) return isLightLeft ? 'text-volcanic-900' : 'text-white'
    return isLightLeft
      ? 'text-volcanic-900/40 hover:text-volcanic-900/70'
      : 'text-white/40 hover:text-white/70'
  }

  // Initialize gradient layer opacities once. Keeping opacity OUT of inline style is what
  // lets GSAP crossfade smoothly — otherwise React's re-render with a new `opacity` value
  // overrides the tween mid-flight and the change feels instant.
  useLayoutEffect(() => {
    if (!stageRef.current) return
    const initialBgId = `${lines[0].id}-${lines[0].products[0].id}`
    lines.forEach((line) => {
      line.products.forEach((p) => {
        const el = stageRef.current!.querySelector<HTMLElement>(
          `[data-bg-id="${line.id}-${p.id}"]`
        )
        if (el) gsap.set(el, { opacity: `${line.id}-${p.id}` === initialBgId ? 1 : 0 })
      })
    })
  }, [lines])

  const animateBgCrossfade = (
    incomingKey: string,
    outgoingKey: string,
    options: { crossfadeDuration?: number; blurAmount?: number; blurDuration?: number } = {}
  ) => {
    const {
      crossfadeDuration = 1.1,
      blurAmount = 8,
      blurDuration = 0.5,
    } = options
    const root = stageRef.current
    if (!root) return
    const incoming = root.querySelector<HTMLElement>(`[data-bg-id="${incomingKey}"]`)
    const outgoing = root.querySelector<HTMLElement>(`[data-bg-id="${outgoingKey}"]`)
    if (incoming)
      gsap.to(incoming, { opacity: 1, duration: crossfadeDuration, ease: 'power2.inOut' })
    if (outgoing)
      gsap.to(outgoing, { opacity: 0, duration: crossfadeDuration, ease: 'power2.inOut' })
    const layers = root.querySelectorAll<HTMLElement>('.bg-layer')
    gsap.fromTo(
      layers,
      { filter: 'blur(0px)' },
      {
        filter: `blur(${blurAmount}px)`,
        duration: blurDuration,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      }
    )
  }

  const animateText = () => {
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 16, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          delay: 0.18,
          ease: 'power3.out',
        }
      )
    }
  }

  const animateBars = () => {
    if (topBarRef.current) {
      gsap.fromTo(
        topBarRef.current.querySelectorAll('.fade-on-change'),
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.2, stagger: 0.05, ease: 'power3.out' }
      )
    }
    if (bottomBarRef.current) {
      gsap.fromTo(
        bottomBarRef.current.querySelectorAll('.fade-on-change'),
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.2, stagger: 0.05, ease: 'power3.out' }
      )
    }
  }

  const handleAdvance = () => {
    onUserInteract?.()
    if (!stageRef.current) return

    const state = Flip.getState(
      stageRef.current.querySelectorAll('.line-card'),
      { props: 'opacity' }
    )
    const prevActive = active
    const newIdx = (activeProductIdx + 1) % activeLine.products.length
    const newProduct = activeLine.products[newIdx]

    flushSync(() => {
      setActiveProductByLine((prev) => ({ ...prev, [activeLine.id]: newIdx }))
    })

    Flip.from(state, {
      duration: 1,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
    })

    animateBgCrossfade(
      `${activeLine.id}-${newProduct.id}`,
      `${activeLine.id}-${prevActive.id}`
    )
    animateText()
    animateBars()
  }

  const handleLineSwitch = (lineId: string) => {
    if (lineId === activeLineId) return
    onUserInteract?.()
    if (!stageRef.current) return

    // Direction matters: switching to a tab on the right slides cards in from the
    // right (and old ones exit to the left). Gives the swap a sense of motion.
    const oldIdx = lines.findIndex((l) => l.id === activeLineId)
    const newIdx = lines.findIndex((l) => l.id === lineId)
    const forward = newIdx > oldIdx
    const enterFromX = forward ? 60 : -60
    const leaveToX = forward ? -60 : 60

    const state = Flip.getState(
      stageRef.current.querySelectorAll('.line-card'),
      { props: 'opacity' }
    )
    const prevActive = active
    const oldLineId = activeLineId
    const newLine = lines.find((l) => l.id === lineId)!
    const newProductIdx = activeProductByLine[lineId] ?? 0
    const newProduct = newLine.products[newProductIdx]

    flushSync(() => {
      setActiveLineId(lineId)
    })

    Flip.from(state, {
      duration: 1.2,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
      // Old line: drift out in the opposite direction with a quick fade
      onLeave: (els) =>
        gsap.to(els, {
          opacity: 0,
          x: leaveToX,
          scale: 0.94,
          duration: 0.65,
          ease: 'power3.in',
          stagger: 0.04,
        }),
      // New line: enter from the direction of travel, delayed so the leave reads first
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, x: enterFromX, scale: 0.94 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.95,
            delay: 0.2,
            ease: 'power3.out',
            stagger: 0.07,
          }
        ),
    })

    // Deeper, longer DOF blur and longer crossfade for the bigger context switch
    animateBgCrossfade(
      `${lineId}-${newProduct.id}`,
      `${oldLineId}-${prevActive.id}`,
      { crossfadeDuration: 1.2, blurAmount: 14, blurDuration: 0.7 }
    )
    animateText()
    animateBars()
  }

  return (
    <div ref={stageRef} className="relative w-full h-full overflow-hidden">
      {/* Pre-rendered gradient layers for every line × product — opacity managed by GSAP */}
      {lines.flatMap((line) =>
        line.products.map((p) => (
          <div
            key={`${line.id}-${p.id}`}
            data-bg-id={`${line.id}-${p.id}`}
            className="bg-layer absolute inset-0 will-change-[opacity,filter]"
            style={{ background: p.gradient, opacity: 0 }}
          />
        ))
      )}

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* ── TOP BAR with line tabs + counter ── */}
      <div
        ref={topBarRef}
        className="absolute top-0 inset-x-0 z-20 pt-20 lg:pt-24 pointer-events-none"
      >
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24 flex items-center justify-between gap-4">
          <div
            className={`flex items-center gap-2 sm:gap-3 pointer-events-auto flex-wrap ${
              isLightLeft ? 'text-volcanic-900/65' : 'text-white/55'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-500 shrink-0"
              style={{ backgroundColor: active.accentColor }}
            />
            {lines.map((line, i) => (
              <Fragment key={line.id}>
                {i > 0 && (
                  <span
                    className={
                      isLightLeft ? 'text-volcanic-900/25' : 'text-white/20'
                    }
                  >
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleLineSwitch(line.id)}
                  className={`text-[10px] lg:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium transition-colors duration-300 ${tabColorClass(line.id === activeLineId)}`}
                >
                  {line.name}
                </button>
              </Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3 lg:gap-4 text-[10px] lg:text-[11px] uppercase tracking-[0.3em] font-medium shrink-0">
            <span
              className="fade-on-change tabular-nums text-base lg:text-lg font-display leading-none"
              style={{
                color: isLightRight ? '#1a1815' : active.accentColor,
              }}
            >
              {String(activeProductIdx + 1).padStart(2, '0')}
            </span>
            <span
              className={`w-8 lg:w-14 h-px ${
                isLightRight ? 'bg-volcanic-900/30' : 'bg-white/25'
              }`}
            />
            <span
              className={`tabular-nums ${
                isLightRight ? 'text-volcanic-900/50' : 'text-white/40'
              }`}
            >
              {String(activeLine.products.length).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="mt-4 lg:mt-5 mx-6 sm:mx-10 lg:mx-16 xl:mx-24 h-px bg-white/10" />
      </div>

      {/* ── PRODUCT CARDS (Flip stage) — only the active line's products are mounted ── */}
      {activeLine.products.map((p) => {
        const isActive = p.id === active.id
        const isThumb = p.id === next.id
        const activeTop = p.activeTop ?? ACTIVE_TOP_DEFAULT
        const activeMaxW = p.activeMaxWidth ?? ACTIVE_MAX_W_DEFAULT
        const cls = isActive
          ? `${ACTIVE_CLASS_BASE} ${activeTop} ${activeMaxW}`
          : isThumb
            ? THUMB_CLASS
            : HIDDEN_CLASS
        return (
          <button
            key={p.id}
            type="button"
            data-flip-id={`${activeLine.id}-${p.id}`}
            onClick={isThumb ? handleAdvance : undefined}
            aria-label={isActive ? p.name : `Ver ${p.name}`}
            aria-hidden={!isActive && !isThumb}
            tabIndex={isActive || isThumb ? 0 : -1}
            className={cls}
          >
            <Image
              src={p.image}
              alt={p.imageAlt}
              fill
              sizes={isActive ? '(min-width: 1024px) 42vw, 70vw' : '150px'}
              className={
                p.fillContainer
                  ? 'object-cover object-[50%_30%]'
                  : 'object-contain'
              }
              priority={
                p.id === activeLine.products[0].id &&
                activeLine.id === lines[0].id
              }
            />
          </button>
        )
      })}

      {/* ── TEXT COLUMN (mobile: stacked below image, centered; desktop: left, vertical-centered) ── */}
      <div
        ref={textRef}
        className="absolute z-20 left-4 right-4 sm:left-10 sm:right-auto lg:left-16 xl:left-24 top-[60%] sm:top-1/2 sm:-translate-y-1/2 max-w-none sm:max-w-sm lg:max-w-md text-center sm:text-left pointer-events-none"
      >
        <div className="pointer-events-auto">
          <div
            className="w-12 h-px mb-4 sm:mb-6 lg:mb-7 mx-auto sm:mx-0 transition-colors duration-700"
            style={{ backgroundColor: active.accentColor }}
          />

          <h1
            className={`font-display text-[2rem] sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.5rem] leading-[0.95] sm:leading-[0.92] tracking-[0.02em] uppercase mb-3 sm:mb-4 ${
              isLightLeft ? 'text-volcanic-900' : 'text-white'
            }`}
          >
            {active.name}
          </h1>

          <p
            className="text-base sm:text-base lg:text-xl font-light italic mb-4 sm:mb-6 lg:mb-7"
            style={{ color: active.accentColor }}
          >
            {active.tagline}
          </p>

          <div
            className={`hidden sm:block w-10 h-px mb-6 lg:mb-7 ${
              isLightLeft ? 'bg-volcanic-900/30' : 'bg-white/25'
            }`}
          />

          <p
            className={`hidden sm:block text-body-sm lg:text-base leading-relaxed max-w-sm mb-6 lg:mb-8 ${
              isLightLeft ? 'text-volcanic-900/70' : 'text-white/55'
            }`}
          >
            {active.description}
          </p>

          {active.price && (
            <div
              className={`font-display text-2xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 lg:mb-7 tabular-nums ${
                isLightLeft ? 'text-volcanic-900' : 'text-white'
              }`}
            >
              {active.price}
            </div>
          )}

          <MagneticButton>
            <Link
              href={active.href}
              className={`group inline-flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 text-body-sm lg:text-body-md font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg ${
                isLightLeft
                  ? 'bg-volcanic-900 hover:bg-volcanic-800 text-white'
                  : 'bg-white hover:bg-sand-100 text-volcanic-900'
              }`}
            >
              {active.ctaText}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </MagneticButton>
        </div>
      </div>

      {/* ── BOTTOM BAR (desktop only — mobile relies on the top-right counter for position) ── */}
      <div
        ref={bottomBarRef}
        className="absolute bottom-0 inset-x-0 z-20 pb-16 lg:pb-20 pointer-events-none hidden sm:block"
      >
        <div className="mx-6 sm:mx-10 lg:mx-16 xl:mx-24 h-px bg-white/10 mb-4 lg:mb-5" />
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24 flex items-end justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-5 text-[10px] lg:text-[11px] uppercase tracking-[0.25em] font-medium">
            {activeLine.products.map((p, i) => {
              const isCurrent = i === activeProductIdx
              const activeCls = isLightLeft ? 'text-volcanic-900' : 'text-white'
              const dimCls = isLightLeft ? 'text-volcanic-900/40' : 'text-white/30'
              return (
                <span
                  key={p.id}
                  className={`fade-on-change transition-colors duration-500 ${
                    isCurrent ? activeCls : dimCls
                  }`}
                >
                  <span className={`hidden sm:inline tabular-nums mr-1.5 ${dimCls}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {p.shortName}
                </span>
              )
            })}
          </div>
          <span
            className={`fade-on-change hidden sm:flex items-center gap-2 text-[10px] lg:text-[11px] uppercase tracking-[0.25em] font-medium ${
              isLightRight ? 'text-volcanic-900/65' : 'text-white/45'
            }`}
          >
            Siguiente
            <span
              className={`w-6 h-px ${
                isLightRight ? 'bg-volcanic-900/30' : 'bg-white/25'
              }`}
            />
            <span
              style={{
                color: isLightRight ? '#1a1815' : active.accentColor,
              }}
            >
              {next.shortName}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
