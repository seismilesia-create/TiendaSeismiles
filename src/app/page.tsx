import {
  MarqueeBanner, Navbar, HeroSection, CategoriesGrid,
  OriginSection, QualitySection, BenefitsBar,
  InstagramSection, NewsletterSection, Footer,
} from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'

export default async function HomePage() {
  const productLines = await getProductLines()

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} />

      <main>
        <HeroSection />
        <CategoriesGrid />
        <OriginSection />
        <QualitySection />
        <BenefitsBar />
        <InstagramSection />
        <NewsletterSection />
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
