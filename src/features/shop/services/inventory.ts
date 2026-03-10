import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface InventoryOverview {
  totalUnidades: number
  productosActivos: number
  sinStock: number
  notificacionesPendientes: number
}

export interface VariantWithProduct {
  id: string
  producto_id: string
  producto_nombre: string
  producto_precio: number
  color_id: string
  color_nombre: string
  color_hex: string
  talle: string
  stock: number
}

export interface StockNotificationRow {
  id: string
  email: string
  producto_id: string
  producto_nombre: string
  talle: string
  color_id: string
  color_nombre: string
  color_hex: string
  notificado: boolean
  created_at: string
  notificado_at: string | null
}

// ============================================================
// Inventory overview (KPIs)
// ============================================================

export async function getInventoryOverview(): Promise<InventoryOverview> {
  const supabase = createServiceClient()

  const [variantsRes, productosRes, sinStockRes, notifRes] = await Promise.all([
    supabase.from('variantes').select('stock'),
    supabase.from('productos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('variantes').select('id', { count: 'exact', head: true }).eq('stock', 0),
    supabase.from('stock_notifications').select('id', { count: 'exact', head: true }).eq('notificado', false),
  ])

  const totalUnidades = (variantsRes.data ?? []).reduce((sum, v) => sum + (v.stock ?? 0), 0)

  return {
    totalUnidades,
    productosActivos: productosRes.count ?? 0,
    sinStock: sinStockRes.count ?? 0,
    notificacionesPendientes: notifRes.count ?? 0,
  }
}

// ============================================================
// All variants with product and color info
// ============================================================

export async function getAllVariantsWithProducts(): Promise<VariantWithProduct[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('variantes')
    .select('id, producto_id, color_id, talle, stock, productos(nombre, precio), colores(nombre, hex)')
    .order('producto_id')

  if (error) throw error

  type ProductoJoin = { nombre: string; precio: number }
  type ColorJoin = { nombre: string; hex: string }

  return (data ?? []).map((row) => ({
    id: row.id,
    producto_id: row.producto_id,
    producto_nombre: (row.productos as unknown as ProductoJoin)?.nombre ?? 'Eliminado',
    producto_precio: (row.productos as unknown as ProductoJoin)?.precio ?? 0,
    color_id: row.color_id,
    color_nombre: (row.colores as unknown as ColorJoin)?.nombre ?? '',
    color_hex: (row.colores as unknown as ColorJoin)?.hex ?? '#ccc',
    talle: row.talle,
    stock: row.stock ?? 0,
  }))
}

// ============================================================
// Stock notifications
// ============================================================

export async function getPendingStockNotifications(): Promise<StockNotificationRow[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('stock_notifications')
    .select('id, email, producto_id, talle, color_id, notificado, created_at, notificado_at, productos(nombre), colores(nombre, hex)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    producto_id: row.producto_id,
    producto_nombre: (row.productos as unknown as { nombre: string })?.nombre ?? 'Eliminado',
    talle: row.talle,
    color_id: row.color_id,
    color_nombre: (row.colores as unknown as { nombre: string; hex: string })?.nombre ?? '',
    color_hex: (row.colores as unknown as { nombre: string; hex: string })?.hex ?? '#ccc',
    notificado: row.notificado ?? false,
    created_at: row.created_at,
    notificado_at: row.notificado_at,
  }))
}

// ============================================================
// Update single variant stock
// ============================================================

export async function updateVariantStock(varianteId: string, newStock: number): Promise<{ oldStock: number }> {
  const supabase = createServiceClient()

  const { data: old, error: readErr } = await supabase
    .from('variantes')
    .select('stock')
    .eq('id', varianteId)
    .single()

  if (readErr || !old) throw new Error('Variante no encontrada')

  const { error } = await supabase
    .from('variantes')
    .update({ stock: newStock })
    .eq('id', varianteId)

  if (error) throw error
  return { oldStock: old.stock }
}
