'use client'

import { useState } from 'react'

/* ─── Filter data matching site taxonomy ─── */

const PRODUCT_TYPES = [
  { value: 'todos', label: 'Todos' },
  { value: 'remeras-lisas', label: 'Remeras Lisas' },
  { value: 'buzos', label: 'Buzos' },
]

const PRODUCT_LINES = [
  { value: 'arista', label: 'Línea Arista', type: 'remeras-lisas' },
  { value: 'pissis', label: 'Línea Pissis', type: 'remeras-lisas' },
  { value: 'origen', label: 'Línea Origen', type: 'remeras-lisas' },
  { value: 'terreno', label: 'Línea Terreno', type: 'remeras-lisas' },
  { value: 'tres-cruces', label: 'Línea Tres Cruces', type: 'buzos' },
]

const SORT_OPTIONS = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nuevos', label: 'Más recientes' },
]

/* ─── Icons ─── */

function ChevronIcon({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${className} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

/* ─── Props ─── */

export interface FilterColor {
  hex: string
  label: string
}

export interface CatalogFiltersProps {
  activeType: string
  onTypeChange: (type: string) => void
  activeLine: string
  onLineChange: (line: string) => void
  activeSort: string
  onSortChange: (sort: string) => void
  activeColor: string | null
  onColorChange: (color: string) => void
  activeSizes: string[]
  onSizeToggle: (size: string) => void
  totalProducts: number
  onClearAll: () => void
  availableColors: FilterColor[]
  availableSizes: string[]
}

/* ─── Mobile Filters ─── */

export function MobileFilters(props: CatalogFiltersProps) {
  const [open, setOpen] = useState(false)

  const activeFilterCount =
    (props.activeType !== 'todos' ? 1 : 0) +
    (props.activeLine !== 'todos' ? 1 : 0) +
    (props.activeColor ? 1 : 0) +
    props.activeSizes.length

  return (
    <div className="lg:hidden">
      {/* Top bar */}
      <div className="space-y-3 py-4">
        <p className="text-body-sm text-volcanic-600">
          <span className="font-semibold text-volcanic-900">{props.totalProducts}</span>{' '}
          {props.totalProducts === 1 ? 'producto' : 'productos'}
        </p>
        <div className="flex items-center justify-between gap-3">
          <select
            value={props.activeSort}
            onChange={(e) => props.onSortChange(e.target.value)}
            className="flex-1 text-body-sm text-volcanic-700 bg-white px-4 py-2.5 rounded-xl border border-sand-200 focus:outline-none focus:border-terra-500/50 cursor-pointer transition-all"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sand-200 text-body-sm font-medium text-volcanic-700 hover:border-volcanic-400 transition-colors whitespace-nowrap"
          >
            <FilterIcon className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-terra-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter pills */}
      <ActiveFilterPills {...props} />

      {/* Fullscreen filter panel */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="flex items-center justify-between px-4 py-4 border-b border-sand-200">
            <h2 className="text-body-lg font-semibold text-volcanic-900">Filtros</h2>
            <button onClick={() => setOpen(false)} className="p-2 text-volcanic-500 hover:text-volcanic-900 transition-colors">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            <TypeFilter activeType={props.activeType} onChange={props.onTypeChange} />
            <LineFilter activeType={props.activeType} activeLine={props.activeLine} onChange={props.onLineChange} />
            <ColorFilter activeColor={props.activeColor} onChange={props.onColorChange} colors={props.availableColors} />
            <SizeFilter activeSizes={props.activeSizes} onToggle={props.onSizeToggle} sizes={props.availableSizes} />
          </div>
          <div className="absolute bottom-0 inset-x-0 px-4 py-4 border-t border-sand-200 bg-white flex gap-3">
            <button
              onClick={() => { props.onClearAll(); setOpen(false) }}
              className="flex-1 py-3 rounded-xl border border-sand-200 text-body-sm font-medium text-volcanic-700 hover:bg-sand-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-3 rounded-xl bg-volcanic-900 text-white text-body-sm font-semibold hover:bg-volcanic-800 transition-colors"
            >
              Ver {props.totalProducts} productos
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Desktop Sidebar Filters ─── */

export function DesktopFilters(props: CatalogFiltersProps) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-28 bg-white rounded-2xl shadow-card p-5 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-sand-200">
          <h2 className="text-body-lg font-semibold text-volcanic-900">Filtros</h2>
          {hasActiveFilters(props) && (
            <button
              onClick={props.onClearAll}
              className="text-body-xs text-terra-500 hover:text-terra-600 font-medium transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>

        <TypeFilter activeType={props.activeType} onChange={props.onTypeChange} />
        <LineFilter activeType={props.activeType} activeLine={props.activeLine} onChange={props.onLineChange} />
        <ColorFilter activeColor={props.activeColor} onChange={props.onColorChange} colors={props.availableColors} />
        <SizeFilter activeSizes={props.activeSizes} onToggle={props.onSizeToggle} sizes={props.availableSizes} />
      </div>
    </div>
  )
}

/* ─── Desktop Top Toolbar ─── */

export function DesktopToolbar({
  activeSort,
  onSortChange,
  totalProducts,
}: Pick<CatalogFiltersProps, 'activeSort' | 'onSortChange' | 'totalProducts'>) {
  return (
    <div className="hidden lg:flex items-center justify-between pb-6 border-b border-sand-200">
      <p className="text-body-sm text-volcanic-600">
        <span className="font-semibold text-volcanic-900">{totalProducts}</span>{' '}
        {totalProducts === 1 ? 'producto' : 'productos'}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-body-xs text-volcanic-500">Ordenar por:</span>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-body-sm font-medium text-volcanic-700 bg-white px-4 py-2 rounded-xl border border-sand-200 focus:outline-none focus:border-terra-500/50 cursor-pointer transition-all"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

/* ─── Active Filter Pills (mobile) ─── */

function ActiveFilterPills(props: CatalogFiltersProps) {
  const pills: { label: string; onRemove: () => void }[] = []

  if (props.activeType !== 'todos') {
    const t = PRODUCT_TYPES.find((t) => t.value === props.activeType)
    if (t) pills.push({ label: t.label, onRemove: () => props.onTypeChange('todos') })
  }
  if (props.activeLine !== 'todos') {
    const l = PRODUCT_LINES.find((l) => l.value === props.activeLine)
    if (l) pills.push({ label: l.label, onRemove: () => props.onLineChange('todos') })
  }
  if (props.activeColor) {
    const c = props.availableColors.find((c) => c.hex === props.activeColor)
    if (c) pills.push({ label: c.label, onRemove: () => props.onColorChange(props.activeColor!) })
  }
  props.activeSizes.forEach((size) => {
    pills.push({ label: `Talle ${size}`, onRemove: () => props.onSizeToggle(size) })
  })

  if (pills.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 pb-4">
      {pills.map((pill) => (
        <button
          key={pill.label}
          onClick={pill.onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-volcanic-900 text-white text-body-xs font-medium transition-colors hover:bg-volcanic-800"
        >
          {pill.label}
          <CloseIcon className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={props.onClearAll}
        className="px-3 py-1.5 rounded-full text-body-xs font-medium text-terra-500 hover:text-terra-600 transition-colors"
      >
        Limpiar todo
      </button>
    </div>
  )
}

/* ─── Individual Filter Sections ─── */

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-sand-200 pt-4 pb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 group-hover:text-volcanic-900 transition-colors">
          {title}
        </span>
        <ChevronIcon className="w-4 h-4 text-volcanic-500" open={open} />
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

function TypeFilter({ activeType, onChange }: { activeType: string; onChange: (v: string) => void }) {
  return (
    <FilterSection title="Tipo de prenda">
      <div className="space-y-0.5">
        {PRODUCT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-body-sm transition-colors ${activeType === type.value
              ? 'bg-terra-500/10 text-terra-600 font-medium'
              : 'text-volcanic-600 hover:bg-sand-50 hover:text-volcanic-900'
              }`}
          >
            {type.label}
            {activeType === type.value && (
              <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
            )}
          </button>
        ))}
      </div>
    </FilterSection>
  )
}

function LineFilter({ activeType, activeLine, onChange }: { activeType: string; activeLine: string; onChange: (v: string) => void }) {
  const visibleLines = activeType === 'todos'
    ? PRODUCT_LINES
    : PRODUCT_LINES.filter((l) => l.type === activeType)

  if (visibleLines.length === 0) return null

  return (
    <FilterSection title="Línea">
      <div className="space-y-0.5">
        <button
          onClick={() => onChange('todos')}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-body-sm transition-colors ${activeLine === 'todos'
            ? 'bg-terra-500/10 text-terra-600 font-medium'
            : 'text-volcanic-600 hover:bg-sand-50 hover:text-volcanic-900'
            }`}
        >
          Todas las líneas
          {activeLine === 'todos' && <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />}
        </button>
        {visibleLines.map((line) => (
          <button
            key={line.value}
            onClick={() => onChange(line.value)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-body-sm transition-colors ${activeLine === line.value
              ? 'bg-terra-500/10 text-terra-600 font-medium'
              : 'text-volcanic-600 hover:bg-sand-50 hover:text-volcanic-900'
              }`}
          >
            {line.label}
            {activeLine === line.value && <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />}
          </button>
        ))}
      </div>
    </FilterSection>
  )
}

function ColorFilter({ activeColor, onChange, colors }: { activeColor: string | null; onChange: (c: string) => void; colors: FilterColor[] }) {
  if (colors.length === 0) return null

  return (
    <FilterSection title="Color">
      <div className="grid grid-cols-4 gap-3">
        {colors.map((c) => {
          const isActive = activeColor === c.hex
          const isLight = isLightColor(c.hex)
          return (
            <button
              key={c.hex}
              onClick={() => onChange(c.hex)}
              className="flex flex-col items-center gap-1.5 group"
              title={c.label}
            >
              <span
                className={`w-8 h-8 rounded-full border-2 transition-all ${isActive
                  ? 'border-terra-500 ring-2 ring-terra-500/20 scale-110'
                  : isLight
                    ? 'border-sand-300 group-hover:border-volcanic-400'
                    : 'border-transparent group-hover:border-volcanic-400'
                  }`}
                style={{ backgroundColor: c.hex }}
              />
              <span className={`text-[10px] transition-colors ${isActive ? 'text-terra-600 font-medium' : 'text-volcanic-500'}`}>
                {c.label}
              </span>
            </button>
          )
        })}
      </div>
    </FilterSection>
  )
}

function SizeFilter({ activeSizes, onToggle, sizes }: { activeSizes: string[]; onToggle: (s: string) => void; sizes: string[] }) {
  if (sizes.length === 0) return null

  return (
    <FilterSection title="Talle" defaultOpen={false}>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onToggle(size)}
            className={`w-12 h-10 rounded-lg text-body-xs font-semibold transition-colors ${activeSizes.includes(size)
              ? 'bg-volcanic-900 text-white'
              : 'bg-sand-100 text-volcanic-600 hover:bg-sand-200 hover:text-volcanic-900'
              }`}
          >
            {size}
          </button>
        ))}
      </div>
    </FilterSection>
  )
}

/* ─── Helpers ─── */

function hasActiveFilters(props: CatalogFiltersProps): boolean {
  return (
    props.activeType !== 'todos' ||
    props.activeLine !== 'todos' ||
    props.activeColor !== null ||
    props.activeSizes.length > 0
  )
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 180
}
