'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'

export interface ProductChange {
  producto_id: string
  fields: Partial<{
    precio: number
    categoria: string
    linea: string
    genero: string
    activo: boolean
    destacado: boolean
    descripcion: string | null
    detalles: string | null
    cuidado: string | null
  }>
}

export interface StockChange {
  producto_id: string
  color_id: string
  talle: string
  new_stock: number
}

export interface BulkUpdatePayload {
  productChanges: ProductChange[]
  stockChanges: StockChange[]
}

export interface BulkUpdateResult {
  success: boolean
  productsUpdated: number
  stockUpdated: number
  errors: string[]
}

const VALID_CATEGORIAS = ['remeras-lisas', 'estampadas', 'buzos']
const VALID_GENEROS = ['hombres', 'mujeres']
const VALID_LINEAS = [
  'arista', 'pissis', 'origen', 'terreno',
  'veta',
  'tres-cruces', 'nacimiento', 'veladero', 'san-francisco',
]

export async function bulkUpdateCatalogAction(
  payload: BulkUpdatePayload
): Promise<BulkUpdateResult> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, productsUpdated: 0, stockUpdated: 0, errors: ['No autorizado'] }

  const errors: string[] = []

  // Validate product changes
  for (const change of payload.productChanges) {
    const f = change.fields
    if (f.precio !== undefined && (f.precio <= 0 || isNaN(f.precio))) {
      errors.push(`Precio inválido para producto ${change.producto_id}`)
    }
    if (f.categoria !== undefined && !VALID_CATEGORIAS.includes(f.categoria)) {
      errors.push(`Categoría inválida: "${f.categoria}"`)
    }
    if (f.genero !== undefined && !VALID_GENEROS.includes(f.genero)) {
      errors.push(`Género inválido: "${f.genero}"`)
    }
    if (f.linea !== undefined && !VALID_LINEAS.includes(f.linea)) {
      errors.push(`Línea inválida: "${f.linea}"`)
    }
  }

  // Validate stock changes
  for (const sc of payload.stockChanges) {
    if (sc.new_stock < 0 || !Number.isInteger(sc.new_stock)) {
      errors.push(`Stock inválido para talle ${sc.talle}: debe ser entero >= 0`)
    }
  }

  if (errors.length > 0) {
    return { success: false, productsUpdated: 0, stockUpdated: 0, errors }
  }

  const supabase = createServiceClient()
  let productsUpdated = 0
  let stockUpdated = 0

  // Apply product changes
  for (const change of payload.productChanges) {
    const { error } = await supabase
      .from('productos')
      .update({ ...change.fields, updated_at: new Date().toISOString() })
      .eq('id', change.producto_id)

    if (error) {
      errors.push(`Error en producto: ${error.message}`)
    } else {
      productsUpdated++
    }
  }

  // Apply stock changes (upsert)
  for (const sc of payload.stockChanges) {
    const { data: existing } = await supabase
      .from('variantes')
      .select('id')
      .eq('producto_id', sc.producto_id)
      .eq('color_id', sc.color_id)
      .eq('talle', sc.talle)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('variantes')
        .update({ stock: sc.new_stock })
        .eq('id', existing.id)

      if (error) {
        errors.push(`Error actualizando stock ${sc.talle}: ${error.message}`)
      } else {
        stockUpdated++
      }
    } else {
      const { error } = await supabase
        .from('variantes')
        .insert({
          producto_id: sc.producto_id,
          color_id: sc.color_id,
          talle: sc.talle,
          stock: sc.new_stock,
        })

      if (error) {
        errors.push(`Error creando variante ${sc.talle}: ${error.message}`)
      } else {
        stockUpdated++
      }
    }
  }

  revalidatePath('/admin/productos')
  revalidatePath('/admin/inventario')
  revalidatePath('/catalogo')

  return {
    success: errors.length === 0,
    productsUpdated,
    stockUpdated,
    errors,
  }
}
