'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProductAction, duplicateProductAction, toggleProductActiveAction, toggleProductDestacadoAction } from '@/actions/admin-products'
import { bulkUpdateCatalogAction } from '@/actions/catalog-bulk'
import { formatLineaLabel } from '@/features/shop/utils/linea'

interface Producto {
  id: string
  nombre: string
  slug: string
  precio: number
  categoria: string
  linea: string
  genero: string
  activo: boolean
  destacado: boolean
  colores: { id: string; nombre: string; hex: string; imagen_url: string | null }[]
  variantes: { id: string }[]
}

const GENERO_LABELS: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  unisex: 'Unisex',
  nino: 'Niño',
}

const CATEGORIAS = [
  { value: 'remeras-lisas', label: 'Remeras Lisas' },
  { value: 'estampadas', label: 'Estampadas' },
  { value: 'buzos', label: 'Buzos' },
]

const LINEAS_ALL = [
  { value: 'arista', label: 'Arista' },
  { value: 'pissis', label: 'Pissis' },
  { value: 'origen', label: 'Origen' },
  { value: 'veta', label: 'Veta' },
  { value: 'tres-cruces', label: 'Tres Cruces' },
  { value: 'nacimiento', label: 'Nacimiento' },
  { value: 'veladero', label: 'Veladero' },
  { value: 'san-francisco', label: 'San Francisco' },
]

const GENEROS = [
  { value: 'hombres', label: 'Hombres' },
  { value: 'mujeres', label: 'Mujeres' },
]

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
  )
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
  )
}

interface ProductsTableProps {
  products: Producto[]
  featuredLimit: number
}

export function ProductsTable({ products, featuredLimit }: ProductsTableProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [togglingDestacado, setTogglingDestacado] = useState<string | null>(null)
  const [filterLinea, setFilterLinea] = useState<string>('')
  const [filterGenero, setFilterGenero] = useState<string>('')
  const [filterDestacados, setFilterDestacados] = useState(false)

  // Live count of destacados — derived from the products prop, refreshes after router.refresh()
  const featuredCount = products.filter((p) => p.destacado && p.activo).length
  const featuredSlotsFull = featuredCount >= featuredLimit

  // Bulk edit state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkApplying, setBulkApplying] = useState(false)
  const [bulkPrecio, setBulkPrecio] = useState('')
  const [bulkCategoria, setBulkCategoria] = useState('')
  const [bulkLinea, setBulkLinea] = useState('')
  const [bulkGenero, setBulkGenero] = useState('')
  const [bulkActivo, setBulkActivo] = useState('')
  const [bulkDestacado, setBulkDestacado] = useState('')
  const [bulkDescripcion, setBulkDescripcion] = useState('')
  const [bulkDetalles, setBulkDetalles] = useState('')
  const [bulkCuidado, setBulkCuidado] = useState('')

  // Derive unique values from actual products
  const lineas = [...new Set(products.map((p) => p.linea))].sort()
  const generos = [...new Set(products.map((p) => p.genero))].sort()

  const filtered = products.filter((p) => {
    if (filterLinea && p.linea !== filterLinea) return false
    if (filterGenero && p.genero !== filterGenero) return false
    if (filterDestacados && !p.destacado) return false
    return true
  })

  const hasFilters = filterLinea || filterGenero || filterDestacados

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)))
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setBulkPrecio('')
    setBulkCategoria('')
    setBulkLinea('')
    setBulkGenero('')
    setBulkActivo('')
    setBulkDestacado('')
    setBulkDescripcion('')
    setBulkDetalles('')
    setBulkCuidado('')
  }

  async function handleBulkApply() {
    const ids = [...selectedIds]
    if (ids.length === 0) return

    const fields: Record<string, unknown> = {}
    if (bulkPrecio) {
      const precio = Number(bulkPrecio)
      if (isNaN(precio) || precio <= 0) {
        alert('El precio debe ser un número mayor a 0')
        return
      }
      fields.precio = precio
    }
    if (bulkCategoria) fields.categoria = bulkCategoria
    if (bulkLinea) fields.linea = bulkLinea
    if (bulkGenero) fields.genero = bulkGenero
    if (bulkActivo) fields.activo = bulkActivo === 'si'
    if (bulkDestacado) fields.destacado = bulkDestacado === 'si'
    if (bulkDescripcion.trim()) fields.descripcion = bulkDescripcion.trim()
    if (bulkDetalles.trim()) fields.detalles = bulkDetalles.trim()
    if (bulkCuidado.trim()) fields.cuidado = bulkCuidado.trim()

    if (Object.keys(fields).length === 0) {
      alert('Seleccioná al menos un campo para editar')
      return
    }

    const count = ids.length
    const fieldNames = Object.keys(fields).join(', ')
    if (!confirm(`Aplicar cambios (${fieldNames}) a ${count} producto${count !== 1 ? 's' : ''}?`)) return

    setBulkApplying(true)
    const result = await bulkUpdateCatalogAction({
      productChanges: ids.map((id) => ({ producto_id: id, fields })),
      stockChanges: [],
    })
    setBulkApplying(false)

    if (result.success) {
      clearSelection()
      router.refresh()
    } else {
      alert(`Errores: ${result.errors.join(', ')}`)
    }
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    await deleteProductAction(id)
    setDeleting(null)
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    setToggling(id)
    await toggleProductActiveAction(id, !currentActive)
    setToggling(null)
  }

  async function handleToggleDestacado(id: string, currentDestacado: boolean) {
    setTogglingDestacado(id)
    const result = await toggleProductDestacadoAction(id, !currentDestacado)
    setTogglingDestacado(null)
    if (result.error) alert(result.error)
  }

  async function handleDuplicate(id: string) {
    setDuplicating(id)
    const result = await duplicateProductAction(id)
    setDuplicating(null)
    if (result.productoId) {
      router.push(`/admin/productos/${result.productoId}`)
    }
  }

  const allFilteredSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const someSelected = selectedIds.size > 0

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <FilterIcon className="w-4 h-4 text-volcanic-500" />
        <select
          value={filterLinea}
          onChange={(e) => setFilterLinea(e.target.value)}
          className="px-3 py-1.5 text-body-sm bg-white border border-sand-200 rounded-lg text-volcanic-700 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500"
        >
          <option value="">Todas las líneas</option>
          {lineas.map((l) => (
            <option key={l} value={l}>{formatLineaLabel(l) || l}</option>
          ))}
        </select>
        <select
          value={filterGenero}
          onChange={(e) => setFilterGenero(e.target.value)}
          className="px-3 py-1.5 text-body-sm bg-white border border-sand-200 rounded-lg text-volcanic-700 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500"
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g} value={g}>{GENERO_LABELS[g] ?? g}</option>
          ))}
        </select>
        <button
          onClick={() => setFilterDestacados((v) => !v)}
          title={filterDestacados ? 'Mostrar todos' : 'Solo destacados'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-body-xs font-medium rounded-lg border transition-colors ${
            filterDestacados
              ? 'bg-terra-500 text-white border-terra-500'
              : 'bg-white text-volcanic-700 border-sand-200 hover:border-terra-400 hover:text-terra-600'
          }`}
        >
          <StarIcon className="w-3.5 h-3.5" filled={filterDestacados} />
          Destacados
          <span className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] ${
            filterDestacados ? 'bg-white/20' : featuredSlotsFull ? 'bg-terra-50 text-terra-600' : 'bg-sand-100 text-volcanic-500'
          }`}>
            {featuredCount}/{featuredLimit}
          </span>
        </button>

        {hasFilters && (
          <button
            onClick={() => { setFilterLinea(''); setFilterGenero(''); setFilterDestacados(false) }}
            className="px-3 py-1.5 text-body-xs font-medium text-terra-600 hover:text-terra-700 hover:bg-terra-50 rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        )}

        {/* Select all toggle */}
        <button
          onClick={toggleSelectAll}
          className={`ml-auto px-3 py-1.5 text-body-xs font-medium rounded-lg transition-colors ${
            allFilteredSelected
              ? 'bg-volcanic-900 text-white'
              : 'text-volcanic-600 bg-sand-100 hover:bg-sand-200'
          }`}
        >
          {allFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>

        <span className="text-body-xs text-volcanic-500">
          {filtered.length} de {products.length}
        </span>
      </div>

      {/* Bulk edit bar */}
      {someSelected && (
        <div className="mb-5 p-4 rounded-xl bg-volcanic-900 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-body-sm font-semibold">
              {selectedIds.size} producto{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearSelection}
              className="text-body-xs text-white/60 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {/* Precio */}
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Precio</label>
              <input
                type="number"
                min={0}
                step={100}
                value={bulkPrecio}
                onChange={(e) => setBulkPrecio(e.target.value)}
                placeholder="—"
                className="w-28 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-terra-500/50"
              />
            </div>
            {/* Categoría */}
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Categoría</label>
              <select
                value={bulkCategoria}
                onChange={(e) => setBulkCategoria(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-terra-500/50"
              >
                <option value="">—</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value} className="text-volcanic-900">{c.label}</option>
                ))}
              </select>
            </div>
            {/* Línea */}
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Línea</label>
              <select
                value={bulkLinea}
                onChange={(e) => setBulkLinea(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-terra-500/50"
              >
                <option value="">—</option>
                {LINEAS_ALL.map((l) => (
                  <option key={l.value} value={l.value} className="text-volcanic-900">{l.label}</option>
                ))}
              </select>
            </div>
            {/* Género */}
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Género</label>
              <select
                value={bulkGenero}
                onChange={(e) => setBulkGenero(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-terra-500/50"
              >
                <option value="">—</option>
                {GENEROS.map((g) => (
                  <option key={g.value} value={g.value} className="text-volcanic-900">{g.label}</option>
                ))}
              </select>
            </div>
            {/* Activo */}
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Activo</label>
              <select
                value={bulkActivo}
                onChange={(e) => setBulkActivo(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-terra-500/50"
              >
                <option value="">—</option>
                <option value="si" className="text-volcanic-900">Sí</option>
                <option value="no" className="text-volcanic-900">No</option>
              </select>
            </div>
            {/* Destacado */}
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Destacado</label>
              <select
                value={bulkDestacado}
                onChange={(e) => setBulkDestacado(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white focus:outline-none focus:ring-2 focus:ring-terra-500/50"
              >
                <option value="">—</option>
                <option value="si" className="text-volcanic-900">Sí</option>
                <option value="no" className="text-volcanic-900">No</option>
              </select>
            </div>
          </div>
          {/* Long text fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Descripción</label>
              <textarea
                value={bulkDescripcion}
                onChange={(e) => setBulkDescripcion(e.target.value)}
                rows={3}
                placeholder="— (dejar vacío para no modificar)"
                className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-terra-500/50 resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Detalles (composición)</label>
              <textarea
                value={bulkDetalles}
                onChange={(e) => setBulkDetalles(e.target.value)}
                rows={3}
                placeholder="— (dejar vacío para no modificar)"
                className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-terra-500/50 resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Cuidado</label>
              <textarea
                value={bulkCuidado}
                onChange={(e) => setBulkCuidado(e.target.value)}
                rows={3}
                placeholder="— (dejar vacío para no modificar)"
                className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-body-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-terra-500/50 resize-y"
              />
            </div>
          </div>
          {/* Apply button */}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleBulkApply}
              disabled={bulkApplying}
              className="px-5 py-2 bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-body-sm font-semibold rounded-lg transition-colors"
            >
              {bulkApplying ? 'Aplicando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtered.map((product) => {
        const firstColor = product.colores[0]
        const isSelected = selectedIds.has(product.id)
        return (
          <div
            key={product.id}
            className={`rounded-xl bg-white border overflow-hidden hover:shadow-card transition-all duration-300 ${
              isSelected ? 'border-terra-500 ring-2 ring-terra-500/20' : 'border-sand-200/60'
            }`}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-sand-100">
              {firstColor?.imagen_url ? (
                <Image
                  src={firstColor.imagen_url}
                  alt={product.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-volcanic-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1.5">
                <button
                  onClick={() => handleToggleActive(product.id, product.activo)}
                  disabled={toggling === product.id}
                  title={product.activo ? 'Click para desactivar' : 'Click para activar'}
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full cursor-pointer transition-colors disabled:opacity-50 ${
                    product.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {toggling === product.id ? '...' : product.activo ? 'Activo' : 'Inactivo'}
                </button>
                {(() => {
                  const canToggle = product.destacado || !featuredSlotsFull
                  const isLoading = togglingDestacado === product.id
                  const title = product.destacado
                    ? 'Click para quitar de destacados'
                    : canToggle
                      ? 'Click para destacar en la landing'
                      : `Límite de ${featuredLimit} destacados alcanzado`
                  return (
                    <button
                      onClick={() => canToggle && handleToggleDestacado(product.id, product.destacado)}
                      disabled={!canToggle || isLoading}
                      title={title}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                        product.destacado
                          ? 'bg-terra-500 text-white hover:bg-terra-600'
                          : canToggle
                            ? 'bg-white/90 text-volcanic-400 hover:bg-terra-50 hover:text-terra-500'
                            : 'bg-white/60 text-volcanic-300 cursor-not-allowed'
                      } ${isLoading ? 'opacity-50' : ''}`}
                    >
                      <StarIcon className="w-3.5 h-3.5" filled={product.destacado} />
                    </button>
                  )
                })()}
              </div>
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(product.id)}
                className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-terra-500 border-terra-500 text-white'
                    : 'bg-white/80 border-sand-300 hover:border-volcanic-400'
                }`}
              >
                {isSelected && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-body-xs text-volcanic-500 uppercase tracking-wide mb-0.5">
                {formatLineaLabel(product.linea) || product.linea}
              </p>
              <h3 className="font-heading text-body-md text-volcanic-900 mb-1">{product.nombre}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-md font-semibold text-volcanic-800">
                  ${product.precio.toLocaleString('es-AR')}
                </span>
                <div className="flex items-center gap-2">
                  {/* Color swatches */}
                  <div className="flex -space-x-1">
                    {product.colores.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: c.hex }}
                        title={c.nombre}
                      />
                    ))}
                    {product.colores.length > 4 && (
                      <span className="w-4 h-4 rounded-full bg-sand-200 border border-white text-[8px] font-bold flex items-center justify-center text-volcanic-500">
                        +{product.colores.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="text-body-xs text-volcanic-500">
                    {product.variantes.length} var.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-body-xs font-medium text-volcanic-700 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  Editar
                </Link>
                <button
                  onClick={() => handleDuplicate(product.id)}
                  disabled={duplicating === product.id}
                  title="Duplicar producto"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-body-xs font-medium text-volcanic-600 bg-sand-100 hover:bg-sand-200 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.nombre)}
                  disabled={deleting === product.id}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-body-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
    </div>
  )
}
