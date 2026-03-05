import { getCatalogProducts } from '@/features/shop/services/product-lines'
import { CatalogClient } from './CatalogClient'

export default async function CatalogoPage() {
  const products = await getCatalogProducts()
  return <CatalogClient products={products} />
}
