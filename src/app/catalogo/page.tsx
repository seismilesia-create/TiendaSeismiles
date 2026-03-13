import { getCatalogProducts, getUserFavoriteIds } from '@/features/shop/services/product-lines'
import { createClient } from '@/lib/supabase/server'
import { CatalogClient } from './CatalogClient'

export default async function CatalogoPage() {
  const [products, supabase] = await Promise.all([
    getCatalogProducts(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  const favoriteIds = user ? await getUserFavoriteIds(user.id) : new Set<string>()

  return (
    <CatalogClient
      products={products}
      favoriteProductIds={Array.from(favoriteIds)}
      isLoggedIn={!!user}
    />
  )
}
