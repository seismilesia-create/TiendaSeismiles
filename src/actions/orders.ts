'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface OrderItem {
  variantId: string
  productId: string
  cantidad: number
  precio: number
}

interface PlaceOrderResult {
  success?: boolean
  pedidos?: { numero_pedido: string; variant_id: string }[]
  error?: string
}

export async function placeOrder(items: OrderItem[]): Promise<PlaceOrderResult> {
  if (!items.length) return { error: 'El carrito esta vacio' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesion para comprar' }

  const rpcItems = items.map((i) => ({
    variant_id: i.variantId,
    product_id: i.productId,
    cantidad: i.cantidad,
    precio: i.precio,
  }))

  const { data, error } = await supabase.rpc('place_order', {
    p_user_id: user.id,
    p_items: rpcItems,
  })

  if (error) {
    if (error.message.includes('Stock insuficiente')) {
      return { error: 'Algunos productos no tienen stock suficiente. Actualiza tu carrito.' }
    }
    return { error: 'Error al procesar el pedido. Intenta de nuevo.' }
  }

  revalidatePath('/catalogo')
  revalidatePath('/admin/inventario')
  revalidatePath('/perfil')

  return { success: true, pedidos: data as { numero_pedido: string; variant_id: string }[] }
}
