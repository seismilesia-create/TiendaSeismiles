import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface OrderListItem {
  id: string
  numero_pedido: string
  created_at: string
  producto_nombre: string
  cantidad: number
  total: number
  estado: string
}

export interface OrderDetail {
  id: string
  numero_pedido: string
  created_at: string
  cantidad: number
  precio_unitario: number
  total: number
  metodo_pago: string
  estado: string
  notas: string | null
  producto: {
    nombre: string
    slug: string
  }
  color: {
    nombre: string
    hex: string
  } | null
  talle: string | null
  imagen_url: string | null
}

// ============================================================
// Get all orders for a user
// ============================================================

export async function getMyOrders(userId: string): Promise<OrderListItem[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('compras')
    .select('id, numero_pedido, created_at, cantidad, total, estado, productos(nombre)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    numero_pedido: row.numero_pedido,
    created_at: row.created_at,
    producto_nombre: (row.productos as unknown as { nombre: string })?.nombre ?? 'Producto eliminado',
    cantidad: row.cantidad,
    total: Number(row.total),
    estado: row.estado,
  }))
}

// ============================================================
// Get single order detail
// ============================================================

export async function getOrderDetail(userId: string, orderId: string): Promise<OrderDetail | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('compras')
    .select('id, numero_pedido, created_at, cantidad, precio_unitario, total, metodo_pago, estado, notas, producto_id, variante_id, productos(nombre, slug), variantes(talle, color_id, colores(nombre, hex))')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  const producto = data.productos as unknown as { nombre: string; slug: string }
  const variante = data.variantes as unknown as { talle: string; color_id: string; colores: { nombre: string; hex: string } } | null

  // Get first image for the color
  let imagen_url: string | null = null
  if (variante?.color_id) {
    const { data: img } = await supabase
      .from('imagenes')
      .select('url')
      .eq('color_id', variante.color_id)
      .order('orden', { ascending: true })
      .limit(1)
      .single()
    imagen_url = img?.url ?? null
  }

  return {
    id: data.id,
    numero_pedido: data.numero_pedido,
    created_at: data.created_at,
    cantidad: data.cantidad,
    precio_unitario: Number(data.precio_unitario),
    total: Number(data.total),
    metodo_pago: data.metodo_pago ?? 'efectivo',
    estado: data.estado,
    notas: data.notas,
    producto: {
      nombre: producto?.nombre ?? 'Producto eliminado',
      slug: producto?.slug ?? '',
    },
    color: variante?.colores ? {
      nombre: variante.colores.nombre,
      hex: variante.colores.hex,
    } : null,
    talle: variante?.talle ?? null,
    imagen_url,
  }
}
