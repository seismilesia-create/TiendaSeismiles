// ============================================================
// SHOP TYPES - Seismiles Textil
// Tipos para la landing page y futuro catalogo de productos
// ============================================================

/** Linea de producto (Algodon, Pique, Buzos, DTF) */
export interface ProductLine {
  name: string
  slug: string
  tagline: string
  description: string
  imageUrl?: string
  isActive: boolean
  displayOrder: number
}

/** Categoria visual para el grid de la landing */
export interface CategoryCard {
  title: string
  subtitle: string
  slug: string
  imageUrl?: string
  gradientFrom: string
  gradientTo: string
}

/** Tab de tipo de producto con sus lineas */
export interface ProductTypeTab {
  id: string
  label: string
  categories: CategoryCard[]
}

/** Feature de calidad numerado */
export interface QualityFeature {
  number: string
  title: string
  description: string
}

/** Item de la barra de beneficios */
export interface BenefitItem {
  icon: 'truck' | 'credit-card' | 'shield' | 'refresh'
  title: string
  description: string
}

/** Foto de Instagram para la seccion lifestyle */
export interface InstagramPhoto {
  alt: string
  imageUrl?: string
  gradientFrom: string
  gradientTo: string
}

/** Mensaje del marquee banner */
export interface MarqueeMessage {
  text: string
}

/** Item de navegacion */
export interface ShopNavItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

/** Columna del footer */
export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

/** Metodo de pago */
export interface PaymentMethod {
  name: string
  slug: string
}

/** Configuracion de la tienda Seismiles */
export interface ShopConfig {
  brand: {
    name: string
    tagline: string
    subtitle: string
    description: string
    instagram: string
    whatsapp: string
    email: string
  }

  hero: {
    badge: string
    headline: string
    subheadline: string
    ctaPrimary: { text: string; href: string }
    ctaSecondary: { text: string; href: string }
  }

  marqueeMessages: MarqueeMessage[]

  navigation: ShopNavItem[]

  productTypeTabs: ProductTypeTab[]

  origin: {
    coordinates: string
    location: string
    heading: string
    paragraphs: string[]
    stats: { value: string; label: string }[]
    cta: { text: string; href: string }
  }

  quality: {
    label: string
    heading: string
    subtitle: string
    features: QualityFeature[]
  }

  benefits: BenefitItem[]

  instagram: {
    handle: string
    heading: string
    subtitle: string
    photos: InstagramPhoto[]
    cta: { text: string; href: string }
  }

  newsletter: {
    label: string
    heading: string
    subtitle: string
    placeholder: string
    buttonText: string
    disclaimer: string
  }

  footer: {
    tagline: string
    columns: FooterColumn[]
    paymentMethods: PaymentMethod[]
    copyright: string
  }
}
