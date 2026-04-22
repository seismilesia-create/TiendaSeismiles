'use server'

import { getProductBySlug, type ProductDetailFromDB } from '@/features/shop/services/product-lines'

/**
 * Fetch full product detail for a cross-sell candidate — invoked on-demand
 * when the shopper opens the inline picker inside the upsell banner. Kept
 * as a thin server action (not bundled into the initial cart payload) so
 * the picker data only loads for users who actually intend to accept.
 */
export async function getCrossSellCandidateDetail(slug: string): Promise<ProductDetailFromDB | null> {
  return getProductBySlug(slug)
}
