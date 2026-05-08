import type { ShopConfig } from './types'

// ============================================================
// SHOP CONFIG - SEISMILES
// Indumentaria urbana premium con alma de montaña
// ============================================================

export const shopConfig: ShopConfig = {
  brand: {
    name: 'SEISMILES',
    tagline: 'Ruta Nacional 60',
    subtitle: 'Calidad de altura',
    description:
      'Nacidas en la inmensidad del altiplano catamarqueño. Donde los volcanes tocan el cielo, vestimos confianza.',
    instagram: 'https://instagram.com/seismiles_',
    whatsapp: 'https://wa.me/5493834243614',
    email: 'seismilestextil@gmail.com',
  },

  hero: {
    badge: 'Catamarca, Argentina',
    headline: 'Calidad de Altura',
    subheadline:
      'Desde el corazón de Catamarca, diseñamos y estampamos ropa de alta gama. Inspirados en la solidez de nuestros SEISMILES, creamos prendas que honran nuestra tierra y están hechas para durar.',
    ctaPrimary: { text: 'Ver colección', href: '/catalogo' },
    ctaSecondary: { text: 'Nuestro origen', href: '/nosotros' },
  },

  marqueeMessages: [
    { text: 'Retiro gratis en Catamarca capital' },
    { text: 'Cadetería local Valle Central' },
    { text: 'Calidad de altura' },
    { text: 'Calidad premium garantizada' },
  ],

  navigation: [
    { label: 'Inicio', href: '/' },
    {
      label: 'Catálogo',
      href: '/catalogo',
      children: [
        { label: 'Remeras Algodón', href: '/catalogo?type=remeras-lisas' },
        { label: 'Buzos', href: '/catalogo?type=buzos', comingSoon: true },
        { label: 'Todos los productos', href: '/catalogo' },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'Nuestro Origen', href: '#origen' },
    { label: 'FAQ', href: '/faq' },
  ],

  featuredProducts: {
    label: 'Destacados',
    heading: 'Lo más elegido',
    subtitle: 'Las prendas que definen nuestro estándar. Calidad premium, confección catamarqueña.',
    products: [
      {
        name: 'Remera Arista',
        slug: 'remera-arista',
        href: '/catalogo?line=linea-arista',
        line: 'Línea Arista',
        price: '$18.500',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&crop=center',
        tag: 'Más vendida',
      },
      {
        name: 'Remera Pissis',
        slug: 'remera-pissis',
        href: '/catalogo?line=linea-pissis',
        line: 'Línea Pissis',
        price: '$19.900',
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&crop=center',
      },
    ],
    cta: { text: 'Ver todos los productos', href: '/catalogo' },
  },

  productTypeTabs: [
    {
      id: 'remeras-lisas',
      label: 'Remeras Lisas',
      categories: [
        {
          title: 'Línea Arista',
          subtitle: 'Elegancia con cuello de morley',
          slug: 'linea-arista',
          gradientFrom: '#2C2420',
          gradientTo: '#4A3D35',
          imageUrl: '/images/Arista.webp',
        },
        {
          title: 'Línea Pissis',
          subtitle: 'Máxima robustez y cuerpo',
          slug: 'linea-pissis',
          gradientFrom: '#C75B39',
          gradientTo: '#A04830',
          imageUrl: '/images/Pissis.webp',
        },
        {
          title: 'Línea Origen',
          subtitle: 'Suavidad, frescura y equilibrio',
          slug: 'linea-origen',
          gradientFrom: '#8B7355',
          gradientTo: '#6B5B45',
          imageUrl: '/images/Origen.webp',
        },
      ],
    },
    {
      id: 'buzos',
      label: 'Buzos',
      comingSoon: true,
      comingSoonMessage: 'Estamos preparando nuestra línea de buzos. Suscribite al newsletter y enterate primero cuando estén disponibles.',
      categories: [],
    },
  ],

  crossSellRules: [],

  origin: {
    coordinates: "27° 07' S  68° 32' W",
    location: 'Paso de San Francisco',
    heading: 'Donde nace nuestro nombre',
    paragraphs: [
      'La Ruta de los SEISMILES recorre la Ruta Nacional 60 entre Tinogasta y el Paso de San Francisco, en Catamarca. Un camino rodeado de volcanes de más de 6.000 metros, paisajes áridos y la majestuosidad del altiplano andino.',
      'Esa grandeza nos inspira. Cada prenda lleva la fuerza de la tierra, la resistencia de la roca volcánica y la calidez del desierto que nos vio nacer. Somos de la montaña, para la ciudad.',
    ],
    stats: [
      { value: '6000', label: 'Metros de altura' },
      { value: '600', label: 'km de recorrido' },
    ],
    cta: { text: 'Conocé la ruta', href: '/nosotros' },
  },

  quality: {
    label: 'Nuestra diferencia',
    heading: 'Calidad forjada en la altura',
    subtitle:
      'Entendemos la urgencia de tus tiempos y la importancia de los detalles. Cada prenda pasa por un estricto control de calidad.',
    imageUrl: '/images/Remeras_Logo.jpg',
    features: [
      {
        number: '01',
        title: 'Algodón Premium',
        description:
          'Fibras seleccionadas para una textura suave y duradera. La base de todo lo que hacemos, como la tierra del altiplano.',
      },
      {
        number: '02',
        title: 'Piqué Superior',
        description:
          'El tejido que nos pone encima del 80% del mercado. Tacto diferencial, estructura que no pierde forma, presencia que se nota.',
      },
      {
        number: '03',
        title: 'Confección Super Premium',
        description:
          'Costuras reforzadas, tinturas de alta fijación, terminaciones impecables. Nuestros Buzos Canguro son la insignia de este estándar.',
      },
    ],
  },

  giftCards: {
    heading: 'Gift Cards SEISMILES',
    subtitle: 'Regalá calidad. Que elijan lo que más les guste con una tarjeta de regalo SEISMILES.',
  },

  benefits: [
    {
      icon: 'truck',
      title: 'Retiro y cadetería en Catamarca',
      description: 'Envíos al resto del país próximamente',
    },
    {
      icon: 'credit-card',
      title: 'Pagá como quieras',
      description: 'Tarjeta o transferencia',
    },
    {
      icon: 'shield',
      title: 'Compra segura',
      description: 'Tus datos siempre protegidos',
    },
    {
      icon: 'refresh',
      title: 'Cambios fáciles',
      description: 'Proceso simple y rápido',
    },
  ],

  faq: {
    heading: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitás saber sobre SEISMILES. Si no encontrás tu respuesta, escribinos y te ayudamos.',
    contactPrompt: '¿No encontraste lo que buscabas? Escribinos tu consulta y te respondemos a la brevedad.',
    items: [
      {
        section: 'Envíos',
        question: '¿Hacen envíos a todo el país?',
        answer: 'Por ahora solo realizamos entregas en Catamarca: retiro en persona en la capital (sin costo) o cadetería local en el Valle Central. Los envíos al resto del país estarán disponibles próximamente; mientras tanto podemos cotizarlos manualmente por WhatsApp con número de seguimiento.',
      },
      {
        section: 'Envíos',
        question: '¿Cuánto tarda en llegar mi pedido?',
        answer: 'Retiro en persona en Catamarca capital: coordinamos el momento al confirmar el pedido. Cadetería local en el Valle Central: entrega en el día o al día siguiente hábil. Para consultas fuera de la zona, escribinos por WhatsApp.',
      },
      {
        section: 'Pagos',
        question: '¿Cuáles son los medios de pago disponibles?',
        answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria, Mercado Pago y efectivo a través de Rapipago y Pago Fácil.',
      },
      {
        section: 'Productos',
        question: '¿Cómo es la guía de talles?',
        answer: 'En cada producto encontrás una tabla de talles detallada con medidas en centímetros. Si tenés dudas, escribinos por WhatsApp con tu altura y peso, y te asesoramos para que elijas el talle perfecto.',
      },
      {
        section: 'Productos',
        question: '¿De dónde son las prendas?',
        answer: 'Todas nuestras prendas son diseñadas, curadas y estampadas en Catamarca, Argentina. Usamos materiales premium seleccionados: algodón de fibra larga, piqué superior y frisas peinadas de primera calidad.',
      },
      {
        section: 'Cambios y Devoluciones',
        question: '¿Puedo cambiar o devolver un producto?',
        answer: 'Sí, tenés 30 días desde la recepción para solicitar un cambio o devolución. El producto debe estar sin uso, con etiquetas y en su empaque original. Los cambios por talle no tienen costo adicional. Para conocer todos los detalles, plazos y condiciones visitá la sección de Cambios y Devoluciones en el pie de página.',
      },
      {
        section: 'Gift Cards',
        question: '¿Las gift cards tienen vencimiento?',
        answer: 'No, nuestras gift cards no tienen fecha de vencimiento. Pueden ser canjeadas en cualquier momento y son válidas para todos los productos de la tienda online.',
      },
      {
        section: 'Personalización',
        question: '¿Hacen personalización para empresas?',
        answer: 'Sí, ofrecemos servicio de personalización con tecnología DTF (Direct to Film) para empresas, eventos y equipos. Podés consultar precios y mínimos escribiéndonos por la sección de contacto.',
      },
    ],
  },

  instagram: {
    handle: '@seismiles_',
    heading: '@seismiles_',
    subtitle:
      'Seguinos y sé parte de la comunidad que se anima a ir más alto.',
    photos: [
      {
        alt: 'Look urbano con remera SEISMILES',
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
      href: 'https://instagram.com/seismiles_',
    },
  },

  blog: {
    heading: 'Blog SEISMILES',
    subtitle:
      'Cuidados de tela, materiales premium y la historia detrás de cada prenda. Conocé lo que nos diferencia.',
    categories: [
      { id: 'cuidados', label: 'Cuidados' },
      { id: 'materiales', label: 'Materiales' },
      { id: 'estilo', label: 'Estilo' },
      { id: 'marca', label: 'Marca' },
    ],
  },

  newsletter: {
    label: 'Newsletter',
    heading: '10% en tu primera compra',
    subtitle:
      'Suscribite y recibí tu cupón de descuento. Enterate primero de novedades, nuevos colores y ofertas exclusivas.',
    placeholder: 'Tu email',
    buttonText: 'Suscribirse',
    disclaimer: 'Al suscribirte aceptás nuestra política de privacidad.',
  },

  footer: {
    tagline:
      'Nacidas en la inmensidad del altiplano catamarqueño. Donde los volcanes tocan el cielo, vestimos confianza.',
    columns: [
      {
        title: 'Tienda',
        links: [
          { label: 'Remeras Lisas', href: '/catalogo?type=remeras-lisas' },
          { label: 'Todos los productos', href: '/catalogo' },
        ],
      },
      {
        title: 'Información',
        links: [
          { label: 'Nosotros', href: '/nosotros' },
          { label: 'Blog', href: '/blog' },
          { label: 'Gift Cards', href: '/giftcards' },
          { label: 'Política de privacidad', href: '/politica-de-privacidad' },
          { label: 'Términos y condiciones', href: '/terminos-y-condiciones' },
        ],
      },
      {
        title: 'Ayuda',
        links: [
          { label: 'Preguntas frecuentes', href: '/faq' },
          { label: 'Cambios y devoluciones', href: '/cambios-y-devoluciones' },
          { label: 'Botón de Arrepentimiento', href: '/arrepentimiento' },
          { label: 'Contacto', href: '/contacto' },
        ],
      },
    ],
    paymentMethods: [
      { name: 'Visa', slug: 'visa' },
      { name: 'Mastercard', slug: 'mastercard' },
      { name: 'Mercado Pago', slug: 'mercadopago' },
      { name: 'Transferencia', slug: 'transferencia' },
    ],
    copyright: '2026 SEISMILES. Calidad de altura. Todos los derechos reservados.',
  },
}
