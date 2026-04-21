import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/giftcards`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/nosotros`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic product pages
  const service = createServiceClient()
  const { data: products } = await service
    .from('productos')
    .select('slug, updated_at')
    .eq('activo', true)

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${siteUrl}/catalogo/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...productPages]
}
