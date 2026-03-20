import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface CampaignRow {
  id: string
  subject: string
  content: string
  status: 'draft' | 'sending' | 'sent'
  recipients_count: number
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriberRow {
  id: string
  email: string
  coupon_code: string | null
  is_active: boolean
  subscribed_at: string | null
  unsubscribe_token: string
}

export interface SubscriberStats {
  total: number
  active: number
  inactive: number
}

// ============================================================
// Campaigns
// ============================================================

export async function getCampaigns(): Promise<CampaignRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as CampaignRow[]
}

export async function getCampaign(id: string): Promise<CampaignRow | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as CampaignRow
}

// ============================================================
// Subscribers
// ============================================================

export async function getAllSubscribers(): Promise<SubscriberRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as SubscriberRow[]
}

export async function getActiveSubscribers(): Promise<SubscriberRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as SubscriberRow[]
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('is_active')

  if (error) throw error

  const all = data ?? []
  const active = all.filter((s) => s.is_active).length

  return {
    total: all.length,
    active,
    inactive: all.length - active,
  }
}
