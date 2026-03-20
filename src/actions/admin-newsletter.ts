'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getResend, EMAIL_CONFIG } from '@/lib/email'
import { campaignEmail } from '@/lib/email/seismiles-templates'

// ── Create campaign (draft) ──

export async function createCampaignAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const subject = (formData.get('subject') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!subject || !content) {
    return { error: 'Asunto y contenido son obligatorios.' }
  }

  const service = createServiceClient()
  const { error } = await service.from('newsletter_campaigns').insert({
    subject,
    content,
    status: 'draft',
  })

  if (error) return { error: 'No se pudo crear la campana.' }

  revalidatePath('/admin/newsletter')
  return { success: true }
}

// ── Update campaign (draft only) ──

export async function updateCampaignAction(id: string, formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const subject = (formData.get('subject') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!subject || !content) {
    return { error: 'Asunto y contenido son obligatorios.' }
  }

  const service = createServiceClient()

  // Verify it's still a draft
  const { data: existing } = await service
    .from('newsletter_campaigns')
    .select('status')
    .eq('id', id)
    .single()

  if (!existing) return { error: 'Campana no encontrada.' }
  if (existing.status !== 'draft') return { error: 'Solo se pueden editar borradores.' }

  const { error } = await service
    .from('newsletter_campaigns')
    .update({
      subject,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'No se pudo actualizar la campana.' }

  revalidatePath('/admin/newsletter')
  return { success: true }
}

// ── Delete campaign ──

export async function deleteCampaignAction(id: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { error } = await service.from('newsletter_campaigns').delete().eq('id', id)

  if (error) return { error: 'No se pudo eliminar la campana.' }

  revalidatePath('/admin/newsletter')
  return { success: true }
}

// ── Send campaign ──

export async function sendCampaignAction(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const service = createServiceClient()

  // 1. Load campaign, verify it's a draft
  const { data: campaign } = await service
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) return { error: 'Campana no encontrada.' }
  if (campaign.status !== 'draft') return { error: 'Esta campana ya fue enviada.' }

  // 2. Get active subscribers
  const { data: subscribers } = await service
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('is_active', true)

  if (!subscribers?.length) return { error: 'No hay suscriptores activos.' }

  // 3. Mark as 'sending'
  await service
    .from('newsletter_campaigns')
    .update({ status: 'sending', recipients_count: subscribers.length })
    .eq('id', id)

  // 4. Send emails one-by-one
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seismiles.com'
  const resend = getResend()

  for (const sub of subscribers) {
    const unsubUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`
    const html = campaignEmail({
      markdownContent: campaign.content,
      unsubscribeUrl: unsubUrl,
    })

    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        replyTo: EMAIL_CONFIG.replyTo,
        to: sub.email,
        subject: campaign.subject,
        html,
      })
    } catch (err) {
      console.error(`[newsletter] Failed to send to ${sub.email}:`, err)
    }
  }

  // 5. Mark as 'sent'
  await service
    .from('newsletter_campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/newsletter')
  return {}
}
