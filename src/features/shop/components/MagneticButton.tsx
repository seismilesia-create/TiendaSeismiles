'use client'

import { useRef, useCallback, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  /** Max pixel displacement. Default 6 */
  strength?: number
  className?: string
  as?: 'div' | 'span'
}

export function MagneticButton({ children, strength = 6, className = '', as: Tag = 'div' }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * strength
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (el) el.style.transform = ''
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.25s cubic-bezier(0.33, 1, 0.68, 1)', willChange: 'transform' }}
    >
      {children}
    </Tag>
  )
}
