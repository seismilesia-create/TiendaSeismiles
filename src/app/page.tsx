import type { Metadata } from 'next'
import {
  MarqueeBanner, Navbar, HeroSection, FeaturedProducts,
  LookbookSection, CategoriesGrid, QualitySection, BenefitsBar,
  NewsletterSection, Footer, ScrollReveal, WelcomeDiscountModal,
} from '@/features/shop/components'
import { getAdminFeaturedProducts, getProductLines } from '@/features/shop/services/product-lines'
import { getSeason, getSeasonDefaultTab, getSeasonSubtitle } from '@/features/shop/utils/season'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const season = getSeason()
  const [productLines, featuredProducts, supabase] = await Promise.all([
    getProductLines(),
    getAdminFeaturedProducts(),
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
          <FeaturedProducts dbProducts={featuredProducts} seasonSubtitle={getSeasonSubtitle(season)} />
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
          <NewsletterSection />
        </ScrollReveal>
      </main>

      <Footer productLines={productLines} />
      <WelcomeDiscountModal />
    </>
  )
}
