'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  createGiftCardDefAction,
  updateGiftCardDefAction,
  uploadGiftCardImageAction,
} from '@/actions/admin-gift-cards'

interface GiftCardDef {
  id: string
  titulo: string
  precio: number
  descripcion: string
  gradient_from: string
  gradient_to: string
  imagen_url: string | null
  activo: boolean
  orden: number
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export function GiftCardDefForm({ existing }: { existing?: GiftCardDef }) {
  const router = useRouter()
  const isEdit = !!existing

  const [titulo, setTitulo] = useState(existing?.titulo ?? '')
  const [precio, setPrecio] = useState(existing?.precio ?? 0)
  const [descripcion, setDescripcion] = useState(existing?.descripcion ?? '')
  const [gradientFrom, setGradientFrom] = useState(existing?.gradient_from ?? '#8B7355')
  const [gradientTo, setGradientTo] = useState(existing?.gradient_to ?? '#6B5B45')
  const [imagenUrl, setImagenUrl] = useState(existing?.imagen_url ?? null)
  const [activo, setActivo] = useState(existing?.activo ?? true)
  const [orden, setOrden] = useState(existing?.orden ?? 0)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.set('titulo', titulo)
    fd.set('precio', String(precio))
    fd.set('descripcion', descripcion)
    fd.set('gradient_from', gradientFrom)
    fd.set('gradient_to', gradientTo)
    fd.set('activo', String(activo))
    fd.set('orden', String(orden))

    const result = isEdit
      ? await updateGiftCardDefAction(existing!.id, fd)
      : await createGiftCardDefAction(fd)

    if ('error' in result && result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    // If creating and a local image was queued, upload now
    // (for edit mode, upload happens immediately)
    router.push('/admin/gift-cards')
    router.refresh()
  }

  async function handleUploadImage(file: File) {
    if (!existing?.id) return
    setUploading(true)
    setError(null)

    const fd = new FormData()
    fd.set('file', file)
    fd.set('def_id', existing.id)

    const result = await uploadGiftCardImageAction(fd)

    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setImagenUrl(result.url)
    }
    setUploading(false)
  }

  function handleRemoveImage() {
    setImagenUrl(null)
    // Clear from DB by updating with null
    if (existing?.id) {
      const fd = new FormData()
      fd.set('titulo', titulo)
      fd.set('precio', String(precio))
      fd.set('descripcion', descripcion)
      fd.set('gradient_from', gradientFrom)
      fd.set('gradient_to', gradientTo)
      fd.set('activo', String(activo))
      fd.set('orden', String(orden))
      updateGiftCardDefAction(existing.id, fd)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-body-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: fields */}
        <div className="space-y-5">
          <div>
            <label htmlFor="titulo" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Titulo
            </label>
            <input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              placeholder="Gift Card Premium"
            />
          </div>

          <div>
            <label htmlFor="precio" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Precio (ARS)
            </label>
            <input
              id="precio"
              type="number"
              value={precio || ''}
              onChange={(e) => setPrecio(Number(e.target.value))}
              required
              min={1}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              placeholder="15000"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Descripcion
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all resize-none"
              placeholder="Descripcion de la gift card..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gradient_from" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
                Color desde
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="gradient_from"
                  type="color"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-sand-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-sand-200 text-volcanic-900 text-body-sm font-mono focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="gradient_to" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
                Color hasta
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="gradient_to"
                  type="color"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-sand-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-sand-200 text-volcanic-900 text-body-sm font-mono focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Imagen (opcional)
            </label>
            <p className="text-body-xs text-volcanic-500 mb-3">
              Si subis una imagen, se muestra en lugar del gradiente.{!isEdit && ' Guarda la gift card primero para subir imagen.'}
            </p>

            {imagenUrl ? (
              <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-xl overflow-hidden bg-sand-100 group">
                <Image src={imagenUrl} alt="" fill className="object-cover" sizes="280px" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar imagen"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ) : isEdit ? (
              <label className={`flex flex-col items-center justify-center w-full max-w-[280px] aspect-[4/3] rounded-xl border-2 border-dashed border-sand-300 cursor-pointer hover:border-terra-400 hover:bg-sand-50 transition-all ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                <UploadIcon className="w-6 h-6 text-volcanic-500 mb-2" />
                <span className="text-body-xs text-volcanic-500">
                  {uploading ? 'Subiendo...' : 'Subir imagen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUploadImage(e.target.files[0])
                    e.target.value = ''
                  }}
                />
              </label>
            ) : (
              <div className="flex items-center justify-center w-full max-w-[280px] aspect-[4/3] rounded-xl border-2 border-dashed border-sand-200 bg-sand-50/50">
                <span className="text-body-xs text-volcanic-300">Disponible despues de guardar</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="orden" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
                Orden
              </label>
              <input
                id="orden"
                type="number"
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-5 h-5 rounded border-sand-300 text-terra-500 focus:ring-terra-500"
                />
                <span className="text-body-sm font-medium text-volcanic-700">Activa</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right column: preview */}
        <div>
          <p className="text-body-sm font-medium text-volcanic-700 mb-3">Preview</p>
          <div className="rounded-2xl overflow-hidden bg-white border border-sand-200/60 max-w-[280px]">
            <div
              className="relative aspect-[4/3] p-5 flex flex-col justify-between"
              style={
                imagenUrl
                  ? undefined
                  : { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
              }
            >
              {imagenUrl && (
                <Image src={imagenUrl} alt="" fill className="object-cover" sizes="280px" />
              )}
              <div className={`relative z-10 flex items-start justify-between ${imagenUrl ? 'drop-shadow-md' : ''}`}>
                <Image
                  src="/images/logo-seismiles-v2.png"
                  alt=""
                  width={80}
                  height={35}
                  className="h-5 w-auto brightness-0 invert opacity-40"
                  aria-hidden
                />
                <GiftIcon className="w-4 h-4 text-white/30" />
              </div>
              <div className={`relative z-10 ${imagenUrl ? 'drop-shadow-md' : ''}`}>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">Valor</p>
                <p className="font-heading text-2xl text-white leading-none">
                  {precio ? `$${precio.toLocaleString('es-AR')}` : '$0'}
                </p>
              </div>
              {imagenUrl && (
                <div className="absolute inset-0 bg-black/30" />
              )}
            </div>
            <div className="p-5">
              <h3 className="font-heading text-base text-volcanic-900 mb-1">
                {titulo || 'Titulo'}
              </h3>
              <p className="text-body-xs text-volcanic-500 leading-relaxed">
                {descripcion || 'Descripcion...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-sand-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear gift card'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/gift-cards')}
          className="px-6 py-3 border border-sand-200 text-volcanic-600 hover:text-volcanic-900 text-body-sm font-medium rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
