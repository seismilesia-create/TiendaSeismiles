'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { welcomeNewsletterEmail } from '@/lib/email/seismiles-templates'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function subscribeNewsletter(email: string): Promise<{ error?: string; alreadySubscribed?: boolean }> {
  // Per-IP limit: 10 subscriptions per hour is more than enough for a shared
  // family/office IP. Scripted enumeration hits this quickly.
  const ip = await getClientIp()
  const ipLimit = await checkRateLimit(`newsletter:ip:${ip}`, 10, 3600)
  if (!ipLimit.allowed) {
    return { error: 'Demasiadas suscripciones desde esta conexión. Intentá más tarde.' }
  }

  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: 'Email inválido' }
  }

  const service = createServiceClient()
  const couponCode = `SEISMILES10-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Insert subscriber
  const { error: subError } = await service
    .from('newsletter_subscribers')
    .insert({ email: trimmed, coupon_code: couponCode })

  if (subError) {
    if (subError.code === '23505') {
      return { alreadySubscribed: true }
    }
    return { error: 'Error al suscribirse' }
  }

  // Create corresponding coupon in cupones table
  await service
    .from('cupones')
    .insert({
      codigo: couponCode,
      tipo: 'porcentaje',
      valor: 10,
      max_usos: 1,
      un_uso_por_usuario: true,
      activo: true,
    })

  // Send welcome email with coupon (fire-and-forget)
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seismiles.com'

    const { data: newSub } = await service
      .from('newsletter_subscribers')
      .select('unsubscribe_token')
      .eq('email', trimmed)
      .single()

    const unsubUrl = newSub
      ? `${siteUrl}/api/newsletter/unsubscribe?token=${newSub.unsubscribe_token}`
      : siteUrl

    const resend = getResend()
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      replyTo: EMAIL_CONFIG.replyTo,
      to: trimmed,
      subject: 'Bienvenido/a a SEISMILES — Tu cupon del 10%',
      html: welcomeNewsletterEmail({ couponCode, siteUrl, unsubscribeUrl: unsubUrl }),
    })
  } catch (err) {
    console.error('[newsletter] Welcome email error:', err)
  }

  return {}
}
