'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

  return { allowed: false, reason: 'Solo los compradores verificados pueden dejar resenas.' }
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesion para dejar una resena.' }
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
    return { error: 'Selecciona una puntuacion general de 1 a 5 estrellas.' }
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
  const { error } = await supabase
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

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya dejaste una resena para este producto.' }
    }
    return { error: 'No se pudo guardar la resena. Intenta de nuevo.' }
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
    return { error: 'No se pudo eliminar la resena.' }
  }

  revalidatePath(`/catalogo/${slug}`)
  return { success: true }
}
