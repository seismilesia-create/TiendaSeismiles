'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProductAction, duplicateProductAction, toggleProductActiveAction } from '@/actions/admin-products'

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

const LINEA_LABELS: Record<string, string> = {
  arista: 'Linea Arista',
  pissis: 'Linea Pissis',
  origen: 'Linea Origen',
  terreno: 'Linea Terreno',
  veta: 'Linea Veta',
  'tres-cruces': 'Linea Tres Cruces',
  nacimiento: 'Linea Nacimiento',
  veladero: 'Linea Veladero',
  'san-francisco': 'Linea San Francisco',
}

const GENERO_LABELS: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  unisex: 'Unisex',
  nino: 'Niño',
}

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

export function ProductsTable({ products }: { products: Producto[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [filterLinea, setFilterLinea] = useState<string>('')
  const [filterGenero, setFilterGenero] = useState<string>('')

  // Derive unique values from actual products
  const lineas = [...new Set(products.map((p) => p.linea))].sort()
  const generos = [...new Set(products.map((p) => p.genero))].sort()

  const filtered = products.filter((p) => {
    if (filterLinea && p.linea !== filterLinea) return false
    if (filterGenero && p.genero !== filterGenero) return false
    return true
  })

  const hasFilters = filterLinea || filterGenero

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`Eliminar "${nombre}"? Esta accion no se puede deshacer.`)) return
    setDeleting(id)
    await deleteProductAction(id)
    setDeleting(null)
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    setToggling(id)
    await toggleProductActiveAction(id, !currentActive)
    setToggling(null)
  }

  async function handleDuplicate(id: string) {
    setDuplicating(id)
    const result = await duplicateProductAction(id)
    setDuplicating(null)
    if (result.productoId) {
      router.push(`/admin/productos/${result.productoId}`)
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <FilterIcon className="w-4 h-4 text-volcanic-400" />
        <select
          value={filterLinea}
          onChange={(e) => setFilterLinea(e.target.value)}
          className="px-3 py-1.5 text-body-sm bg-white border border-sand-200 rounded-lg text-volcanic-700 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500"
        >
          <option value="">Todas las lineas</option>
          {lineas.map((l) => (
            <option key={l} value={l}>{LINEA_LABELS[l] ?? l}</option>
          ))}
        </select>
        <select
          value={filterGenero}
          onChange={(e) => setFilterGenero(e.target.value)}
          className="px-3 py-1.5 text-body-sm bg-white border border-sand-200 rounded-lg text-volcanic-700 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500"
        >
          <option value="">Todos los generos</option>
          {generos.map((g) => (
            <option key={g} value={g}>{GENERO_LABELS[g] ?? g}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setFilterLinea(''); setFilterGenero('') }}
            className="px-3 py-1.5 text-body-xs font-medium text-terra-600 hover:text-terra-700 hover:bg-terra-50 rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        )}
        <span className="text-body-xs text-volcanic-400 ml-auto">
          {filtered.length} de {products.length}
        </span>
      </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtered.map((product) => {
        const firstColor = product.colores[0]
        return (
          <div
            key={product.id}
            className="rounded-xl bg-white border border-sand-200/60 overflow-hidden hover:shadow-card transition-shadow duration-300"
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
                {product.destacado && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-terra-100 text-terra-700">
                    Destacado
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-body-xs text-volcanic-400 uppercase tracking-wide mb-0.5">
                {LINEA_LABELS[product.linea] ?? product.linea}
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
                  <span className="text-body-xs text-volcanic-400">
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
