// SEISMILES — Branded email templates
// Colors: volcanic-900 (#1C1917), terra-500 (#C75B39), sand-100 (#F5F0EB)
//
// SECURITY: every interpolation of `data.*` string fields below goes through
// `escapeHtml()`. Adding a new template? Do the same. The trust boundary for
// these templates is INSIDE the function — callers can pass user input freely.

import { escapeHtml } from './escape'

/**
 * Returns a CSS color value only if it looks like a hex color (#RGB, #RRGGBB
 * or #RRGGBBAA). Anything else falls back to a neutral grey, so an attacker
 * can't break out of a `style="background-color:..."` attribute.
 */
function safeColor(hex: string | null | undefined, fallback = '#999999'): string {
  if (!hex) return fallback
  return /^#[0-9A-Fa-f]{3,8}$/.test(hex) ? hex : fallback
}

const BRAND = {
  name: 'SEISMILES',
  tagline: 'Calidad de altura',
  volcanic: '#1C1917',
  terra: '#C75B39',
  sand: '#F5F0EB',
  sandDark: '#E8E0D8',
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
}

function baseLayout(content: string, footerNote?: string): string {
  const footerText = footerNote ?? 'Recibís este email porque te suscribiste a una notificación de stock.'
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.sand};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.volcanic};padding:28px 32px;text-align:center;border-radius:16px 16px 0 0;">
              <span style="font-size:22px;font-weight:700;color:white;letter-spacing:0.08em;text-transform:uppercase;">
                SEISMILES
              </span>
              <br/>
              <span style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.15em;text-transform:uppercase;">
                ${BRAND.tagline}
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.sandDark};padding:24px 32px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${BRAND.textSecondary};">
                ${BRAND.name} — Prendas premium desde el altiplano argentino.
              </p>
              <p style="margin:0;font-size:11px;color:${BRAND.textSecondary};">
                ${footerText}
                <br/>Si no fuiste vos, podés ignorar este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Stock notification confirmation email ──

interface StockConfirmData {
  productName: string
  talle: string
  colorName: string
  colorHex: string
}

export function stockNotificationConfirmEmail(data: StockConfirmData): string {
  const productName = escapeHtml(data.productName)
  const talle = escapeHtml(data.talle)
  const colorName = escapeHtml(data.colorName)
  const colorHex = safeColor(data.colorHex)

  const content = `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Te vamos a avisar
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Registramos tu pedido. Te enviaremos un email cuando este producto vuelva a tener stock en tu talle.
    </p>

    <!-- Product card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Producto
          </p>
          <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">
            ${productName}
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:20px;">
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Talle</p>
                <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;padding:6px 14px;border-radius:8px;">
                  ${talle}
                </span>
              </td>
              <td>
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Color</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:8px;">
                      <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${colorHex};border:1px solid ${BRAND.sandDark};"></span>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:13px;font-weight:600;color:${BRAND.textPrimary};">${colorName}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
      Mientras tanto, podés seguir explorando nuestra colección.
    </p>
  `
  return baseLayout(content)
}

// ── Back in stock notification email ──

interface BackInStockData {
  productName: string
  talle: string
  colorName: string
  colorHex: string
  productSlug: string
  siteUrl: string
}

export function backInStockEmail(data: BackInStockData): string {
  const productName = escapeHtml(data.productName)
  const talle = escapeHtml(data.talle)
  const colorName = escapeHtml(data.colorName)
  const colorHex = safeColor(data.colorHex)
  // productSlug came from slugify() server-side, but encode anyway as defense in depth.
  const productUrl = `${data.siteUrl}/catalogo/${encodeURIComponent(data.productSlug)}`

  const content = `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Ya hay stock disponible!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      El producto que estabas esperando volvio a tener stock en tu talle. ¡No te lo pierdas!.
    </p>

    <!-- Product card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Disponible
          </p>
          <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">
            ${productName}
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:20px;">
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Talle</p>
                <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;padding:6px 14px;border-radius:8px;">
                  ${talle}
                </span>
              </td>
              <td>
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Color</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:8px;">
                      <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${colorHex};border:1px solid ${BRAND.sandDark};"></span>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:13px;font-weight:600;color:${BRAND.textPrimary};">${colorName}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${productUrl}" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Ver producto
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content)
}

// ── Admin alert: new FAQ question from user ──

interface AdminNewQuestionData {
  customerEmail: string
  customerName: string | null
  message: string
  siteUrl: string
}

export function adminNewQuestionEmail(data: AdminNewQuestionData): string {
  // PUBLIC-TRIGGERED: any logged-in user can cause this email. Escape everything.
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const customerEmail = escapeHtml(data.customerEmail)
  // Preserve newlines in the user message but escape the rest.
  const message = escapeHtml(data.message).replace(/\n/g, '<br>')
  const adminUrl = `${data.siteUrl}/admin/faq`

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Nueva consulta recibida
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Un cliente envió una pregunta
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      <strong style="color:${BRAND.textPrimary};">${customerName || customerEmail}</strong>
      (${customerEmail}) escribio:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};line-height:1.6;font-style:italic;">
            "${message}"
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${adminUrl}" style="display:inline-block;background-color:${BRAND.terra};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Ver en el panel
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque sos administrador de SEISMILES.')
}

// ── FAQ reply email to user ──

interface FaqReplyData {
  customerName: string | null
  originalQuestion: string
  replyText: string
  siteUrl: string
}

export function faqReplyEmail(data: FaqReplyData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  // Quoting back the user's own question — escape it.
  const originalQuestion = escapeHtml(data.originalQuestion).replace(/\n/g, '<br>')
  // replyText is admin-set; escape anyway for defense in depth.
  const replyText = escapeHtml(data.replyText).replace(/\n/g, '<br>')

  const content = `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Respondimos tu consulta
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Hola${customerName ? ` ${customerName}` : ''}! Te respondemos tu pregunta:
    </p>

    <!-- Original question -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Tu pregunta</p>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};line-height:1.6;font-style:italic;">
            "${originalQuestion}"
          </p>
        </td>
      </tr>
    </table>

    <!-- Reply -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:white;border:2px solid ${BRAND.terra};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Nuestra respuesta</p>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};line-height:1.6;">
            ${replyText}
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${data.siteUrl}/faq" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Ver preguntas frecuentes
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque enviaste una consulta en SEISMILES.')
}

// ── Order confirmation email to customer ──

interface OrderConfirmationData {
  customerName: string | null
  numeroPedido: string
  productName: string
  talle: string | null
  colorName: string | null
  colorHex: string | null
  cantidad: number
  precioUnitario: number
  total: number
  metodoPago: string
  siteUrl: string
  /** When set (guest checkout), replaces the "Ver mis pedidos" CTA with a
   * one-click sign-in link. The token is single-use and expires per the
   * Supabase auth config. */
  magicLink?: string | null
}

const PAYMENT_DISPLAY: Record<string, string> = {
  tarjeta: 'Tarjeta de crédito/débito',
  transferencia: 'Transferencia bancaria',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo',
}

export function orderConfirmationEmail(data: OrderConfirmationData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const numeroPedido = escapeHtml(data.numeroPedido)
  const productName = escapeHtml(data.productName)
  const talle = data.talle ? escapeHtml(data.talle) : null
  const colorName = data.colorName ? escapeHtml(data.colorName) : null
  const colorHex = safeColor(data.colorHex)
  const perfilUrl = `${data.siteUrl}/perfil`
  // Guest checkouts get a magic-link CTA instead of the perfil button. The
  // link is generated server-side and is safe to drop into HTML as-is — the
  // value space (URL with token) doesn't include `<` or `"`.
  const magicLink = data.magicLink && /^https?:\/\//.test(data.magicLink) ? data.magicLink : null
  const ctaUrl = magicLink ?? perfilUrl
  const ctaLabel = magicLink ? 'Acceder a mi cuenta' : 'Ver mis pedidos'
  const ctaHelperText = magicLink
    ? 'Hacé click en el botón para acceder con un solo click. El link expira pronto, así que no tardes.'
    : 'Podés seguir el estado de tu pedido desde tu perfil.'
  const paymentLabel = escapeHtml(PAYMENT_DISPLAY[data.metodoPago] ?? data.metodoPago)

  const colorBlock = colorName && data.colorHex
    ? `<td>
        <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Color</p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:8px;">
              <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${colorHex};border:1px solid ${BRAND.sandDark};"></span>
            </td>
            <td style="vertical-align:middle;">
              <span style="font-size:13px;font-weight:600;color:${BRAND.textPrimary};">${colorName}</span>
            </td>
          </tr>
        </table>
      </td>`
    : ''

  const talleBlock = talle
    ? `<td style="padding-right:20px;">
        <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Talle</p>
        <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;padding:6px 14px;border-radius:8px;">
          ${talle}
        </span>
      </td>`
    : ''

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Pedido confirmado
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Gracias por tu compra${customerName ? `, ${customerName}` : ''}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Tu pedido <strong style="color:${BRAND.textPrimary};">${numeroPedido}</strong> fue confirmado con éxito.
      Te avisaremos cuando este en camino.
    </p>

    <!-- Product card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Producto
          </p>
          <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">
            ${productName}
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              ${talleBlock}
              ${colorBlock}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Order summary -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Resumen
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Cantidad</td>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">${data.cantidad}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Precio unitario</td>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">$${data.precioUnitario.toLocaleString('es-AR')}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Metodo de pago</td>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">${paymentLabel}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 0 0;border-top:1px solid ${BRAND.sandDark};"></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:15px;font-weight:700;color:${BRAND.textPrimary};">Total</td>
              <td style="padding:6px 0;font-size:15px;font-weight:700;color:${BRAND.textPrimary};text-align:right;">$${data.total.toLocaleString('es-AR')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${ctaUrl}" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            ${ctaLabel}
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;text-align:center;">
      ${ctaHelperText}
    </p>
  `
  return baseLayout(content, 'Recibís este email porque realizaste una compra en SEISMILES.')
}

// ── Gift card delivery email ──

interface GiftCardEmailData {
  customerName: string | null
  titulo: string
  monto: number
  codigo: string
  siteUrl: string
}

export function giftCardEmail(data: GiftCardEmailData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const titulo = escapeHtml(data.titulo)
  const codigo = escapeHtml(data.codigo)

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Gift Card
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Tu Gift Card está lista${customerName ? `, ${customerName}` : ''}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Gracias por tu compra. Acá tenés tu tarjeta de regalo SEISMILES.
    </p>

    <!-- Gift card visual -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND.volcanic},#4A3D35);border-radius:16px;padding:28px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em;">
            ${titulo}
          </p>
          <p style="margin:0 0 20px;font-size:28px;font-weight:700;color:white;">
            $${data.monto.toLocaleString('es-AR')}
          </p>
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">
            Codigo
          </p>
          <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
            ${codigo}
          </p>
        </td>
      </tr>
    </table>

    <!-- Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Como usar tu Gift Card
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">
            Presenta este codigo al momento de tu compra para canjearlo.
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
            Sin fecha de vencimiento · Valida en toda la tienda
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${data.siteUrl}/catalogo" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Explorar la tienda
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque compraste una Gift Card en SEISMILES.')
}

// ── Admin digest: stock demand summary ──

interface StockDemandItem {
  productName: string
  talle: string
  colorName: string
  colorHex: string
  count: number
}

interface AdminStockDigestData {
  totalPending: number
  items: StockDemandItem[]
  siteUrl: string
}

export function adminStockDigestEmail(data: AdminStockDigestData): string {
  const adminUrl = `${data.siteUrl}/admin/inventario`

  const rows = data.items.map((item) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.textPrimary};border-bottom:1px solid ${BRAND.sandDark};">
        ${escapeHtml(item.productName)}
      </td>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.textPrimary};border-bottom:1px solid ${BRAND.sandDark};text-align:center;">
        ${escapeHtml(item.talle)}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid ${BRAND.sandDark};text-align:center;">
        <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background-color:${safeColor(item.colorHex)};border:1px solid ${BRAND.sandDark};vertical-align:middle;"></span>
        <span style="font-size:13px;color:${BRAND.textPrimary};vertical-align:middle;margin-left:4px;">${escapeHtml(item.colorName)}</span>
      </td>
      <td style="padding:8px 0;font-size:13px;font-weight:700;color:${BRAND.terra};border-bottom:1px solid ${BRAND.sandDark};text-align:right;">
        ${item.count}
      </td>
    </tr>
  `).join('')

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Resumen de demanda
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ${data.totalPending} clientes esperando stock
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Hay nuevos pedidos de reposición. Acá tenés un resumen de lo más solicitado.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 0 8px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${BRAND.sandDark};">Producto</td>
              <td style="padding:0 0 8px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${BRAND.sandDark};text-align:center;">Talle</td>
              <td style="padding:0 0 8px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${BRAND.sandDark};text-align:center;">Color</td>
              <td style="padding:0 0 8px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${BRAND.sandDark};text-align:right;">Pedidos</td>
            </tr>
            ${rows}
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${adminUrl}" style="display:inline-block;background-color:${BRAND.terra};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Ver inventario
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque sos administrador de SEISMILES.')
}

// ── Password changed confirmation email ──

interface PasswordChangedData {
  customerName: string | null
  siteUrl: string
}

export function passwordChangedEmail(data: PasswordChangedData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Seguridad de tu cuenta
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Contraseña actualizada
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Hola${customerName ? ` ${customerName}` : ''}! Te confirmamos que tu contraseña fue cambiada con exito.
    </p>

    <!-- Confirmation card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td style="text-align:center;">
          <span style="display:inline-block;width:48px;height:48px;border-radius:50%;background-color:#D1FAE5;line-height:48px;font-size:24px;margin-bottom:12px;">
            &#10003;
          </span>
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${BRAND.textPrimary};">
            Tu contraseña fue actualizada
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
            Ya podés iniciar sesión con tu nueva contraseña.
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF3C7;border-radius:12px;padding:16px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
            Si no fuiste vos quien cambió la contraseña, contactanos inmediatamente.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${data.siteUrl}/login" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Iniciar sesion
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque se actualizó la contraseña de tu cuenta en SEISMILES.')
}

// ── Order status update email ──

const STATUS_MESSAGES: Record<string, { heading: string; description: string; badgeColor: string; badgeBg: string }> = {
  en_preparacion: {
    heading: 'Tu pedido está siendo preparado',
    description: 'Estamos preparando tu pedido con mucho cuidado. Te avisaremos cuando lo despachemos.',
    badgeColor: '#1D4ED8',
    badgeBg: '#DBEAFE',
  },
  enviado: {
    heading: 'Tu pedido fue enviado',
    description: 'Tu pedido ya está en camino. Podés hacer seguimiento con el número que te dejamos abajo.',
    badgeColor: '#0369A1',
    badgeBg: '#E0F2FE',
  },
  entregado: {
    heading: 'Tu pedido fue entregado',
    description: 'Esperamos que disfrutes tu compra. Si tenés alguna consulta, no dudes en escribirnos.',
    badgeColor: '#047857',
    badgeBg: '#D1FAE5',
  },
  cancelada: {
    heading: 'Tu pedido fue cancelado',
    description: 'Lamentamos informarte que tu pedido fue cancelado. Si tenés dudas, contactanos.',
    badgeColor: '#DC2626',
    badgeBg: '#FEE2E2',
  },
}

const STATUS_LABELS: Record<string, string> = {
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelada: 'Cancelada',
}

interface OrderStatusUpdateData {
  customerName: string | null
  numeroPedido: string
  productName: string
  newStatus: string
  trackingNumber?: string | null
  siteUrl: string
}

export function orderStatusUpdateEmail(data: OrderStatusUpdateData): string {
  const statusInfo = STATUS_MESSAGES[data.newStatus]
  if (!statusInfo) return ''

  // statusLabel is from a fixed map, but fall back to escaped newStatus if missing.
  const statusLabel = STATUS_LABELS[data.newStatus] ?? escapeHtml(data.newStatus)
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const numeroPedido = escapeHtml(data.numeroPedido)
  const productName = escapeHtml(data.productName)
  const trackingNumber = data.trackingNumber ? escapeHtml(data.trackingNumber) : null
  const perfilUrl = `${data.siteUrl}/perfil`

  const trackingBlock = trackingNumber
    ? `
    <!-- Tracking number -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Numero de seguimiento
          </p>
          <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.textPrimary};letter-spacing:0.05em;font-family:'Courier New',Courier,monospace;">
            ${trackingNumber}
          </p>
        </td>
      </tr>
    </table>
    `
    : ''

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Actualizacion de pedido
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ${statusInfo.heading}${customerName ? `, ${customerName}` : ''}
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      ${statusInfo.description}
    </p>

    <!-- Order info card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Pedido</td>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">${numeroPedido}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Producto</td>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">${productName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Estado</td>
              <td style="padding:6px 0;text-align:right;">
                <span style="display:inline-block;background-color:${statusInfo.badgeBg};color:${statusInfo.badgeColor};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">
                  ${statusLabel}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${trackingBlock}

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${perfilUrl}" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Ver mis pedidos
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;text-align:center;">
      Podés seguir el estado de tu pedido desde tu perfil.
    </p>
  `
  return baseLayout(content, 'Recibís este email porque realizaste una compra en SEISMILES.')
}

// ── Newsletter email helpers ──

function markdownToEmailHtml(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings (process h3 before h2 before h1)
    .replace(/^### (.+)$/gm, `<h3 style="margin:24px 0 8px;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="margin:24px 0 8px;font-size:18px;font-weight:700;color:${BRAND.textPrimary};">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="margin:24px 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">$1</h1>`)
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${BRAND.textPrimary};">$1</strong>`)
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" style="color:${BRAND.terra};text-decoration:underline;">$1</a>`)
    // Double newline = paragraph break
    .replace(/\n\n/g, `</p><p style="margin:0 0 16px;font-size:14px;color:${BRAND.textPrimary};line-height:1.7;">`)
    // Single newline = line break
    .replace(/\n/g, '<br/>')

  return `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.textPrimary};line-height:1.7;">${html}</p>`
}

// ── Welcome newsletter email (sent on subscription) ──

interface WelcomeNewsletterData {
  couponCode: string
  siteUrl: string
  unsubscribeUrl: string
}

export function welcomeNewsletterEmail(data: WelcomeNewsletterData): string {
  const couponCode = escapeHtml(data.couponCode)

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Bienvenido/a a la expedicion
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Ya sos parte de SEISMILES!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Gracias por suscribirte. Acá tenés tu cupón de descuento del 10% para tu primera compra.
    </p>

    <!-- Coupon card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND.volcanic},#4A3D35);border-radius:16px;padding:28px 24px;margin-bottom:16px;">
      <tr>
        <td style="text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em;">
            Tu cupón de descuento
          </p>
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:white;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
            ${couponCode}
          </p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);">
            10% de descuento en tu primera compra
          </p>
        </td>
      </tr>
    </table>

    <!-- How to use -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">
            Ingresa este codigo en el carrito de compras al momento de pagar.
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
            Valido por unica vez · Aplica a toda la tienda
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${data.siteUrl}/catalogo" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Explorar la tienda
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, `Recibis este email porque te suscribiste al newsletter de SEISMILES.<br/><a href="${data.unsubscribeUrl}" style="color:${BRAND.textSecondary};text-decoration:underline;">Desuscribirse</a>`)
}

// ── Campaign newsletter email ──

interface CampaignEmailData {
  markdownContent: string
  unsubscribeUrl: string
}

export function campaignEmail(data: CampaignEmailData): string {
  const htmlContent = markdownToEmailHtml(data.markdownContent)

  const content = `
    <div>
      ${htmlContent}
    </div>
  `
  return baseLayout(content, `Recibis este email porque te suscribiste al newsletter de SEISMILES.<br/><a href="${data.unsubscribeUrl}" style="color:${BRAND.textSecondary};text-decoration:underline;">Desuscribirse</a>`)
}

// ── Boton de Arrepentimiento: constancia al consumidor (Res. 424/2020) ──

interface ArrepentimientoReceiptData {
  codigo: string
  nombre: string
  numeroPedido: string
  fechaCompra: string | null
  motivo: string | null
  createdAt: string
}

export function arrepentimientoReceiptEmail(data: ArrepentimientoReceiptData): string {
  // PUBLIC-TRIGGERED: anyone can submit the form. Escape every field.
  const codigo = escapeHtml(data.codigo)
  const nombre = escapeHtml(data.nombre)
  const numeroPedido = escapeHtml(data.numeroPedido)
  const fechaCompra = data.fechaCompra ? escapeHtml(data.fechaCompra) : 'No informada'
  const motivo = data.motivo ? escapeHtml(data.motivo).replace(/\n/g, '<br>') : null
  const createdAt = escapeHtml(data.createdAt)

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Constancia de arrepentimiento
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Recibimos tu solicitud, ${nombre}
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Este email es tu constancia formal del ejercicio del derecho de arrepentimiento
      (Res. 424/2020 - Ley 24.240 art. 34). Guardalo como comprobante.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.volcanic};border-radius:12px;padding:24px;margin-bottom:24px;">
      <tr>
        <td align="center">
          <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.15em;">
            Código de constancia
          </p>
          <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:0.05em;font-family:Menlo,Monaco,Consolas,monospace;">
            ${codigo}
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Datos de la solicitud
          </p>
          <p style="margin:0 0 6px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">
            <strong>N° de pedido:</strong> ${numeroPedido}
          </p>
          <p style="margin:0 0 6px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">
            <strong>Fecha de compra:</strong> ${fechaCompra}
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">
            <strong>Fecha de solicitud:</strong> ${createdAt}
          </p>
          ${motivo ? `
          <p style="margin:12px 0 0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">
            <strong>Motivo:</strong><br/>${motivo}
          </p>` : ''}
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:white;border:1px solid ${BRAND.sandDark};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 10px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;font-weight:700;">
            Próximos pasos
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
            1. Vamos a contactarte dentro de las <strong style="color:${BRAND.textPrimary};">24 horas hábiles</strong> para coordinar la devolución del producto.
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
            2. El producto debe devolverse en su estado original. Los costos de envío de la devolución están a nuestro cargo.
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
            3. Una vez recibido, procederemos al reembolso íntegro por el mismo medio de pago utilizado en la compra.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:${BRAND.textSecondary};line-height:1.6;text-align:center;">
      Si tenés dudas, respondenos este email o escribinos a
      <a href="mailto:seismilestextil@gmail.com" style="color:${BRAND.terra};text-decoration:underline;">seismilestextil@gmail.com</a>.
    </p>
  `
  return baseLayout(content, 'Recibís este email porque solicitaste el ejercicio del derecho de arrepentimiento en la tienda SEISMILES.')
}

// ── Boton de Arrepentimiento: notificacion al admin ──

interface AdminArrepentimientoData {
  codigo: string
  nombre: string
  dni: string
  email: string
  telefono: string | null
  numeroPedido: string
  fechaCompra: string | null
  metodoPago: string | null
  motivo: string | null
  compraEncontrada: boolean
  siteUrl: string
}

export function adminArrepentimientoEmail(data: AdminArrepentimientoData): string {
  const codigo = escapeHtml(data.codigo)
  const nombre = escapeHtml(data.nombre)
  const dni = escapeHtml(data.dni)
  const email = escapeHtml(data.email)
  const telefono = data.telefono ? escapeHtml(data.telefono) : 'No proporcionado'
  const numeroPedido = escapeHtml(data.numeroPedido)
  const fechaCompra = data.fechaCompra ? escapeHtml(data.fechaCompra) : 'No informada'
  const metodoPago = data.metodoPago ? escapeHtml(data.metodoPago) : 'No informado'
  const motivo = data.motivo ? escapeHtml(data.motivo).replace(/\n/g, '<br>') : null
  const adminUrl = `${data.siteUrl}/admin/arrepentimientos`

  const matchBadge = data.compraEncontrada
    ? `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background-color:#DCFCE7;color:#166534;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Pedido encontrado</span>`
    : `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background-color:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Pedido no encontrado</span>`

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Boton de arrepentimiento
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Nueva solicitud: ${codigo}
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Tenes <strong style="color:${BRAND.textPrimary};">24 hs habiles</strong> para contactar al consumidor (Res. 424/2020).
    </p>

    <p style="margin:0 0 24px;">${matchBadge}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Consumidor
          </p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Nombre:</strong> ${nombre}</p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>DNI:</strong> ${dni}</p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Email:</strong> <a href="mailto:${email}" style="color:${BRAND.terra};">${email}</a></p>
          <p style="margin:0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Telefono:</strong> ${telefono}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Compra declarada
          </p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>N° de pedido:</strong> ${numeroPedido}</p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Fecha de compra:</strong> ${fechaCompra}</p>
          <p style="margin:0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Medio de pago:</strong> ${metodoPago}</p>
        </td>
      </tr>
    </table>

    ${motivo ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:white;border:1px solid ${BRAND.sandDark};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Motivo declarado (opcional)
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;font-style:italic;">
            "${motivo}"
          </p>
        </td>
      </tr>
    </table>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${adminUrl}" style="display:inline-block;background-color:${BRAND.terra};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Gestionar en el panel
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque sos administrador de SEISMILES.')
}

// ── Abandoned cart emails ──

interface AbandonedCartItem {
  productName: string
  productSlug: string
  colorName: string
  colorHex: string
  talle: string
  cantidad: number
  precio: number
  imagenUrl: string | null
}

interface AbandonedCartBaseData {
  customerName: string | null
  items: AbandonedCartItem[]
  subtotal: number
  siteUrl: string
}

interface AbandonedCartDiscountData extends AbandonedCartBaseData {
  couponCode: string
  discountPercent: number
  expiresAtLabel: string
}

function renderCartItems(items: AbandonedCartItem[]): string {
  return items
    .map((item) => {
      const productName = escapeHtml(item.productName)
      const colorName = escapeHtml(item.colorName)
      const colorHex = safeColor(item.colorHex)
      const talle = escapeHtml(item.talle)
      const image = item.imagenUrl && /^https?:\/\//.test(item.imagenUrl)
        ? item.imagenUrl
        : null
      const subtotal = item.precio * item.cantidad

      const imageCell = image
        ? `<td width="88" style="padding-right:16px;vertical-align:top;">
            <img src="${image}" alt="${productName}" width="88" height="88" style="display:block;border-radius:10px;background-color:${BRAND.sandDark};object-fit:cover;" />
          </td>`
        : `<td width="88" style="padding-right:16px;vertical-align:top;">
            <div style="width:88px;height:88px;border-radius:10px;background-color:${BRAND.sandDark};"></div>
          </td>`

      return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:16px;margin-bottom:12px;">
          <tr>
            ${imageCell}
            <td style="vertical-align:top;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${BRAND.textPrimary};line-height:1.3;">
                ${productName}
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
                <tr>
                  <td style="padding-right:10px;">
                    <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;letter-spacing:0.05em;">
                      ${talle}
                    </span>
                  </td>
                  <td style="vertical-align:middle;padding-right:6px;">
                    <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background-color:${colorHex};border:1px solid ${BRAND.sandDark};vertical-align:middle;"></span>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:12px;color:${BRAND.textSecondary};">${colorName}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:${BRAND.textSecondary};">
                ${item.cantidad} × $${item.precio.toLocaleString('es-AR')} · <strong style="color:${BRAND.textPrimary};">$${subtotal.toLocaleString('es-AR')}</strong>
              </p>
            </td>
          </tr>
        </table>`
    })
    .join('')
}

function cartSummaryFooter(subtotal: number): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      <tr>
        <td style="padding:10px 0;border-top:1px solid ${BRAND.sandDark};font-size:14px;color:${BRAND.textSecondary};">
          Subtotal
        </td>
        <td style="padding:10px 0;border-top:1px solid ${BRAND.sandDark};text-align:right;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">
          $${subtotal.toLocaleString('es-AR')}
        </td>
      </tr>
    </table>`
}

export function abandonedCartReminderEmail(data: AbandonedCartBaseData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const cartUrl = `${data.siteUrl}/carrito`

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Tu carrito te espera
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Te dejaste esto en el carrito${customerName ? `, ${customerName}` : ''}
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Guardamos tu selección. Seguí donde lo dejaste — el stock puede moverse rápido.
    </p>

    ${renderCartItems(data.items)}
    ${cartSummaryFooter(data.subtotal)}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${cartUrl}" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Volver al carrito
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque dejaste productos en tu carrito de SEISMILES.')
}

export function abandonedCartDiscountEmail(data: AbandonedCartDiscountData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const couponCode = escapeHtml(data.couponCode)
  const expiresAtLabel = escapeHtml(data.expiresAtLabel)
  const cartUrl = `${data.siteUrl}/carrito`

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Un regalo de SEISMILES
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Tenés ${data.discountPercent}% OFF esperándote${customerName ? `, ${customerName}` : ''}
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Seguimos guardando tu carrito. Usá este código antes que expire y llevate tu pedido con descuento.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND.volcanic},#4A3D35);border-radius:16px;padding:24px;margin-bottom:24px;">
      <tr>
        <td style="text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em;">
            Tu código de descuento
          </p>
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:white;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
            ${couponCode}
          </p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);">
            ${data.discountPercent}% OFF · vence ${expiresAtLabel}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
      Lo que dejaste en el carrito
    </p>
    ${renderCartItems(data.items)}
    ${cartSummaryFooter(data.subtotal)}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${cartUrl}" style="display:inline-block;background-color:${BRAND.terra};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Aprovechar el descuento
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:${BRAND.textSecondary};line-height:1.6;text-align:center;">
      Ingresá el código en el carrito antes de pagar. Válido por un único uso.
    </p>
  `
  return baseLayout(content, 'Recibís este email porque dejaste productos en tu carrito de SEISMILES.')
}

export function abandonedCartLastChanceEmail(data: AbandonedCartDiscountData): string {
  const customerName = data.customerName ? escapeHtml(data.customerName) : null
  const couponCode = escapeHtml(data.couponCode)
  const expiresAtLabel = escapeHtml(data.expiresAtLabel)
  const cartUrl = `${data.siteUrl}/carrito`

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Última oportunidad
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ${data.discountPercent}% OFF — se vence tu carrito${customerName ? `, ${customerName}` : ''}
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Es la última vez que te escribimos por este pedido. Subimos el descuento al ${data.discountPercent}% para que te lo lleves hoy.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND.terra},#8A3D25);border-radius:16px;padding:24px;margin-bottom:24px;">
      <tr>
        <td style="text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.15em;">
            Tu código final
          </p>
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:white;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
            ${couponCode}
          </p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.8);">
            ${data.discountPercent}% OFF · vence ${expiresAtLabel}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
      Tu selección
    </p>
    ${renderCartItems(data.items)}
    ${cartSummaryFooter(data.subtotal)}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${cartUrl}" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Completar mi compra
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:${BRAND.textSecondary};line-height:1.6;text-align:center;">
      Después de esto liberamos tu carrito — no volveremos a escribirte por este pedido.
    </p>
  `
  return baseLayout(content, 'Recibís este email porque dejaste productos en tu carrito de SEISMILES.')
}

// ── Reseña de baja puntuación: notificación al admin ──

interface AdminLowRatingReviewData {
  puntuacion: number
  productName: string
  productSlug: string
  customerName: string
  customerEmail: string
  comentario: string | null
  comodidad: number | null
  calidad: number | null
  ajuste: number | null
  longitud: number | null
  createdAtDisplay: string
  siteUrl: string
}

export function adminLowRatingReviewEmail(data: AdminLowRatingReviewData): string {
  const puntuacion = Math.max(1, Math.min(5, data.puntuacion))
  const productName = escapeHtml(data.productName)
  const productSlug = escapeHtml(data.productSlug)
  const customerName = escapeHtml(data.customerName)
  const customerEmail = escapeHtml(data.customerEmail)
  const comentario = data.comentario
    ? escapeHtml(data.comentario).replace(/\n/g, '<br>')
    : null
  const createdAtDisplay = escapeHtml(data.createdAtDisplay)
  const adminUrl = `${data.siteUrl}/admin/resenas`
  const productUrl = `${data.siteUrl}/catalogo/${productSlug}#reviews`

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < puntuacion
      ? `<span style="color:${BRAND.terra};font-size:18px;">★</span>`
      : `<span style="color:${BRAND.sandDark};font-size:18px;">★</span>`
  ).join('')

  const AJUSTE = ['Muy ajustado', 'Algo ajustado', 'Perfecto', 'Algo holgado', 'Muy holgado']
  const LONGITUD = ['Corto', 'Algo corto', 'Perfecto', 'Algo largo', 'Largo']

  const detailRows: string[] = []
  if (data.comodidad != null) {
    detailRows.push(`<strong>Comodidad:</strong> ${data.comodidad}/5`)
  }
  if (data.calidad != null) {
    detailRows.push(`<strong>Calidad:</strong> ${data.calidad}/5`)
  }
  if (data.ajuste != null && data.ajuste >= 1 && data.ajuste <= 5) {
    detailRows.push(`<strong>Ajuste:</strong> ${escapeHtml(AJUSTE[data.ajuste - 1])}`)
  }
  if (data.longitud != null && data.longitud >= 1 && data.longitud <= 5) {
    detailRows.push(`<strong>Longitud:</strong> ${escapeHtml(LONGITUD[data.longitud - 1])}`)
  }

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Reseña para moderar
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Nueva reseña de ${puntuacion}★
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Un comprador verificado dejó una puntuación baja en
      <a href="${productUrl}" style="color:${BRAND.terra};text-decoration:underline;">${productName}</a>.
      Revisala y decidí si corresponde mantenerla, contactar al cliente, o ocultarla.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Puntuación general
          </p>
          <p style="margin:0 0 16px;line-height:1;">
            ${stars}
            <span style="margin-left:8px;font-size:13px;color:${BRAND.textPrimary};font-weight:700;">${puntuacion}/5</span>
          </p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Producto:</strong> ${productName}</p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Cliente:</strong> ${customerName}</p>
          <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color:${BRAND.terra};">${customerEmail}</a></p>
          <p style="margin:0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;"><strong>Recibida:</strong> ${createdAtDisplay}</p>
        </td>
      </tr>
    </table>

    ${detailRows.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:white;border:1px solid ${BRAND.sandDark};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 10px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Detalles
          </p>
          ${detailRows.map((r) => `<p style="margin:0 0 4px;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;">${r}</p>`).join('')}
        </td>
      </tr>
    </table>` : ''}

    ${comentario ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:white;border:1px solid ${BRAND.sandDark};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Comentario del cliente
          </p>
          <p style="margin:0;font-size:13px;color:${BRAND.textPrimary};line-height:1.6;font-style:italic;">
            "${comentario}"
          </p>
        </td>
      </tr>
    </table>` : `
    <p style="margin:0 0 24px;font-size:12px;color:${BRAND.textSecondary};font-style:italic;">
      El cliente no dejó comentario.
    </p>`}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${adminUrl}" style="display:inline-block;background-color:${BRAND.terra};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Moderar en el panel
          </a>
        </td>
      </tr>
    </table>
  `
  return baseLayout(content, 'Recibís este email porque sos administrador de SEISMILES.')
}
