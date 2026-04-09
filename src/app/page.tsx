import {
  MarqueeBanner, Navbar, HeroSection, FeaturedProducts,
  LookbookSection, CategoriesGrid, QualitySection, BenefitsBar,
  InstagramSection, NewsletterSection, Footer, ScrollReveal,
} from '@/features/shop/components'
import { getProductLines, getSeasonalFeaturedProducts } from '@/features/shop/services/product-lines'
import { getSeason, getSeasonDefaultTab, getSeasonSubtitle } from '@/features/shop/utils/season'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const season = getSeason()
  const [productLines, seasonalProducts, supabase] = await Promise.all([
    getProductLines(),
    getSeasonalFeaturedProducts(season, 4),
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
        <ScrollReveal stagger>
          <FeaturedProducts dbProducts={seasonalProducts} seasonSubtitle={getSeasonSubtitle(season)} />
        </ScrollReveal>
        <ScrollReveal>
          <LookbookSection />
        </ScrollReveal>
        <ScrollReveal stagger>
          <CategoriesGrid defaultTab={getSeasonDefaultTab(season)} />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <QualitySection />
        </ScrollReveal>
        <ScrollReveal stagger>
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
