'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteFaqItem } from '@/actions/faq'
import type { FaqRow } from '@/features/shop/services/faq'

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
  )
}

interface Props {
  faqs: FaqRow[]
}

export function FaqItemsTable({ faqs }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteFaqItem(id)
    setDeletingId(null)
    setConfirmId(null)
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div key={faq.id} className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-body-sm font-semibold text-volcanic-900">
                  {faq.question}
                </h3>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-terra-500/10 text-terra-600 text-[11px] font-semibold">
                  {faq.section}
                </span>
                {!faq.is_active && (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-volcanic-100 text-volcanic-500 text-[11px] font-semibold">
                    Inactiva
                  </span>
                )}
                <span className="text-body-xs text-volcanic-500">
                  #{faq.display_order}
                </span>
              </div>
              <p className="text-body-sm text-volcanic-500 leading-relaxed line-clamp-2">
                {faq.answer}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/admin/faq/${faq.id}`}
                className="p-2 rounded-lg text-volcanic-500 hover:text-terra-500 hover:bg-sand-100 transition-all"
                title="Editar"
              >
                <EditIcon className="w-4 h-4" />
              </Link>

              {confirmId === faq.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(faq.id)}
                    disabled={deletingId === faq.id}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {deletingId === faq.id ? '...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-1.5 text-[11px] text-volcanic-500 hover:text-volcanic-600"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(faq.id)}
                  className="p-2 rounded-lg text-volcanic-500 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
