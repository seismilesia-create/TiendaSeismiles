'use client'

import { useEffect } from 'react'
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

// ── Body diagram ──

function BodyDiagram() {
  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <svg viewBox="0 0 200 280" fill="none" className="w-full text-volcanic-300">
        {/* Head */}
        <circle cx="100" cy="30" r="20" stroke="currentColor" strokeWidth={1.5} />
        {/* Body */}
        <path d="M100 50 V 160" stroke="currentColor" strokeWidth={1.5} />
        {/* Arms */}
        <path d="M100 80 L 50 120" stroke="currentColor" strokeWidth={1.5} />
        <path d="M100 80 L 150 120" stroke="currentColor" strokeWidth={1.5} />
        {/* Legs */}
        <path d="M100 160 L 70 240" stroke="currentColor" strokeWidth={1.5} />
        <path d="M100 160 L 130 240" stroke="currentColor" strokeWidth={1.5} />

        {/* Measurement lines */}
        {/* Chest (pecho) */}
        <line x1="50" y1="85" x2="150" y2="85" stroke="#C75B39" strokeWidth={1.5} strokeDasharray="4 2" />
        <circle cx="50" cy="85" r="3" fill="#C75B39" />
        <circle cx="150" cy="85" r="3" fill="#C75B39" />

        {/* Shoulders (hombros) */}
        <line x1="55" y1="70" x2="145" y2="70" stroke="#8B7355" strokeWidth={1.5} strokeDasharray="4 2" />
        <circle cx="55" cy="70" r="3" fill="#8B7355" />
        <circle cx="145" cy="70" r="3" fill="#8B7355" />

        {/* Length (largo) */}
        <line x1="165" y1="55" x2="165" y2="160" stroke="#5C5347" strokeWidth={1.5} strokeDasharray="4 2" />
        <circle cx="165" cy="55" r="3" fill="#5C5347" />
        <circle cx="165" cy="160" r="3" fill="#5C5347" />
      </svg>

      {/* Labels */}
      <div className="absolute top-[28%] left-0 text-[10px] font-semibold text-terra-500">Pecho</div>
      <div className="absolute top-[22%] left-0 text-[10px] font-semibold text-[#8B7355]">Hombros</div>
      <div className="absolute top-[38%] right-0 text-[10px] font-semibold text-volcanic-500">Largo</div>
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

  const activeCategory = CATEGORIES.find((c) => c.id === defaultCategory) ?? CATEGORIES[0]

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
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-sand-200">
            <div className="flex items-center gap-3">
              <RulerIcon className="w-5 h-5 text-terra-500" />
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
              <h3 className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-5">
                Como medir
              </h3>
              <BodyDiagram />
              <div className="mt-5 space-y-3">
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

            {/* Category tabs */}
            <div>
              <h3 className="text-body-xs font-semibold uppercase tracking-widest text-volcanic-700 mb-4">
                Medidas en cm
              </h3>

              {/* Tabs — visual only since we auto-detect from product */}
              <div className="flex gap-2 mb-5">
                {CATEGORIES.map((cat) => (
                  <span
                    key={cat.id}
                    className={`px-4 py-2 rounded-lg text-body-xs font-semibold transition-colors ${
                      cat.id === activeCategory.id
                        ? 'bg-volcanic-900 text-white'
                        : 'bg-sand-100 text-volcanic-500'
                    }`}
                  >
                    {cat.label}
                  </span>
                ))}
              </div>

              {/* Table */}
              <div className="rounded-xl border border-sand-200 overflow-hidden">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="bg-sand-50">
                      <th className="text-left px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">Talle</th>
                      <th className="text-center px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">Pecho</th>
                      <th className="text-center px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">Largo</th>
                      <th className="text-center px-4 py-3 font-semibold text-volcanic-900 text-body-xs uppercase tracking-wider">Hombros</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {activeCategory.data.map((row) => (
                      <tr key={row.talle} className="hover:bg-sand-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-volcanic-900">{row.talle}</td>
                        <td className="px-4 py-3 text-center text-volcanic-600">{row.pecho}</td>
                        <td className="px-4 py-3 text-center text-volcanic-600">{row.largo}</td>
                        <td className="px-4 py-3 text-center text-volcanic-600">{row.hombros}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
