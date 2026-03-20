import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface MonthlyRevenue {
  month: number
  monthName: string
  revenue: number
  orders: number
  units: number
}

export interface RevenueSummary {
  today: number
  thisWeek: number
  thisMonth: number
  lastMonth: number
  monthChange: number // percentage change vs last month
  totalYear: number
  totalOrders: number
}

export interface TopProduct {
  producto_id: string
  nombre: string
  totalRevenue: number
  totalUnits: number
  totalOrders: number
}

export interface RecentOrder {
  id: string
  created_at: string
  producto_nombre: string
  user_email: string
  cantidad: number
  total: number
  metodo_pago: string
  estado: string
  numero_seguimiento: string | null
}

// ============================================================
// Month names in Spanish
// ============================================================

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

// ============================================================
// Revenue by month for a given year
// ============================================================

export async function getRevenueByMonth(year: number): Promise<MonthlyRevenue[]> {
  const supabase = createServiceClient()

  const startDate = `${year}-01-01T00:00:00`
  const endDate = `${year + 1}-01-01T00:00:00`

  const { data, error } = await supabase
    .from('compras')
    .select('created_at, total, cantidad')
    .in('estado', ['confirmado', 'en_preparacion', 'enviado', 'entregado'])
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) throw error

  // Aggregate by month in JS
  const byMonth = new Map<number, { revenue: number; orders: number; units: number }>()

  for (const row of data ?? []) {
    const month = new Date(row.created_at).getMonth() // 0-indexed
    const entry = byMonth.get(month) ?? { revenue: 0, orders: 0, units: 0 }
    entry.revenue += Number(row.total)
    entry.orders += 1
    entry.units += Number(row.cantidad)
    byMonth.set(month, entry)
  }

  // Return all 12 months (fill empty months with 0)
  return Array.from({ length: 12 }, (_, i) => {
    const entry = byMonth.get(i)
    return {
      month: i + 1,
      monthName: MONTH_NAMES[i],
      revenue: entry?.revenue ?? 0,
      orders: entry?.orders ?? 0,
      units: entry?.units ?? 0,
    }
  })
}

// ============================================================
// Available years (for year selector)
// ============================================================

export async function getAvailableYears(): Promise<number[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('compras')
    .select('created_at')
    .in('estado', ['confirmado', 'en_preparacion', 'enviado', 'entregado'])
    .order('created_at', { ascending: true })
    .limit(1)

  if (error || !data?.length) return [new Date().getFullYear()]

  const firstYear = new Date(data[0].created_at).getFullYear()
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= firstYear; y--) {
    years.push(y)
  }
  return years
}

// ============================================================
// Revenue summary (KPIs)
// ============================================================

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const supabase = createServiceClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Start of this week (Monday)
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset).toISOString()

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()

  // Fetch all completed orders for the year
  const { data, error } = await supabase
    .from('compras')
    .select('created_at, total, cantidad')
    .in('estado', ['confirmado', 'en_preparacion', 'enviado', 'entregado'])
    .gte('created_at', lastMonthStart)

  if (error) throw error

  let today = 0
  let thisWeek = 0
  let thisMonth = 0
  let lastMonth = 0
  let totalOrders = 0

  for (const row of data ?? []) {
    const amount = Number(row.total)
    const date = row.created_at

    if (date >= todayStart) today += amount
    if (date >= weekStart) thisWeek += amount
    if (date >= thisMonthStart) {
      thisMonth += amount
      totalOrders++
    } else if (date >= lastMonthStart) {
      lastMonth += amount
    }
  }

  // Get total year revenue separately
  const { data: yearData } = await supabase
    .from('compras')
    .select('total')
    .in('estado', ['confirmado', 'en_preparacion', 'enviado', 'entregado'])
    .gte('created_at', yearStart)

  const totalYear = (yearData ?? []).reduce((sum, r) => sum + Number(r.total), 0)

  const monthChange = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : thisMonth > 0 ? 100 : 0

  return { today, thisWeek, thisMonth, lastMonth, monthChange, totalYear, totalOrders }
}

// ============================================================
// Top products by revenue
// ============================================================

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = createServiceClient()

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()

  const { data, error } = await supabase
    .from('compras')
    .select('producto_id, total, cantidad, productos(nombre)')
    .in('estado', ['confirmado', 'en_preparacion', 'enviado', 'entregado'])
    .gte('created_at', yearStart)

  if (error) throw error

  // Aggregate by product
  const byProduct = new Map<string, TopProduct>()

  for (const row of data ?? []) {
    const id = row.producto_id
    const entry = byProduct.get(id) ?? {
      producto_id: id,
      nombre: (row.productos as unknown as { nombre: string })?.nombre ?? 'Producto eliminado',
      totalRevenue: 0,
      totalUnits: 0,
      totalOrders: 0,
    }
    entry.totalRevenue += Number(row.total)
    entry.totalUnits += Number(row.cantidad)
    entry.totalOrders += 1
    byProduct.set(id, entry)
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
}

// ============================================================
// Recent orders
// ============================================================

export async function getRecentOrders(limit = 10): Promise<RecentOrder[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('compras')
    .select('id, created_at, cantidad, total, metodo_pago, estado, numero_seguimiento, productos(nombre), profiles(email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    created_at: row.created_at,
    producto_nombre: (row.productos as unknown as { nombre: string })?.nombre ?? 'Eliminado',
    user_email: (row.profiles as unknown as { email: string })?.email ?? 'Sin email',
    cantidad: row.cantidad,
    total: Number(row.total),
    metodo_pago: row.metodo_pago ?? 'efectivo',
    estado: row.estado,
    numero_seguimiento: row.numero_seguimiento ?? null,
  }))
}
