'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

interface ValidateResult {
  valid: boolean
  giftCardId?: string
  monto?: number
  saldo_restante?: number
  titulo?: string
  error?: string
}

export async function validateGiftCardCode(codigo: string): Promise<ValidateResult> {
  if (!codigo?.trim()) return { valid: false, error: 'Ingresa un codigo de gift card' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { valid: false, error: 'Debes iniciar sesion' }

  const service = createServiceClient()

  const { data: gc } = await service
    .from('gift_cards')
    .select('id, monto, saldo_restante, titulo, estado')
    .eq('codigo', codigo.trim().toUpperCase())
    .single()

  if (!gc) return { valid: false, error: 'Codigo de gift card no encontrado' }

  if (gc.estado !== 'activa') {
    return { valid: false, error: 'Esta gift card no esta activa' }
  }

  if (!gc.saldo_restante || gc.saldo_restante <= 0) {
    return { valid: false, error: 'Esta gift card no tiene saldo disponible' }
  }

  return {
    valid: true,
    giftCardId: gc.id,
    monto: gc.monto,
    saldo_restante: gc.saldo_restante,
    titulo: gc.titulo,
  }
}
