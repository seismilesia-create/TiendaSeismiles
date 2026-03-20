import { createClient } from '@supabase/supabase-js'
import { shopConfig } from '../config'
import { type Season, getSeasonCategoryPriority } from '../utils/season'

/** Client anonimo sin cookies - seguro para Server Components y build estatico */
function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── Types ──

export interface ProductLineRow {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  image_url: string | null
}

export interface FeaturedProductFromDB {
  id: string
  nombre: string
  slug: string
  precio: number
  linea: string
  colores: { imagen_url: string | null }[]
}

/** Fetch productos destacados activos con la primera imagen de color */
export async function getFeaturedProducts(): Promise<FeaturedProductFromDB[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, slug, precio, linea,
        colores(imagen_url)
      `)
      .eq('destacado', true)
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) throw error
    return (data ?? []) as FeaturedProductFromDB[]
  } catch {
    return []
  }
}

// ── Catalog types ──

export interface CatalogProductFromDB {
  id: string
  nombre: string
  slug: string
  precio: number
  categoria: string
  linea: string
  genero: string
  destacado: boolean
  created_at: string
  colores: { nombre: string; hex: string; imagen_url: string | null }[]
  variantes: { talle: string }[]
}

/** Fetch most viewed products (excludes a given product) */
export async function getMostViewedProducts(excludeId?: string, limit = 4): Promise<CatalogProductFromDB[]> {
  try {
    const supabase = createAnonClient()
    let query = supabase
      .from('productos')
      .select(`
        id, nombre, slug, precio, categoria, linea, genero, destacado, created_at,
        colores(nombre, hex, imagen_url),
        variantes(talle)
      `)
      .eq('activo', true)
      .order('visualizaciones', { ascending: false })
      .limit(limit + 1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []).slice(0, limit) as CatalogProductFromDB[]
  } catch {
    return []
  }
}

/** Fetch featured products prioritized by season */
export async function getSeasonalFeaturedProducts(season: Season, limit = 4): Promise<CatalogProductFromDB[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, slug, precio, categoria, linea, genero, destacado, created_at,
        colores(nombre, hex, imagen_url),
        variantes(talle)
      `)
      .eq('activo', true)
      .order('visualizaciones', { ascending: false })
      .limit(limit * 3)

    if (error) throw error
    if (!data || data.length === 0) return []

    const products = data as CatalogProductFromDB[]
    const priority = getSeasonCategoryPriority(season)

    // Sort: seasonal categories first, then by original view order
    products.sort((a, b) => {
      const aPriority = priority.indexOf(a.categoria)
      const bPriority = priority.indexOf(b.categoria)
      const aScore = aPriority === -1 ? priority.length : aPriority
      const bScore = bPriority === -1 ? priority.length : bPriority
      return aScore - bScore
    })

    return products.slice(0, limit)
  } catch {
    return []
  }
}

/** Fetch all active products for the catalog page */
export async function getCatalogProducts(): Promise<CatalogProductFromDB[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, slug, precio, categoria, linea, genero, destacado, created_at,
        colores(nombre, hex, imagen_url),
        variantes(talle)
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as CatalogProductFromDB[]
  } catch {
    return []
  }
}

// ── Product Detail types ──

export interface ProductDetailFromDB {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  categoria: string
  linea: string
  genero: string
  cuidado: string | null
  detalles: string | null
  destacado: boolean
  created_at: string
  colores: {
    id: string; nombre: string; hex: string; imagen_url: string | null; orden: number;
    imagenes: { id: string; url: string; orden: number }[]
  }[]
  variantes: { id: string; color_id: string; talle: string; stock: number }[]
}

/** Fetch a single product by slug with all colors and variants */
export async function getProductBySlug(slug: string): Promise<ProductDetailFromDB | null> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, slug, descripcion, precio, categoria, linea, genero,
        cuidado, detalles, destacado, created_at,
        colores(id, nombre, hex, imagen_url, orden, imagenes(id, url, orden)),
        variantes(id, color_id, talle, stock)
      `)
      .eq('slug', slug)
      .eq('activo', true)
      .single()

    if (error) return null
    return data as ProductDetailFromDB
  } catch {
    return null
  }
}

/**
 * Derive product lines from config for Navbar/Footer.
 * Since product_lines table was removed, we generate them from shopConfig.productTypeTabs.
 */
// ── Reviews types ──

export interface ReviewFromDB {
  id: string
  producto_id: string
  user_id: string
  puntuacion: number
  comodidad: number | null
  calidad: number | null
  ajuste: number | null
  longitud: number | null
  comentario: string
  created_at: string
  profiles: { full_name: string | null; email: string | null }
}

export interface ReviewSummary {
  average: number
  total: number
  distribution: Record<number, number>
  avgComodidad: number
  avgCalidad: number
  avgAjuste: number
  avgLongitud: number
}

/** Fetch all reviews for a product (newest first) + summary */
export async function getProductReviews(productoId: string): Promise<{
  reviews: ReviewFromDB[]
  summary: ReviewSummary
}> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('resenas')
      .select(`
        id, producto_id, user_id, puntuacion, comodidad, calidad, ajuste, longitud,
        comentario, created_at,
        profiles(full_name, email)
      `)
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Supabase returns profiles as array; flatten to single object
    const reviews = (data ?? []).map((r) => ({
      ...r,
      profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
    })) as ReviewFromDB[]

    // Calculate summary
    const total = reviews.length
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let sum = 0
    let sumComodidad = 0, countComodidad = 0
    let sumCalidad = 0, countCalidad = 0
    let sumAjuste = 0, countAjuste = 0
    let sumLongitud = 0, countLongitud = 0

    for (const r of reviews) {
      sum += r.puntuacion
      distribution[r.puntuacion] = (distribution[r.puntuacion] ?? 0) + 1
      if (r.comodidad) { sumComodidad += r.comodidad; countComodidad++ }
      if (r.calidad) { sumCalidad += r.calidad; countCalidad++ }
      if (r.ajuste) { sumAjuste += r.ajuste; countAjuste++ }
      if (r.longitud) { sumLongitud += r.longitud; countLongitud++ }
    }
    const average = total > 0 ? sum / total : 0

    return {
      reviews,
      summary: {
        average, total, distribution,
        avgComodidad: countComodidad > 0 ? sumComodidad / countComodidad : 0,
        avgCalidad: countCalidad > 0 ? sumCalidad / countCalidad : 0,
        avgAjuste: countAjuste > 0 ? sumAjuste / countAjuste : 0,
        avgLongitud: countLongitud > 0 ? sumLongitud / countLongitud : 0,
      },
    }
  } catch {
    return {
      reviews: [],
      summary: {
        average: 0, total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        avgComodidad: 0, avgCalidad: 0, avgAjuste: 0, avgLongitud: 0,
      },
    }
  }
}

// ── Favorites ──

/** Fetch favorite product IDs for a user */
export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('favoritos')
      .select('producto_id')
      .eq('user_id', userId)

    if (error) throw error
    return new Set((data ?? []).map((r) => r.producto_id))
  } catch {
    return new Set()
  }
}

/** Fetch full product data for a user's favorites (for the favorites page) */
export async function getUserFavoriteProducts(userId: string): Promise<CatalogProductFromDB[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data: favs, error: favError } = await supabase
      .from('favoritos')
      .select('producto_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (favError) throw favError
    if (!favs || favs.length === 0) return []

    const productIds = favs.map((f) => f.producto_id)

    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, nombre, slug, precio, categoria, linea, genero, destacado, created_at,
        colores(nombre, hex, imagen_url),
        variantes(talle)
      `)
      .in('id', productIds)
      .eq('activo', true)

    if (error) throw error

    // Sort by favorite order (most recently favorited first)
    const orderMap = new Map(productIds.map((id, i) => [id, i]))
    return ((data ?? []) as CatalogProductFromDB[]).sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    )
  } catch {
    return []
  }
}

export async function getProductLines(): Promise<ProductLineRow[]> {
  let order = 0
  const lines: ProductLineRow[] = []

  for (const tab of shopConfig.productTypeTabs) {
    for (const cat of tab.categories) {
      lines.push({
        id: cat.slug,
        name: cat.title,
        slug: cat.slug,
        description: cat.subtitle,
        display_order: order++,
        is_active: true,
        image_url: cat.imageUrl ?? null,
      })
    }
  }

  return lines
}
