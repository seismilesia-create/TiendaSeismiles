import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/customer'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { PendingOrderChecker } from '@/features/shop/components/cart/PendingOrderChecker'
import { getProductLines } from '@/features/shop/services/product-lines'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ShopCustomerLayout({ children }: { children: React.ReactNode }) {
  const [authUser, productLines] = await Promise.all([
    requireAuth(),
    getProductLines(),
  ])

  if (!authUser) redirect('/login')

  const navUser = { email: authUser.email, role: authUser.role }

  return (
    <>
      <PendingOrderChecker />
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer productLines={productLines} />
    </>
  )
}
