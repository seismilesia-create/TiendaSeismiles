import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface GiftCardDef {
  id: string
  titulo: string
  precio: number
  descripcion: string
  gradient_from: string
  gradient_to: string
  imagen_url: string | null
  activo: boolean
  orden: number
  created_at: string
  updated_at: string
}

export interface GiftCardDefDTO {
  titulo: string
  precio: number
  descripcion: string
  gradient_from: string
  gradient_to: string
  activo: boolean
  orden: number
}

// ============================================================
// Queries
// ============================================================

/** All definitions (admin) — includes inactive */
export async function getGiftCardDefinitions(): Promise<GiftCardDef[]> {
  const service = createServiceClient()
  const { data } = await service
    .from('gift_card_definitions')
    .select('*')
    .order('orden', { ascending: true })

  return (data ?? []) as GiftCardDef[]
}

/** Active definitions only (public page) */
export async function getActiveGiftCardDefinitions(): Promise<GiftCardDef[]> {
  const service = createServiceClient()
  const { data } = await service
    .from('gift_card_definitions')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  return (data ?? []) as GiftCardDef[]
}

/** Single definition by ID */
export async function getGiftCardDefinition(id: string): Promise<GiftCardDef | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('gift_card_definitions')
    .select('*')
    .eq('id', id)
    .single()

  return (data as GiftCardDef) ?? null
}

// ============================================================
// Mutations
// ============================================================

export async function createGiftCardDefinition(dto: GiftCardDefDTO) {
  const service = createServiceClient()
  const { data, error } = await service
    .from('gift_card_definitions')
    .insert(dto)
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: data!.id }
}

export async function updateGiftCardDefinition(id: string, dto: Partial<GiftCardDefDTO>) {
  const service = createServiceClient()
  const { error } = await service
    .from('gift_card_definitions')
    .update({ ...dto, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteGiftCardDefinition(id: string) {
  const service = createServiceClient()
  const { error } = await service
    .from('gift_card_definitions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadGiftCardImage(
  defId: string,
  fileBuffer: ArrayBuffer,
  ext: string,
  contentType: string,
): Promise<{ url: string }> {
  const service = createServiceClient()
  const storagePath = `gift-cards/${defId}-${Date.now()}.${ext}`

  const { error: uploadError } = await service.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, { contentType, upsert: false })

  if (uploadError) throw uploadError

  const { data: urlData } = service.storage
    .from('product-images')
    .getPublicUrl(storagePath)

  await service
    .from('gift_card_definitions')
    .update({ imagen_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', defId)

  return { url: urlData.publicUrl }
}
