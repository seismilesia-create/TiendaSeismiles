'use client'

import { useState, useMemo, useTransition } from 'react'
import { updateStockAction } from '@/actions/inventory'
import type { VariantWithProduct } from '@/features/shop/services/inventory'

type EstadoFilter = 'todos' | 'sin-stock' | 'stock-bajo'

interface ProductGroup {
  productoId: string
  productoNombre: string
  productoPrecio: number
  variants: VariantWithProduct[]
  totalStock: number
  sinStock: number
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
  )
}

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function getEstadoBadge(stock: number) {
  if (stock === 0) return { label: 'Sin stock', className: 'bg-red-100 text-red-600' }
  if (stock <= 3) return { label: 'Stock bajo', className: 'bg-amber-100 text-amber-700' }
  return { label: 'OK', className: 'bg-emerald-100 text-emerald-700' }
}

function getGroupBadge(group: ProductGroup) {
  if (group.sinStock > 0) return { label: `${group.sinStock} sin stock`, className: 'bg-red-100 text-red-600' }
  const lowStock = group.variants.filter((v) => v.stock > 0 && v.stock <= 3).length
  if (lowStock > 0) return { label: `${lowStock} stock bajo`, className: 'bg-amber-100 text-amber-700' }
  return { label: 'OK', className: 'bg-emerald-100 text-emerald-700' }
}

interface Props {
  variants: VariantWithProduct[]
}

export function StockTable({ variants: initialVariants }: Props) {
  const [variants, setVariants] = useState(initialVariants)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<EstadoFilter>('todos')
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [, startTransition] = useTransition()
  const [savingId, setSavingId] = useState<string | null>(null)

  const filtered = variants.filter((v) => {
    const matchesSearch = v.producto_nombre.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'sin-stock') return v.stock === 0
    if (filter === 'stock-bajo') return v.stock > 0 && v.stock <= 3
    return true
  })

  const groups = useMemo(() => {
    const map = new Map<string, ProductGroup>()
    for (const v of filtered) {
      let group = map.get(v.producto_id)
      if (!group) {
        group = {
          productoId: v.producto_id,
          productoNombre: v.producto_nombre,
          productoPrecio: v.producto_precio,
          variants: [],
          totalStock: 0,
          sinStock: 0,
        }
        map.set(v.producto_id, group)
      }
      group.variants.push(v)
      group.totalStock += v.stock
      if (v.stock === 0) group.sinStock++
    }
    return Array.from(map.values())
  }, [filtered])

  function toggleProduct(productoId: string) {
    setExpandedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(productoId)) {
        next.delete(productoId)
      } else {
        next.add(productoId)
      }
      return next
    })
  }

  function expandAll() {
    setExpandedProducts(new Set(groups.map((g) => g.productoId)))
  }

  function collapseAll() {
    setExpandedProducts(new Set())
  }

  function startEdit(variant: VariantWithProduct) {
    setEditingId(variant.id)
    setEditValue(String(variant.stock))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  function saveEdit(varianteId: string) {
    const newStock = parseInt(editValue, 10)
    if (isNaN(newStock) || newStock < 0) {
      cancelEdit()
      return
    }

    const current = variants.find((v) => v.id === varianteId)
    if (current && current.stock === newStock) {
      cancelEdit()
      return
    }

    setSavingId(varianteId)
    setEditingId(null)

    // Optimistic update
    setVariants((prev) =>
      prev.map((v) => (v.id === varianteId ? { ...v, stock: newStock } : v))
    )

    startTransition(async () => {
      const result = await updateStockAction(varianteId, newStock)
      if (result.error) {
        setVariants((prev) =>
          prev.map((v) => (v.id === varianteId ? { ...v, stock: current?.stock ?? 0 } : v))
        )
      }
      setSavingId(null)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent, varianteId: string) {
    if (e.key === 'Enter') saveEdit(varianteId)
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
      <div className="p-5 lg:p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-volcanic-900">Stock por producto</h3>
          {groups.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-body-xs text-volcanic-500 hover:text-volcanic-700 transition-colors"
              >
                Expandir todos
              </button>
              <span className="text-volcanic-300">|</span>
              <button
                onClick={collapseAll}
                className="text-body-xs text-volcanic-500 hover:text-volcanic-700 transition-colors"
              >
                Colapsar todos
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-volcanic-500" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sand-200 text-body-sm text-volcanic-900 placeholder:text-volcanic-500 focus:outline-none focus:border-terra-500 transition-colors"
            />
          </div>
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as EstadoFilter)}
            className="px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-body-sm text-volcanic-700 focus:outline-none focus:border-terra-500 transition-colors"
          >
            <option value="todos">Todos</option>
            <option value="sin-stock">Sin stock</option>
            <option value="stock-bajo">Stock bajo</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {groups.length === 0 ? (
          <div className="px-5 lg:px-6 py-8 text-center text-body-sm text-volcanic-500">
            No se encontraron productos.
          </div>
        ) : (
          <div>
            {groups.map((group) => {
              const isOpen = expandedProducts.has(group.productoId)
              const groupBadge = getGroupBadge(group)
              const uniqueColors = Array.from(
                new Map(group.variants.map((v) => [v.color_id, { nombre: v.color_nombre, hex: v.color_hex }])).values()
              )

              return (
                <div key={group.productoId} className="border-b border-sand-200/60 last:border-0">
                  {/* Product header row */}
                  <button
                    onClick={() => toggleProduct(group.productoId)}
                    className="w-full flex items-center gap-3 px-5 lg:px-6 py-4 hover:bg-sand-100/30 transition-colors text-left"
                  >
                    <ChevronIcon open={isOpen} className="w-4 h-4 text-volcanic-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-body-sm font-medium text-volcanic-900 truncate block">
                        {group.productoNombre}
                      </span>
                    </div>
                    {/* Precio */}
                    <span className="text-body-sm text-volcanic-500 tabular-nums shrink-0">
                      ${group.productoPrecio.toLocaleString('es-AR')}
                    </span>
                    {/* Color dots */}
                    <div className="flex items-center gap-1 shrink-0">
                      {uniqueColors.map((c) => (
                        <span
                          key={c.nombre}
                          className="w-3.5 h-3.5 rounded-full border border-sand-300"
                          style={{ backgroundColor: c.hex }}
                          title={c.nombre}
                        />
                      ))}
                    </div>
                    {/* Total stock */}
                    <span className="text-body-sm font-semibold text-volcanic-700 tabular-nums shrink-0 w-16 text-right">
                      {group.totalStock} unid.
                    </span>
                    {/* Group status */}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${groupBadge.className}`}>
                      {groupBadge.label}
                    </span>
                  </button>

                  {/* Expanded variants */}
                  {isOpen && (
                    <div className="bg-sand-50/50">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-sand-200/40">
                            <th className="pl-14 pr-4 lg:pl-16 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Color</th>
                            <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Talle</th>
                            <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Stock</th>
                            <th className="px-4 pr-5 lg:pr-6 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.variants.map((variant) => {
                            const badge = getEstadoBadge(variant.stock)
                            const isSaving = savingId === variant.id
                            return (
                              <tr key={variant.id} className="border-b border-sand-200/30 last:border-0 hover:bg-sand-100/40 transition-colors">
                                <td className="pl-14 pr-4 lg:pl-16 py-3">
                                  <span className="inline-flex items-center gap-2 text-body-sm text-volcanic-700">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-sand-300 shrink-0"
                                      style={{ backgroundColor: variant.color_hex }}
                                    />
                                    {variant.color_nombre}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-block bg-volcanic-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                                    {variant.talle}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {editingId === variant.id ? (
                                    <input
                                      type="number"
                                      min={0}
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleKeyDown(e, variant.id)}
                                      onBlur={() => saveEdit(variant.id)}
                                      autoFocus
                                      className="w-20 px-3 py-1.5 rounded-lg border border-terra-500 text-body-sm text-volcanic-900 text-center focus:outline-none"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => startEdit(variant)}
                                      disabled={isSaving}
                                      className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-colors ${
                                        isSaving
                                          ? 'text-volcanic-500 cursor-wait'
                                          : 'text-volcanic-900 hover:bg-white cursor-pointer'
                                      }`}
                                    >
                                      {isSaving ? '...' : variant.stock}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 pr-5 lg:pr-6 py-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}>
                                    {badge.label}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
