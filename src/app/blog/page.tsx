import type { Metadata } from 'next'
import { shopConfig } from '@/features/shop/config'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { BlogCard } from '@/features/shop/components/BlogCard'
import { getProductLines } from '@/features/shop/services/product-lines'
import { getPublishedPosts, getPostsByCategory } from '@/features/shop/services/blog'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { BlogCategoryFilter } from './BlogCategoryFilter'

export const metadata: Metadata = {
  title: 'Blog | SEISMILES',
  description: 'Articulos sobre cuidados de tela, materiales premium, estilo y la historia detrás de SEISMILES. Aprende a cuidar tu ropa y conoce nuestros procesos.',
  alternates: { canonical: '/blog' },
}

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams
  const { blog } = shopConfig
  const [productLines, supabase, posts] = await Promise.all([
    getProductLines(),
    createClient(),
    category ? getPostsByCategory(category) : getPublishedPosts(),
  ])
  const { data: { user } } = await supabase.auth.getUser()
  let navUser: { email: string; role: string } | null = null
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    navUser = { email: user.email ?? '', role: profile?.role ?? 'customer' }
  }

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />

      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 bg-background overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-volcanic-900/5 mb-8">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-terra-500">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
              </svg>
              <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
                Blog
              </span>
            </div>

            <h1 className="font-heading text-display-lg sm:text-display-xl text-volcanic-900 mb-6">
              {blog.heading}
            </h1>
            <p className="text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
              {blog.subtitle}
            </p>
          </div>
        </section>

        {/* Blog content */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-body-lg text-volcanic-500">
                  Pronto publicaremos nuestros primeros artículos. Volve a visitarnos.
                </p>
              </div>
            ) : (
              <>
                <BlogCategoryFilter categories={blog.categories} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
