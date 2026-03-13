import { createServiceClient } from '@/lib/supabase/server'

// ============================================================
// Types
// ============================================================

export interface ProductoRow {
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
  activo: boolean
  destacado: boolean
  created_at: string
  updated_at: string
}

export interface ColorRow {
  id: string
  producto_id: string
  nombre: string
  hex: string
  imagen_url: string | null
  orden: number
}

export interface VarianteRow {
  id: string
  producto_id: string
  color_id: string
  talle: string
  stock: number
}

export interface ImagenRow {
  id: string
  color_id: string
  url: string
  orden: number
}

export interface ProductoWithRelations extends ProductoRow {
  colores: (ColorRow & { imagenes: ImagenRow[] })[]
  variantes: (VarianteRow & { color: { id: string; nombre: string; hex: string } | null })[]
}

export interface ProductoListItem extends ProductoRow {
  colores: { id: string; nombre: string; hex: string; imagen_url: string | null }[]
  variantes: { id: string }[]
}

export interface CreateProductoDTO {
  nombre: string
  slug: string
  descripcion?: string
  precio: number
  categoria: string
  linea: string
  genero: string
  cuidado?: string
  detalles?: string
  activo?: boolean
  destacado?: boolean
}

export interface ColorInput {
  nombre: string
  hex: string
  imagen_url?: string | null
  orden?: number
}

export interface VarianteInput {
  color_id: string
  talle: string
  stock: number
}

// ============================================================
// READ
// ============================================================

export async function getAdminProducts(): Promise<ProductoListItem[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      colores(id, nombre, hex, imagen_url),
      variantes(id)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ProductoListItem[]
}

export async function getAdminProduct(id: string): Promise<ProductoWithRelations | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      colores(*, imagenes(*)),
      variantes(*, color:colores(id, nombre, hex))
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as ProductoWithRelations
}

// ============================================================
// DUPLICATE
// ============================================================

export async function duplicateProduct(sourceId: string): Promise<string> {
  const supabase = createServiceClient()

  // 1. Fetch the full source product
  const source = await getAdminProduct(sourceId)
  if (!source) throw new Error('Producto no encontrado')

  // 2. Create new product with "(Copia)" suffix
  const { data: newProduct, error: prodError } = await supabase
    .from('productos')
    .insert({
      nombre: `${source.nombre} (Copia)`,
      slug: `${source.slug}-copia-${Date.now()}`,
      descripcion: source.descripcion,
      precio: source.precio,
      categoria: source.categoria,
      linea: source.linea,
      genero: source.genero,
      cuidado: source.cuidado,
      detalles: source.detalles,
      activo: false, // Start as inactive so admin reviews before publishing
      destacado: false,
    })
    .select()
    .single()

  if (prodError) throw prodError

  // 3. Duplicate colors (with imagen_url), images, and map old color IDs to new ones
  const colorMap = new Map<string, string>() // oldId → newId
  for (const color of source.colores) {
    const { data: newColor, error: colorError } = await supabase
      .from('colores')
      .insert({
        producto_id: newProduct.id,
        nombre: color.nombre,
        hex: color.hex,
        imagen_url: color.imagen_url,
        orden: color.orden,
      })
      .select()
      .single()

    if (colorError) throw colorError
    colorMap.set(color.id, newColor.id)

    // Duplicate images for this color
    if (color.imagenes && color.imagenes.length > 0) {
      const imageRows = color.imagenes.map((img: { url: string; orden: number }) => ({
        color_id: newColor.id,
        url: img.url,
        orden: img.orden,
      }))
      const { error: imgError } = await supabase
        .from('imagenes')
        .insert(imageRows)
      if (imgError) throw imgError
    }
  }

  // 4. Duplicate variants with mapped color IDs
  const variantRows = source.variantes
    .filter((v) => colorMap.has(v.color_id))
    .map((v) => ({
      producto_id: newProduct.id,
      color_id: colorMap.get(v.color_id)!,
      talle: v.talle,
      stock: v.stock,
    }))

  if (variantRows.length > 0) {
    const { error: varError } = await supabase
      .from('variantes')
      .insert(variantRows)

    if (varError) throw varError
  }

  return newProduct.id
}

// ============================================================
// WRITE — Productos
// ============================================================

export async function createProduct(dto: CreateProductoDTO): Promise<ProductoRow> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('productos')
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, dto: Partial<CreateProductoDTO>): Promise<ProductoRow> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('productos')
    .update({ ...dto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const supabase = createServiceClient()

  // Get color images to delete from storage
  const { data: colores } = await supabase
    .from('colores')
    .select('imagen_url')
    .eq('producto_id', id)

  if (colores?.length) {
    const paths = colores
      .map((c) => {
        if (!c.imagen_url) return null
        const match = c.imagen_url.match(/product-images\/(.+)$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    if (paths.length) {
      await supabase.storage.from('product-images').remove(paths)
    }
  }

  // Cascade deletes colores + variantes
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// WRITE — Colores
// ============================================================

export async function addColor(productoId: string, input: ColorInput): Promise<ColorRow> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('colores')
    .insert({
      producto_id: productoId,
      nombre: input.nombre,
      hex: input.hex,
      imagen_url: input.imagen_url ?? null,
      orden: input.orden ?? 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateColor(colorId: string, input: Partial<ColorInput>): Promise<ColorRow> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('colores')
    .update(input)
    .eq('id', colorId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteColor(colorId: string) {
  const supabase = createServiceClient()

  // Get image to delete from storage
  const { data: color } = await supabase
    .from('colores')
    .select('imagen_url')
    .eq('id', colorId)
    .single()

  if (color?.imagen_url) {
    const match = color.imagen_url.match(/product-images\/(.+)$/)
    if (match) {
      await supabase.storage.from('product-images').remove([match[1]])
    }
  }

  // Cascade deletes variantes for this color
  const { error } = await supabase.from('colores').delete().eq('id', colorId)
  if (error) throw error
}

export async function uploadColorImage(
  productoId: string,
  colorId: string,
  fileBuffer: ArrayBuffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  const supabase = createServiceClient()

  const ext = fileName.split('.').pop() || 'jpg'
  const storagePath = `products/${productoId}/${colorId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, { contentType, upsert: false })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath)

  // Update color with image URL
  await supabase
    .from('colores')
    .update({ imagen_url: urlData.publicUrl })
    .eq('id', colorId)

  return urlData.publicUrl
}

// ============================================================
// WRITE — Imagenes (multiple images per color/product)
// ============================================================

export async function uploadProductImage(
  productoId: string,
  colorId: string,
  fileBuffer: ArrayBuffer,
  fileName: string,
  contentType: string,
  orden: number,
): Promise<ImagenRow> {
  const supabase = createServiceClient()

  const ext = fileName.split('.').pop() || 'jpg'
  const storagePath = `products/${productoId}/${colorId}-${Date.now()}-${orden}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, { contentType, upsert: false })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath)

  const { data, error } = await supabase
    .from('imagenes')
    .insert({ color_id: colorId, url: urlData.publicUrl, orden })
    .select()
    .single()

  if (error) throw error

  // Also set colores.imagen_url to the first image (for backward compat with cards)
  if (orden === 0) {
    await supabase.from('colores').update({ imagen_url: urlData.publicUrl }).eq('id', colorId)
  }

  return data as ImagenRow
}

export async function deleteProductImage(imageId: string) {
  const supabase = createServiceClient()

  const { data: img } = await supabase
    .from('imagenes')
    .select('url, color_id')
    .eq('id', imageId)
    .single()

  if (img?.url) {
    const match = img.url.match(/product-images\/(.+)$/)
    if (match) {
      await supabase.storage.from('product-images').remove([match[1]])
    }
  }

  const { error } = await supabase.from('imagenes').delete().eq('id', imageId)
  if (error) throw error

  // If we deleted the primary image, update colores.imagen_url to the next one
  if (img?.color_id) {
    const { data: remaining } = await supabase
      .from('imagenes')
      .select('url')
      .eq('color_id', img.color_id)
      .order('orden', { ascending: true })
      .limit(1)

    await supabase
      .from('colores')
      .update({ imagen_url: remaining?.[0]?.url ?? null })
      .eq('id', img.color_id)
  }
}

export async function setImageAsCover(imageId: string, colorId: string) {
  const supabase = createServiceClient()

  // Get all images for this color
  const { data: images, error: fetchError } = await supabase
    .from('imagenes')
    .select('id, orden')
    .eq('color_id', colorId)
    .order('orden', { ascending: true })

  if (fetchError) throw fetchError

  // Reorder: chosen image gets 0, others shift
  const reordered = (images ?? []).map((img) => {
    if (img.id === imageId) return { id: img.id, orden: 0 }
    const currentOrden = img.orden >= 0 ? img.orden : 0
    return { id: img.id, orden: img.id === imageId ? 0 : currentOrden >= 0 ? currentOrden + 1 : currentOrden }
  })
  // Sort so cover is 0, rest are 1, 2, 3...
  reordered.sort((a, b) => a.orden - b.orden)
  let nextOrden = 0
  for (const item of reordered) {
    if (item.id === imageId) {
      item.orden = 0
    } else {
      nextOrden++
      item.orden = nextOrden
    }
  }

  // Update each image's orden
  for (const item of reordered) {
    await supabase.from('imagenes').update({ orden: item.orden }).eq('id', item.id)
  }

  // Update colores.imagen_url to the new cover image
  const coverImage = images?.find((img) => img.id === imageId)
  if (coverImage) {
    const { data: fullImg } = await supabase.from('imagenes').select('url').eq('id', imageId).single()
    if (fullImg) {
      await supabase.from('colores').update({ imagen_url: fullImg.url }).eq('id', colorId)
    }
  }
}

// ============================================================
// WRITE — Variantes
// ============================================================

export async function saveVariants(productoId: string, variantes: VarianteInput[]) {
  const supabase = createServiceClient()

  // Determine which color IDs are being saved
  const colorIds = [...new Set(variantes.map((v) => v.color_id))]

  // Delete existing variants only for the colors being saved (preserve other colors)
  for (const cid of colorIds) {
    await supabase.from('variantes').delete().eq('producto_id', productoId).eq('color_id', cid)
  }

  if (variantes.length === 0) return

  const rows = variantes.map((v) => ({
    producto_id: productoId,
    color_id: v.color_id,
    talle: v.talle,
    stock: v.stock,
  }))

  const { error } = await supabase.from('variantes').insert(rows)
  if (error) throw error
}
