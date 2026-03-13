'use client'

import { useState } from 'react'
import { replyToQuestion, archiveQuestion } from '@/actions/faq'
import type { FaqQuestionRow } from '@/features/shop/services/faq'

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></svg>
  )
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
  )
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  answered: { label: 'Respondida', className: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'Archivada', className: 'bg-volcanic-100 text-volcanic-500' },
}

interface Props {
  questions: FaqQuestionRow[]
}

export function FaqQuestionsTable({ questions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReply(questionId: string) {
    setLoading(true)
    setError(null)
    const result = await replyToQuestion(questionId, replyText)
    if (result.error) {
      setError(result.error)
    } else {
      setExpandedId(null)
      setReplyText('')
    }
    setLoading(false)
  }

  async function handleArchive(questionId: string) {
    setLoading(true)
    await archiveQuestion(questionId)
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const status = STATUS_LABELS[q.status] ?? STATUS_LABELS.pending
        const isExpanded = expandedId === q.id

        return (
          <div key={q.id} className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-body-sm font-semibold text-volcanic-900 truncate">
                    {q.user_name || q.user_email}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-body-xs text-volcanic-500">
                  {q.user_email} — {new Date(q.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {q.status !== 'archived' && (
                <div className="flex items-center gap-2 shrink-0">
                  {q.status === 'pending' && (
                    <button
                      onClick={() => {
                        setExpandedId(isExpanded ? null : q.id)
                        setReplyText('')
                        setError(null)
                      }}
                      className="text-body-xs font-semibold text-terra-500 hover:text-terra-600 transition-colors"
                    >
                      Responder
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(q.id)}
                    disabled={loading}
                    className="p-1.5 rounded-lg text-volcanic-500 hover:text-volcanic-600 hover:bg-sand-100 transition-all"
                    title="Archivar"
                  >
                    <ArchiveIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Message */}
            <p className="text-body-sm text-volcanic-700 leading-relaxed mb-3">
              {q.message}
            </p>

            {/* Existing reply */}
            {q.admin_reply && (
              <div className="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200/60">
                <p className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">Tu respuesta</p>
                <p className="text-body-sm text-volcanic-700 leading-relaxed">{q.admin_reply}</p>
                {q.replied_at && (
                  <p className="text-body-xs text-volcanic-500 mt-2">
                    {new Date(q.replied_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )}

            {/* Reply form */}
            {isExpanded && (
              <div className="mt-4 space-y-3">
                {error && (
                  <p className="text-body-xs text-red-500">{error}</p>
                )}
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribi tu respuesta..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all resize-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReply(q.id)}
                    disabled={loading || !replyText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-terra-500 hover:bg-terra-600 text-white text-body-xs font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SendIcon className="w-3.5 h-3.5" />
                    {loading ? 'Enviando...' : 'Enviar respuesta'}
                  </button>
                  <button
                    onClick={() => { setExpandedId(null); setReplyText(''); setError(null) }}
                    className="text-body-xs text-volcanic-500 hover:text-volcanic-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
