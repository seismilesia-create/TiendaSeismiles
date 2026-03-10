import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { PendingOrderChecker } from '@/features/shop/components/cart/PendingOrderChecker'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function CarritoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [productLines, supabase] = await Promise.all([
    getProductLines(),
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
      <PendingOrderChecker />
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer productLines={productLines} />
    </>
  )
}
