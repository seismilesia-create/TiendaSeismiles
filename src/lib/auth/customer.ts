import { createClient, createServiceClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: string
}

export async function requireAuth(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? null,
    role: profile?.role ?? 'customer',
  }
}
