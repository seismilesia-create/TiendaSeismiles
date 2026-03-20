import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface InventoryOverview {
  totalUnidades: number
  productosActivos: number
  sinStock: number
  notificacionesPendientes: number
  valorInventario: number
  stockBajo: number
  coberturaPorcentaje: number
}

export interface StockByTalle {
  talle: string
  stock: number
  sinStock: number
  total: number
}

export interface StockByProducto {
  productoId: string
  nombre: string
  totalStock: number
  sinStockCount: number
  variantCount: number
  valorInventario: number
}

export interface StockHealthRow {
  productoId: string
  nombre: string
  totalStock: number
  ventasUltimos30d: number
  velocidadDiaria: number  // unidades/dia
  diasRestantes: number | null  // null = sin ventas (no se puede calcular)
}

export interface DemandInsight {
  productoNombre: string
  talle: string
  colorNombre: string
  colorHex: string
  requestCount: number
  oldestRequest: string
}

export interface CriticalAlert {
  varianteId: string
  type: 'sin_stock_con_demanda' | 'stock_bajo' | 'sin_stock'
  severity: 'critical' | 'warning' | 'info'
  message: string
  productoNombre: string
  talle: string
  colorNombre: string
  colorHex: string
  stock: number
  demandCount?: number
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

  const [variantsRes, productosRes, notifRes] = await Promise.all([
    supabase.from('variantes').select('stock, productos(precio, activo)'),
    supabase.from('productos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('stock_notifications').select('id', { count: 'exact', head: true }).eq('notificado', false),
  ])

  const rows = variantsRes.data ?? []
  type PJoin = { precio: number; activo: boolean }

  const totalUnidades = rows.reduce((sum, v) => sum + (v.stock ?? 0), 0)
  const valorInventario = rows.reduce((sum, v) => {
    const precio = Number((v.productos as unknown as PJoin)?.precio ?? 0)
    return sum + (v.stock ?? 0) * precio
  }, 0)
  const sinStock = rows.filter((v) => v.stock === 0).length
  const stockBajo = rows.filter((v) => v.stock > 0 && v.stock <= 3).length
  const coberturaPorcentaje = rows.length > 0
    ? Math.round(((rows.length - sinStock) / rows.length) * 100)
    : 100

  return {
    totalUnidades,
    productosActivos: productosRes.count ?? 0,
    sinStock,
    notificacionesPendientes: notifRes.count ?? 0,
    valorInventario,
    stockBajo,
    coberturaPorcentaje,
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

// ============================================================
// Stock distribution by size (for bar chart)
// ============================================================

const TALLE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export async function getStockByTalle(): Promise<StockByTalle[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('variantes')
    .select('talle, stock')

  if (error) throw error

  const byTalle = new Map<string, { stock: number; sinStock: number; total: number }>()

  for (const row of data ?? []) {
    const entry = byTalle.get(row.talle) ?? { stock: 0, sinStock: 0, total: 0 }
    entry.stock += row.stock ?? 0
    entry.total += 1
    if ((row.stock ?? 0) === 0) entry.sinStock += 1
    byTalle.set(row.talle, entry)
  }

  return TALLE_ORDER
    .filter((t) => byTalle.has(t))
    .map((t) => ({ talle: t, ...byTalle.get(t)! }))
}

// ============================================================
// Stock distribution by product (for donut chart)
// ============================================================

export async function getStockByProducto(): Promise<StockByProducto[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('variantes')
    .select('producto_id, stock, productos(nombre, precio)')

  if (error) throw error

  type PJoin = { nombre: string; precio: number }
  const byProduct = new Map<string, StockByProducto>()

  for (const row of data ?? []) {
    const id = row.producto_id
    const p = row.productos as unknown as PJoin
    const entry = byProduct.get(id) ?? {
      productoId: id,
      nombre: p?.nombre ?? 'Eliminado',
      totalStock: 0,
      sinStockCount: 0,
      variantCount: 0,
      valorInventario: 0,
    }
    const stock = row.stock ?? 0
    entry.totalStock += stock
    entry.variantCount += 1
    if (stock === 0) entry.sinStockCount += 1
    entry.valorInventario += stock * Number(p?.precio ?? 0)
    byProduct.set(id, entry)
  }

  return Array.from(byProduct.values()).sort((a, b) => b.totalStock - a.totalStock)
}

// ============================================================
// Demand insights (from stock_notifications)
// ============================================================

export async function getDemandInsights(): Promise<DemandInsight[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('stock_notifications')
    .select('producto_id, talle, color_id, created_at, productos(nombre), colores(nombre, hex)')
    .eq('notificado', false)

  if (error) throw error

  type PJoin = { nombre: string }
  type CJoin = { nombre: string; hex: string }

  const grouped = new Map<string, DemandInsight>()

  for (const row of data ?? []) {
    const key = `${row.producto_id}-${row.talle}-${row.color_id}`
    const existing = grouped.get(key)
    const p = row.productos as unknown as PJoin
    const c = row.colores as unknown as CJoin

    if (existing) {
      existing.requestCount += 1
      if (row.created_at < existing.oldestRequest) {
        existing.oldestRequest = row.created_at
      }
    } else {
      grouped.set(key, {
        productoNombre: p?.nombre ?? 'Eliminado',
        talle: row.talle,
        colorNombre: c?.nombre ?? '',
        colorHex: c?.hex ?? '#ccc',
        requestCount: 1,
        oldestRequest: row.created_at,
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.requestCount - a.requestCount)
}

// ============================================================
// Critical alerts (prioritized list)
// ============================================================

export async function getCriticalAlerts(): Promise<CriticalAlert[]> {
  const supabase = createServiceClient()

  const [variantsRes, notifsRes] = await Promise.all([
    supabase
      .from('variantes')
      .select('id, producto_id, color_id, talle, stock, productos(nombre), colores(nombre, hex)')
      .or('stock.eq.0,stock.lte.3'),
    supabase
      .from('stock_notifications')
      .select('producto_id, talle, color_id')
      .eq('notificado', false),
  ])

  type PJoin = { nombre: string }
  type CJoin = { nombre: string; hex: string }

  // Count demand per variant key
  const demandMap = new Map<string, number>()
  for (const n of notifsRes.data ?? []) {
    const key = `${n.producto_id}-${n.talle}-${n.color_id}`
    demandMap.set(key, (demandMap.get(key) ?? 0) + 1)
  }

  const alerts: CriticalAlert[] = []

  for (const v of variantsRes.data ?? []) {
    const p = v.productos as unknown as PJoin
    const c = v.colores as unknown as CJoin
    const key = `${v.producto_id}-${v.talle}-${v.color_id}`
    const demand = demandMap.get(key) ?? 0
    const stock = v.stock ?? 0

    if (stock === 0 && demand > 0) {
      alerts.push({
        varianteId: v.id,
        type: 'sin_stock_con_demanda',
        severity: 'critical',
        message: `Sin stock — ${demand} cliente${demand > 1 ? 's' : ''} esperando`,
        productoNombre: p?.nombre ?? 'Eliminado',
        talle: v.talle,
        colorNombre: c?.nombre ?? '',
        colorHex: c?.hex ?? '#ccc',
        stock: 0,
        demandCount: demand,
      })
    } else if (stock > 0 && stock <= 3) {
      alerts.push({
        varianteId: v.id,
        type: 'stock_bajo',
        severity: 'warning',
        message: `Solo ${stock} unidad${stock > 1 ? 'es' : ''}`,
        productoNombre: p?.nombre ?? 'Eliminado',
        talle: v.talle,
        colorNombre: c?.nombre ?? '',
        colorHex: c?.hex ?? '#ccc',
        stock,
      })
    } else if (stock === 0) {
      alerts.push({
        varianteId: v.id,
        type: 'sin_stock',
        severity: 'info',
        message: 'Sin stock',
        productoNombre: p?.nombre ?? 'Eliminado',
        talle: v.talle,
        colorNombre: c?.nombre ?? '',
        colorHex: c?.hex ?? '#ccc',
        stock: 0,
      })
    }
  }

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return alerts.slice(0, 10)
}

// ============================================================
// Stock health: velocity + days remaining per product
// ============================================================

export async function getStockHealth(): Promise<StockHealthRow[]> {
  const supabase = createServiceClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [variantsRes, salesRes] = await Promise.all([
    supabase
      .from('variantes')
      .select('producto_id, stock, productos(nombre)')
      .order('producto_id'),
    supabase
      .from('compras')
      .select('producto_id, cantidad')
      .in('estado', ['confirmado', 'en_preparacion', 'enviado', 'entregado'])
      .gte('created_at', thirtyDaysAgo),
  ])

  type PJoin = { nombre: string }

  // Aggregate sales by product
  const salesMap = new Map<string, number>()
  for (const row of salesRes.data ?? []) {
    salesMap.set(row.producto_id, (salesMap.get(row.producto_id) ?? 0) + row.cantidad)
  }

  // Aggregate stock by product
  const stockMap = new Map<string, { nombre: string; totalStock: number }>()
  for (const row of variantsRes.data ?? []) {
    const id = row.producto_id
    const p = row.productos as unknown as PJoin
    const entry = stockMap.get(id) ?? { nombre: p?.nombre ?? 'Eliminado', totalStock: 0 }
    entry.totalStock += row.stock ?? 0
    stockMap.set(id, entry)
  }

  const results: StockHealthRow[] = []

  for (const [productoId, { nombre, totalStock }] of stockMap) {
    const ventasUltimos30d = salesMap.get(productoId) ?? 0
    const velocidadDiaria = ventasUltimos30d / 30

    results.push({
      productoId,
      nombre,
      totalStock,
      ventasUltimos30d,
      velocidadDiaria: Math.round(velocidadDiaria * 10) / 10,
      diasRestantes: velocidadDiaria > 0
        ? Math.round(totalStock / velocidadDiaria)
        : null,
    })
  }

  // Sort: lowest days remaining first (most urgent), nulls last
  results.sort((a, b) => {
    if (a.diasRestantes === null && b.diasRestantes === null) return b.totalStock - a.totalStock
    if (a.diasRestantes === null) return 1
    if (b.diasRestantes === null) return -1
    return a.diasRestantes - b.diasRestantes
  })

  return results
}
