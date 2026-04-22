'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { sendLowRatingReviewEmail } from '@/lib/email/send-low-rating-review'

/** Ratings <= this value trigger an admin notification for proactive moderation. */
const LOW_RATING_THRESHOLD = 2

/** Check if user is admin or has purchased the product */
async function canReview(userId: string, productoId: string): Promise<{ allowed: boolean; reason?: string }> {
  const service = createServiceClient()

  // Check admin role
  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return { allowed: true }

  // Check purchase record
  const { data: compra } = await service
    .from('compras')
    .select('id')
    .eq('user_id', userId)
    .eq('producto_id', productoId)
    .maybeSingle()

  if (compra) return { allowed: true }

  return { allowed: false, reason: 'Solo los compradores verificados pueden dejar reseñas.' }
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debés iniciar sesión para dejar una reseña.' }
  }

  const productoId = formData.get('producto_id') as string
  const puntuacion = Number(formData.get('puntuacion'))
  const comodidad = Number(formData.get('comodidad')) || null
  const calidad = Number(formData.get('calidad')) || null
  const ajuste = Number(formData.get('ajuste')) || null
  const longitud = Number(formData.get('longitud')) || null
  const comentario = (formData.get('comentario') as string)?.trim() ?? ''
  const slug = formData.get('slug') as string

  if (!productoId || !puntuacion || puntuacion < 1 || puntuacion > 5) {
    return { error: 'Seleccioná una puntuación general de 1 a 5 estrellas.' }
  }

  if (comentario.length > 1000) {
    return { error: 'El comentario no puede superar los 1000 caracteres.' }
  }

  // Verify the user is allowed to review (admin or purchased)
  const check = await canReview(user.id, productoId)
  if (!check.allowed) {
    return { error: check.reason }
  }

  // Upsert: if the user already reviewed this product, update it
  const { data: upserted, error } = await supabase
    .from('resenas')
    .upsert(
      {
        producto_id: productoId,
        user_id: user.id,
        puntuacion,
        comodidad,
        calidad,
        ajuste,
        longitud,
        comentario,
      },
      { onConflict: 'user_id,producto_id' }
    )
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya dejaste una reseña para este producto.' }
    }
    return { error: 'No se pudo guardar la reseña. Intentá de nuevo.' }
  }

  // Best-effort: notificar al admin ante reseñas de puntuación baja para
  // moderar o contactar al cliente. Nunca bloquea la respuesta del usuario.
  if (upserted && puntuacion <= LOW_RATING_THRESHOLD) {
    void sendLowRatingReviewEmail({
      reviewId: upserted.id,
      productoId,
      userId: user.id,
      puntuacion,
      comodidad,
      calidad,
      ajuste,
      longitud,
      comentario,
    })
  }

  revalidatePath(`/catalogo/${slug}`)
  return { success: true }
}

export async function deleteReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado.' }
  }

  const reviewId = formData.get('review_id') as string
  const slug = formData.get('slug') as string

  const { error } = await supabase
    .from('resenas')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'No se pudo eliminar la reseña.' }
  }

  revalidatePath(`/catalogo/${slug}`)
  return { success: true }
}

/**
 * Admin-only: toggle a review's visibility.
 * Hidden reviews stop appearing on the public product page (RLS filters
 * `oculta = false`), but remain in the DB so the admin can un-hide later.
 */
export async function setReviewHidden(reviewId: string, hidden: boolean) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado.' }

  const service = createServiceClient()
  const { data, error } = await service
    .from('resenas')
    .update({ oculta: hidden })
    .eq('id', reviewId)
    .select('productos(slug)')
    .single()

  if (error) {
    return { error: 'No se pudo actualizar la reseña.' }
  }

  const productos = (data as { productos: { slug: string } | { slug: string }[] | null } | null)?.productos
  const slug = Array.isArray(productos) ? productos[0]?.slug : productos?.slug
  if (slug) revalidatePath(`/catalogo/${slug}`)
  revalidatePath('/admin/resenas')

  return { success: true }
}
