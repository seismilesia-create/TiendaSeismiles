import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { adminLowRatingReviewEmail } from '@/lib/email/seismiles-templates'

interface Params {
  reviewId: string
  productoId: string
  userId: string
  puntuacion: number
  comodidad: number | null
  calidad: number | null
  ajuste: number | null
  longitud: number | null
  comentario: string
}

/**
 * Notifica al admin cuando un comprador deja una reseña de 2 o menos estrellas,
 * para poder moderar o contactar al cliente proactivamente.
 *
 * Fire-and-forget: cualquier error se loguea pero no afecta al flujo del usuario
 * (la reseña ya quedó guardada).
 */
export async function sendLowRatingReviewEmail(params: Params): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) return

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (!adminEmail) return

    const service = createServiceClient()

    const [{ data: product }, { data: profile }] = await Promise.all([
      service
        .from('productos')
        .select('nombre, slug')
        .eq('id', params.productoId)
        .single(),
      service
        .from('profiles')
        .select('full_name, email')
        .eq('id', params.userId)
        .single(),
    ])

    if (!product) return

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'
    const customerName = profile?.full_name
      ?? profile?.email?.split('@')[0]
      ?? 'Cliente'
    const customerEmail = profile?.email ?? 'sin-email@seismiles.ar'

    const createdAtDisplay = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    const html = adminLowRatingReviewEmail({
      puntuacion: params.puntuacion,
      productName: product.nombre,
      productSlug: product.slug,
      customerName,
      customerEmail,
      comentario: params.comentario.trim() ? params.comentario : null,
      comodidad: params.comodidad,
      calidad: params.calidad,
      ajuste: params.ajuste,
      longitud: params.longitud,
      createdAtDisplay,
      siteUrl,
    })

    const resend = getResend()
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      replyTo: customerEmail,
      to: adminEmail,
      subject: `[Reseña ${params.puntuacion}★] ${product.nombre} — ${customerName}`,
      html,
    })
  } catch (err) {
    console.error('sendLowRatingReviewEmail error:', err)
  }
}
