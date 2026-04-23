'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { trackEvent } from '@/features/analytics/lib/fbq'

export function MetaPixelPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    trackEvent('PageView')
  }, [pathname, searchParams])

  return null
}
