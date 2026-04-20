import { createServiceClient } from '@/lib/supabase/server'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { passwordChangedEmail } from '@/lib/email/seismiles-templates'

/**
 * Sends a confirmation email when the user changes their password.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function sendPasswordChangedEmail(userId: string): Promise<void> {
  try {
    const service = createServiceClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data: profile } = await service
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile?.email) return

    const html = passwordChangedEmail({
      customerName: profile.full_name,
      siteUrl,
    })

    const resend = getResend()
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: profile.email,
      subject: 'Contraseña actualizada — SEISMILES',
      html,
    })
  } catch (err) {
    console.error('Error sending password changed email:', err)
  }
}
