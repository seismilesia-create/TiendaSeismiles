'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FaqItem } from '@/features/shop/types'

/* ── Icons ── */

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

const SECTION_ICONS: Record<string, (props: { className?: string }) => React.ReactNode> = {
  Envíos: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
    </svg>
  ),
  Pagos: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  Productos: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  ),
  'Cambios y Devoluciones': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  ),
  'Gift Cards': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  ),
  Personalización: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  ),
}

function DefaultIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  )
}

/* ── Answer text with auto-linking ── */

function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('/') ? (
          <Link key={i} href={part} className="text-terra-500 hover:text-terra-600 underline underline-offset-2 transition-colors">
            Ver política completa
          </Link>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

/* ── Accordion item ── */

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl bg-white border border-sand-200/60 overflow-hidden transition-shadow duration-300 hover:shadow-warm">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-5 text-left"
      >
        <span className="font-heading text-body-md lg:text-lg text-volcanic-900 pr-4">
          {item.question}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-volcanic-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-terra-500' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-5">
            <div className="w-8 h-px bg-terra-500/20 mb-4" />
            <p className="text-body-md text-volcanic-500 leading-relaxed">
              <AnswerText text={item.answer} />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ── */

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = useMemo(() => {
    const seen: string[] = []
    for (const item of items) {
      const s = item.section ?? 'General'
      if (!seen.includes(s)) seen.push(s)
    }
    return seen
  }, [items])

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>()
    for (const item of items) {
      const s = item.section ?? 'General'
      const arr = map.get(s) ?? []
      arr.push(item)
      map.set(s, arr)
    }
    return map
  }, [items])

  const hasSections = sections.length > 1

  if (!hasSections) {
    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isOpen={openKey === String(i)}
            onToggle={() => setOpenKey(openKey === String(i) ? null : String(i))}
          />
        ))}
      </div>
    )
  }

  const current = activeSection

  return (
    <div className="space-y-3">
      {sections.map((s) => {
        const isActive = current === s
        const Icon = SECTION_ICONS[s] ?? DefaultIcon
        const sectionItems = grouped.get(s) ?? []

        return (
          <div key={s}>
            {/* Section bar */}
            <button
              onClick={() => { setActiveSection(isActive ? null : s); setOpenKey(null) }}
              className={`flex items-center justify-between w-full px-6 py-5 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-volcanic-900 border-volcanic-900 text-white shadow-lg'
                  : 'bg-white border-sand-200/60 text-volcanic-900 hover:shadow-warm'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-terra-400' : 'text-volcanic-500'} transition-colors`} />
                <span className="font-heading text-body-md lg:text-lg">{s}</span>
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                  isActive ? 'rotate-180 text-terra-400' : 'text-volcanic-500'
                }`}
              />
            </button>

            {/* Section content */}
            <div
              className={`grid transition-all duration-300 ${
                isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 pt-3">
                  {sectionItems.map((item, i) => {
                    const key = `${s}-${i}`
                    return (
                      <AccordionItem
                        key={key}
                        item={item}
                        isOpen={openKey === key}
                        onToggle={() => setOpenKey(openKey === key ? null : key)}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
