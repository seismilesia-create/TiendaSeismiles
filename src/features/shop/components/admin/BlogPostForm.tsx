'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBlogPost, updateBlogPost } from '@/actions/blog'
import type { BlogPostRow } from '@/features/shop/services/blog'

const CATEGORY_OPTIONS = [
  { id: 'cuidados', label: 'Cuidados' },
  { id: 'materiales', label: 'Materiales' },
  { id: 'estilo', label: 'Estilo' },
  { id: 'marca', label: 'Marca' },
  { id: 'general', label: 'General' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface Props {
  post?: BlogPostRow
}

export function BlogPostForm({ post }: Props) {
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [category, setCategory] = useState(post?.category ?? 'general')
  const [authorName, setAuthorName] = useState(post?.author_name ?? 'Seismiles')
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false)
  const [autoSlug, setAutoSlug] = useState(!isEdit)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (autoSlug) setSlug(slugify(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('excerpt', excerpt)
    formData.set('content', content)
    formData.set('cover_image_url', coverImageUrl)
    formData.set('category', category)
    formData.set('author_name', authorName)
    formData.set('is_published', String(isPublished))

    const result = isEdit
      ? await updateBlogPost(post.id, formData)
      : await createBlogPost(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/blog')
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
        {/* Titulo */}
        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Titulo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
            placeholder="Ej: Como cuidar tu remera de algodon peinado"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Slug (URL)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center rounded-xl bg-sand-100/50 border border-sand-200 overflow-hidden">
              <span className="px-4 py-3 text-body-sm text-volcanic-400 bg-sand-200/30 border-r border-sand-200">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false) }}
                required
                className="flex-1 px-4 py-3 bg-transparent text-volcanic-900 text-body-sm focus:outline-none"
                placeholder="como-cuidar-tu-remera"
              />
            </div>
            {!autoSlug && (
              <button
                type="button"
                onClick={() => { setAutoSlug(true); setSlug(slugify(title)) }}
                className="text-body-xs text-terra-500 hover:text-terra-600 whitespace-nowrap"
              >
                Auto
              </button>
            )}
          </div>
        </div>

        {/* Extracto */}
        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Extracto
            <span className="ml-2 font-normal text-volcanic-400">({excerpt.length}/200)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all resize-none"
            placeholder="Resumen corto del articulo para las cards y SEO..."
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
              placeholder="Escribe el contenido en Markdown...&#10;&#10;## Subtitulo&#10;&#10;Parrafo con **negrita** y *cursiva*.&#10;&#10;- Lista de items&#10;- Otro item"
            />
          )}
          <p className="mt-1.5 text-body-xs text-volcanic-400">
            Usa Markdown: **negrita**, *cursiva*, ## subtitulos, - listas, [links](url)
          </p>
        </div>

        {/* Imagen de portada */}
        <div>
          <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
            Imagen de portada (URL)
            <span className="ml-2 font-normal text-volcanic-400">Opcional</span>
          </label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-6">
          {/* Categoria */}
          <div className="flex-1">
            <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Autor */}
          <div className="flex-1">
            <label className="block text-body-sm font-semibold text-volcanic-900 mb-2">
              Autor
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
              placeholder="Seismiles"
            />
          </div>
        </div>

        {/* Publicado */}
        {isEdit && (
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-sand-200 text-terra-500 focus:ring-terra-500/30"
              />
              <span className="text-body-sm text-volcanic-700">Publicado (visible en el blog)</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear articulo'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="px-6 py-3 text-body-sm text-volcanic-500 hover:text-volcanic-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
