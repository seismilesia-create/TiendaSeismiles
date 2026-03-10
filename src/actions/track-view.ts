'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function trackProductView(productId: string) {
  try {
    const supabase = createServiceClient()
    await supabase.rpc('increment_visualizaciones', { product_id: productId })
  } catch {
    // Silent fail — view tracking should never break the page
  }
}
