'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaignAction, updateCampaignAction } from '@/actions/admin-newsletter'
import type { CampaignRow } from '@/features/shop/services/newsletter'

interface Props {
  campaign?: CampaignRow
}

export function CampaignForm({ campaign }: Props) {
  const router = useRouter()
  const isEdit = !!campaign

  const [subject, setSubject] = useState(campaign?.subject ?? '')
  const [content, setContent] = useState(campaign?.content ?? '')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('subject', subject)
    formData.set('content', content)

    const result = isEdit
      ? await updateCampaignAction(campaign.id, formData)
      : await createCampaignAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/newsletter')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-sand-200/60 p-6 lg:p-8 space-y-5">
        {/* Asunto */}
        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Asunto del email
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
            placeholder="Ej: Nuevos colores de temporada disponibles"
          />
        </div>

        {/* Contenido */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-body-sm font-semibold text-volcanic-900">
              Contenido (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-body-xs text-terra-500 hover:text-terra-600 transition-colors"
            >
              {showPreview ? 'Editar' : 'Vista previa'}
            </button>
          </div>
          {showPreview ? (
            <div className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm min-h-[240px] whitespace-pre-wrap">
              {content || <span className="text-volcanic-400">Sin contenido...</span>}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all resize-y font-mono"
              placeholder={"Escribe el contenido en Markdown...\n\n## Subtitulo\n\nParrafo con **negrita** y *cursiva*.\n\n[Ver catalogo](https://seismiles.com/catalogo)"}
            />
          )}
          <p className="mt-1.5 text-body-xs text-volcanic-400">
            Usa Markdown: **negrita**, *cursiva*, ## subtitulos, [links](url)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear borrador'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/newsletter')}
          className="px-6 py-3 text-body-sm text-volcanic-500 hover:text-volcanic-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
