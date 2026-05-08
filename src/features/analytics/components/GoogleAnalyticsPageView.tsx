'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// We disable send_page_view in the gtag('config', ...) call so GA doesn't
// double-count on App Router client navigations. This component fires every
// page_view manually — including the initial load — keyed off pathname +
// searchParams. Without the manual fire, the first hit would never reach GA.
export function GoogleAnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    if (!gaId) return

    const query = searchParams.toString()
    const path = query ? `${pathname}?${query}` : pathname

    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    })
  }, [pathname, searchParams])

  return null
}
