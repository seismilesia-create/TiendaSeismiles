'use client'

import { useState, useEffect } from 'react'
import { shopConfig } from '../config'

// ── Size data ──

interface SizeRow {
  talle: string
  pecho: string
  largo: string
  hombros: string
}

const REMERAS: SizeRow[] = [
  { talle: 'XS', pecho: '88 – 92', largo: '68', hombros: '42' },
  { talle: 'S', pecho: '92 – 96', largo: '70', hombros: '44' },
  { talle: 'M', pecho: '96 – 100', largo: '72', hombros: '46' },
  { talle: 'L', pecho: '100 – 104', largo: '74', hombros: '48' },
  { talle: 'XL', pecho: '104 – 110', largo: '76', hombros: '50' },
  { talle: 'XXL', pecho: '110 – 116', largo: '78', hombros: '52' },
]

const BUZOS: SizeRow[] = [
  { talle: 'XS', pecho: '92 – 96', largo: '66', hombros: '44' },
  { talle: 'S', pecho: '96 – 100', largo: '68', hombros: '46' },
  { talle: 'M', pecho: '100 – 104', largo: '70', hombros: '48' },
  { talle: 'L', pecho: '104 – 108', largo: '72', hombros: '50' },
  { talle: 'XL', pecho: '108 – 114', largo: '74', hombros: '52' },
  { talle: 'XXL', pecho: '114 – 120', largo: '76', hombros: '54' },
]

const CATEGORIES = [
  { id: 'remeras', label: 'Remeras', data: REMERAS },
  { id: 'buzos', label: 'Buzos y Camperas', data: BUZOS },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

// ── Icons ──

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

function RulerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
    </svg>
  )
}

// ── Professional torso diagram ──

function TorsoDiagram() {
  return (
    <div className="relative w-full max-w-[240px] mx-auto py-2">
      <svg viewBox="0 0 240 260" fill="none" className="w-full">
        {/* T-shirt silhouette */}
        <path
          d="M120 12 C112 12 108 16 104 22 L98 22 C88 22 72 28 60 36 L42 50 C38 53 38 58 42 60 L62 72 C64 73 67 72 68 70 L74 58 L74 100 C74 104 74 108 74 112 L74 220 C74 226 78 230 84 230 L156 230 C162 230 166 226 166 220 L166 112 C166 108 166 104 166 100 L166 58 L172 70 C173 72 176 73 178 72 L198 60 C202 58 202 53 198 50 L180 36 C168 28 152 22 142 22 L136 22 C132 16 128 12 120 12 Z"
          fill="#FAF8F4"
          stroke="#D4CFC7"
          strokeWidth={1.5}
        />

        {/* Collar */}
        <path
          d="M108 22 C108 32 112 38 120 38 C128 38 132 32 132 22"
          fill="none"
          stroke="#D4CFC7"
          strokeWidth={1.5}
        />

        {/* ── Measurement lines ── */}

        {/* Shoulders — across the top */}
        <line x1="62" y1="44" x2="178" y2="44" stroke="#8B7355" strokeWidth={2} strokeDasharray="6 3" />
        <circle cx="62" cy="44" r="4" fill="#8B7355" />
        <circle cx="178" cy="44" r="4" fill="#8B7355" />

        {/* Chest — across the mid torso */}
        <line x1="74" y1="100" x2="166" y2="100" stroke="#C75B39" strokeWidth={2} strokeDasharray="6 3" />
        <circle cx="74" cy="100" r="4" fill="#C75B39" />
        <circle cx="166" cy="100" r="4" fill="#C75B39" />

        {/* Length — vertical right side */}
        <line x1="190" y1="22" x2="190" y2="230" stroke="#5C5347" strokeWidth={2} strokeDasharray="6 3" />
        <circle cx="190" cy="22" r="4" fill="#5C5347" />
        <circle cx="190" cy="230" r="4" fill="#5C5347" />

        {/* Arrow tips for length */}
        <path d="M186 28 L190 18 L194 28" fill="none" stroke="#5C5347" strokeWidth={1.5} />
        <path d="M186 224 L190 234 L194 224" fill="none" stroke="#5C5347" strokeWidth={1.5} />
      </svg>

      {/* Labels positioned around the diagram */}
      <div className="absolute left-1 flex items-center gap-1.5" style={{ top: '14%' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#8B7355]" />
        <span className="text-[11px] font-semibold text-[#8B7355] tracking-wide">Hombros</span>
      </div>
      <div className="absolute left-1 flex items-center gap-1.5" style={{ top: '36%' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-terra-500" />
        <span className="text-[11px] font-semibold text-terra-500 tracking-wide">Pecho</span>
      </div>
      <div className="absolute flex items-center gap-1.5" style={{ top: '46%', right: '-2px' }}>
        <span className="text-[11px] font-semibold text-volcanic-500 tracking-wide">Largo</span>
        <span className="w-2.5 h-2.5 rounded-full bg-volcanic-500" />
      </div>
    </div>
  )
}

// ── Main Component ──

interface SizeGuideDrawerProps {
  open: boolean
  onClose: () => void
  /** Pre-select category based on the product's category */
  defaultCategory?: 'remeras' | 'buzos'
}

export function SizeGuideDrawer({ open, onClose, defaultCategory = 'remeras' }: SizeGuideDrawerProps) {
  const [activeId, setActiveId] = useState<CategoryId>(defaultCategory)

  // Sync with prop changes
  useEffect(() => {
    setActiveId(defaultCategory)
  }, [defaultCategory])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const activeCategory = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-between px-6 py-5 border-b border-sand-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-terra-500/10 flex items-center justify-center">
                <RulerIcon className="w-[18px] h-[18px] text-terra-500" />
              </div>
              <h2 className="font-heading text-lg text-volcanic-900">Guia de talles</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-sand-100 transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-volcanic-500" />
            </button>
          </div>

          <div className="px-6 py-8 space-y-10">
            {/* How to measure */}
            <div>
              <h3 className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-400 mb-1">
                Paso 1
              </h3>
              <p className="text-body-base font-semibold text-volcanic-900 mb-5">
                Como tomar las medidas
              </p>
              <div className="rounded-2xl bg-sand-50 border border-sand-200 p-6">
                <TorsoDiagram />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#8B7355] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-body-sm font-semibold text-volcanic-900">Hombros</p>
                    <p className="text-body-xs text-volcanic-500">De costura a costura, por la parte mas ancha.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full bg-terra-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-body-sm font-semibold text-volcanic-900">Pecho</p>
                    <p className="text-body-xs text-volcanic-500">Contorno completo a la altura del pecho, sin ajustar.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full bg-volcanic-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-body-sm font-semibold text-volcanic-900">Largo</p>
                    <p className="text-body-xs text-volcanic-500">Desde la base del cuello hasta el borde inferior.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Size table */}
            <div>
              <h3 className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-400 mb-1">
                Paso 2
              </h3>
              <p className="text-body-base font-semibold text-volcanic-900 mb-5">
                Encontra tu talle
              </p>

              {/* Interactive tabs */}
              <div className="flex gap-2 mb-5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveId(cat.id)}
                    className={`px-4 py-2 rounded-full text-body-xs font-semibold transition-all duration-200 ${
                      cat.id === activeId
                        ? 'bg-volcanic-900 text-white shadow-sm'
                        : 'bg-sand-100 text-volcanic-500 hover:bg-sand-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="rounded-xl border border-sand-200 overflow-hidden">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="bg-sand-50">
                      <th className="text-left px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">Talle</th>
                      <th className="text-center px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-terra-500" />
                          Pecho
                        </span>
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-volcanic-500" />
                          Largo
                        </span>
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#8B7355]" />
                          Hombros
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {activeCategory.data.map((row) => (
                      <tr key={row.talle} className="hover:bg-sand-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-volcanic-900">{row.talle}</td>
                        <td className="px-4 py-3.5 text-center text-volcanic-600">{row.pecho}</td>
                        <td className="px-4 py-3.5 text-center text-volcanic-600">{row.largo}</td>
                        <td className="px-4 py-3.5 text-center text-volcanic-600">{row.hombros}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Unit note */}
              <p className="text-body-xs text-volcanic-400 mt-3 text-center">
                Todas las medidas estan expresadas en centimetros (cm)
              </p>
            </div>

            {/* Tip */}
            <div className="flex items-start gap-3 rounded-xl bg-terra-500/5 border border-terra-500/15 p-4">
              <span className="text-lg leading-none mt-0.5">&#128161;</span>
              <p className="text-body-sm text-volcanic-700 leading-relaxed">
                <span className="font-semibold">Tip:</span> Si estas entre dos talles, te recomendamos elegir el mas grande para un calce mas comodo.
              </p>
            </div>

            {/* Help note */}
            <div className="rounded-xl bg-sand-50 border border-sand-200 p-5">
              <p className="text-body-sm text-volcanic-600 leading-relaxed">
                <span className="font-semibold text-volcanic-900">Dudas con tu talle?</span>{' '}
                Escribinos por{' '}
                <a
                  href={shopConfig.brand.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terra-500 hover:underline font-semibold"
                >
                  WhatsApp
                </a>{' '}
                con tu altura y peso y te asesoramos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
