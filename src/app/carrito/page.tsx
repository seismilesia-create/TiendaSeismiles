import type { Metadata } from 'next'
import { getCatalogProducts } from '@/features/shop/services/product-lines'
import { createClient } from '@/lib/supabase/server'
import { CartContent } from '@/features/shop/components/cart/CartContent'

export const metadata: Metadata = {
  title: 'Mi Carrito',
}

export default async function CarritoPage() {
  const [allProducts, supabase] = await Promise.all([
    getCatalogProducts(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  return <CartContent allProducts={allProducts} userId={user?.id ?? null} />
}
