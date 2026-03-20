'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/features/shop/services/admin-coupons'

function revalidateCoupons() {
  revalidatePath('/admin/cupones')
}

export async function createCouponAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const codigo = formData.get('codigo') as string
  const tipo = formData.get('tipo') as string
  const valor = Number(formData.get('valor'))
  const minimo_compra = Number(formData.get('minimo_compra') || 0)
  const max_usos_raw = formData.get('max_usos') as string
  const max_usos = max_usos_raw ? Number(max_usos_raw) : null
  const un_uso_por_usuario = formData.get('un_uso_por_usuario') === 'true'
  const activo = formData.get('activo') === 'true'
  const fecha_inicio = (formData.get('fecha_inicio') as string) || new Date().toISOString()
  const fecha_fin_raw = formData.get('fecha_fin') as string
  const fecha_fin = fecha_fin_raw || null

  if (!codigo || !tipo || !valor) {
    return { error: 'Codigo, tipo y valor son requeridos' }
  }

  if (tipo !== 'porcentaje' && tipo !== 'monto_fijo') {
    return { error: 'Tipo debe ser porcentaje o monto_fijo' }
  }

  if (tipo === 'porcentaje' && (valor <= 0 || valor > 100)) {
    return { error: 'El porcentaje debe estar entre 1 y 100' }
  }

  const result = await createCoupon({
    codigo,
    tipo,
    valor,
    minimo_compra,
    max_usos,
    un_uso_por_usuario,
    activo,
    fecha_inicio,
    fecha_fin,
  })

  revalidateCoupons()
  return result
}

export async function updateCouponAction(id: string, formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const codigo = formData.get('codigo') as string
  const tipo = formData.get('tipo') as string
  const valor = Number(formData.get('valor'))
  const minimo_compra = Number(formData.get('minimo_compra') || 0)
  const max_usos_raw = formData.get('max_usos') as string
  const max_usos = max_usos_raw ? Number(max_usos_raw) : null
  const un_uso_por_usuario = formData.get('un_uso_por_usuario') === 'true'
  const activo = formData.get('activo') === 'true'
  const fecha_inicio = (formData.get('fecha_inicio') as string) || new Date().toISOString()
  const fecha_fin_raw = formData.get('fecha_fin') as string
  const fecha_fin = fecha_fin_raw || null

  if (!codigo || !tipo || !valor) {
    return { error: 'Codigo, tipo y valor son requeridos' }
  }

  if (tipo === 'porcentaje' && (valor <= 0 || valor > 100)) {
    return { error: 'El porcentaje debe estar entre 1 y 100' }
  }

  const result = await updateCoupon(id, {
    codigo,
    tipo: tipo as 'porcentaje' | 'monto_fijo',
    valor,
    minimo_compra,
    max_usos,
    un_uso_por_usuario,
    activo,
    fecha_inicio,
    fecha_fin,
  })

  revalidateCoupons()
  return result
}

export async function deleteCouponAction(id: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const result = await deleteCoupon(id)
  revalidateCoupons()
  return result
}
