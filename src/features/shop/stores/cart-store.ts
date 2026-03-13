import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  colorId: string
  colorName: string
  colorHex: string
  talle: string
  precio: number
  cantidad: number
  imagenUrl: string | null
  maxStock: number
}

export interface AppliedGiftCard {
  code: string
  giftCardId: string
  saldo: number
  titulo: string
}

interface CartState {
  items: CartItem[]
  pendingOrderRef: string | null
  appliedGiftCards: AppliedGiftCard[]
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, cantidad: number) => void
  clearCart: () => void
  setPendingOrderRef: (ref: string) => void
  clearPendingOrderRef: () => void
  applyGiftCard: (gc: AppliedGiftCard) => void
  removeGiftCard: (code: string) => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingOrderRef: null,
      appliedGiftCards: [],

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

      clearCart: () => set({ items: [], pendingOrderRef: null, appliedGiftCards: [] }),

      setPendingOrderRef: (ref) => set({ pendingOrderRef: ref }),
      clearPendingOrderRef: () => set({ pendingOrderRef: null }),

      applyGiftCard: (gc) =>
        set((state) => {
          if (state.appliedGiftCards.some((g) => g.code === gc.code)) return state
          return { appliedGiftCards: [...state.appliedGiftCards, gc] }
        }),
      removeGiftCard: (code) =>
        set((state) => ({
          appliedGiftCards: state.appliedGiftCards.filter((g) => g.code !== code),
        })),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    }),
    {
      name: 'seismiles-cart',
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>
        if (version < 4) {
          const old = state.appliedGiftCard as AppliedGiftCard | null | undefined
          return {
            ...state,
            appliedGiftCards: old ? [old] : [],
            appliedGiftCard: undefined,
          }
        }
        return state
      },
    }
  )
)
