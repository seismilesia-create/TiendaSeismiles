import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface BlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  category: string
  author_name: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Public reads
// ============================================================

export async function getPublishedPosts(): Promise<BlogPostRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as BlogPostRow[]
}

export async function getPublishedPost(slug: string): Promise<BlogPostRow | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) return null
  return data as BlogPostRow
}

export async function getPostsByCategory(category: string): Promise<BlogPostRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as BlogPostRow[]
}

// ============================================================
// Admin reads
// ============================================================

export async function getAdminPosts(): Promise<BlogPostRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as BlogPostRow[]
}

export async function getAdminPost(id: string): Promise<BlogPostRow | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as BlogPostRow
}
