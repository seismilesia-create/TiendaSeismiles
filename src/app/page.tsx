import {
  MarqueeBanner, Navbar, HeroSection, FeaturedProducts, AndesDivider,
  CategoriesGrid, QualitySection, BenefitsBar,
  InstagramSection, NewsletterSection, Footer, ScrollReveal,
} from '@/features/shop/components'
import { getProductLines, getMostViewedProducts } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const [productLines, mostViewed, supabase] = await Promise.all([
    getProductLines(),
    getMostViewedProducts(undefined, 4),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  let navUser: { email: string; role: string } | null = null
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    navUser = { email: user.email ?? '', role: profile?.role ?? 'customer' }
  }

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />

      <main>
        <HeroSection />
        <ScrollReveal>
          <FeaturedProducts dbProducts={mostViewed} />
        </ScrollReveal>
        <AndesDivider />
        <ScrollReveal>
          <CategoriesGrid />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <QualitySection />
        </ScrollReveal>
        <ScrollReveal>
          <BenefitsBar />
        </ScrollReveal>
        <ScrollReveal>
          <InstagramSection />
        </ScrollReveal>
        <ScrollReveal>
          <NewsletterSection />
        </ScrollReveal>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
