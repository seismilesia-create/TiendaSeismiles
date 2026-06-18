type GtagParams = Record<string, unknown>

export interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string
  item_brand?: string
  price?: number
  quantity?: number
  index?: number
}

export interface ViewItemParams {
  currency: string
  value: number
  items: GA4Item[]
}

export interface AddToCartParams {
  currency: string
  value: number
  items: GA4Item[]
}

export interface BeginCheckoutParams {
  currency: string
  value: number
  items: GA4Item[]
  coupon?: string
}

export interface PurchaseParams {
  transaction_id: string
  currency: string
  value: number
  items: GA4Item[]
  shipping?: number
  tax?: number
  coupon?: string
}

function call(eventName: string, params: GtagParams) {
  if (typeof window === 'undefined') return

  if (typeof window.gtag !== 'function') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[GA4] window.gtag is not available yet. Skipping event "${eventName}".`,
      )
    }
    return
  }

  window.gtag('event', eventName, params)
}

export function trackEvent(eventName: string, params: GtagParams = {}) {
  call(eventName, params)
}

export function trackViewItem(params: ViewItemParams) {
  call('view_item', params as unknown as GtagParams)
}

export function trackAddToCart(params: AddToCartParams) {
  call('add_to_cart', params as unknown as GtagParams)
}

export function trackBeginCheckout(params: BeginCheckoutParams) {
  call('begin_checkout', params as unknown as GtagParams)
}

export function trackPurchase(params: PurchaseParams) {
  call('purchase', params as unknown as GtagParams)
}

// Namespace export so call sites can `import { gtag }` and dodge the name
// collision with fbq.ts (Meta Pixel uses the same verbs but a different
// payload shape, so the two libs can't share helpers).
export const gtag = {
  trackEvent,
  trackViewItem,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
}
