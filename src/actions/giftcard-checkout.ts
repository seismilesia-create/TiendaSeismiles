'use server'

import { randomUUID } from 'crypto'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { mpPreference, mpPayment } from '@/lib/mercadopago'
import { getGiftCardDefinition } from '@/features/shop/services/admin-gift-cards'
import { sendGiftcardEmail } from '@/lib/email/send-giftcard-email'

interface GiftcardCheckoutResult {
  initPoint?: string
  giftcardId?: string
  error?: string
}

function generateCode(): string {
  const raw = randomUUID().replace(/-/g, '').toUpperCase()
  return `GC-${raw.slice(0, 4)}-${raw.slice(4, 8)}`
}

export async function createGiftcardCheckout(cardId: string): Promise<GiftcardCheckoutResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesion para comprar' }

  const card = await getGiftCardDefinition(cardId)
  if (!card || !card.activo) return { error: 'Gift card no encontrada' }

  const monto = card.precio
  const codigo = generateCode()
  const service = createServiceClient()

  // Insert gift card record
  const { data: giftcard, error: insertError } = await service
    .from('gift_cards')
    .insert({
      user_id: user.id,
      codigo,
      monto,
      titulo: card.titulo,
      estado: 'pendiente_pago',
    })
    .select('id')
    .single()

  if (insertError || !giftcard) {
    console.error('Gift card insert error:', insertError)
    return { error: 'Error al crear la gift card. Intenta de nuevo.' }
  }

  // Create MP preference
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const response = await mpPreference.create({
      body: {
        items: [{
          id: cardId,
          title: card.titulo,
          quantity: 1,
          unit_price: monto,
          currency_id: 'ARS',
        }],
        back_urls: {
          success: `${siteUrl}/giftcards/resultado`,
          failure: `${siteUrl}/giftcards/resultado`,
          pending: `${siteUrl}/giftcards/resultado`,
        },
        ...(siteUrl.includes('localhost') ? {} : { auto_return: 'approved' as const }),
        ...(siteUrl.includes('localhost') ? {} : { notification_url: `${siteUrl}/api/mercadopago/webhook` }),
        external_reference: `gc:${giftcard.id}`,
      },
    })

    // Update with MP preference ID
    await service
      .from('gift_cards')
      .update({ mp_preference_id: response.id })
      .eq('id', giftcard.id)

    return { initPoint: response.init_point!, giftcardId: giftcard.id }
  } catch (mpError) {
    console.error('MP preference error:', mpError)
    return { error: 'Error al conectar con Mercado Pago. Intenta de nuevo.' }
  }
}

/* ─── Confirm gift card payment when user returns from MP ─── */

interface ConfirmGiftcardResult {
  confirmed: boolean
  codigo?: string
  error?: string
}

export async function confirmGiftcardPayment(
  paymentId: string,
  giftcardId: string
): Promise<ConfirmGiftcardResult> {
  if (!paymentId || !giftcardId) {
    return { confirmed: false, error: 'Datos incompletos' }
  }

  try {
    const payment = await mpPayment.get({ id: Number(paymentId) })
    const mpStatus = payment.status ?? ''

    const service = createServiceClient()

    if (mpStatus === 'approved' || mpStatus === 'authorized') {
      // First get the monto to set saldo_restante
      const { data: existing } = await service
        .from('gift_cards')
        .select('monto')
        .eq('id', giftcardId)
        .single()

      const { data: gc, error: updateError } = await service
        .from('gift_cards')
        .update({ estado: 'activa', mp_payment_id: String(paymentId), saldo_restante: existing?.monto ?? 0 })
        .eq('id', giftcardId)
        .select('codigo, monto, titulo, user_id')
        .single()

      if (gc) {
        // Send email with gift card code (fire-and-forget)
        sendGiftcardEmail(gc.user_id, gc.codigo, gc.monto, gc.titulo)
      }

      return { confirmed: true, codigo: gc?.codigo }
    }

    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      await service
        .from('gift_cards')
        .update({ estado: 'cancelada', mp_payment_id: String(paymentId) })
        .eq('id', giftcardId)

      return { confirmed: false }
    }

    // Pending — just save payment ID
    await service
      .from('gift_cards')
      .update({ mp_payment_id: String(paymentId) })
      .eq('id', giftcardId)

    return { confirmed: false }
  } catch (err) {
    console.error('confirmGiftcardPayment error:', err)
    return { confirmed: false, error: 'Error al verificar el pago' }
  }
}

/* ─── Check pending gift card (fallback for sandbox / manual return) ─── */

export async function checkPendingGiftcard(): Promise<ConfirmGiftcardResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { confirmed: false }

  const service = createServiceClient()

  // Find the most recent pending gift card with an MP preference
  const { data: gc } = await service
    .from('gift_cards')
    .select('id, codigo, monto, titulo, user_id, mp_preference_id')
    .eq('user_id', user.id)
    .eq('estado', 'pendiente_pago')
    .not('mp_preference_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!gc?.mp_preference_id) return { confirmed: false }

  // Search for payments linked to this preference
  try {
    const searchUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=gc:${gc.id}&sort=date_created&criteria=desc&limit=1`
    const response = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    const data = await response.json()
    const payment = data.results?.[0]
    if (!payment) return { confirmed: false }

    const mpStatus = payment.status ?? ''

    if (mpStatus === 'approved' || mpStatus === 'authorized') {
      const { data: updated } = await service
        .from('gift_cards')
        .update({ estado: 'activa', mp_payment_id: String(payment.id), saldo_restante: gc.monto })
        .eq('id', gc.id)
        .select('codigo, monto, titulo, user_id')
        .single()

      if (updated) {
        sendGiftcardEmail(updated.user_id, updated.codigo, updated.monto, updated.titulo)
      }

      return { confirmed: true, codigo: updated?.codigo ?? gc.codigo }
    }

    return { confirmed: false }
  } catch (err) {
    console.error('[GC Check] Error:', err)
    return { confirmed: false }
  }
}
