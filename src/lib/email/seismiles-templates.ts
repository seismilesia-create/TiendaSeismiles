// Seismiles Textil — Branded email templates
// Colors: volcanic-900 (#1C1917), terra-500 (#C75B39), sand-100 (#F5F0EB)

const BRAND = {
  name: 'Seismiles Textil',
  tagline: 'Nacidos a 6000 metros',
  volcanic: '#1C1917',
  terra: '#C75B39',
  sand: '#F5F0EB',
  sandDark: '#E8E0D8',
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
}

function baseLayout(content: string, footerNote?: string): string {
  const footerText = footerNote ?? 'Recibis este email porque te suscribiste a una notificacion de stock.'
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
                <br/>Si no fuiste vos, podes ignorar este mensaje.
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
            ${data.productName}
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:20px;">
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Talle</p>
                <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;padding:6px 14px;border-radius:8px;">
                  ${data.talle}
                </span>
              </td>
              <td>
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Color</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:8px;">
                      <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${data.colorHex};border:1px solid ${BRAND.sandDark};"></span>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:13px;font-weight:600;color:${BRAND.textPrimary};">${data.colorName}</span>
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
      Mientras tanto, podes seguir explorando nuestra coleccion.
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
  const productUrl = `${data.siteUrl}/catalogo/${data.productSlug}`
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
            ${data.productName}
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:20px;">
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Talle</p>
                <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;padding:6px 14px;border-radius:8px;">
                  ${data.talle}
                </span>
              </td>
              <td>
                <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Color</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:8px;">
                      <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${data.colorHex};border:1px solid ${BRAND.sandDark};"></span>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:13px;font-weight:600;color:${BRAND.textPrimary};">${data.colorName}</span>
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
  const adminUrl = `${data.siteUrl}/admin/faq`
  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Nueva consulta recibida
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Un cliente envio una pregunta
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      <strong style="color:${BRAND.textPrimary};">${data.customerName || data.customerEmail}</strong>
      (${data.customerEmail}) escribio:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};line-height:1.6;font-style:italic;">
            "${data.message}"
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
  return baseLayout(content, 'Recibis este email porque sos administrador de Seismiles Textil.')
}

// ── FAQ reply email to user ──

interface FaqReplyData {
  customerName: string | null
  originalQuestion: string
  replyText: string
  siteUrl: string
}

export function faqReplyEmail(data: FaqReplyData): string {
  const content = `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Respondimos tu consulta
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Hola${data.customerName ? ` ${data.customerName}` : ''}! Te respondemos tu pregunta:
    </p>

    <!-- Original question -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Tu pregunta</p>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};line-height:1.6;font-style:italic;">
            "${data.originalQuestion}"
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
            ${data.replyText}
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
  return baseLayout(content, 'Recibis este email porque enviaste una consulta en Seismiles Textil.')
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
}

const PAYMENT_DISPLAY: Record<string, string> = {
  tarjeta: 'Tarjeta de crédito/débito',
  transferencia: 'Transferencia bancaria',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo',
}

export function orderConfirmationEmail(data: OrderConfirmationData): string {
  const perfilUrl = `${data.siteUrl}/perfil`
  const paymentLabel = PAYMENT_DISPLAY[data.metodoPago] ?? data.metodoPago

  const colorBlock = data.colorName && data.colorHex
    ? `<td>
        <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Color</p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:8px;">
              <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${data.colorHex};border:1px solid ${BRAND.sandDark};"></span>
            </td>
            <td style="vertical-align:middle;">
              <span style="font-size:13px;font-weight:600;color:${BRAND.textPrimary};">${data.colorName}</span>
            </td>
          </tr>
        </table>
      </td>`
    : ''

  const talleBlock = data.talle
    ? `<td style="padding-right:20px;">
        <p style="margin:0 0 4px;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.08em;">Talle</p>
        <span style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;padding:6px 14px;border-radius:8px;">
          ${data.talle}
        </span>
      </td>`
    : ''

  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Pedido confirmado
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Gracias por tu compra${data.customerName ? `, ${data.customerName}` : ''}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Tu pedido <strong style="color:${BRAND.textPrimary};">${data.numeroPedido}</strong> fue confirmado con exito.
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
            ${data.productName}
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
          <a href="${perfilUrl}" style="display:inline-block;background-color:${BRAND.volcanic};color:white;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.05em;text-transform:uppercase;">
            Ver mis pedidos
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:${BRAND.textSecondary};line-height:1.6;text-align:center;">
      Podes seguir el estado de tu pedido desde tu perfil.
    </p>
  `
  return baseLayout(content, 'Recibis este email porque realizaste una compra en Seismiles Textil.')
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
  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Gift Card
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Tu Gift Card esta lista${data.customerName ? `, ${data.customerName}` : ''}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Gracias por tu compra. Aca tenes tu tarjeta de regalo Seismiles.
    </p>

    <!-- Gift card visual -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND.volcanic},#4A3D35);border-radius:16px;padding:28px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em;">
            ${data.titulo}
          </p>
          <p style="margin:0 0 20px;font-size:28px;font-weight:700;color:white;">
            $${data.monto.toLocaleString('es-AR')}
          </p>
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">
            Codigo
          </p>
          <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
            ${data.codigo}
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
  return baseLayout(content, 'Recibis este email porque compraste una Gift Card en Seismiles Textil.')
}

// ── Password changed confirmation email ──

interface PasswordChangedData {
  customerName: string | null
  siteUrl: string
}

export function passwordChangedEmail(data: PasswordChangedData): string {
  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Seguridad de tu cuenta
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      Contraseña actualizada
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Hola${data.customerName ? ` ${data.customerName}` : ''}! Te confirmamos que tu contraseña fue cambiada con exito.
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
            Ya podes iniciar sesion con tu nueva contraseña.
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF3C7;border-radius:12px;padding:16px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
            Si no fuiste vos quien cambio la contraseña, contactanos inmediatamente.
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
  return baseLayout(content, 'Recibis este email porque se actualizo la contraseña de tu cuenta en Seismiles Textil.')
}
