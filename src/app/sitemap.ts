import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'
  const now = new Date()

  // Static pages — core commerce + content + legal.
  // Legal pages count as trust signals for e-commerce SEO, so they belong
  // in the sitemap even if they rarely change.
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalogo`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/giftcards`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/nosotros`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/cambios-y-devoluciones`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/arrepentimiento`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/terminos-y-condiciones`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/politica-de-privacidad`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const service = createServiceClient()

  // Dynamic product pages.
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

  // Dynamic blog posts (only published ones show on the public blog route).
  const { data: posts } = await service
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('is_published', true)

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.updated_at ?? p.published_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
