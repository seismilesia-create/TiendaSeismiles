'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitArrepentimiento } from '@/actions/arrepentimientos'

type Submitting = { state: 'idle' | 'submitting' }
type Result =
  | { state: 'success'; codigo: string }
  | { state: 'error'; message: string }

export function ArrepentimientoForm() {
  const [status, setStatus] = useState<Submitting | Result>({ state: 'idle' })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus({ state: 'submitting' })

    const fd = new FormData(event.currentTarget)
    const result = await submitArrepentimiento({
      nombre: String(fd.get('nombre') ?? ''),
      dni: String(fd.get('dni') ?? ''),
      email: String(fd.get('email') ?? ''),
      telefono: String(fd.get('telefono') ?? ''),
      numero_pedido: String(fd.get('numero_pedido') ?? ''),
      fecha_compra: String(fd.get('fecha_compra') ?? ''),
      metodo_pago: String(fd.get('metodo_pago') ?? ''),
      motivo: String(fd.get('motivo') ?? ''),
    })

    if ('error' in result) {
      setStatus({ state: 'error', message: result.error })
      return
    }
    setStatus({ state: 'success', codigo: result.codigo })
  }

  if (status.state === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-sand-200/60 p-8 lg:p-10 shadow-warm-sm">
        <div className="w-14 h-14 rounded-full bg-terra-500/10 flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-terra-500">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-heading text-display-xs text-volcanic-900 mb-3">
          Solicitud registrada
        </h2>
        <p className="text-body-md text-volcanic-500 leading-relaxed mb-6">
          Tu solicitud de arrepentimiento fue registrada correctamente.
          Te enviamos la constancia al email que declaraste.
        </p>

        <div className="bg-volcanic-900 rounded-xl p-5 mb-6">
          <p className="text-body-xs uppercase tracking-widest text-white/60 mb-2">
            Código de constancia
          </p>
          <p className="font-mono text-xl font-bold text-white tracking-wider">
            {status.codigo}
          </p>
        </div>

        <p className="text-body-sm text-volcanic-500 leading-relaxed mb-6">
          Vamos a contactarte dentro de las <strong className="text-volcanic-900">24 horas hábiles</strong> para
          coordinar la devolución del producto y procesar el reembolso integro por el mismo medio de pago.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  const isSubmitting = status.state === 'submitting'
  const errorMessage = status.state === 'error' ? status.message : null

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-sand-200/60 p-6 lg:p-10 shadow-warm-sm space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Nombre y apellido" name="nombre" required maxLength={120} />
        <Field label="DNI" name="dni" required maxLength={20} inputMode="numeric" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Email" name="email" type="email" required maxLength={200} />
        <Field label="Teléfono" name="telefono" maxLength={40} inputMode="tel" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Número de pedido" name="numero_pedido" required maxLength={60} placeholder="Ej: SEIS-00123" />
        <Field label="Fecha de compra" name="fecha_compra" type="date" />
      </div>

      <Field
        label="Medio de pago (opcional)"
        name="metodo_pago"
        maxLength={60}
        placeholder="Ej: tarjeta de crédito, transferencia, Mercado Pago"
      />

      <div>
        <label htmlFor="motivo" className="block text-body-sm font-semibold text-volcanic-900 mb-2">
          Motivo <span className="text-volcanic-500 font-normal">(opcional)</span>
        </label>
        <textarea
          id="motivo"
          name="motivo"
          maxLength={3000}
          rows={4}
          className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-body-sm text-volcanic-900 placeholder:text-volcanic-400 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500 transition-all resize-none"
        />
      </div>

      <div className="bg-sand-100 rounded-xl p-4 text-body-xs text-volcanic-500 leading-relaxed">
        <p className="font-semibold text-volcanic-900 mb-1">
          Declaracion de arrepentimiento
        </p>
        <p>
          Al enviar este formulario declaro ejercer el derecho de arrepentimiento
          previsto en el art. 34 de la Ley 24.240 y la Res. 424/2020, dentro de
          los 10 días corridos de la celebracion del contrato o la recepcion del
          producto. Entiendo que el producto debera ser devuelto en su estado
          original y que los costos de envío de la devolución están a cargo del vendedor.
        </p>
      </div>

      {errorMessage ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-body-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-body-sm font-semibold rounded-xl transition-all"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  maxLength?: number
  placeholder?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'none' | 'decimal'
}

function Field({ label, name, type = 'text', required, maxLength, placeholder, inputMode }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-body-sm font-semibold text-volcanic-900 mb-2">
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-body-sm text-volcanic-900 placeholder:text-volcanic-400 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500 transition-all"
      />
    </div>
  )
}
