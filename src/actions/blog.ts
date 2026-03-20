'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

// ── Admin CRUD: Blog posts ──

export async function createBlogPost(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const title = (formData.get('title') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const cover_image_url = (formData.get('cover_image_url') as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim() || 'general'
  const author_name = (formData.get('author_name') as string)?.trim() || 'Seismiles'

  if (!title || !slug || !excerpt || !content) {
    return { error: 'Titulo, slug, extracto y contenido son obligatorios.' }
  }

  const service = createServiceClient()
  const { error } = await service.from('blog_posts').insert({
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    category,
    author_name,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un articulo con ese slug.' }
    return { error: 'No se pudo crear el articulo.' }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

export async function updateBlogPost(id: string, formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const title = (formData.get('title') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const cover_image_url = (formData.get('cover_image_url') as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim() || 'general'
  const author_name = (formData.get('author_name') as string)?.trim() || 'Seismiles'
  const is_published = formData.get('is_published') === 'true'

  if (!title || !slug || !excerpt || !content) {
    return { error: 'Titulo, slug, extracto y contenido son obligatorios.' }
  }

  const service = createServiceClient()

  // If publishing for the first time, set published_at
  const { data: existing } = await service
    .from('blog_posts')
    .select('is_published, published_at')
    .eq('id', id)
    .single()

  const published_at = is_published && !existing?.published_at
    ? new Date().toISOString()
    : existing?.published_at

  const { error } = await service
    .from('blog_posts')
    .update({
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      category,
      author_name,
      is_published,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un articulo con ese slug.' }
    return { error: 'No se pudo actualizar el articulo.' }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

export async function deleteBlogPost(id: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { error } = await service.from('blog_posts').delete().eq('id', id)

  if (error) return { error: 'No se pudo eliminar el articulo.' }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

export async function togglePublishPost(id: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const service = createServiceClient()
  const { data: post } = await service
    .from('blog_posts')
    .select('is_published, published_at')
    .eq('id', id)
    .single()

  if (!post) return { error: 'Articulo no encontrado.' }

  const is_published = !post.is_published
  const published_at = is_published && !post.published_at
    ? new Date().toISOString()
    : post.published_at

  const { error } = await service
    .from('blog_posts')
    .update({ is_published, published_at, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'No se pudo cambiar el estado.' }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}
