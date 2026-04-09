// SEISMILES Textil — Branded email templates
// Colors: volcanic-900 (#1C1917), terra-500 (#C75B39), sand-100 (#F5F0EB)

const BRAND = {
  name: 'SEISMILES Textil',
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
  return baseLayout(content, 'Recibis este email porque sos administrador de SEISMILES Textil.')
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
  return baseLayout(content, 'Recibis este email porque enviaste una consulta en SEISMILES Textil.')
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
  return baseLayout(content, 'Recibis este email porque realizaste una compra en SEISMILES Textil.')
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
      Gracias por tu compra. Aca tenes tu tarjeta de regalo SEISMILES.
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
  return baseLayout(content, 'Recibis este email porque compraste una Gift Card en SEISMILES Textil.')
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
        ${item.productName}
      </td>
      <td style="padding:8px 0;font-size:13px;color:${BRAND.textPrimary};border-bottom:1px solid ${BRAND.sandDark};text-align:center;">
        ${item.talle}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid ${BRAND.sandDark};text-align:center;">
        <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background-color:${item.colorHex};border:1px solid ${BRAND.sandDark};vertical-align:middle;"></span>
        <span style="font-size:13px;color:${BRAND.textPrimary};vertical-align:middle;margin-left:4px;">${item.colorName}</span>
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
      Hay nuevos pedidos de reposicion. Aca tenes un resumen de lo mas solicitado.
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
  return baseLayout(content, 'Recibis este email porque sos administrador de SEISMILES Textil.')
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
  return baseLayout(content, 'Recibis este email porque se actualizo la contraseña de tu cuenta en SEISMILES Textil.')
}

// ── Order status update email ──

const STATUS_MESSAGES: Record<string, { heading: string; description: string; badgeColor: string; badgeBg: string }> = {
  en_preparacion: {
    heading: 'Tu pedido esta siendo preparado',
    description: 'Estamos preparando tu pedido con mucho cuidado. Te avisaremos cuando lo despachemos.',
    badgeColor: '#1D4ED8',
    badgeBg: '#DBEAFE',
  },
  enviado: {
    heading: 'Tu pedido fue enviado',
    description: 'Tu pedido ya esta en camino. Podes hacer seguimiento con el numero que te dejamos abajo.',
    badgeColor: '#0369A1',
    badgeBg: '#E0F2FE',
  },
  entregado: {
    heading: 'Tu pedido fue entregado',
    description: 'Esperamos que disfrutes tu compra. Si tenes alguna consulta, no dudes en escribirnos.',
    badgeColor: '#047857',
    badgeBg: '#D1FAE5',
  },
  cancelada: {
    heading: 'Tu pedido fue cancelado',
    description: 'Lamentamos informarte que tu pedido fue cancelado. Si tenes dudas, contactanos.',
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

  const statusLabel = STATUS_LABELS[data.newStatus] ?? data.newStatus
  const perfilUrl = `${data.siteUrl}/perfil`

  const trackingBlock = data.trackingNumber
    ? `
    <!-- Tracking number -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.sand};border-radius:12px;padding:20px 24px;margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Numero de seguimiento
          </p>
          <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.textPrimary};letter-spacing:0.05em;font-family:'Courier New',Courier,monospace;">
            ${data.trackingNumber}
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
      ${statusInfo.heading}${data.customerName ? `, ${data.customerName}` : ''}
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
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">${data.numeroPedido}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textSecondary};">Producto</td>
              <td style="padding:6px 0;font-size:13px;color:${BRAND.textPrimary};text-align:right;font-weight:600;">${data.productName}</td>
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
      Podes seguir el estado de tu pedido desde tu perfil.
    </p>
  `
  return baseLayout(content, 'Recibis este email porque realizaste una compra en SEISMILES Textil.')
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
  const content = `
    <p style="margin:0 0 4px;font-size:11px;color:${BRAND.terra};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Bienvenido/a a la expedicion
    </p>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};">
      ¡Ya sos parte de SEISMILES!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">
      Gracias por suscribirte. Aca tenes tu cupon de descuento del 10% para tu primera compra.
    </p>

    <!-- Coupon card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND.volcanic},#4A3D35);border-radius:16px;padding:28px 24px;margin-bottom:16px;">
      <tr>
        <td style="text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em;">
            Tu cupon de descuento
          </p>
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:white;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
            ${data.couponCode}
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
  return baseLayout(content, `Recibis este email porque te suscribiste al newsletter de SEISMILES Textil.<br/><a href="${data.unsubscribeUrl}" style="color:${BRAND.textSecondary};text-decoration:underline;">Desuscribirse</a>`)
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
  return baseLayout(content, `Recibis este email porque te suscribiste al newsletter de SEISMILES Textil.<br/><a href="${data.unsubscribeUrl}" style="color:${BRAND.textSecondary};text-decoration:underline;">Desuscribirse</a>`)
}
