'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFaqItem, updateFaqItem } from '@/actions/faq'
import type { FaqRow } from '@/features/shop/services/faq'

interface Props {
  faq?: FaqRow
}

export function FaqItemForm({ faq }: Props) {
  const router = useRouter()
  const isEdit = !!faq

  const SECTION_OPTIONS = ['Envíos', 'Pagos', 'Productos', 'Cambios y Devoluciones', 'Gift Cards', 'Personalización', 'General']

  const [question, setQuestion] = useState(faq?.question ?? '')
  const [answer, setAnswer] = useState(faq?.answer ?? '')
  const [section, setSection] = useState(faq?.section ?? 'General')
  const [customSection, setCustomSection] = useState('')
  const [displayOrder, setDisplayOrder] = useState(faq?.display_order ?? 0)
  const [isActive, setIsActive] = useState(faq?.is_active ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('question', question)
    formData.set('answer', answer)
    formData.set('section', section === '__custom__' ? customSection : section)
    formData.set('display_order', String(displayOrder))
    formData.set('is_active', String(isActive))

    const result = isEdit
      ? await updateFaqItem(faq.id, formData)
      : await createFaqItem(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/faq')
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
        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Pregunta
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all resize-none"
            placeholder="Ej: Hacen envios a todo el pais?"
          />
        </div>

        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Respuesta
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all resize-none"
            placeholder="Escribi la respuesta completa..."
          />
        </div>

        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Seccion
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
          >
            {SECTION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom__">+ Nueva seccion</option>
          </select>
          {section === '__custom__' && (
            <input
              type="text"
              value={customSection}
              onChange={(e) => setCustomSection(e.target.value)}
              placeholder="Nombre de la nueva seccion"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
            />
          )}
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
              Orden
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              min={0}
              className="w-24 px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
            />
          </div>

          {isEdit && (
            <div className="pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-sand-200 text-terra-500 focus:ring-terra-500/30"
                />
                <span className="text-body-sm text-volcanic-700">Activa (visible en la pagina)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear pregunta'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/faq')}
          className="px-6 py-3 text-body-sm text-volcanic-500 hover:text-volcanic-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
