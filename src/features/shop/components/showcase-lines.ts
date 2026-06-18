// Configs for the multi-line product showcase (homepage section).
// Each line has a name shown in the top-bar tab and a list of products that
// participate in the Flip carousel. Prices + slugs mirror the DB.

export type ShowcaseProduct = {
  id: string
  shortName: string
  name: string
  tagline: string
  description: string
  image: string
  imageAlt: string
  gradient: string
  accentColor: string
  /** Which half of the bg is light (so chrome on that side switches to dark tones). */
  lightSide?: 'left' | 'right'
  /** Price string. Omit for catalog-entry tiles (e.g. "Toda la línea"). */
  price?: string
  ctaText: string
  href: string
  /**
   * When true, the image uses object-cover (good for "duo" shots that fill
   * the frame edge-to-edge). Single-model photos use the default object-contain.
   */
  fillContainer?: boolean
  /**
   * Override the default top-position class for the ACTIVE state. Useful when
   * the model's head sits high in the photo and gets clipped by the top bar —
   * shifting the card down keeps the figure clear.
   * Format: full responsive class string, e.g. "top-[15%] sm:top-[58%]".
   */
  activeTop?: string
  /**
   * Override the default max-width class for the ACTIVE state. Use to shrink
   * a card whose photo is tightly framed so the figure isn't clipped at center.
   * Format: a Tailwind max-width class, e.g. "max-w-[420px]".
   */
  activeMaxWidth?: string
}

export type ShowcaseLine = {
  /** Stable id (used for data-flip-id namespacing + bg-layer keys). */
  id: string
  /** Label shown in the top-bar tab. */
  name: string
  /** Short label (currently unused but handy if a section heading is added). */
  shortName: string
  products: ShowcaseProduct[]
}

// ─── ARISTA ──────────────────────────────────────────────────────────────────

export const aristaLine: ShowcaseLine = {
  id: 'arista',
  name: 'Colección Arista',
  shortName: 'Arista',
  products: [
    {
      id: 'verde',
      shortName: 'Verde',
      name: 'Arista Verde Inglés',
      tagline: 'La fuerza del paisaje',
      description:
        'Algodón premium con la solidez de las laderas catamarqueñas. Verde inglés que acompaña cada movimiento.',
      image: '/images/Arista verde.png',
      imageAlt: 'Remera Arista verde inglés',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #3a5249 0%, #1c2c25 45%, #0a1310 100%)',
      accentColor: '#9fbba9',
      price: '$35.000',
      ctaText: 'Comprar',
      href: '/catalogo/arista-verde-ingles',
    },
    {
      id: 'negra',
      shortName: 'Negra',
      name: 'Arista Negra',
      tagline: 'El silencio del Pissis',
      description:
        'Algodón premium en negro firme. La noche estrellada sobre el campo de piedra pómez.',
      image: '/images/Arista negra.png',
      imageAlt: 'Remera Arista negra',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #2a2826 0%, #15131f 45%, #050402 100%)',
      accentColor: '#d9c9a8',
      price: '$35.000',
      ctaText: 'Comprar',
      href: '/catalogo/arista-negra',
    },
    {
      id: 'marino',
      shortName: 'Marino',
      name: 'Arista Marino',
      tagline: 'El azul de la cordillera',
      description:
        'Algodón premium en azul marino. La profundidad del cielo del altiplano cuando cae la noche.',
      image: '/images/Arista Azul Marino .png',
      imageAlt: 'Remera Arista azul marino',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #3d4a6e 0%, #1f2638 45%, #0a0e1a 100%)',
      accentColor: '#a5b1cc',
      price: '$35.000',
      ctaText: 'Comprar',
      href: '/catalogo/arista-marino',
    },
    {
      id: 'duo',
      shortName: 'Línea',
      name: 'Toda la línea',
      tagline: 'Más colores te esperan',
      description:
        'Conocé toda la paleta de la Línea Arista: manteca, bordó, francia, melange, blanca y más en el catálogo.',
      image: '/images/Arista duo crema y negra.png',
      imageAlt: 'Remeras Arista crema y negra',
      // Split: cream on left (under the cream-shirt model), dark on right (under the black-shirt model)
      gradient:
        'linear-gradient(95deg, #ddc8a0 0%, #c8b48d 22%, #8a7355 44%, #3a2a1c 52%, #1a1815 62%, #15131f 100%)',
      accentColor: '#3a2a1c',
      lightSide: 'left',
      ctaText: 'Ver catálogo completo',
      href: '/catalogo?linea=arista',
      fillContainer: true,
    },
  ],
}

// ─── ORIGEN ──────────────────────────────────────────────────────────────────

export const origenLine: ShowcaseLine = {
  id: 'origen',
  name: 'Línea Origen',
  shortName: 'Origen',
  products: [
    {
      id: 'blanco',
      shortName: 'Blanco',
      name: 'Origen Blanco',
      tagline: 'Pureza del salar',
      description:
        'Algodón premium en blanco puro. La luz reflejada en el salar al amanecer.',
      image: '/images/Origen Blanco sin fondo.png',
      imageAlt: 'Remera Origen blanca',
      // Warm dark stone so the white shirt pops without being washed out.
      gradient:
        'radial-gradient(ellipse at 60% 40%, #4a4540 0%, #25211c 50%, #0c0a07 100%)',
      accentColor: '#d9cdb0',
      price: '$25.000',
      ctaText: 'Comprar',
      href: '/catalogo/origen-blanco',
      // Slightly smaller than Arista (480 → 420) so the tightly-framed figure
      // doesn't clip into the top bar when centered.
      activeMaxWidth: 'max-w-[420px]',
    },
    {
      id: 'negro',
      shortName: 'Negro',
      name: 'Origen Negro',
      tagline: 'La noche del altiplano',
      description:
        'Algodón premium en negro absoluto. La oscuridad del cielo sobre la cordillera.',
      image: '/images/Origen negro 1.png',
      imageAlt: 'Remera Origen negra',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #2e2a26 0%, #161312 50%, #050402 100%)',
      accentColor: '#d9c9a8',
      price: '$25.000',
      ctaText: 'Comprar',
      href: '/catalogo/origen-negro',
      activeMaxWidth: 'max-w-[420px]',
    },
    {
      id: 'oxido',
      shortName: 'Óxido',
      name: 'Origen Óxido',
      tagline: 'El óxido del paisaje',
      description:
        'Algodón premium en óxido cálido. Los tonos del valle al atardecer.',
      image: '/images/Origen Oxido sin fondo.png',
      imageAlt: 'Remera Origen óxido',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #7a3f1a 0%, #401d08 45%, #1a0a02 100%)',
      accentColor: '#e8a37e',
      price: '$25.000',
      ctaText: 'Comprar',
      href: '/catalogo/origen-oxido',
      activeMaxWidth: 'max-w-[420px]',
    },
    {
      id: 'linea',
      shortName: 'Línea',
      name: 'Toda la línea',
      tagline: 'Más colores te esperan',
      description:
        'Conocé toda la paleta de la Línea Origen: oliva, papaya, camel, petróleo, baton rouge y más en el catálogo.',
      image: '/images/Origen Baton Rouge.png',
      imageAlt: 'Remeras Origen Baton Rouge',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #6e2840 0%, #3a1422 45%, #1a060f 100%)',
      accentColor: '#e8b8c5',
      ctaText: 'Ver catálogo completo',
      href: '/catalogo?linea=origen',
      // No fillContainer: object-contain shows the duo photo fully (not cropped).
      // Position inherits the default bottom-anchored baseline shared by every product.
    },
  ],
}

// ─── PISSIS ──────────────────────────────────────────────────────────────────

export const pissisLine: ShowcaseLine = {
  id: 'pissis',
  name: 'Línea Pissis',
  shortName: 'Pissis',
  products: [
    {
      id: 'amarillo',
      shortName: 'Amarillo',
      name: 'Pissis Amarillo',
      tagline: 'El sol del altiplano',
      description:
        'Algodón premium en amarillo cálido. Como el sol del valle al mediodía sobre la piedra volcánica.',
      image: '/images/Pissis amarillo 1.png',
      imageAlt: 'Remera Pissis amarilla',
      // Warm deep gold so the yellow shirt pops with editorial richness.
      gradient:
        'radial-gradient(ellipse at 60% 40%, #3a2e1a 0%, #1a140c 45%, #060403 100%)',
      accentColor: '#f4d975',
      price: '$28.000',
      ctaText: 'Comprar',
      href: '/catalogo/pissis-amarillo',
      activeMaxWidth: 'max-w-[420px]',
    },
    {
      id: 'marino',
      shortName: 'Marino',
      name: 'Pissis Marino',
      tagline: 'Cielo profundo',
      description:
        'Algodón premium en azul marino. La profundidad del cielo nocturno sobre la cordillera.',
      image: '/images/Azul Marino Pissis.png',
      imageAlt: 'Remera Pissis azul marino',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #2e3a5c 0%, #161e36 45%, #060a18 100%)',
      accentColor: '#9eb4d9',
      price: '$28.000',
      ctaText: 'Comprar',
      href: '/catalogo/pissis-marino',
      activeMaxWidth: 'max-w-[420px]',
    },
    {
      id: 'negro',
      shortName: 'Negro',
      name: 'Pissis Negro',
      tagline: 'Sombra del Pissis',
      description:
        'Algodón premium en negro firme. La sombra de la cumbre al caer la tarde.',
      image: '/images/Pissis negro 2.png',
      imageAlt: 'Remera Pissis negra',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #2a2c2e 0%, #131517 45%, #050608 100%)',
      accentColor: '#c8cdd4',
      price: '$28.000',
      ctaText: 'Comprar',
      href: '/catalogo/pissis-negro',
      activeMaxWidth: 'max-w-[420px]',
    },
    {
      id: 'linea',
      shortName: 'Línea',
      name: 'Toda la línea',
      tagline: 'Más colores te esperan',
      description:
        'Conocé toda la paleta de la Línea Pissis: francia, gris topo, rojo y más en el catálogo.',
      image: '/images/Pissis Rojo.png',
      imageAlt: 'Remeras Pissis rojas',
      gradient:
        'radial-gradient(ellipse at 60% 40%, #7a2620 0%, #401010 45%, #1a0606 100%)',
      accentColor: '#e8a8a0',
      ctaText: 'Ver catálogo completo',
      href: '/catalogo?linea=pissis',
      // Position inherits the default bottom-anchored baseline shared by every product.
      activeMaxWidth: 'max-w-[580px]',
    },
  ],
}

export const SHOWCASE_LINES: ShowcaseLine[] = [aristaLine, origenLine, pissisLine]
