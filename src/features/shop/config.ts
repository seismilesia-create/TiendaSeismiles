import type { ShopConfig } from './types'

// ============================================================
// SHOP CONFIG - Seismiles Textil
// Indumentaria urbana premium con alma de montana
// ============================================================

export const shopConfig: ShopConfig = {
  brand: {
    name: 'Seismiles',
    tagline: 'Ruta Nacional 60',
    subtitle: 'Nacidas a 6000 metros de altura',
    description:
      'Nacidas en la inmensidad del altiplano catamarqueno. Donde los volcanes tocan el cielo, vestimos confianza.',
    instagram: 'https://instagram.com/seismiles_textil',
    whatsapp: 'https://wa.me/5493834000000',
    email: 'contacto@seismilestextil.com',
  },

  hero: {
    badge: 'Catamarca, Argentina',
    headline: 'Nacidas a 6000 metros de altura',
    subheadline:
      'Donde el altiplano toca el cielo y los volcanes cuentan historias milenarias. Desde la Ruta de los Seismiles, vestimos confianza.',
    ctaPrimary: { text: 'Ver coleccion', href: '/tienda' },
    ctaSecondary: { text: 'Nuestro origen', href: '#origen' },
  },

  marqueeMessages: [
    { text: 'Envio gratis a todo el pais' },
    { text: '3 cuotas sin interes' },
    { text: 'Nacidas a 6000 metros de altura' },
    { text: 'Calidad premium garantizada' },
  ],

  navigation: [
    { label: 'Inicio', href: '/' },
    {
      label: 'Tienda',
      href: '/tienda',
      children: [
        { label: 'Remeras Algodon', href: '/tienda/remeras-algodon' },
        { label: 'Remeras Pique', href: '/tienda/remeras-pique' },
        { label: 'Buzos Canguro', href: '/tienda/buzos-canguro' },
        { label: 'Todos los productos', href: '/tienda' },
      ],
    },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Nuestro Origen', href: '#origen' },
    { label: 'Contacto', href: '/contacto' },
  ],

  categories: [
    {
      title: 'Remeras Algodon',
      subtitle: 'De basico a premium',
      slug: 'remeras-algodon',
      gradientFrom: '#8B7355',
      gradientTo: '#6B5B45',
    },
    {
      title: 'Remeras Pique',
      subtitle: 'Tejido que marca la diferencia',
      slug: 'remeras-pique',
      gradientFrom: '#C75B39',
      gradientTo: '#A04830',
    },
    {
      title: 'Buzos Canguro',
      subtitle: 'Super Premium',
      slug: 'buzos-canguro',
      gradientFrom: '#2C2420',
      gradientTo: '#1A1614',
    },
    {
      title: 'Empresas & DTF',
      subtitle: 'Mayorista y personalizado',
      slug: 'empresas',
      gradientFrom: '#5C5347',
      gradientTo: '#3D372E',
    },
  ],

  origin: {
    coordinates: "27° 07' S  68° 32' W",
    location: 'Paso de San Francisco',
    heading: 'Donde nace nuestro nombre',
    paragraphs: [
      'La Ruta de los Seismiles recorre la Ruta Nacional 60 entre Tinogasta y el Paso de San Francisco, en Catamarca. Un camino rodeado de volcanes de mas de 6.000 metros, paisajes aridos y la majestuosidad del altiplano andino.',
      'Esa grandeza nos inspira. Cada prenda lleva la fuerza de la tierra, la resistencia de la roca volcanica y la calidez del desierto que nos vio nacer. Somos de la montana, para la ciudad.',
    ],
    stats: [
      { value: '6000', label: 'Metros de altura' },
      { value: '600', label: 'km de recorrido' },
    ],
    cta: { text: 'Conoce la ruta', href: '#origen' },
  },

  quality: {
    label: 'Nuestra diferencia',
    heading: 'Calidad forjada en la altura',
    subtitle:
      'Entendemos la urgencia de tus tiempos y la importancia de los detalles. Cada prenda pasa por un estricto control de calidad.',
    features: [
      {
        number: '01',
        title: 'Algodon Premium',
        description:
          'Fibras seleccionadas para una textura suave y duradera. La base de todo lo que hacemos, como la tierra del altiplano.',
      },
      {
        number: '02',
        title: 'Pique Superior',
        description:
          'El tejido que nos pone encima del 80% del mercado. Tacto diferencial, estructura que no pierde forma, presencia que se nota.',
      },
      {
        number: '03',
        title: 'Confeccion Super Premium',
        description:
          'Costuras reforzadas, tinturas de alta fijacion, terminaciones impecables. Nuestros Buzos Canguro son la insignia de este estandar.',
      },
    ],
  },

  benefits: [
    {
      icon: 'truck',
      title: 'Envios a todo el pais',
      description: 'Entregas rapidas y seguras',
    },
    {
      icon: 'credit-card',
      title: 'Paga como quieras',
      description: 'Tarjeta, transferencia o efectivo',
    },
    {
      icon: 'shield',
      title: 'Compra segura',
      description: 'Tus datos siempre protegidos',
    },
    {
      icon: 'refresh',
      title: 'Cambios faciles',
      description: 'Proceso simple y rapido',
    },
  ],

  instagram: {
    handle: '@seismiles_textil',
    heading: '@seismiles_textil',
    subtitle:
      'Seguinos y se parte de la comunidad que se anima a ir mas alto.',
    photos: [
      {
        alt: 'Look urbano con remera Seismiles',
        gradientFrom: '#8B7355',
        gradientTo: '#C75B39',
      },
      {
        alt: 'Estilo premium con buzo canguro',
        gradientFrom: '#C75B39',
        gradientTo: '#2C2420',
      },
      {
        alt: 'Remera pique en la ciudad',
        gradientFrom: '#5C5347',
        gradientTo: '#8B7355',
      },
    ],
    cta: {
      text: 'Seguinos en Instagram',
      href: 'https://instagram.com/seismiles_textil',
    },
  },

  newsletter: {
    label: 'Newsletter',
    heading: '10% en tu primera compra',
    subtitle:
      'Suscribite y recibi tu cupon de descuento. Enterate primero de novedades, nuevos colores y ofertas exclusivas.',
    placeholder: 'Tu email',
    buttonText: 'Suscribirse',
    disclaimer: 'Al suscribirte aceptas nuestra politica de privacidad.',
  },

  footer: {
    tagline:
      'Nacidas en la inmensidad del altiplano catamarqueno. Donde los volcanes tocan el cielo, vestimos confianza.',
    columns: [
      {
        title: 'Tienda',
        links: [
          { label: 'Remeras Algodon', href: '/tienda/remeras-algodon' },
          { label: 'Remeras Pique', href: '/tienda/remeras-pique' },
          { label: 'Buzos Canguro', href: '/tienda/buzos-canguro' },
          { label: 'Todos los productos', href: '/tienda' },
        ],
      },
      {
        title: 'Empresas',
        links: [
          { label: 'Venta Mayorista', href: '/empresas' },
          { label: 'Personalizacion DTF', href: '/empresas#dtf' },
          { label: 'Consultar precios', href: '/contacto' },
        ],
      },
      {
        title: 'Ayuda',
        links: [
          { label: 'Contacto', href: '/contacto' },
          { label: 'Preguntas frecuentes', href: '/faq' },
          { label: 'Envios y seguimiento', href: '/envios' },
          { label: 'Cambios y devoluciones', href: '/cambios' },
        ],
      },
    ],
    paymentMethods: [
      { name: 'Visa', slug: 'visa' },
      { name: 'Mastercard', slug: 'mastercard' },
      { name: 'Mercado Pago', slug: 'mercadopago' },
      { name: 'Transferencia', slug: 'transferencia' },
    ],
    copyright: '2026 Seismiles Textil. Nacidas a 6000 metros. Todos los derechos reservados.',
  },
}
