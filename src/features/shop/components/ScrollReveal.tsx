'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** When true, parent stays visible and children with data-stagger animate individually */
  stagger?: boolean
}

export function ScrollReveal({ children, className = '', delay = 0, stagger = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced motion or unsupported IO: skip animation, reveal immediately so
    // the section is never stuck at opacity:0.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }

    const reveal = () => {
      if (delay > 0) {
        const id = setTimeout(() => setRevealed(true), delay)
        return () => clearTimeout(id)
      }
      setRevealed(true)
    }

    let cleanupReveal: (() => void) | undefined

    // Threshold 0 fires on any visibility — needed because tall sections
    // (e.g. QualitySection) can have a max intersection ratio below 0.15
    // on short viewports, leaving them invisible forever. rootMargin pulls
    // the trigger up slightly so the reveal runs as the section approaches.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cleanupReveal = reveal()
          observer.unobserve(el)
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(el)

    // Safety net: if the observer hasn't fired within 1.5s but the element
    // is already inside the viewport, reveal it anyway. Guards against
    // edge cases where the observer never reports an intersection.
    const fallbackId = setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight || document.documentElement.clientHeight
      const inViewport = rect.top < viewportH && rect.bottom > 0
      if (inViewport) {
        cleanupReveal = reveal()
        observer.unobserve(el)
      }
    }, 1500)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackId)
      cleanupReveal?.()
    }
  }, [delay])

  const visibleClass = revealed ? 'scroll-reveal-visible' : ''
  const baseClass = stagger ? 'scroll-reveal scroll-reveal--stagger' : 'scroll-reveal'
  const classes = `${baseClass} ${visibleClass} ${className}`.trim()

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
}
