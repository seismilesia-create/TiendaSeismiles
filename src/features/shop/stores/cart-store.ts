import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShippingMethod } from '@/lib/shipping'

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  colorId: string
  colorName: string
  colorHex: string
  talle: string
  /** Precio unitario actual (puede estar con descuento si cross-sell aplicó). */
  precio: number
  cantidad: number
  imagenUrl: string | null
  maxStock: number
  /** Taxonomía para reglas de cross-sell (coincide con productos.linea). */
  linea?: string
  /** Taxonomía para reglas de cross-sell (coincide con productos.categoria). */
  categoria?: string
  /** Precio original sin descuento — solo presente si precio está descontado. */
  precioOriginal?: number
  /** ID de la regla de cross-sell que aplicó el descuento en este item. */
  crossSellRuleId?: string
}

export interface AppliedGiftCard {
  code: string
  giftCardId: string
  saldo: number
  titulo: string
}

export interface AppliedCoupon {
  code: string
  couponId: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  descuento: number
}

/**
 * Snapshot guardado al iniciar el checkout y consumido en /carrito/resultado
 * para disparar el evento Purchase del Meta Pixel con los datos correctos
 * (los items del carrito ya se limpian al volver de MP). Sobrevive a clearCart
 * a propósito — se borra explícitamente vía clearPendingPurchase().
 */
export interface PendingPurchase {
  externalRef: string
  value: number
  currency: 'ARS'
  contentIds: string[]
  contents: Array<{ id: string; quantity: number; item_price: number }>
  numItems: number
}

interface CartState {
  items: CartItem[]
  pendingOrderRef: string | null
  pendingPurchase: PendingPurchase | null
  appliedGiftCards: AppliedGiftCard[]
  appliedCoupon: AppliedCoupon | null
  shippingMethod: ShippingMethod | null
  shippingAddress: string
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, cantidad: number) => void
  clearCrossSellDiscounts: (ruleId?: string) => void
  clearCart: () => void
  setPendingOrderRef: (ref: string) => void
  clearPendingOrderRef: () => void
  setPendingPurchase: (p: PendingPurchase) => void
  clearPendingPurchase: () => void
  applyGiftCard: (gc: AppliedGiftCard) => void
  removeGiftCard: (code: string) => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  setShippingMethod: (method: ShippingMethod | null) => void
  setShippingAddress: (address: string) => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingOrderRef: null,
      pendingPurchase: null,
      appliedGiftCards: [],
      appliedCoupon: null,
      shippingMethod: null,
      shippingAddress: '',

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, cantidad: Math.min(i.cantidad + 1, i.maxStock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, cantidad: 1 }] }
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, cantidad) =>
        set((state) => {
          if (cantidad < 1) {
            return { items: state.items.filter((i) => i.variantId !== variantId) }
          }
          return {
            items: state.items.map((i) =>
              i.variantId === variantId
                ? { ...i, cantidad: Math.min(cantidad, i.maxStock) }
                : i
            ),
          }
        }),

      clearCrossSellDiscounts: (ruleId) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (!i.crossSellRuleId) return i
            if (ruleId && i.crossSellRuleId !== ruleId) return i
            const { precioOriginal, crossSellRuleId: _ruleId, ...rest } = i
            return {
              ...rest,
              precio: precioOriginal ?? i.precio,
            }
          }),
        })),

      // pendingPurchase se preserva a propósito: se setea antes de redirigir
      // a MP y se consume al volver al sitio (/carrito/resultado), donde sí
      // se limpia con clearPendingPurchase. Sin esto el snapshot moriría
      // entre el redirect a MP y la confirmación.
      clearCart: () => set({
        items: [],
        pendingOrderRef: null,
        appliedGiftCards: [],
        appliedCoupon: null,
        shippingMethod: null,
        shippingAddress: '',
      }),

      setPendingOrderRef: (ref) => set({ pendingOrderRef: ref }),
      clearPendingOrderRef: () => set({ pendingOrderRef: null }),

      setPendingPurchase: (p) => set({ pendingPurchase: p }),
      clearPendingPurchase: () => set({ pendingPurchase: null }),

      applyGiftCard: (gc) =>
        set((state) => {
          if (state.appliedGiftCards.some((g) => g.code === gc.code)) return state
          return { appliedGiftCards: [...state.appliedGiftCards, gc] }
        }),
      removeGiftCard: (code) =>
        set((state) => ({
          appliedGiftCards: state.appliedGiftCards.filter((g) => g.code !== code),
        })),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      setShippingMethod: (method) =>
        set((state) => ({
          shippingMethod: method,
          // Clear address when switching away from cadeteria.
          shippingAddress: method === 'cadeteria' ? state.shippingAddress : '',
        })),
      setShippingAddress: (address) => set({ shippingAddress: address }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    }),
    {
      name: 'seismiles-cart',
      version: 8,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>
        if (version < 4) {
          const old = state.appliedGiftCard as AppliedGiftCard | null | undefined
          return {
            ...state,
            appliedGiftCards: old ? [old] : [],
            appliedGiftCard: undefined,
            appliedCoupon: null,
          }
        }
        if (version < 5) {
          return {
            ...state,
            appliedCoupon: null,
          }
        }
        if (version < 6) {
          return {
            ...state,
            shippingMethod: null,
            shippingAddress: '',
          }
        }
        if (version < 7) {
          // Drop any stale cross-sell markers from carts persisted before the
          // feature existed — they would have no matching rule in config.
          const items = Array.isArray(state.items) ? state.items : []
          return {
            ...state,
            items: items.map((i) => {
              const item = i as Record<string, unknown>
              const { crossSellRuleId: _r, precioOriginal: _p, ...rest } = item
              return rest
            }),
          }
        }
        if (version < 8) {
          return {
            ...state,
            pendingPurchase: null,
          }
        }
        return state
      },
    }
  )
)
