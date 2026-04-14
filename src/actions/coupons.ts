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
  if (!code.trim()) return { valid: false, error: 'Ingresá un código' }

  const service = createServiceClient()
  const normalizedCode = code.trim().toUpperCase()

  // Fetch coupon
  const { data: coupon, error: fetchErr } = await service
    .from('cupones')
    .select('*')
    .eq('codigo', normalizedCode)
    .single()

  if (fetchErr || !coupon) {
    return { valid: false, error: 'Código de descuento inválido' }
  }

  // Check active
  if (!coupon.activo) {
    return { valid: false, error: 'Este cupón ya no está activo' }
  }

  // Check date range
  const now = new Date()
  if (coupon.fecha_inicio && new Date(coupon.fecha_inicio) > now) {
    return { valid: false, error: 'Este cupón aún no está vigente' }
  }
  if (coupon.fecha_fin && new Date(coupon.fecha_fin) < now) {
    return { valid: false, error: 'Este cupón ya venció' }
  }

  // Check max uses — authoritative count from cupon_usos rather than the
  // denormalized `usos_actuales` counter, which can drift under races and
  // after cancellations.
  if (coupon.max_usos !== null) {
    const { count: usosActuales } = await service
      .from('cupon_usos')
      .select('id', { count: 'exact', head: true })
      .eq('cupon_id', coupon.id)
    if ((usosActuales ?? 0) >= coupon.max_usos) {
      return { valid: false, error: 'Este cupón ya alcanzó su límite de usos' }
    }
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
        return { valid: false, error: 'Ya usaste este cupón' }
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
