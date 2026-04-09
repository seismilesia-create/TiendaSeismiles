'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

/**
 * Intercepts internal <a> clicks and wraps them in the View Transitions API
 * for smooth crossfade between pages. Falls back to the CSS page-transition
 * animation in unsupported browsers.
 */
export function ViewTransitions({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supportsVT = 'startViewTransition' in document
    if (!supportsVT) return

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href?.startsWith('/')) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      e.preventDefault()
      e.stopPropagation()

      document.documentElement.dataset.viewTransitioning = ''

      const transition = (document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } })
        .startViewTransition(() => {
          router.push(href)
        })

      transition.finished.finally(() => {
        delete document.documentElement.dataset.viewTransitioning
      })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [router])

  return <>{children}</>
}
