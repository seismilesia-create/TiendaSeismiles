'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { bulkUpdateCatalogAction } from '@/actions/catalog-bulk'
import type { ProductExportRow } from '@/features/shop/services/admin-products'
import type { BulkUpdatePayload, BulkUpdateResult } from '@/actions/catalog-bulk'

const TALLES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

const HEADERS = [
  'Producto ID',
  'Nombre',
  'Precio',
  'Categoría',
  'Línea',
  'Género',
  'Activo',
  'Destacado',
  'Descripción',
  'Detalles',
  'Cuidado',
  'Color ID',
  'Color',
  ...TALLES,
]

interface DiffItem {
  producto_id: string
  nombre: string
  color_nombre: string
  field: string
  old_value: string | number | boolean
  new_value: string | number | boolean
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

interface Props {
  exportData: ProductExportRow[]
}

export function CatalogBulkActions({ exportData }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importing, setImporting] = useState(false)
  const [applying, setApplying] = useState(false)
  const [diff, setDiff] = useState<DiffItem[] | null>(null)
  const [payload, setPayload] = useState<BulkUpdatePayload | null>(null)
  const [result, setResult] = useState<BulkUpdateResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  // Stock masivo panel state
  const [showStockPanel, setShowStockPanel] = useState(false)
  const [stockValue, setStockValue] = useState<string>('')
  const [selectedTalles, setSelectedTalles] = useState<Set<string>>(new Set(TALLES))
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [onlyExisting, setOnlyExisting] = useState(true)
  const [productSearch, setProductSearch] = useState('')

  // Discover all talle keys from data (in case DB has extra sizes)
  const allTalles = useCallback(() => {
    const set = new Set(TALLES)
    for (const row of exportData) {
      for (const talle of Object.keys(row.stock)) {
        set.add(talle)
      }
    }
    return [...set]
  }, [exportData])

  const handleExport = useCallback(async () => {
    const XLSX = await import('xlsx')
    const talleColumns = allTalles()

    const wsData = exportData.map((row) => {
      const base: Record<string, string | number> = {
        'Producto ID': row.producto_id,
        'Nombre': row.nombre,
        'Precio': row.precio,
        'Categoría': row.categoria,
        'Línea': row.linea,
        'Género': row.genero,
        'Activo': row.activo ? 'Sí' : 'No',
        'Destacado': row.destacado ? 'Sí' : 'No',
        'Descripción': row.descripcion ?? '',
        'Detalles': row.detalles ?? '',
        'Cuidado': row.cuidado ?? '',
        'Color ID': row.color_id,
        'Color': row.color_nombre,
      }
      for (const talle of talleColumns) {
        base[talle] = row.stock[talle] ?? 0
      }
      return base
    })

    const headers = [
      'Producto ID', 'Nombre', 'Precio', 'Categoría', 'Línea', 'Género',
      'Activo', 'Destacado', 'Descripción', 'Detalles', 'Cuidado',
      'Color ID', 'Color', ...talleColumns,
    ]

    const ws = XLSX.utils.json_to_sheet(wsData, { header: headers })

    ws['!cols'] = headers.map((h) => ({
      wch: h === 'Producto ID' || h === 'Color ID' ? 38
        : h === 'Nombre' || h === 'Descripción' ? 30
        : h === 'Detalles' || h === 'Cuidado' ? 25
        : 12,
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo')
    XLSX.writeFile(wb, `catalogo-seismiles-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }, [exportData, allTalles])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setImporting(true)
    setParseError(null)
    setDiff(null)
    setPayload(null)
    setResult(null)

    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

      if (rows.length === 0) {
        setParseError('El archivo está vacío o no tiene el formato esperado.')
        setImporting(false)
        return
      }

      const firstRow = rows[0]
      if (!('Producto ID' in firstRow) || !('Color ID' in firstRow)) {
        setParseError('Faltan columnas requeridas (Producto ID, Color ID). Usá el archivo exportado como base.')
        setImporting(false)
        return
      }

      // Build lookup from original data
      const originalMap = new Map<string, ProductExportRow>()
      for (const row of exportData) {
        originalMap.set(`${row.producto_id}::${row.color_id}`, row)
      }

      const diffs: DiffItem[] = []
      const productChangesMap = new Map<string, Record<string, unknown>>()
      const stockChanges: BulkUpdatePayload['stockChanges'] = []
      const talleColumns = allTalles()

      for (const imported of rows) {
        const prodId = String(imported['Producto ID'] ?? '')
        const colorId = String(imported['Color ID'] ?? '')
        const key = `${prodId}::${colorId}`
        const original = originalMap.get(key)

        if (!original) continue

        // Product-level fields (only take first occurrence per product)
        if (!productChangesMap.has(prodId)) {
          productChangesMap.set(prodId, {})
        }
        const pChanges = productChangesMap.get(prodId)!

        // Precio
        const newPrecio = Number(imported['Precio'])
        if (!isNaN(newPrecio) && newPrecio !== original.precio) {
          pChanges.precio = newPrecio
          diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: 'Precio', old_value: original.precio, new_value: newPrecio })
        }

        // Categoría
        const newCat = String(imported['Categoría'] ?? '')
        if (newCat && newCat !== original.categoria) {
          pChanges.categoria = newCat
          diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: 'Categoría', old_value: original.categoria, new_value: newCat })
        }

        // Línea
        const newLinea = String(imported['Línea'] ?? '')
        if (newLinea && newLinea !== original.linea) {
          pChanges.linea = newLinea
          diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: 'Línea', old_value: original.linea, new_value: newLinea })
        }

        // Género
        const newGenero = String(imported['Género'] ?? '')
        if (newGenero && newGenero !== original.genero) {
          pChanges.genero = newGenero
          diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: 'Género', old_value: original.genero, new_value: newGenero })
        }

        // Activo
        const newActivo = String(imported['Activo'] ?? '').toLowerCase()
        if (newActivo) {
          const activoBool = newActivo === 'sí' || newActivo === 'si' || newActivo === 'true' || newActivo === '1'
          if (activoBool !== original.activo) {
            pChanges.activo = activoBool
            diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: 'Activo', old_value: original.activo ? 'Sí' : 'No', new_value: activoBool ? 'Sí' : 'No' })
          }
        }

        // Destacado
        const newDest = String(imported['Destacado'] ?? '').toLowerCase()
        if (newDest) {
          const destBool = newDest === 'sí' || newDest === 'si' || newDest === 'true' || newDest === '1'
          if (destBool !== original.destacado) {
            pChanges.destacado = destBool
            diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: 'Destacado', old_value: original.destacado ? 'Sí' : 'No', new_value: destBool ? 'Sí' : 'No' })
          }
        }

        // Descripción, Detalles, Cuidado
        const textFields = [
          { header: 'Descripción', key: 'descripcion' },
          { header: 'Detalles', key: 'detalles' },
          { header: 'Cuidado', key: 'cuidado' },
        ] as const
        for (const { header, key } of textFields) {
          const newVal = String(imported[header] ?? '')
          const oldVal = original[key] ?? ''
          if (newVal !== oldVal) {
            pChanges[key] = newVal || null
            diffs.push({ producto_id: prodId, nombre: original.nombre, color_nombre: '', field: header, old_value: oldVal, new_value: newVal })
          }
        }

        // Stock per talle
        for (const talle of talleColumns) {
          const raw = imported[talle]
          if (raw === undefined || raw === null || raw === '') continue
          const newStock = Math.round(Number(raw))
          if (isNaN(newStock)) continue
          const oldStock = original.stock[talle] ?? 0
          if (newStock !== oldStock) {
            stockChanges.push({
              producto_id: prodId,
              color_id: colorId,
              talle,
              new_stock: newStock,
            })
            diffs.push({
              producto_id: prodId,
              nombre: original.nombre,
              color_nombre: original.color_nombre,
              field: `Stock ${talle}`,
              old_value: oldStock,
              new_value: newStock,
            })
          }
        }
      }

      // Build productChanges from map
      const productChanges: BulkUpdatePayload['productChanges'] = []
      for (const [pid, fields] of productChangesMap) {
        if (Object.keys(fields).length > 0) {
          productChanges.push({ producto_id: pid, fields })
        }
      }

      if (diffs.length === 0) {
        setParseError('No se detectaron cambios. El archivo es idéntico al catálogo actual.')
        setImporting(false)
        return
      }

      setDiff(diffs)
      setPayload({ productChanges, stockChanges })
    } catch (err) {
      setParseError(`Error al leer el archivo: ${(err as Error).message}`)
    }

    setImporting(false)
  }, [exportData, allTalles])

  const handleApply = useCallback(async () => {
    if (!payload) return
    setApplying(true)
    setResult(null)

    const res = await bulkUpdateCatalogAction(payload)
    setResult(res)
    setApplying(false)

    if (res.success) {
      router.refresh()
    }
  }, [payload, router])

  const handleCancel = useCallback(() => {
    setDiff(null)
    setPayload(null)
    setResult(null)
    setParseError(null)
  }, [])

  // Group exportData by producto_id for the stock masivo panel
  const productsGrouped = useCallback(() => {
    const map = new Map<string, { nombre: string; colores: { id: string; nombre: string; stock: Record<string, number> }[] }>()
    for (const row of exportData) {
      if (!row.color_id) continue
      if (!map.has(row.producto_id)) {
        map.set(row.producto_id, { nombre: row.nombre, colores: [] })
      }
      map.get(row.producto_id)!.colores.push({
        id: row.color_id,
        nombre: row.color_nombre,
        stock: row.stock,
      })
    }
    return [...map.entries()].map(([id, v]) => ({ id, ...v }))
  }, [exportData])

  const toggleTalle = useCallback((t: string) => {
    setSelectedTalles((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }, [])

  const toggleProduct = useCallback((id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredProducts = useCallback(() => {
    const q = productSearch.trim().toLowerCase()
    const all = productsGrouped()
    if (!q) return all
    return all.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [productSearch, productsGrouped])

  const toggleAllFiltered = useCallback(() => {
    const filtered = filteredProducts()
    const allSelected = filtered.every((p) => selectedProducts.has(p.id))
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        for (const p of filtered) next.delete(p.id)
      } else {
        for (const p of filtered) next.add(p.id)
      }
      return next
    })
  }, [filteredProducts, selectedProducts])

  const handlePreviewStockMasivo = useCallback(() => {
    setParseError(null)
    setResult(null)

    const newStock = Math.round(Number(stockValue))
    if (isNaN(newStock) || newStock < 0) {
      setParseError('Ingresá un stock válido (entero >= 0).')
      return
    }
    if (selectedTalles.size === 0) {
      setParseError('Seleccioná al menos un talle.')
      return
    }
    if (selectedProducts.size === 0) {
      setParseError('Seleccioná al menos un producto.')
      return
    }

    const groups = productsGrouped()
    const stockChanges: BulkUpdatePayload['stockChanges'] = []
    const diffs: DiffItem[] = []

    for (const prod of groups) {
      if (!selectedProducts.has(prod.id)) continue
      for (const color of prod.colores) {
        for (const talle of selectedTalles) {
          const existing = color.stock[talle]
          const variantExists = existing !== undefined
          if (onlyExisting && !variantExists) continue
          const oldStock = existing ?? 0
          if (oldStock === newStock) continue
          stockChanges.push({
            producto_id: prod.id,
            color_id: color.id,
            talle,
            new_stock: newStock,
          })
          diffs.push({
            producto_id: prod.id,
            nombre: prod.nombre,
            color_nombre: color.nombre,
            field: `Stock ${talle}`,
            old_value: oldStock,
            new_value: newStock,
          })
        }
      }
    }

    if (diffs.length === 0) {
      setParseError('No hay cambios para aplicar con los criterios elegidos.')
      return
    }

    setDiff(diffs)
    setPayload({ productChanges: [], stockChanges })
    setShowStockPanel(false)
  }, [stockValue, selectedTalles, selectedProducts, onlyExisting, productsGrouped])

  return (
    <div>
      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sand-200 hover:bg-sand-50 text-volcanic-700 text-body-sm font-medium rounded-xl transition-all"
        >
          <DownloadIcon className="w-4 h-4" />
          Exportar Excel
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sand-200 hover:bg-sand-50 text-volcanic-700 text-body-sm font-medium rounded-xl transition-all disabled:opacity-50"
        >
          <UploadIcon className="w-4 h-4" />
          {importing ? 'Leyendo...' : 'Importar Excel'}
        </button>

        <button
          onClick={() => {
            setShowStockPanel((v) => !v)
            setParseError(null)
            setResult(null)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sand-200 hover:bg-sand-50 text-volcanic-700 text-body-sm font-medium rounded-xl transition-all"
        >
          Stock masivo
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Stock masivo panel */}
      {showStockPanel && !diff && (
        <div className="mt-4 rounded-2xl bg-white border border-sand-200/60 p-5">
          <h3 className="font-heading text-lg text-volcanic-900">Modificar stock masivamente</h3>
          <p className="text-body-xs text-volcanic-500 mt-1">
            Aplica el mismo stock a los talles y productos seleccionados.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stock value */}
            <div>
              <label className="block text-body-xs font-semibold text-volcanic-700 mb-1.5">
                Nuevo stock
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                placeholder="Ej: 10"
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-volcanic-300"
              />
              <label className="mt-3 flex items-center gap-2 text-body-xs text-volcanic-600">
                <input
                  type="checkbox"
                  checked={onlyExisting}
                  onChange={(e) => setOnlyExisting(e.target.checked)}
                />
                Solo talles existentes (no crear variantes nuevas)
              </label>
            </div>

            {/* Talles */}
            <div>
              <label className="block text-body-xs font-semibold text-volcanic-700 mb-1.5">
                Talles a modificar
              </label>
              <div className="flex flex-wrap gap-2">
                {TALLES.map((t) => {
                  const active = selectedTalles.has(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTalle(t)}
                      className={`px-3 py-1.5 rounded-lg text-body-xs font-medium border transition-all ${
                        active
                          ? 'bg-volcanic-900 text-white border-volcanic-900'
                          : 'bg-white text-volcanic-600 border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-body-xs font-semibold text-volcanic-700">
                Productos ({selectedProducts.size} seleccionado{selectedProducts.size !== 1 ? 's' : ''})
              </label>
              <button
                type="button"
                onClick={toggleAllFiltered}
                className="text-body-xs text-volcanic-600 hover:text-volcanic-900 underline"
              >
                {filteredProducts().every((p) => selectedProducts.has(p.id)) && filteredProducts().length > 0
                  ? 'Deseleccionar visibles'
                  : 'Seleccionar visibles'}
              </button>
            </div>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full px-3 py-2 border border-sand-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-volcanic-300 mb-2"
            />
            <div className="max-h-64 overflow-y-auto border border-sand-200/60 rounded-lg divide-y divide-sand-200/30">
              {filteredProducts().map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-sand-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  <span className="text-body-sm text-volcanic-900 flex-1">{p.nombre}</span>
                  <span className="text-body-xs text-volcanic-500">
                    {p.colores.length} color{p.colores.length !== 1 ? 'es' : ''}
                  </span>
                </label>
              ))}
              {filteredProducts().length === 0 && (
                <div className="px-3 py-4 text-body-xs text-volcanic-500 text-center">
                  Sin resultados
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowStockPanel(false)}
              className="px-5 py-2.5 text-body-sm font-medium text-volcanic-600 hover:text-volcanic-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePreviewStockMasivo}
              className="px-6 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all"
            >
              Previsualizar cambios
            </button>
          </div>
        </div>
      )}

      {/* Parse error */}
      {parseError && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-body-sm text-amber-800 flex items-center justify-between">
          <span>{parseError}</span>
          <button onClick={handleCancel} className="ml-3 text-amber-600 hover:text-amber-800 underline text-body-xs">Cerrar</button>
        </div>
      )}

      {/* Diff preview */}
      {diff && diff.length > 0 && !result && (
        <div className="mt-6 rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
          <div className="p-5 border-b border-sand-200/60">
            <h3 className="font-heading text-lg text-volcanic-900">
              Vista previa de cambios
            </h3>
            <p className="text-body-xs text-volcanic-500 mt-1">
              {diff.length} cambio{diff.length !== 1 ? 's' : ''} detectado{diff.length !== 1 ? 's' : ''}. Revisá antes de aplicar.
            </p>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-sand-50">
                <tr className="border-b border-sand-200/60">
                  <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Color</th>
                  <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Campo</th>
                  <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Actual</th>
                  <th className="px-4 py-2.5 text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider">Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {diff.map((d, i) => (
                  <tr key={i} className="border-t border-sand-200/30">
                    <td className="px-4 py-2.5 text-body-sm text-volcanic-900">{d.nombre}</td>
                    <td className="px-4 py-2.5 text-body-sm text-volcanic-500">{d.color_nombre || '—'}</td>
                    <td className="px-4 py-2.5 text-body-sm font-medium text-volcanic-700">{d.field}</td>
                    <td className="px-4 py-2.5 text-body-sm text-red-600 line-through">{String(d.old_value)}</td>
                    <td className="px-4 py-2.5 text-body-sm text-emerald-700 font-medium">{String(d.new_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-sand-200/60 flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 text-body-sm font-medium text-volcanic-600 hover:text-volcanic-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-50 text-white text-body-sm font-semibold rounded-xl transition-all"
            >
              {applying ? 'Aplicando...' : `Aplicar ${diff.length} cambio${diff.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div className={`mt-4 p-4 rounded-xl border text-body-sm ${
          result.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-medium">
            {result.success ? 'Cambios aplicados correctamente' : 'Algunos cambios tuvieron errores'}
          </p>
          <p className="mt-1 text-body-xs">
            {result.productsUpdated} producto{result.productsUpdated !== 1 ? 's' : ''} actualizado{result.productsUpdated !== 1 ? 's' : ''}, {result.stockUpdated} stock{result.stockUpdated !== 1 ? 's' : ''} modificado{result.stockUpdated !== 1 ? 's' : ''}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-body-xs">
              {result.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
          <button onClick={handleCancel} className="mt-2 underline text-body-xs">Cerrar</button>
        </div>
      )}
    </div>
  )
}
