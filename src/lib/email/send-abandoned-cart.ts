import { randomBytes } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import {
  abandonedCartReminderEmail,
  abandonedCartDiscountEmail,
  abandonedCartLastChanceEmail,
} from '@/lib/email/seismiles-templates'

/**
 * Reminder = email 1 (no discount). Discount10 = email 2. LastChance15 = email 3.
 * Keep these as literal strings so the cron selector + the sender agree.
 */
export type AbandonedCartStage = 'reminder' | 'discount10' | 'lastChance15'

interface CartRow {
  id: string
  user_id: string
  email: string
  items: unknown
  subtotal: number | string
}

interface CartItem {
  productName: string
  productSlug: string
  colorName: string
  colorHex: string
  talle: string
  cantidad: number
  precio: number
  imagenUrl: string | null
}

/**
 * Create a single-use percentage coupon scoped to one recipient. 72h expiry
 * gives the user time to finish the cycle even if email 2 and 3 arrive back
 * to back. Caller is responsible for writing the returned code back onto the
 * abandoned_carts row.
 */
async function createAbandonedCartCoupon(
  service: ReturnType<typeof createServiceClient>,
  prefix: 'VUELVE10' | 'ULTIMA15',
  percent: number,
): Promise<string> {
  // 6 random chars from crypto-safe bytes, uppercase. Collision on 36^6 ≈
  // 2B is negligible at this volume but we also rely on the DB UNIQUE on
  // cupones.codigo to catch any accidental dup.
  const suffix = randomBytes(4).toString('hex').slice(0, 6).toUpperCase()
  const code = `${prefix}-${suffix}`

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)

  const { error } = await service.from('cupones').insert({
    codigo: code,
    tipo: 'porcentaje',
    valor: percent,
    minimo_compra: 0,
    max_usos: 1,
    un_uso_por_usuario: true,
    activo: true,
    fecha_fin: expiresAt.toISOString(),
  })

  if (error) throw new Error(`Failed to create coupon: ${error.message}`)

  return code
}

function formatExpiresLabel(hoursFromNow: number): string {
  const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Resolve the customer's display name from the profiles table. Non-fatal —
 * the email works fine without it, the greeting just omits the name.
 */
async function getCustomerName(
  service: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<string | null> {
  const { data } = await service
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()
  const raw = (data as { full_name?: string | null } | null)?.full_name ?? null
  if (!raw) return null
  // Only use the first name for a friendlier greeting.
  return raw.split(' ')[0] ?? raw
}

export async function sendAbandonedCartEmail(
  cart: CartRow,
  stage: AbandonedCartStage,
): Promise<{ sent: boolean; couponCode?: string }> {
  const service = createServiceClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seismilestextil.com.ar'
  const items = (Array.isArray(cart.items) ? cart.items : []) as CartItem[]
  if (items.length === 0) return { sent: false }

  const customerName = await getCustomerName(service, cart.user_id)

  let html: string
  let subject: string
  let couponCode: string | undefined

  if (stage === 'reminder') {
    html = abandonedCartReminderEmail({
      customerName,
      items,
      subtotal: Number(cart.subtotal),
      siteUrl,
    })
    subject = 'Te dejaste algo en el carrito — SEISMILES'
  } else if (stage === 'discount10') {
    couponCode = await createAbandonedCartCoupon(service, 'VUELVE10', 10)
    html = abandonedCartDiscountEmail({
      customerName,
      items,
      subtotal: Number(cart.subtotal),
      siteUrl,
      couponCode,
      discountPercent: 10,
      expiresAtLabel: formatExpiresLabel(72),
    })
    subject = 'Tenés 10% OFF esperándote — SEISMILES'
  } else {
    couponCode = await createAbandonedCartCoupon(service, 'ULTIMA15', 15)
    html = abandonedCartLastChanceEmail({
      customerName,
      items,
      subtotal: Number(cart.subtotal),
      siteUrl,
      couponCode,
      discountPercent: 15,
      expiresAtLabel: formatExpiresLabel(72),
    })
    subject = 'Última oportunidad: 15% OFF — SEISMILES'
  }

  const resend = getResend()
  const result = await resend.emails.send({
    from: EMAIL_CONFIG.from,
    to: cart.email,
    subject,
    html,
  })

  if (result.error) {
    console.error(
      '[abandoned-cart] Resend error for cart',
      cart.id,
      'stage',
      stage,
      ':',
      result.error,
    )
    return { sent: false, couponCode }
  }

  return { sent: true, couponCode }
}
