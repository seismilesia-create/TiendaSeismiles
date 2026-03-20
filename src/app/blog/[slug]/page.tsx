import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { shopConfig } from '@/features/shop/config'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { BlogContent } from '@/features/shop/components/BlogContent'
import { getProductLines } from '@/features/shop/services/product-lines'
import { getPublishedPost } from '@/features/shop/services/blog'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const CATEGORY_LABELS: Record<string, string> = {
  cuidados: 'Cuidados',
  materiales: 'Materiales',
  estilo: 'Estilo',
  marca: 'Marca',
  general: 'General',
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) return { title: 'Articulo no encontrado' }

  return {
    title: `${post.title} | Blog Seismiles`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      ...(post.cover_image_url && { images: [{ url: post.cover_image_url }] }),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [productLines, supabase, post] = await Promise.all([
    getProductLines(),
    createClient(),
    getPublishedPost(slug),
  ])

  if (!post) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let navUser: { email: string; role: string } | null = null
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    navUser = { email: user.email ?? '', role: profile?.role ?? 'customer' }
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />

      <main>
        <article>
          {/* Hero / Header */}
          <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 bg-background overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors mb-8"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
                </svg>
                Volver al blog
              </Link>

              {/* Category badge */}
              <div className="mb-4">
                <span className="inline-flex px-3 py-1 rounded-full bg-terra-500/10 text-terra-600 text-body-xs font-semibold uppercase tracking-wide">
                  {CATEGORY_LABELS[post.category] || post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-display-md sm:text-display-lg text-volcanic-900 mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-body-sm text-volcanic-400">
                <span className="font-medium text-volcanic-600">{post.author_name}</span>
                <span className="w-1 h-1 rounded-full bg-volcanic-300" />
                <time>{formattedDate}</time>
              </div>
            </div>
          </section>

          {/* Cover image */}
          {post.cover_image_url && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-12">
              <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                  priority
                />
              </div>
            </section>
          )}

          {/* Content */}
          <section className="py-8 lg:py-12 bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <BlogContent content={post.content} />

              {/* Bottom nav */}
              <div className="mt-16 pt-8 border-t border-sand-200">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-body-sm font-semibold text-terra-500 hover:text-terra-600 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
                  </svg>
                  Ver todos los articulos
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
