import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { giftCardEmail } from '@/lib/email/seismiles-templates'

/**
 * Sends the gift card code to the buyer's email.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function sendGiftcardEmail(
  userId: string,
  codigo: string,
  monto: number,
  titulo: string
): Promise<void> {
  try {
    const service = createServiceClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data: profile } = await service
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile?.email) return

    const html = giftCardEmail({
      customerName: profile.full_name,
      titulo,
      monto,
      codigo,
      siteUrl,
    })

    const resend = getResend()
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: profile.email,
      subject: `Tu Gift Card SEISMILES — ${codigo}`,
      html,
    })
  } catch (err) {
    console.error('Error sending gift card email:', err)
  }
}
