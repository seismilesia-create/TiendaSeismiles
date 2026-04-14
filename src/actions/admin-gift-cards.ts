'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { validateImageUpload } from '@/lib/uploads/validate-image'
import {
  createGiftCardDefinition,
  updateGiftCardDefinition,
  deleteGiftCardDefinition,
  uploadGiftCardImage,
} from '@/features/shop/services/admin-gift-cards'

function revalidateGiftCards() {
  revalidatePath('/admin/gift-cards')
  revalidatePath('/giftcards')
}

export async function createGiftCardDefAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const titulo = formData.get('titulo') as string
  const precio = Number(formData.get('precio'))
  const descripcion = formData.get('descripcion') as string
  const gradient_from = formData.get('gradient_from') as string
  const gradient_to = formData.get('gradient_to') as string
  const activo = formData.get('activo') === 'true'
  const orden = Number(formData.get('orden') || 0)

  if (!titulo || !precio || !descripcion) {
    return { error: 'Titulo, precio y descripcion son requeridos' }
  }

  const result = await createGiftCardDefinition({
    titulo,
    precio,
    descripcion,
    gradient_from: gradient_from || '#8B7355',
    gradient_to: gradient_to || '#6B5B45',
    activo,
    orden,
  })

  revalidateGiftCards()
  return result
}

export async function updateGiftCardDefAction(id: string, formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const titulo = formData.get('titulo') as string
  const precio = Number(formData.get('precio'))
  const descripcion = formData.get('descripcion') as string
  const gradient_from = formData.get('gradient_from') as string
  const gradient_to = formData.get('gradient_to') as string
  const activo = formData.get('activo') === 'true'
  const orden = Number(formData.get('orden') || 0)

  if (!titulo || !precio || !descripcion) {
    return { error: 'Titulo, precio y descripcion son requeridos' }
  }

  const result = await updateGiftCardDefinition(id, {
    titulo,
    precio,
    descripcion,
    gradient_from,
    gradient_to,
    activo,
    orden,
  })

  revalidateGiftCards()
  return result
}

export async function deleteGiftCardDefAction(id: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const result = await deleteGiftCardDefinition(id)
  revalidateGiftCards()
  return result
}

export async function uploadGiftCardImageAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const file = formData.get('file') as File
  const defId = formData.get('def_id') as string

  if (!file || !defId) return { error: 'Archivo y gift card requeridos' }

  const validation = await validateImageUpload(file)
  if (!validation.ok) return { error: validation.error }

  try {
    const { buffer, ext, contentType } = validation.image
    const { url } = await uploadGiftCardImage(defId, buffer, ext, contentType)
    revalidateGiftCards()
    return { success: true, url }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
