import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/auth/',
          '/api/',
          '/perfil/',
          // Transactional / session pages — no SEO value and some leak state.
          '/carrito',
          '/carrito/resultado',
          '/giftcards/resultado',
          '/newsletter/unsub',
          '/coming-soon',
          '/update-password',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
