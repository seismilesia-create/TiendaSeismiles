'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteBlogPost, togglePublishPost } from '@/actions/blog'
import type { BlogPostRow } from '@/features/shop/services/blog'

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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  cuidados: 'Cuidados',
  materiales: 'Materiales',
  estilo: 'Estilo',
  marca: 'Marca',
  general: 'General',
}

interface Props {
  posts: BlogPostRow[]
}

export function BlogPostsTable({ posts }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteBlogPost(id)
    setDeletingId(null)
    setConfirmId(null)
  }

  async function handleTogglePublish(id: string) {
    setTogglingId(id)
    await togglePublishPost(id)
    setTogglingId(null)
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div key={post.id} className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-body-sm font-semibold text-volcanic-900">
                  {post.title}
                </h3>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-terra-500/10 text-terra-600 text-[11px] font-semibold">
                  {CATEGORY_LABELS[post.category] || post.category}
                </span>
                {post.is_published ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-success-100 text-success-700 text-[11px] font-semibold">
                    Publicado
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-volcanic-100 text-volcanic-500 text-[11px] font-semibold">
                    Borrador
                  </span>
                )}
              </div>
              <p className="text-body-sm text-volcanic-500 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 mt-2 text-body-xs text-volcanic-400">
                <span>{post.author_name}</span>
                <span>{formatDate(post.published_at || post.created_at)}</span>
                <span className="text-volcanic-300">/blog/{post.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Toggle publish */}
              <button
                onClick={() => handleTogglePublish(post.id)}
                disabled={togglingId === post.id}
                className="p-2 rounded-lg text-volcanic-500 hover:text-terra-500 hover:bg-sand-100 transition-all disabled:opacity-50"
                title={post.is_published ? 'Despublicar' : 'Publicar'}
              >
                {post.is_published
                  ? <EyeIcon className="w-4 h-4" />
                  : <EyeOffIcon className="w-4 h-4" />
                }
              </button>

              {/* Edit */}
              <Link
                href={`/admin/blog/${post.id}`}
                className="p-2 rounded-lg text-volcanic-500 hover:text-terra-500 hover:bg-sand-100 transition-all"
                title="Editar"
              >
                <EditIcon className="w-4 h-4" />
              </Link>

              {/* Delete */}
              {confirmId === post.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {deletingId === post.id ? '...' : 'Confirmar'}
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
                  onClick={() => setConfirmId(post.id)}
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
