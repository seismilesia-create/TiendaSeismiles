'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** When true, parent stays visible and children with data-stagger animate individually */
  stagger?: boolean
}

export function ScrollReveal({ children, className = '', delay = 0, stagger = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('scroll-reveal-visible')
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const classes = stagger
    ? `scroll-reveal scroll-reveal--stagger ${className}`
    : `scroll-reveal ${className}`

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
}
