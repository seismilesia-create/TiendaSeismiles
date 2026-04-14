import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/config/siteConfig'
import { escapeHtml, sanitizeHeader } from '@/lib/email/escape'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Defense in depth: cap field lengths so a malicious payload can't blow up
// the email body or the Resend request size.
const MAX_NAME = 100
const MAX_EMAIL = 200
const MAX_PHONE = 40
const MAX_MESSAGE = 5000

export async function POST(request: NextRequest) {
  try {
    // Rate-limit per IP first: a scripted flood shouldn't even reach JSON
    // parsing or field validation. 5 per hour from a single IP is generous
    // for a contact form.
    const ip = await getClientIp()
    const ipLimit = await checkRateLimit(`contact:ip:${ip}`, 5, 3600)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta mas tarde.' },
        { status: 429 },
      )
    }

    const body = await request.json()

    const { name, email, phone, message } = body

    // Validate
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
    }
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })
    }

    // Per-email limit: catches IP-rotated floods that reuse the same email,
    // plus accidental double-submits.
    const emailLimit = await checkRateLimit(
      `contact:email:${email.trim().toLowerCase()}`,
      3,
      3600,
    )
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Ya recibimos varios mensajes desde este email. Te respondemos pronto.' },
        { status: 429 },
      )
    }

    // Trim + cap, THEN escape. The order matters: escape is the last step
    // before interpolation so the rendered HTML is always safe.
    const safeName = escapeHtml(name.trim().slice(0, MAX_NAME))
    const safeEmail = escapeHtml(email.trim().slice(0, MAX_EMAIL))
    const safePhone = phone?.trim()
      ? escapeHtml(phone.trim().slice(0, MAX_PHONE))
      : 'No proporcionado'
    const safeMessage = escapeHtml(message.trim().slice(0, MAX_MESSAGE)).replace(
      /\n/g,
      '<br>',
    )

    // Subject is a header — strip CRLF (header injection) and cap length.
    const safeSubject = sanitizeHeader(
      `Nuevo mensaje de contacto de ${name.trim()}`,
    ).slice(0, 200)

    // Try to send email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: 'noreply@resend.dev',
          to: siteConfig.contact.email,
          subject: safeSubject,
          html: `
            <h2>Nuevo mensaje de contacto</h2>
            <p><strong>Nombre:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Teléfono:</strong> ${safePhone}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${safeMessage}</p>
            <hr>
            <p style="color:#666;font-size:12px;">Enviado desde el formulario de contacto de ${escapeHtml(siteConfig.firmName)}</p>
          `,
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Continue - don't fail the request just because email didn't send
      }
    } else {
      // RESEND_API_KEY not configured — skip email
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
