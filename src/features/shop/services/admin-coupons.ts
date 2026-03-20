import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface Coupon {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  minimo_compra: number
  max_usos: number | null
  usos_actuales: number
  un_uso_por_usuario: boolean
  activo: boolean
  fecha_inicio: string
  fecha_fin: string | null
  created_at: string
}

export interface CouponDTO {
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  minimo_compra: number
  max_usos: number | null
  un_uso_por_usuario: boolean
  activo: boolean
  fecha_inicio: string
  fecha_fin: string | null
}

// ============================================================
// Queries
// ============================================================

export async function getCoupons(): Promise<Coupon[]> {
  const service = createServiceClient()
  const { data } = await service
    .from('cupones')
    .select('*')
    .order('created_at', { ascending: false })

  return (data ?? []) as Coupon[]
}

export async function getCoupon(id: string): Promise<Coupon | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('cupones')
    .select('*')
    .eq('id', id)
    .single()

  return (data as Coupon) ?? null
}

// ============================================================
// Mutations
// ============================================================

export async function createCoupon(dto: CouponDTO) {
  const service = createServiceClient()
  const { data, error } = await service
    .from('cupones')
    .insert({
      ...dto,
      codigo: dto.codigo.trim().toUpperCase(),
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un cupon con ese codigo' }
    return { error: error.message }
  }
  return { id: data!.id }
}

export async function updateCoupon(id: string, dto: Partial<CouponDTO>) {
  const service = createServiceClient()
  const updateData = { ...dto } as Record<string, unknown>
  if (dto.codigo) updateData.codigo = dto.codigo.trim().toUpperCase()

  const { error } = await service
    .from('cupones')
    .update(updateData)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un cupon con ese codigo' }
    return { error: error.message }
  }
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const service = createServiceClient()

  // Check if coupon has been used
  const { data: uses } = await service
    .from('cupon_usos')
    .select('id')
    .eq('cupon_id', id)
    .limit(1)

  if (uses && uses.length > 0) {
    // Don't delete, just deactivate
    const { error } = await service
      .from('cupones')
      .update({ activo: false })
      .eq('id', id)

    if (error) return { error: error.message }
    return { success: true, deactivated: true }
  }

  const { error } = await service
    .from('cupones')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
