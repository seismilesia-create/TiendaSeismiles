'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

interface CartItemSnapshot {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  colorName: string
  colorHex: string
  talle: string
  precio: number
  cantidad: number
  imagenUrl: string | null
}

/**
 * Sync the logged-in user's cart to the abandoned_carts table.
 *
 * Empty items → delete the row (cart emptied, nothing to follow up on).
 * Non-empty items → upsert with fresh last_activity_at. If the row had been
 * marked converted_at (previous order completed), clear it AND the email
 * timers so the next abandonment starts a fresh email cycle.
 *
 * Silent failure: this is a fire-and-forget tracking call. Errors are logged
 * but never thrown — we don't want cart operations to break if sync fails.
 */
export async function syncAbandonedCart(
  items: CartItemSnapshot[],
  subtotal: number,
): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const service = createServiceClient()

    if (items.length === 0) {
      await service.from('abandoned_carts').delete().eq('user_id', user.id)
      return
    }

    const { data: existing } = await service
      .from('abandoned_carts')
      .select('converted_at')
      .eq('user_id', user.id)
      .maybeSingle()

    const resetEmails = existing?.converted_at != null

    await service.from('abandoned_carts').upsert(
      {
        user_id: user.id,
        email: user.email,
        items,
        subtotal,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(resetEmails
          ? {
              email_1_sent_at: null,
              email_2_sent_at: null,
              email_2_coupon_code: null,
              email_3_sent_at: null,
              email_3_coupon_code: null,
              converted_at: null,
            }
          : {}),
      },
      { onConflict: 'user_id' },
    )
  } catch (err) {
    console.error('[syncAbandonedCart] failed:', err)
  }
}

/**
 * Mark the current user's abandoned cart as converted when they complete an
 * order. Also wipes the email log for the user so the cooldown resets — a
 * legitimate purchase earns a fresh cycle on the next abandonment.
 */
export async function markAbandonedCartConverted(userId: string): Promise<void> {
  try {
    const service = createServiceClient()
    await service
      .from('abandoned_carts')
      .update({ converted_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('converted_at', null)
    await service
      .from('abandoned_cart_email_log')
      .delete()
      .eq('user_id', userId)
  } catch (err) {
    console.error('[markAbandonedCartConverted] failed:', err)
  }
}
