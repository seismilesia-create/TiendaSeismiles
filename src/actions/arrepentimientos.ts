'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getResend, EMAIL_CONFIG } from '@/lib/email/resend'
import {
  arrepentimientoReceiptEmail,
  adminArrepentimientoEmail,
} from '@/lib/email/seismiles-templates'
import { sanitizeHeader } from '@/lib/email/escape'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Defense in depth: cap every field so a malicious payload can't blow up
// the DB row or the email body.
const MAX_NOMBRE = 120
const MAX_DNI = 20
const MAX_EMAIL = 200
const MAX_TEL = 40
const MAX_PEDIDO = 60
const MAX_METODO_PAGO = 60
const MAX_MOTIVO = 3000
const MAX_NOTA_ADMIN = 3000

// Codigo de constancia: ARR-YYYYMMDD-XXXX (4 hex chars).
// Colision-proof-enough: 65k espacio/dia, y el UNIQUE de la DB rebota
// cualquier choque (reintentamos hasta 3 veces).
function generateCodigo(): string {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  const suffix = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
  return `ARR-${yyyy}${mm}${dd}-${suffix}`
}

interface SubmitArrepentimientoInput {
  nombre: string
  dni: string
  email: string
  telefono?: string
  numero_pedido: string
  fecha_compra?: string
  metodo_pago?: string
  motivo?: string
}

function validateStr(
  v: unknown,
  field: string,
  min: number,
  max: number,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof v !== 'string') return { ok: false, error: `${field} invalido.` }
  const trimmed = v.trim()
  if (trimmed.length < min) return { ok: false, error: `${field} invalido.` }
  if (trimmed.length > max) return { ok: false, error: `${field} demasiado largo.` }
  return { ok: true, value: trimmed }
}

export async function submitArrepentimiento(
  input: SubmitArrepentimientoInput,
): Promise<{ success: true; codigo: string } | { error: string }> {
  // Rate-limit step 1 (per IP). Runs before ANY validation so a scripted
  // flood can't even hit the DB for the email lookup. 10 per hour is well
  // above any realistic human use for a "boton de arrepentimiento" form.
  const ip = await getClientIp()
  const ipLimit = await checkRateLimit(`arrepentimiento:ip:${ip}`, 10, 3600)
  if (!ipLimit.allowed) {
    return {
      error: 'Demasiadas solicitudes desde esta conexión. Intentá más tarde.',
    }
  }

  const nombre = validateStr(input.nombre, 'Nombre', 2, MAX_NOMBRE)
  if (!nombre.ok) return { error: nombre.error }

  const dni = validateStr(input.dni, 'DNI', 6, MAX_DNI)
  if (!dni.ok) return { error: dni.error }

  const email = validateStr(input.email, 'Email', 5, MAX_EMAIL)
  if (!email.ok) return { error: email.error }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return { error: 'Email inválido.' }
  }

  // Rate-limit step 2 (per normalized email). Catches attackers rotating
  // IPs via a botnet but reusing an email, and also catches a legitimate
  // user who double-submits by accident. 3 per hour is enough for a
  // retry-after-typo workflow but not for spam.
  const emailLimit = await checkRateLimit(
    `arrepentimiento:email:${email.value.toLowerCase()}`,
    3,
    3600,
  )
  if (!emailLimit.allowed) {
    return {
      error:
        'Ya registramos varias solicitudes con este email en la última hora. Si es un error, contactanos.',
    }
  }

  const pedido = validateStr(input.numero_pedido, 'Numero de pedido', 1, MAX_PEDIDO)
  if (!pedido.ok) return { error: pedido.error }

  const telefono = input.telefono?.trim()
    ? input.telefono.trim().slice(0, MAX_TEL)
    : null

  const metodoPago = input.metodo_pago?.trim()
    ? input.metodo_pago.trim().slice(0, MAX_METODO_PAGO)
    : null

  const motivo = input.motivo?.trim()
    ? input.motivo.trim().slice(0, MAX_MOTIVO)
    : null

  // fecha_compra: optional, must be a valid YYYY-MM-DD if provided.
  let fechaCompra: string | null = null
  if (input.fecha_compra?.trim()) {
    const f = input.fecha_compra.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || Number.isNaN(new Date(f).getTime())) {
      return { error: 'Fecha de compra inválida.' }
    }
    fechaCompra = f
  }

  const service = createServiceClient()

  // Best-effort match on numero_pedido. The law does not allow blocking a
  // submission because the lookup fails — if not found, we still insert.
  let compraId: string | null = null
  let compraEncontrada = false
  {
    const { data: compra } = await service
      .from('compras')
      .select('id')
      .eq('numero_pedido', pedido.value)
      .limit(1)
      .maybeSingle()
    if (compra?.id) {
      compraId = compra.id
      compraEncontrada = true
    }
  }

  // Insert con retry por si colisiona el codigo UNIQUE (muy improbable).
  let codigo = generateCodigo()
  let inserted: { id: string; codigo: string; created_at: string } | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await service
      .from('arrepentimientos')
      .insert({
        codigo,
        nombre: nombre.value,
        dni: dni.value,
        email: email.value,
        telefono,
        numero_pedido: pedido.value,
        fecha_compra: fechaCompra,
        metodo_pago: metodoPago,
        motivo,
        compra_id: compraId,
      })
      .select('id, codigo, created_at')
      .single()

    if (!error && data) {
      inserted = data
      break
    }
    // 23505 = unique_violation en Postgres. Reintentamos con nuevo codigo.
    if (error?.code === '23505') {
      codigo = generateCodigo()
      continue
    }
    console.error('submitArrepentimiento insert error:', error)
    return { error: 'No se pudo registrar la solicitud. Intentá de nuevo.' }
  }

  if (!inserted) {
    return { error: 'No se pudo generar una constancia única. Intentá de nuevo.' }
  }

  // Emails — best-effort. Si fallan, NO tiramos el exito: la solicitud
  // ya quedo registrada y el admin la va a ver en el panel.
  if (process.env.RESEND_API_KEY) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    const createdAtDisplay = new Date(inserted.created_at).toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    try {
      const resend = getResend()

      // Constancia al consumidor.
      const customerSubject = sanitizeHeader(
        `Constancia de arrepentimiento ${inserted.codigo}`,
      ).slice(0, 200)
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        replyTo: EMAIL_CONFIG.replyTo,
        to: email.value,
        subject: customerSubject,
        html: arrepentimientoReceiptEmail({
          codigo: inserted.codigo,
          nombre: nombre.value,
          numeroPedido: pedido.value,
          fechaCompra,
          motivo,
          createdAt: createdAtDisplay,
        }),
      })

      // Notificacion al admin.
      if (adminEmail) {
        const adminSubject = sanitizeHeader(
          `[Arrepentimiento] ${inserted.codigo} - ${nombre.value}`,
        ).slice(0, 200)
        await resend.emails.send({
          from: EMAIL_CONFIG.from,
          replyTo: email.value,
          to: adminEmail,
          subject: adminSubject,
          html: adminArrepentimientoEmail({
            codigo: inserted.codigo,
            nombre: nombre.value,
            dni: dni.value,
            email: email.value,
            telefono,
            numeroPedido: pedido.value,
            fechaCompra,
            metodoPago,
            motivo,
            compraEncontrada,
            siteUrl,
          }),
        })
      }
    } catch (emailError) {
      console.error('arrepentimiento email error:', emailError)
    }
  }

  revalidatePath('/admin/arrepentimientos')

  return { success: true, codigo: inserted.codigo }
}

// ── Admin actions ──

export async function updateArrepentimientoEstado(
  id: string,
  estado: 'pendiente' | 'en_proceso' | 'reembolsado' | 'rechazado',
  notaAdmin?: string,
): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'No autorizado.' }

  const service = createServiceClient()

  const patch: Record<string, unknown> = { estado }

  if (typeof notaAdmin === 'string') {
    patch.nota_admin = notaAdmin.trim().slice(0, MAX_NOTA_ADMIN) || null
  }

  // processed_at: fijar la primera vez que pasa de pendiente a otro estado.
  if (estado !== 'pendiente') {
    const { data: current } = await service
      .from('arrepentimientos')
      .select('processed_at')
      .eq('id', id)
      .single()
    if (current && !current.processed_at) {
      patch.processed_at = new Date().toISOString()
    }
  }

  const { error } = await service
    .from('arrepentimientos')
    .update(patch)
    .eq('id', id)

  if (error) {
    console.error('updateArrepentimientoEstado error:', error)
    return { error: 'No se pudo actualizar la solicitud.' }
  }

  revalidatePath('/admin/arrepentimientos')
  return { success: true }
}
