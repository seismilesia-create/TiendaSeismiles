import {
  MarqueeBanner, Navbar, HeroSection, FeaturedProducts, AndesDivider,
  CategoriesGrid, QualitySection, BenefitsBar,
  InstagramSection, NewsletterSection, Footer,
} from '@/features/shop/components'
import { getProductLines, getFeaturedProducts } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const [productLines, featuredProducts, supabase] = await Promise.all([
    getProductLines(),
    getFeaturedProducts(),
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
        <FeaturedProducts dbProducts={featuredProducts} />
        <AndesDivider />
        <CategoriesGrid />
        <QualitySection />
        <BenefitsBar />
        <InstagramSection />
        <NewsletterSection />
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
