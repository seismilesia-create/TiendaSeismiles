import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface FaqRow {
  id: string
  question: string
  answer: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FaqQuestionRow {
  id: string
  user_id: string
  user_email: string
  user_name: string | null
  message: string
  status: 'pending' | 'answered' | 'archived'
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

// ============================================================
// Public reads
// ============================================================

export async function getActiveFaqs(): Promise<FaqRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as FaqRow[]
}

// ============================================================
// Admin reads
// ============================================================

export async function getAdminFaqs(): Promise<FaqRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as FaqRow[]
}

export async function getAdminFaq(id: string): Promise<FaqRow | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as FaqRow
}

export async function getAdminQuestions(): Promise<FaqQuestionRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('faq_questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as FaqQuestionRow[]
}
