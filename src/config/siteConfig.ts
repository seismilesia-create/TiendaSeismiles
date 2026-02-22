// ============================================================
// SITE CONFIG - Seismiles Textil (Minimal)
// ============================================================
// Solo lo necesario para api/contact y layouts (auth)/(main).
// La config completa de la tienda esta en src/features/shop/config.ts
// ============================================================

export interface SiteConfig {
  firmName: string
  contact: {
    phone: string
    email: string
    whatsappNumber?: string
  }
}

export const siteConfig: SiteConfig = {
  firmName: 'Seismiles Textil',
  contact: {
    phone: '+5493834000000',
    email: 'contacto@seismilestextil.com',
    whatsappNumber: '+5493834000000',
  },
}
