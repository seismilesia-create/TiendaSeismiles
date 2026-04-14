'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { validateImageUpload } from '@/lib/uploads/validate-image'
import { backInStockEmail } from '@/lib/email/seismiles-templates'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  addColor,
  updateColor,
  deleteColor,
  uploadColorImage,
  uploadProductImage,
  deleteProductImage,
  setImageAsCover,
  saveVariants,
  type VarianteInput,
} from '@/features/shop/services/admin-products'
import { FEATURED_PRODUCTS_LIMIT } from '@/features/shop/services/product-lines'

/**
 * Throws if marking this product as `destacado` would exceed FEATURED_PRODUCTS_LIMIT.
 * Pass `currentProductoId` when updating, so the product itself is excluded from the count.
 */
async function assertFeaturedSlotAvailable(currentProductoId?: string): Promise<void> {
  const supabase = createServiceClient()
  let query = supabase
    .from('productos')
    .select('id', { count: 'exact', head: true })
    .eq('destacado', true)
    .eq('activo', true)

  if (currentProductoId) {
    query = query.neq('id', currentProductoId)
  }

  const { count, error } = await query
  if (error) throw new Error('No se pudo verificar el cupo de destacados.')
  if ((count ?? 0) >= FEATURED_PRODUCTS_LIMIT) {
    throw new Error(
      `Ya hay ${FEATURED_PRODUCTS_LIMIT} productos destacados. Quita uno desde la lista de productos antes de añadir este.`
    )
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createProductAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const nombre = formData.get('nombre') as string
  const slug = (formData.get('slug') as string) || slugify(nombre)
  const destacado = formData.get('destacado') === 'true'

  try {
    if (destacado) {
      await assertFeaturedSlotAvailable()
    }

    const producto = await createProduct({
      nombre,
      slug,
      descripcion: (formData.get('descripcion') as string) || undefined,
      precio: parseFloat(formData.get('precio') as string),
      categoria: formData.get('categoria') as string,
      linea: formData.get('linea') as string,
      genero: formData.get('genero') as string,
      cuidado: (formData.get('cuidado') as string) || undefined,
      detalles: (formData.get('detalles') as string) || undefined,
      activo: formData.get('activo') === 'true',
      destacado,
    })

    revalidatePath('/admin/productos')
    return { success: true, productoId: producto.id }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function updateProductAction(productoId: string, formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const destacado = formData.get('destacado') === 'true'

  try {
    if (destacado) {
      await assertFeaturedSlotAvailable(productoId)
    }

    await updateProduct(productoId, {
      nombre: formData.get('nombre') as string,
      slug: formData.get('slug') as string,
      descripcion: (formData.get('descripcion') as string) || undefined,
      precio: parseFloat(formData.get('precio') as string),
      categoria: formData.get('categoria') as string,
      linea: formData.get('linea') as string,
      genero: formData.get('genero') as string,
      cuidado: (formData.get('cuidado') as string) || undefined,
      detalles: (formData.get('detalles') as string) || undefined,
      activo: formData.get('activo') === 'true',
      destacado,
    })

    revalidatePath('/admin/productos')
    revalidatePath('/')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function duplicateProductAction(productoId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    const newProductId = await duplicateProduct(productoId)
    revalidatePath('/admin/productos')
    return { success: true, productoId: newProductId }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function toggleProductActiveAction(productoId: string, activo: boolean) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    await updateProduct(productoId, { activo })
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function toggleProductDestacadoAction(productoId: string, destacado: boolean) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    if (destacado) {
      await assertFeaturedSlotAvailable(productoId)
    }
    await updateProduct(productoId, { destacado })
    revalidatePath('/admin/productos')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteProductAction(productoId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    await deleteProduct(productoId)
    revalidatePath('/admin/productos')
    revalidatePath('/')
    revalidatePath('/catalogo')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function addColorAction(productoId: string, nombre: string, hex: string, color_base?: string, color_base_hex?: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    const color = await addColor(productoId, { nombre, hex, color_base: color_base ?? null, color_base_hex: color_base_hex ?? null })
    revalidatePath(`/admin/productos/${productoId}`)
    return { success: true, color }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function updateColorAction(colorId: string, nombre: string, hex: string, color_base?: string, color_base_hex?: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    const color = await updateColor(colorId, { nombre, hex, color_base: color_base ?? null, color_base_hex: color_base_hex ?? null })
    return { success: true, color }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteColorAction(colorId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    await deleteColor(colorId)
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function uploadColorImageAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const file = formData.get('file') as File
  const productoId = formData.get('producto_id') as string
  const colorId = formData.get('color_id') as string

  if (!file || !productoId || !colorId) return { error: 'Archivo, producto y color requeridos' }

  const validation = await validateImageUpload(file)
  if (!validation.ok) return { error: validation.error }

  try {
    const { buffer, ext, contentType } = validation.image
    const url = await uploadColorImage(productoId, colorId, buffer, ext, contentType)
    revalidatePath(`/admin/productos/${productoId}`)
    return { success: true, url }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function saveVariantsAction(productoId: string, variantes: VarianteInput[]) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    const supabase = createServiceClient()

    // Fetch old variants to detect what had 0 stock before
    const { data: oldVariants } = await supabase
      .from('variantes')
      .select('color_id, talle, stock')
      .eq('producto_id', productoId)

    const oldStockMap = new Map<string, number>()
    for (const v of oldVariants ?? []) {
      oldStockMap.set(`${v.color_id}:${v.talle}`, v.stock)
    }

    await saveVariants(productoId, variantes)
    revalidatePath(`/admin/productos/${productoId}`)

    // Detect sizes that went from 0 (or non-existent) to > 0
    const restocked: { color_id: string; talle: string }[] = []
    for (const v of variantes) {
      const oldStock = oldStockMap.get(`${v.color_id}:${v.talle}`) ?? 0
      if (oldStock === 0 && v.stock > 0) {
        restocked.push({ color_id: v.color_id, talle: v.talle })
      }
    }

    // Send back-in-stock emails in background (don't block response)
    if (restocked.length > 0) {
      notifyBackInStock(productoId, restocked).catch((err) =>
        console.error('Error sending back-in-stock emails:', err)
      )
    }

    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

async function notifyBackInStock(
  productoId: string,
  restocked: { color_id: string; talle: string }[]
) {
  const supabase = createServiceClient()

  // Fetch product info for the email
  const { data: product } = await supabase
    .from('productos')
    .select('nombre, slug')
    .eq('id', productoId)
    .single()

  if (!product) return

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seismiles.com'

  for (const { color_id, talle } of restocked) {
    // Fetch color info
    const { data: color } = await supabase
      .from('colores')
      .select('nombre, hex')
      .eq('id', color_id)
      .single()

    if (!color) continue

    // Fetch pending subscribers for this product/color/talle
    const { data: subscribers } = await supabase
      .from('stock_notifications')
      .select('id, email')
      .eq('producto_id', productoId)
      .eq('color_id', color_id)
      .eq('talle', talle)
      .eq('notificado', false)

    if (!subscribers || subscribers.length === 0) continue

    // Send emails via Resend
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'SEISMILES Textil <onboarding@resend.dev>'

      const html = backInStockEmail({
        productName: product.nombre,
        talle,
        colorName: color.nombre,
        colorHex: color.hex,
        productSlug: product.slug,
        siteUrl,
      })

      for (const sub of subscribers) {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: sub.email,
            subject: `Ya hay stock de ${product.nombre} en talle ${talle}`,
            html,
          })
        } catch (emailErr) {
          console.error(`Error sending to ${sub.email}:`, emailErr)
        }
      }
    }

    // Mark all as notified
    const ids = subscribers.map((s) => s.id)
    await supabase
      .from('stock_notifications')
      .update({ notificado: true, notificado_at: new Date().toISOString() })
      .in('id', ids)
  }
}

export async function uploadProductImageAction(formData: FormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  const file = formData.get('file') as File
  const productoId = formData.get('producto_id') as string
  const colorId = formData.get('color_id') as string
  const orden = parseInt(formData.get('orden') as string) || 0

  if (!file || !productoId || !colorId) return { error: 'Archivo, producto y color requeridos' }

  const validation = await validateImageUpload(file)
  if (!validation.ok) return { error: validation.error }

  try {
    const { buffer, ext, contentType } = validation.image
    const imagen = await uploadProductImage(productoId, colorId, buffer, ext, contentType, orden)
    revalidatePath(`/admin/productos/${productoId}`)
    return { success: true, imagen }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function deleteProductImageAction(imageId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    await deleteProductImage(imageId)
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function setImageAsCoverAction(imageId: string, colorId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado' }

  try {
    await setImageAsCover(imageId, colorId)
    revalidatePath('/admin/productos')
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
