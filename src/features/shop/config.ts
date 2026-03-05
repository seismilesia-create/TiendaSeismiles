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
    headline: 'Calidad de Altura',
    subheadline:
      'Desde el corazón de Catamarca, diseñamos y confeccionamos ropa de alta gama. Inspirados en la solidez de nuestros Seismiles, creamos prendas que honran nuestra tierra y están hechas para durar.',
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

  featuredProducts: {
    label: 'Destacados',
    heading: 'Lo mas elegido',
    subtitle: 'Las prendas que definen nuestro estandar. Calidad premium, confeccion catamarquena.',
    products: [
      {
        name: 'Remera Arista',
        slug: 'remera-arista',
        href: '/tienda/linea-arista',
        line: 'Linea Arista',
        price: '$18.500',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&crop=center',
        tag: 'Mas vendida',
      },
      {
        name: 'Buzo Tres Cruces',
        slug: 'buzo-tres-cruces',
        href: '/tienda/linea-tres-cruces',
        line: 'Linea Tres Cruces',
        price: '$32.900',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop&crop=center',
        tag: 'Nuevo',
      },
      {
        name: 'Remera Pissis',
        slug: 'remera-pissis',
        href: '/tienda/linea-pissis',
        line: 'Linea Pissis',
        price: '$19.900',
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&crop=center',
      },
      {
        name: 'Buzo Veladero',
        slug: 'buzo-veladero',
        href: '/tienda/linea-veladero',
        line: 'Linea Veladero',
        price: '$34.500',
        imageUrl: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?w=600&h=800&fit=crop&crop=center',
      },
    ],
    cta: { text: 'Ver todos los productos', href: '/tienda' },
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
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center',
        },
        {
          title: 'Linea Pissis',
          subtitle: 'Maxima robustez y cuerpo',
          slug: 'linea-pissis',
          gradientFrom: '#C75B39',
          gradientTo: '#A04830',
          imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=600&fit=crop&crop=center',
        },
        {
          title: 'Linea Origen',
          subtitle: 'Suavidad, frescura y equilibrio',
          slug: 'linea-origen',
          gradientFrom: '#8B7355',
          gradientTo: '#6B5B45',
          imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop&crop=center',
        },
        {
          title: 'Linea Terreno',
          subtitle: 'Resistencia para el dia a dia',
          slug: 'linea-terreno',
          gradientFrom: '#5C5347',
          gradientTo: '#3D372E',
          imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4f0783dc8?w=800&h=600&fit=crop&crop=center',
        },
      ],
    },
    {
      id: 'remeras-personalizadas',
      label: 'Personalizadas',
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
    heading: 'Gift Cards Seismiles',
    subtitle: 'Regala calidad. Que elijan lo que mas les guste con una tarjeta de regalo Seismiles.',
    cards: [
      {
        id: 'gc-5000',
        title: 'Gift Card Clasica',
        price: '$5.000',
        description: 'Ideal para un detalle. Perfecta para accesorios o como aporte a una prenda favorita.',
        gradientFrom: '#8B7355',
        gradientTo: '#6B5B45',
      },
      {
        id: 'gc-15000',
        title: 'Gift Card Premium',
        price: '$15.000',
        description: 'La eleccion mas popular. Alcanza para una remera de cualquiera de nuestras lineas.',
        gradientFrom: '#C75B39',
        gradientTo: '#A04830',
      },
      {
        id: 'gc-30000',
        title: 'Gift Card Cumbre',
        price: '$30.000',
        description: 'Para quienes van por todo. Cubre buzos, camperas o varias prendas a eleccion.',
        gradientFrom: '#2C2420',
        gradientTo: '#4A3D35',
      },
      {
        id: 'gc-50000',
        title: 'Gift Card Seismiles',
        price: '$50.000',
        description: 'El regalo definitivo. Libertad total para armar el guardarropa completo.',
        gradientFrom: '#5C5347',
        gradientTo: '#1A1614',
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

  faq: {
    heading: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre Seismiles. Si no encontras tu respuesta, escribinos y te ayudamos.',
    contactPrompt: 'No encontraste lo que buscabas? Escribinos tu consulta y te respondemos a la brevedad.',
    items: [
      {
        question: 'Hacen envios a todo el pais?',
        answer: 'Si, realizamos envios a todo el territorio argentino a traves de correo y servicios de mensajeria. Los tiempos de entrega varian segun la localidad, pero generalmente son de 3 a 7 dias habiles.',
      },
      {
        question: 'Cuales son los medios de pago disponibles?',
        answer: 'Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express), transferencia bancaria, Mercado Pago y efectivo a traves de Rapipago y Pago Facil. Ofrecemos hasta 3 cuotas sin interes con tarjeta.',
      },
      {
        question: 'Como se la guia de talles?',
        answer: 'En cada producto encontras una tabla de talles detallada con medidas en centimetros. Si tenes dudas, escribinos por WhatsApp con tu altura y peso, y te asesoramos para que elijas el talle perfecto.',
      },
      {
        question: 'Puedo cambiar o devolver un producto?',
        answer: 'Si, tenes 30 dias desde la recepcion para solicitar un cambio o devolucion. El producto debe estar sin uso, con etiquetas y en su empaque original. Los cambios por talle no tienen costo adicional.',
      },
      {
        question: 'Las gift cards tienen vencimiento?',
        answer: 'No, nuestras gift cards no tienen fecha de vencimiento. Pueden ser canjeadas en cualquier momento y son validas para todos los productos de la tienda online.',
      },
      {
        question: 'Hacen personalizacion para empresas?',
        answer: 'Si, ofrecemos servicio de personalizacion con tecnologia DTF (Direct to Film) para empresas, eventos y equipos. Podes consultar precios y minimos escribiendonos por la seccion de contacto.',
      },
      {
        question: 'De donde son las prendas?',
        answer: 'Todas nuestras prendas son disenadas y confeccionadas en Catamarca, Argentina. Usamos materiales premium seleccionados: algodon de fibra larga, pique superior y frisas peinadas de primera calidad.',
      },
      {
        question: 'Cuanto tarda en llegar mi pedido?',
        answer: 'Los pedidos dentro de Catamarca capital llegan en 24-48 horas. Para el resto del pais, el plazo es de 3 a 7 dias habiles dependiendo de la localidad. Recibiras un codigo de seguimiento por email.',
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
