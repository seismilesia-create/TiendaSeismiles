'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_STATUSES = [
  'pendiente_pago',
  'confirmado',
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelada',
  'reembolsada',
] as const

type OrderStatus = (typeof VALID_STATUSES)[number]

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
    return { error: 'Estado invalido' }
  }

  const service = createServiceClient()

  // Get current order
  const { data: order, error: fetchErr } = await service
    .from('compras')
    .select('id, estado, variante_id, cantidad')
    .eq('id', orderId)
    .single()

  if (fetchErr || !order) return { error: 'Pedido no encontrado' }

  const oldStatus = order.estado

  // Restore stock if cancelling a non-cancelled order
  if (
    newStatus === 'cancelada' &&
    oldStatus !== 'cancelada' &&
    oldStatus !== 'reembolsada' &&
    order.variante_id
  ) {
    const { data: variant } = await service
      .from('variantes')
      .select('stock')
      .eq('id', order.variante_id)
      .single()

    if (variant) {
      await service
        .from('variantes')
        .update({ stock: variant.stock + order.cantidad })
        .eq('id', order.variante_id)
    }
  }

  const { error } = await service
    .from('compras')
    .update({ estado: newStatus })
    .eq('id', orderId)

  if (error) return { error: 'Error al actualizar el estado' }

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/pedidos')
  revalidatePath('/perfil')
  revalidatePath('/admin/inventario')

  return {}
}
