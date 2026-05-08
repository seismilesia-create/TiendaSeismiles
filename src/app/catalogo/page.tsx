import type { Metadata } from 'next'
import { getCatalogProducts, getUserFavoriteIds } from '@/features/shop/services/product-lines'
import { createClient } from '@/lib/supabase/server'
import { CatalogClient } from './CatalogClient'

export const metadata: Metadata = {
  title: 'Catálogo | SEISMILES',
  description: 'Explora el catálogo completo de SEISMILES. Remeras, buzos canguro y más indumentaria premium nacida en Catamarca.',
  alternates: { canonical: '/catalogo' },
}

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
