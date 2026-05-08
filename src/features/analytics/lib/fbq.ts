type FbqParams = Record<string, unknown>

interface FbqOptions {
  /** Used by Meta to dedupe between Pixel and Conversions API events. */
  eventID?: string
}

function call(
  command: 'track' | 'trackCustom',
  eventName: string,
  params?: FbqParams,
  options?: FbqOptions,
) {
  if (typeof window === 'undefined') return

  if (typeof window.fbq !== 'function') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[MetaPixel] window.fbq is not available yet. Skipping ${command}("${eventName}").`,
      )
    }
    return
  }

  if (params && options) {
    window.fbq(command, eventName, params, options)
  } else if (params) {
    window.fbq(command, eventName, params)
  } else {
    window.fbq(command, eventName)
  }
}

export function trackEvent(eventName: string, params?: FbqParams, options?: FbqOptions) {
  call('track', eventName, params, options)
}

export function trackCustomEvent(eventName: string, params?: FbqParams) {
  call('trackCustom', eventName, params)
}

/* ─── Standard ecommerce events ─── */

export interface PixelContent {
  id: string
  quantity: number
  item_price?: number
}

export interface ViewContentParams {
  content_ids: string[]
  content_name: string
  content_type?: 'product' | 'product_group'
  content_category?: string
  value: number
  currency: string
}

export interface AddToCartParams extends ViewContentParams {
  contents?: PixelContent[]
}

export interface InitiateCheckoutParams {
  content_ids: string[]
  contents: PixelContent[]
  num_items: number
  value: number
  currency: string
}

export interface PurchaseParams extends InitiateCheckoutParams {
  content_type?: 'product' | 'product_group'
}

export function trackViewContent(params: ViewContentParams) {
  trackEvent('ViewContent', params as unknown as FbqParams)
}

export function trackAddToCart(params: AddToCartParams) {
  trackEvent('AddToCart', params as unknown as FbqParams)
}

export function trackInitiateCheckout(params: InitiateCheckoutParams) {
  trackEvent('InitiateCheckout', params as unknown as FbqParams)
}

export function trackPurchase(params: PurchaseParams, eventID?: string) {
  trackEvent(
    'Purchase',
    params as unknown as FbqParams,
    eventID ? { eventID } : undefined,
  )
}

export const fbq = {
  trackEvent,
  trackCustomEvent,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
}
