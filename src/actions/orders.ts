'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface OrderItem {
  variantId: string
  productId: string
  cantidad: number
}

interface PlaceOrderResult {
  success?: boolean
  pedidos?: { numero_pedido: string; variant_id: string }[]
  error?: string
}

export async function placeOrder(items: OrderItem[]): Promise<PlaceOrderResult> {
  if (!items.length) return { error: 'El carrito está vacío' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Debés iniciar sesión para comprar' }

  // Precio is intentionally omitted: place_order re-derives it from the
  // productos table to prevent client-side price tampering.
  const rpcItems = items.map((i) => ({
    variant_id: i.variantId,
    product_id: i.productId,
    cantidad: i.cantidad,
  }))

  const { data, error } = await supabase.rpc('place_order', {
    p_user_id: user.id,
    p_items: rpcItems,
  })

  if (error) {
    if (error.message.includes('Stock insuficiente')) {
      return { error: 'Algunos productos no tienen stock suficiente. Actualizá tu carrito.' }
    }
    return { error: 'Error al procesar el pedido. Intentá de nuevo.' }
  }

  revalidatePath('/catalogo')
  revalidatePath('/admin/inventario')
  revalidatePath('/perfil')

  return { success: true, pedidos: data as { numero_pedido: string; variant_id: string }[] }
}
