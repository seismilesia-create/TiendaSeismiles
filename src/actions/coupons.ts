'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

interface ValidateCouponResult {
  valid: boolean
  couponId?: string
  tipo?: 'porcentaje' | 'monto_fijo'
  valor?: number
  descuento?: number
  error?: string
}

export async function validateCouponCode(
  code: string,
  subtotal: number
): Promise<ValidateCouponResult> {
  if (!code.trim()) return { valid: false, error: 'Ingresa un codigo' }

  const service = createServiceClient()
  const normalizedCode = code.trim().toUpperCase()

  // Fetch coupon
  const { data: coupon, error: fetchErr } = await service
    .from('cupones')
    .select('*')
    .eq('codigo', normalizedCode)
    .single()

  if (fetchErr || !coupon) {
    return { valid: false, error: 'Codigo de descuento invalido' }
  }

  // Check active
  if (!coupon.activo) {
    return { valid: false, error: 'Este cupon ya no esta activo' }
  }

  // Check date range
  const now = new Date()
  if (coupon.fecha_inicio && new Date(coupon.fecha_inicio) > now) {
    return { valid: false, error: 'Este cupon aun no esta vigente' }
  }
  if (coupon.fecha_fin && new Date(coupon.fecha_fin) < now) {
    return { valid: false, error: 'Este cupon ya vencio' }
  }

  // Check max uses
  if (coupon.max_usos !== null && coupon.usos_actuales >= coupon.max_usos) {
    return { valid: false, error: 'Este cupon ya alcanzo su limite de usos' }
  }

  // Check per-user usage
  if (coupon.un_uso_por_usuario) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: usage } = await service
        .from('cupon_usos')
        .select('id')
        .eq('cupon_id', coupon.id)
        .eq('user_id', user.id)
        .limit(1)

      if (usage && usage.length > 0) {
        return { valid: false, error: 'Ya usaste este cupon' }
      }
    }
  }

  // Check minimum purchase
  if (coupon.minimo_compra > 0 && subtotal < Number(coupon.minimo_compra)) {
    return {
      valid: false,
      error: `Minimo de compra: $${Number(coupon.minimo_compra).toLocaleString('es-AR')}`,
    }
  }

  // Calculate discount
  const tipo = coupon.tipo as 'porcentaje' | 'monto_fijo'
  const valor = Number(coupon.valor)
  const descuento = tipo === 'porcentaje'
    ? Math.round(subtotal * valor / 100)
    : Math.min(valor, subtotal)

  return {
    valid: true,
    couponId: coupon.id,
    tipo,
    valor,
    descuento,
  }
}
