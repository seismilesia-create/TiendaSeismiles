'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email/resend'
import { orderStatusUpdateEmail } from '@/lib/email/seismiles-templates'
import { sendOrderConfirmationEmails } from '@/lib/email/send-order-confirmation'

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

const STATUSES_WITH_EMAIL = new Set<string>([
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelada',
])

const STATUS_SUBJECTS: Record<string, string> = {
  en_preparacion: 'Tu pedido esta siendo preparado',
  enviado: 'Tu pedido fue enviado',
  entregado: 'Tu pedido fue entregado',
  cancelada: 'Tu pedido fue cancelado',
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  trackingNumber?: string
): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
    return { error: 'Estado inválido' }
  }

  const service = createServiceClient()

  // Get current order with product and user info for email
  const { data: order, error: fetchErr } = await service
    .from('compras')
    .select('id, estado, variante_id, cantidad, numero_pedido, compra_grupo, producto_id, user_id, cupon_id, gift_cards_applied, productos(nombre), profiles(email, full_name)')
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

  // If admin is canceling a PENDING order (user never paid), refund the GC
  // balance and release the coupon reservation — mirrors the cancelada path
  // in confirmPayment. For confirmado→cancelada admin refunds we leave the
  // GC/coupon usage in place, since the user did consume the discount; any
  // money refund is handled out-of-band via MP.
  if (newStatus === 'cancelada' && oldStatus === 'pendiente_pago') {
    const gcApplied = (order.gift_cards_applied ?? null) as { id: string; descuento: number }[] | null
    if (gcApplied) {
      for (const gc of gcApplied) {
        await service.rpc('refund_gift_card', { p_gc_id: gc.id, p_amount: gc.descuento })
      }
    }
    if (order.cupon_id) {
      await service.rpc('release_coupon', {
        p_coupon_id: order.cupon_id,
        p_compra_ids: [order.numero_pedido],
      })
    }
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = { estado: newStatus }
  if (trackingNumber !== undefined && newStatus === 'enviado') {
    updatePayload.numero_seguimiento = trackingNumber || null
  }

  const { error } = await service
    .from('compras')
    .update(updatePayload)
    .eq('id', orderId)

  if (error) return { error: 'Error al actualizar el estado' }

  // Manual confirmation of a pending order (typically offline payments —
  // efectivo/transferencia — that an admin verifies by hand). The MP/GoCuotas
  // flow normally confirms via webhook before reaching the admin, so this only
  // really fires for offline orders. sendOrderConfirmationEmails expands to the
  // whole purchase group and sends ONE email with every product, so we gate it:
  // only the FIRST product row of the purchase to be confirmed sends it.
  // Otherwise confirming each of N product rows would email the customer N times.
  if (newStatus === 'confirmado' && oldStatus === 'pendiente_pago') {
    const grupo = order.compra_grupo
    let alreadyEmailed = false
    if (grupo) {
      // This row was just set to 'confirmado' above; if a SIBLING is already
      // confirmado, another call already (or will) send the email.
      const { count } = await service
        .from('compras')
        .select('id', { count: 'exact', head: true })
        .eq('compra_grupo', grupo)
        .eq('estado', 'confirmado')
        .neq('id', orderId)
      alreadyEmailed = (count ?? 0) > 0
    }
    if (!alreadyEmailed) {
      await sendOrderConfirmationEmails([order.numero_pedido])
    }
  }

  // Send email notification (fire-and-forget)
  if (STATUSES_WITH_EMAIL.has(newStatus) && oldStatus !== newStatus) {
    const userEmail = (order.profiles as unknown as { email: string; full_name: string | null })?.email
    const userName = (order.profiles as unknown as { email: string; full_name: string | null })?.full_name
    const productName = (order.productos as unknown as { nombre: string })?.nombre ?? 'Producto'

    if (userEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'
      const html = orderStatusUpdateEmail({
        customerName: userName,
        numeroPedido: order.numero_pedido,
        productName,
        newStatus,
        trackingNumber: newStatus === 'enviado' ? trackingNumber : null,
        siteUrl,
      })

      if (html) {
        getResend()
          .emails.send({
            from: EMAIL_CONFIG.from,
            replyTo: EMAIL_CONFIG.replyTo,
            to: userEmail,
            subject: `${STATUS_SUBJECTS[newStatus]} — SEISMILES`,
            html,
          })
          .catch((err) => {
            console.error('[order-status-email] Error sending email:', err)
          })
      }
    }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/pedidos')
  revalidatePath('/perfil')
  revalidatePath('/admin/inventario')

  return {}
}
