'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  createProductAction,
  updateProductAction,
  addColorAction,
  updateColorAction,
  uploadProductImageAction,
  deleteProductImageAction,
  saveVariantsAction,
} from '@/actions/admin-products'
import type { VarianteInput } from '@/features/shop/services/admin-products'

// ── Taxonomy data ──

const CATEGORIAS = [
  { value: 'remeras-lisas', label: 'Remeras Lisas' },
  { value: 'personalizadas', label: 'Personalizadas' },
  { value: 'buzos-camperas', label: 'Buzos y Camperas' },
]

const LINEAS: Record<string, { value: string; label: string }[]> = {
  'remeras-lisas': [
    { value: 'arista', label: 'Linea Arista' },
    { value: 'pissis', label: 'Linea Pissis' },
    { value: 'origen', label: 'Linea Origen' },
    { value: 'terreno', label: 'Linea Terreno' },
  ],
  personalizadas: [
    { value: 'veta', label: 'Linea Veta' },
  ],
  'buzos-camperas': [
    { value: 'tres-cruces', label: 'Linea Tres Cruces' },
    { value: 'nacimiento', label: 'Linea Nacimiento' },
    { value: 'veladero', label: 'Linea Veladero' },
    { value: 'san-francisco', label: 'Linea San Francisco' },
  ],
}

const GENEROS = [
  { value: 'hombres', label: 'Hombres' },
  { value: 'mujeres', label: 'Mujeres' },
  { value: 'ninos', label: 'Ninos' },
]

const TALLES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

// ── Types ──

interface ExistingImage {
  id: string
  url: string
  orden: number
}

interface ExistingColor {
  id: string
  nombre: string
  hex: string
  imagenes: ExistingImage[]
}

interface ExistingVariante {
  color_id: string
  talle: string
  stock: number
}

interface ExistingProduct {
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
  colores: ExistingColor[]
  variantes: ExistingVariante[]
}

export interface ProductFormProps {
  product?: ExistingProduct
}

// ── Helpers ──

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ── Icons ──

function TrashIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
}

function UploadIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
}

function ImageIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
}

// ── Main Component ──

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justCreated, setJustCreated] = useState(false)
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [categoria, setCategoria] = useState(product?.categoria ?? '')
  const [linea, setLinea] = useState(product?.linea ?? '')

  // Product ID (from prop or after creation)
  const [productId, setProductId] = useState<string | null>(product?.id ?? null)

  // Single color state
  const existingColor = product?.colores?.[0] ?? null
  const [colorId, setColorId] = useState<string | null>(existingColor?.id ?? null)
  const [colorNombre, setColorNombre] = useState(existingColor?.nombre ?? '')
  const [colorHex, setColorHex] = useState(existingColor?.hex ?? '#000000')

  // Images state
  const [imagenes, setImagenes] = useState<ExistingImage[]>(existingColor?.imagenes ?? [])
  const [uploading, setUploading] = useState(false)

  // Variants state (simplified for single color)
  const [variantState, setVariantState] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    product?.variantes.forEach((v) => { map[v.talle] = v.stock })
    return map
  })
  const variantsRef = useRef<VarianteInput[]>(
    product?.variantes.map((v) => ({ color_id: v.color_id, talle: v.talle, stock: v.stock })) ?? []
  )

  const canUploadImages = !!productId && !!colorId

  // ── Handlers ──

  function handleNameChange(value: string) {
    if (!product) setSlug(slugify(value))
  }

  function handleCategoriaChange(value: string) {
    setCategoria(value)
    setLinea('')
  }

  function updateVariant(talle: string, stock: number) {
    setVariantState((prev) => ({ ...prev, [talle]: stock }))
    const existing = variantsRef.current.find((v) => v.talle === talle)
    if (existing) {
      existing.stock = stock
    } else {
      variantsRef.current.push({ color_id: colorId ?? '', talle, stock })
    }
  }

  async function handleUploadImages(files: FileList) {
    if (!productId || !colorId) return
    setUploading(true)
    setError(null)
    let nextOrden = imagenes.length
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.set('file', files[i])
      formData.set('producto_id', productId)
      formData.set('color_id', colorId)
      formData.set('orden', String(nextOrden))
      const result = await uploadProductImageAction(formData)
      if (result.error) {
        setError(result.error)
        break
      } else if (result.imagen) {
        setImagenes((prev) => [...prev, result.imagen!])
        nextOrden++
      }
    }
    setUploading(false)
  }

  async function handleDeleteImage(imageId: string) {
    setError(null)
    const result = await deleteProductImageAction(imageId)
    if (result.error) {
      setError(result.error)
    } else {
      setImagenes((prev) => prev.filter((img) => img.id !== imageId))
    }
  }

  // ── Submit ──

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!colorNombre.trim()) {
      setError('Ingresa el nombre del color del producto.')
      return
    }
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('slug', slug)
    formData.set('categoria', categoria)
    formData.set('linea', linea)
    formData.set('activo', formData.has('activo') ? 'true' : 'false')
    formData.set('destacado', formData.has('destacado') ? 'true' : 'false')

    let currentProductId = productId
    let currentColorId = colorId

    try {
      if (currentProductId) {
        // Update existing product
        const result = await updateProductAction(currentProductId, formData)
        if (result.error) { setError(result.error); setSaving(false); return }

        // Update or create color
        if (currentColorId) {
          const colorResult = await updateColorAction(currentColorId, colorNombre.trim(), colorHex)
          if (colorResult.error) { setError(colorResult.error); setSaving(false); return }
        } else {
          const colorResult = await addColorAction(currentProductId, colorNombre.trim(), colorHex)
          if (colorResult.error) { setError(colorResult.error); setSaving(false); return }
          if (colorResult.color) {
            currentColorId = colorResult.color.id
            setColorId(currentColorId)
          }
        }
      } else {
        // Create new product
        const result = await createProductAction(formData)
        if (result.error) { setError(result.error); setSaving(false); return }
        currentProductId = result.productoId!
        setProductId(currentProductId)

        // Auto-create the single color
        const colorResult = await addColorAction(currentProductId, colorNombre.trim(), colorHex)
        if (colorResult.error) { setError(colorResult.error); setSaving(false); return }
        if (colorResult.color) {
          currentColorId = colorResult.color.id
          setColorId(currentColorId)
        }
      }

      // Save variants
      if (currentProductId && currentColorId) {
        const filtered = variantsRef.current
          .map((v) => ({ ...v, color_id: currentColorId! }))
          .filter((v) => v.stock > 0)
        if (filtered.length > 0) {
          const varResult = await saveVariantsAction(currentProductId, filtered)
          if (varResult.error) { setError(varResult.error); setSaving(false); return }
        }
      }

      setSaving(false)
      if (product || justCreated) {
        router.push('/admin/productos')
      } else {
        setJustCreated(true)
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
      setSaving(false)
    }
  }

  const availableLineas = categoria ? (LINEAS[categoria] ?? []) : []

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-body-sm text-red-700">
          {error}
        </div>
      )}

      {justCreated && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-body-sm text-green-700 flex items-center justify-between">
          <span>Producto creado. Ahora subi las fotos y configura el stock.</span>
          <button type="button" onClick={() => router.push('/admin/productos')}
            className="text-body-xs font-medium text-green-600 hover:text-green-800 underline underline-offset-2 flex-shrink-0 ml-4">
            Ir a la lista
          </button>
        </div>
      )}

      {/* ── Section: Info basica ── */}
      <section className="rounded-2xl bg-white border border-sand-200/60 p-6 lg:p-8">
        <h2 className="font-heading text-lg text-volcanic-900 mb-6">Informacion basica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Nombre *</label>
            <input id="nombre" name="nombre" type="text" required defaultValue={product?.nombre}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              placeholder="Ej: Remera Arista Negro" />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Slug (URL)</label>
            <div className="w-full px-4 py-3 rounded-xl bg-sand-50 border border-sand-200 text-volcanic-500 text-body-sm font-mono min-h-[48px]">
              {slug || <span className="text-volcanic-300">se-genera-del-nombre</span>}
            </div>
          </div>

          <div>
            <label htmlFor="precio" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Precio (ARS) *</label>
            <input id="precio" name="precio" type="number" step="0.01" min="0" required defaultValue={product?.precio}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 transition-all"
              placeholder="18500" />
          </div>

          <div>
            <label htmlFor="categoria" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Categoria *</label>
            <select id="categoria" value={categoria} onChange={(e) => handleCategoriaChange(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 transition-all">
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="linea" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Linea *</label>
            <select id="linea" value={linea} onChange={(e) => setLinea(e.target.value)} required disabled={!categoria}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 transition-all disabled:opacity-50">
              <option value="">{categoria ? 'Seleccionar linea...' : 'Primero selecciona categoria'}</option>
              {availableLineas.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="genero" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Genero *</label>
            <select id="genero" name="genero" required defaultValue={product?.genero ?? 'hombres'}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 transition-all">
              {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="descripcion" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Descripcion</label>
            <textarea id="descripcion" name="descripcion" rows={3} defaultValue={product?.descripcion ?? ''}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 transition-all resize-none"
              placeholder="Descripcion del producto..." />
          </div>

          <div>
            <label htmlFor="detalles" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Detalles (composicion)</label>
            <textarea id="detalles" name="detalles" rows={2} defaultValue={product?.detalles ?? ''}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500 transition-all resize-none"
              placeholder="Ej: 100% algodon peinado 24/1, 180gr" />
          </div>

          <div>
            <label htmlFor="cuidado" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Cuidado</label>
            <textarea id="cuidado" name="cuidado" rows={2} defaultValue={product?.cuidado ?? ''}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500 transition-all resize-none"
              placeholder="Ej: Lavar a mano, no usar lavandina" />
          </div>

          <div className="sm:col-span-2 flex gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="activo" defaultChecked={product?.activo ?? true}
                className="w-4 h-4 rounded border-sand-300 text-terra-500 focus:ring-terra-500" />
              <span className="text-body-sm text-volcanic-700">Activo</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="destacado" defaultChecked={product?.destacado ?? false}
                className="w-4 h-4 rounded border-sand-300 text-terra-500 focus:ring-terra-500" />
              <span className="text-body-sm text-volcanic-700">Destacado (aparece en la landing)</span>
            </label>
          </div>
        </div>
      </section>

      {/* ── Section: Color del producto ── */}
      <section className="rounded-2xl bg-white border border-sand-200/60 p-6 lg:p-8">
        <h2 className="font-heading text-lg text-volcanic-900 mb-2">Color del producto</h2>
        <p className="text-body-xs text-volcanic-500 mb-6">
          Cada producto tiene un unico color. Ej: &quot;Remera Arista Negro&quot; → color Negro.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Nombre del color *</label>
            <input
              type="text"
              value={colorNombre}
              onChange={(e) => setColorNombre(e.target.value)}
              placeholder="Ej: Negro, Blanco, Terracotta"
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 transition-all"
            />
          </div>
          <div className="w-24">
            <label className="block text-body-sm font-medium text-volcanic-700 mb-1.5">Color</label>
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-full h-[48px] rounded-xl border border-sand-200 cursor-pointer"
            />
          </div>
          {colorNombre && (
            <div className="flex items-center gap-2.5 pb-1">
              <span className="w-8 h-8 rounded-full border border-sand-300 flex-shrink-0" style={{ backgroundColor: colorHex }} />
              <span className="text-body-sm text-volcanic-600">{colorNombre}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Section: Imagenes ── */}
      <section className="rounded-2xl bg-white border border-sand-200/60 p-6 lg:p-8">
        <h2 className="font-heading text-lg text-volcanic-900 mb-2">Imagenes del producto</h2>
        <p className="text-body-xs text-volcanic-500 mb-6">
          Subi varias fotos del producto. La primera imagen sera la portada en el catalogo.
        </p>

        {!canUploadImages ? (
          <div className="text-center py-10">
            <ImageIcon className="w-10 h-10 text-volcanic-300 mx-auto mb-3" />
            <p className="text-body-sm text-volcanic-400">
              Guarda el producto primero para subir imagenes.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagenes
                .sort((a, b) => a.orden - b.orden)
                .map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-sand-100">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" />
                    {img.orden === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-terra-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
                        Portada
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}

              {/* Upload card */}
              <label className={`aspect-square rounded-xl border-2 border-dashed border-sand-300 flex flex-col items-center justify-center cursor-pointer hover:border-terra-400 hover:bg-sand-50 transition-all ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                <UploadIcon className="w-6 h-6 text-volcanic-400 mb-2" />
                <span className="text-body-xs text-volcanic-500 text-center px-2">
                  {uploading ? 'Subiendo...' : 'Subir imagenes'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) handleUploadImages(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>

            {imagenes.length === 0 && (
              <p className="mt-4 text-center text-body-xs text-volcanic-400">
                Todavia no hay imagenes. Subi al menos una foto del producto.
              </p>
            )}
          </>
        )}
      </section>

      {/* ── Section: Stock por talle ── */}
      <section className="rounded-2xl bg-white border border-sand-200/60 p-6 lg:p-8">
        <h2 className="font-heading text-lg text-volcanic-900 mb-2">Stock por talle</h2>
        <p className="text-body-xs text-volcanic-500 mb-6">Ingresa el stock disponible para cada talle.</p>

        {!colorId ? (
          <p className="text-body-sm text-volcanic-400 text-center py-8">
            Guarda el producto con su color para definir el stock.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {TALLES.map((talle) => (
              <div key={talle} className="text-center">
                <label className="block text-body-sm font-semibold text-volcanic-700 mb-2">{talle}</label>
                <input
                  type="number"
                  min="0"
                  value={variantState[talle] ?? 0}
                  onChange={(e) => updateVariant(talle, parseInt(e.target.value) || 0)}
                  className="w-full text-center py-2.5 rounded-xl border border-sand-200 text-body-md text-volcanic-900 focus:outline-none focus:border-terra-500 transition-all"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 text-body-sm font-medium text-volcanic-600 hover:text-volcanic-900 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="px-8 py-3 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 text-white text-body-sm font-semibold rounded-xl transition-all duration-300">
          {saving ? 'Guardando...' : productId ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
