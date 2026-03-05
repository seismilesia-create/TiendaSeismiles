import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function CatalogoLayout({
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
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />
      <main>{children}</main>
      <Footer productLines={productLines} />
    </>
  )
}
