import { createServiceClient } from '@/lib/supabase/server'

export type ArrepentimientoEstado =
  | 'pendiente'
  | 'en_proceso'
  | 'reembolsado'
  | 'rechazado'

export interface ArrepentimientoRow {
  id: string
  codigo: string
  nombre: string
  dni: string
  email: string
  telefono: string | null
  numero_pedido: string
  fecha_compra: string | null
  metodo_pago: string | null
  motivo: string | null
  compra_id: string | null
  estado: ArrepentimientoEstado
  nota_admin: string | null
  created_at: string
  processed_at: string | null
}

export async function getArrepentimientos(limit = 200): Promise<ArrepentimientoRow[]> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('arrepentimientos')
    .select(
      'id, codigo, nombre, dni, email, telefono, numero_pedido, fecha_compra, metodo_pago, motivo, compra_id, estado, nota_admin, created_at, processed_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as ArrepentimientoRow[]
}
