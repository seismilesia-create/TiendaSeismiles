'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleFavorite(productId: string, productSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesion para guardar favoritos.' }
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favoritos')
    .select('id')
    .eq('user_id', user.id)
    .eq('producto_id', productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: 'No se pudo quitar de favoritos.' }

    revalidatePath('/catalogo')
    revalidatePath(`/catalogo/${productSlug}`)
    revalidatePath('/perfil/favoritos')
    return { favorited: false }
  } else {
    const { error } = await supabase
      .from('favoritos')
      .insert({ user_id: user.id, producto_id: productId })

    if (error) return { error: 'No se pudo agregar a favoritos.' }

    revalidatePath('/catalogo')
    revalidatePath(`/catalogo/${productSlug}`)
    revalidatePath('/perfil/favoritos')
    return { favorited: true }
  }
}
