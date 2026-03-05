'use client'

import { useState } from 'react'
import type { FaqItem } from '@/features/shop/types'

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="rounded-xl bg-white border border-sand-200/60 overflow-hidden transition-shadow duration-300 hover:shadow-warm"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex items-center justify-between w-full px-6 py-5 text-left"
            >
              <span className="font-heading text-body-md lg:text-lg text-volcanic-900 pr-4">
                {item.question}
              </span>
              <ChevronDownIcon
                className={`w-5 h-5 shrink-0 text-volcanic-400 transition-transform duration-300 ${
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
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
