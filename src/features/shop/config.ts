import type { ShopConfig } from './types'

// ============================================================
// SHOP CONFIG - SEISMILES Textil
// Indumentaria urbana premium con alma de montaña
// ============================================================

export const shopConfig: ShopConfig = {
  brand: {
    name: 'SEISMILES',
    tagline: 'Ruta Nacional 60',
    subtitle: 'Nacidas a 6000 metros de altura',
    description:
      'Nacidas en la inmensidad del altiplano catamarqueño. Donde los volcanes tocan el cielo, vestimos confianza.',
    instagram: 'https://instagram.com/seismiles_textil',
    whatsapp: 'https://wa.me/5493834243614',
    email: 'seismilestextil@gmail.com',
  },

  hero: {
    badge: 'Catamarca, Argentina',
    headline: 'Calidad de Altura',
    subheadline:
      'Desde el corazón de Catamarca, diseñamos y confeccionamos ropa de alta gama. Inspirados en la solidez de nuestros SEISMILES, creamos prendas que honran nuestra tierra y están hechas para durar.',
    ctaPrimary: { text: 'Ver coleccion', href: '/catalogo' },
    ctaSecondary: { text: 'Nuestro origen', href: '/nosotros' },
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
      label: 'Catalogo',
      href: '/catalogo',
      children: [
        { label: 'Remeras Algodon', href: '/catalogo?type=remeras-lisas' },
        { label: 'Remeras Pique', href: '/catalogo?type=estampadas' },
        { label: 'Buzos y Camperas', href: '/catalogo?type=buzos-camperas' },
        { label: 'Todos los productos', href: '/catalogo' },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'Nuestro Origen', href: '#origen' },
    { label: 'FAQ', href: '/faq' },
  ],

  featuredProducts: {
    label: 'Destacados',
    heading: 'Lo mas elegido',
    subtitle: 'Las prendas que definen nuestro estandar. Calidad premium, confeccion catamarquena.',
    products: [
      {
        name: 'Remera Arista',
        slug: 'remera-arista',
        href: '/catalogo?line=linea-arista',
        line: 'Linea Arista',
        price: '$18.500',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&crop=center',
        tag: 'Mas vendida',
      },
      {
        name: 'Buzo Tres Cruces',
        slug: 'buzo-tres-cruces',
        href: '/catalogo?line=linea-tres-cruces',
        line: 'Linea Tres Cruces',
        price: '$32.900',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop&crop=center',
        tag: 'Nuevo',
      },
      {
        name: 'Remera Pissis',
        slug: 'remera-pissis',
        href: '/catalogo?line=linea-pissis',
        line: 'Linea Pissis',
        price: '$19.900',
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&crop=center',
      },
      {
        name: 'Buzo Veladero',
        slug: 'buzo-veladero',
        href: '/catalogo?line=linea-veladero',
        line: 'Linea Veladero',
        price: '$34.500',
        imageUrl: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?w=600&h=800&fit=crop&crop=center',
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
          title: 'Linea Arista',
          subtitle: 'Elegancia con cuello de morley',
          slug: 'linea-arista',
          gradientFrom: '#2C2420',
          gradientTo: '#4A3D35',
          imageUrl: '/images/Arista.webp',
        },
        {
          title: 'Linea Pissis',
          subtitle: 'Maxima robustez y cuerpo',
          slug: 'linea-pissis',
          gradientFrom: '#C75B39',
          gradientTo: '#A04830',
          imageUrl: '/images/Pissis.webp',
        },
        {
          title: 'Linea Origen',
          subtitle: 'Suavidad, frescura y equilibrio',
          slug: 'linea-origen',
          gradientFrom: '#8B7355',
          gradientTo: '#6B5B45',
          imageUrl: '/images/Origen.webp',
        },
      ],
    },
    {
      id: 'remeras-estampadas',
      label: 'Estampadas',
      categories: [
        {
          title: 'Linea Veta',
          subtitle: 'Personaliza tu estilo',
          slug: 'linea-veta',
          gradientFrom: '#C75B39',
          gradientTo: '#8B7355',
          imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=600&fit=crop&crop=center',
        },
      ],
    },
    {
      id: 'buzos-camperas',
      label: 'Buzos y Camperas',
      categories: [
        {
          title: 'Linea Tres Cruces',
          subtitle: 'Frisa invisible peinada premium',
          slug: 'linea-tres-cruces',
          gradientFrom: '#2C2420',
          gradientTo: '#1A1614',
          imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop&crop=center',
        },
        {
          title: 'Linea Nacimiento',
          subtitle: 'Frisa cardada clasica',
          slug: 'linea-nacimiento',
          gradientFrom: '#8B7355',
          gradientTo: '#6B5B45',
          imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=600&fit=crop&crop=center',
        },
        {
          title: 'Linea Veladero',
          subtitle: 'Rustico peinado pesado premium',
          slug: 'linea-veladero',
          gradientFrom: '#C75B39',
          gradientTo: '#A04830',
          imageUrl: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?w=800&h=600&fit=crop&crop=center',
        },
        {
          title: 'Linea San Francisco',
          subtitle: 'Rustico peinado pesado base',
          slug: 'linea-san-francisco',
          gradientFrom: '#5C5347',
          gradientTo: '#3D372E',
          imageUrl: 'https://images.unsplash.com/photo-1578768079470-c9e6a3c9e4b1?w=800&h=600&fit=crop&crop=center',
        },
      ],
    },
  ],

  origin: {
    coordinates: "27° 07' S  68° 32' W",
    location: 'Paso de San Francisco',
    heading: 'Donde nace nuestro nombre',
    paragraphs: [
      'La Ruta de los SEISMILES recorre la Ruta Nacional 60 entre Tinogasta y el Paso de San Francisco, en Catamarca. Un camino rodeado de volcanes de mas de 6.000 metros, paisajes aridos y la majestuosidad del altiplano andino.',
      'Esa grandeza nos inspira. Cada prenda lleva la fuerza de la tierra, la resistencia de la roca volcanica y la calidez del desierto que nos vio nacer. Somos de la montaña, para la ciudad.',
    ],
    stats: [
      { value: '6000', label: 'Metros de altura' },
      { value: '600', label: 'km de recorrido' },
    ],
    cta: { text: 'Conoce la ruta', href: '/nosotros' },
  },

  quality: {
    label: 'Nuestra diferencia',
    heading: 'Calidad forjada en la altura',
    subtitle:
      'Entendemos la urgencia de tus tiempos y la importancia de los detalles. Cada prenda pasa por un estricto control de calidad.',
    imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop&crop=center',
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

  giftCards: {
    heading: 'Gift Cards SEISMILES',
    subtitle: 'Regala calidad. Que elijan lo que mas les guste con una tarjeta de regalo SEISMILES.',
  },

  benefits: [
    {
      icon: 'truck',
      title: 'Envíos a todo el país',
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

  faq: {
    heading: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre SEISMILES. Si no encontras tu respuesta, escribinos y te ayudamos.',
    contactPrompt: 'No encontraste lo que buscabas? Escribinos tu consulta y te respondemos a la brevedad.',
    items: [
      {
        section: 'Envíos',
        question: 'Hacen envios a todo el pais?',
        answer: 'Si, realizamos envios a todo el territorio argentino a traves de correo y servicios de mensajeria. Los tiempos de entrega varian segun la localidad, pero generalmente son de 3 a 7 dias habiles.',
      },
      {
        section: 'Envíos',
        question: 'Cuanto tarda en llegar mi pedido?',
        answer: 'Los pedidos dentro de Catamarca capital llegan en 24-48 horas. Para el resto del pais, el plazo es de 3 a 7 dias habiles dependiendo de la localidad. Recibiras un codigo de seguimiento por email.',
      },
      {
        section: 'Pagos',
        question: 'Cuales son los medios de pago disponibles?',
        answer: 'Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express), transferencia bancaria, Mercado Pago y efectivo a traves de Rapipago y Pago Facil. Ofrecemos hasta 3 cuotas sin interes con tarjeta.',
      },
      {
        section: 'Productos',
        question: 'Como se la guia de talles?',
        answer: 'En cada producto encontras una tabla de talles detallada con medidas en centimetros. Si tenes dudas, escribinos por WhatsApp con tu altura y peso, y te asesoramos para que elijas el talle perfecto.',
      },
      {
        section: 'Productos',
        question: 'De donde son las prendas?',
        answer: 'Todas nuestras prendas son diseñadas y confeccionadas en Catamarca, Argentina. Usamos materiales premium seleccionados: algodon de fibra larga, pique superior y frisas peinadas de primera calidad.',
      },
      {
        section: 'Cambios y Devoluciones',
        question: 'Puedo cambiar o devolver un producto?',
        answer: 'Si, tenes 30 dias desde la recepcion para solicitar un cambio o devolucion. El producto debe estar sin uso, con etiquetas y en su empaque original. Los cambios por talle no tienen costo adicional. Para conocer todos los detalles, plazos y condiciones visita la seccion de Cambios y Devoluciones en el pie de pagina.',
      },
      {
        section: 'Gift Cards',
        question: 'Las gift cards tienen vencimiento?',
        answer: 'No, nuestras gift cards no tienen fecha de vencimiento. Pueden ser canjeadas en cualquier momento y son validas para todos los productos de la tienda online.',
      },
      {
        section: 'Personalización',
        question: 'Hacen personalizacion para empresas?',
        answer: 'Si, ofrecemos servicio de personalizacion con tecnologia DTF (Direct to Film) para empresas, eventos y equipos. Podes consultar precios y minimos escribiendonos por la seccion de contacto.',
      },
    ],
  },

  instagram: {
    handle: '@seismiles_textil',
    heading: '@seismiles_textil',
    subtitle:
      'Seguinos y se parte de la comunidad que se anima a ir mas alto.',
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
      href: 'https://instagram.com/seismiles_textil',
    },
  },

  blog: {
    heading: 'Blog SEISMILES',
    subtitle:
      'Cuidados de tela, materiales premium y la historia detras de cada prenda. Conoce lo que nos diferencia.',
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
      'Suscribite y recibi tu cupon de descuento. Enterate primero de novedades, nuevos colores y ofertas exclusivas.',
    placeholder: 'Tu email',
    buttonText: 'Suscribirse',
    disclaimer: 'Al suscribirte aceptas nuestra politica de privacidad.',
  },

  footer: {
    tagline:
      'Nacidas en la inmensidad del altiplano catamarqueño. Donde los volcanes tocan el cielo, vestimos confianza.',
    columns: [
      {
        title: 'Tienda',
        links: [
          { label: 'Remeras Lisas', href: '/catalogo?type=remeras-lisas' },
          { label: 'Estampadas', href: '/catalogo?type=estampadas' },
          { label: 'Buzos y Camperas', href: '/catalogo?type=buzos-camperas' },
          { label: 'Todos los productos', href: '/catalogo' },
        ],
      },
      {
        title: 'Informacion',
        links: [
          { label: 'Nosotros', href: '/nosotros' },
          { label: 'Blog', href: '/blog' },
          { label: 'Gift Cards', href: '/giftcards' },
        ],
      },
      {
        title: 'Ayuda',
        links: [
          { label: 'Preguntas frecuentes', href: '/faq' },
          { label: 'Cambios y devoluciones', href: '/cambios-y-devoluciones' },
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
    copyright: '2026 SEISMILES Textil. Nacidas a 6000 metros. Todos los derechos reservados.',
  },
}
