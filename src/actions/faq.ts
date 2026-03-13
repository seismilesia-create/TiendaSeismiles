'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getResend, EMAIL_CONFIG } from '@/lib/email/resend'
import { adminNewQuestionEmail, faqReplyEmail } from '@/lib/email/seismiles-templates'

// ── User action: submit a question ──

export async function submitFaqQuestion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesion para enviar una pregunta.' }
  }

  const message = (formData.get('message') as string)?.trim()
  if (!message || message.length < 10) {
    return { error: 'Tu pregunta debe tener al menos 10 caracteres.' }
  }
  if (message.length > 2000) {
    return { error: 'Tu pregunta no puede superar los 2000 caracteres.' }
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const userEmail = profile?.email || user.email || ''
  const userName = profile?.full_name || null

  const { error } = await service
    .from('faq_questions')
    .insert({
      user_id: user.id,
      user_email: userEmail,
      user_name: userName,
      message,
    })

  if (error) {
    return { error: 'No se pudo enviar tu pregunta. Intenta de nuevo.' }
  }

  // Send admin notification email
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (adminEmail) {
    try {
      const resend = getResend()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seismiles.com'
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: adminEmail,
        subject: `Nueva pregunta de ${userName || userEmail}`,
        html: adminNewQuestionEmail({ customerEmail: userEmail, customerName: userName, message, siteUrl }),
      })
    } catch (emailErr) {
      console.error('Error sending admin FAQ notification:', emailErr)
    }
  }

  revalidatePath('/admin/faq')
  return { success: true }
}

// ── Admin action: reply to a question ──

export async function replyToQuestion(questionId: string, reply: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  if (!reply.trim()) return { error: 'La respuesta no puede estar vacia.' }

  const service = createServiceClient()

  const { data: question } = await service
    .from('faq_questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (!question) return { error: 'Pregunta no encontrada.' }

  const { error } = await service
    .from('faq_questions')
    .update({
      admin_reply: reply.trim(),
      status: 'answered',
      replied_at: new Date().toISOString(),
    })
    .eq('id', questionId)

  if (error) return { error: 'No se pudo guardar la respuesta.' }

  // Send reply email to user
  try {
    const resend = getResend()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seismiles.com'
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: question.user_email,
      subject: 'Respondimos tu consulta — Seismiles Textil',
      html: faqReplyEmail({
        customerName: question.user_name,
        originalQuestion: question.message,
        replyText: reply.trim(),
        siteUrl,
      }),
    })
  } catch (emailErr) {
    console.error('Error sending FAQ reply email:', emailErr)
  }

  revalidatePath('/admin/faq')
  return { success: true }
}

// ── Admin action: archive a question ──

export async function archiveQuestion(questionId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { error } = await service
    .from('faq_questions')
    .update({ status: 'archived' })
    .eq('id', questionId)

  if (error) return { error: 'No se pudo archivar la pregunta.' }

  revalidatePath('/admin/faq')
  return { success: true }
}

// ── Admin CRUD: FAQ items ──

export async function createFaqItem(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const question = (formData.get('question') as string)?.trim()
  const answer = (formData.get('answer') as string)?.trim()
  const section = (formData.get('section') as string)?.trim() || 'General'
  const display_order = parseInt(formData.get('display_order') as string) || 0

  if (!question || !answer) return { error: 'Pregunta y respuesta son obligatorias.' }

  const service = createServiceClient()
  const { error } = await service.from('faqs').insert({ question, answer, section, display_order })

  if (error) return { error: 'No se pudo crear la pregunta frecuente.' }

  revalidatePath('/admin/faq')
  revalidatePath('/faq')
  return { success: true }
}

export async function updateFaqItem(id: string, formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const question = (formData.get('question') as string)?.trim()
  const answer = (formData.get('answer') as string)?.trim()
  const section = (formData.get('section') as string)?.trim() || 'General'
  const display_order = parseInt(formData.get('display_order') as string) || 0
  const is_active = formData.get('is_active') === 'true'

  if (!question || !answer) return { error: 'Pregunta y respuesta son obligatorias.' }

  const service = createServiceClient()
  const { error } = await service
    .from('faqs')
    .update({ question, answer, section, display_order, is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'No se pudo actualizar.' }

  revalidatePath('/admin/faq')
  revalidatePath('/faq')
  return { success: true }
}

export async function deleteFaqItem(id: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { error } = await service.from('faqs').delete().eq('id', id)

  if (error) return { error: 'No se pudo eliminar.' }

  revalidatePath('/admin/faq')
  revalidatePath('/faq')
  return { success: true }
}
