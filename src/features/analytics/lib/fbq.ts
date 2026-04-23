type FbqParams = Record<string, unknown>

function call(command: 'track' | 'trackCustom', eventName: string, params?: FbqParams) {
  if (typeof window === 'undefined') return

  if (typeof window.fbq !== 'function') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[MetaPixel] window.fbq is not available yet. Skipping ${command}("${eventName}").`,
      )
    }
    return
  }

  if (params) {
    window.fbq(command, eventName, params)
  } else {
    window.fbq(command, eventName)
  }
}

export function trackEvent(eventName: string, params?: FbqParams) {
  call('track', eventName, params)
}

export function trackCustomEvent(eventName: string, params?: FbqParams) {
  call('trackCustom', eventName, params)
}

export const fbq = {
  trackEvent,
  trackCustomEvent,
}
