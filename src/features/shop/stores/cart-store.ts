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

interface CartState {
  items: CartItem[]
  // Stores the external reference of orders sent to MP, so we can verify on return
  pendingOrderRef: string | null
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, cantidad: number) => void
  clearCart: () => void
  setPendingOrderRef: (ref: string) => void
  clearPendingOrderRef: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingOrderRef: null,

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

      clearCart: () => set({ items: [], pendingOrderRef: null }),

      setPendingOrderRef: (ref) => set({ pendingOrderRef: ref }),
      clearPendingOrderRef: () => set({ pendingOrderRef: null }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    }),
    { name: 'seismiles-cart', version: 2 }
  )
)
