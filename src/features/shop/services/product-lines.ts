import { createClient } from '@supabase/supabase-js'

/** Client anonimo sin cookies - seguro para Server Components y build estatico */
function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface ProductLineRow {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  image_url: string | null
}

/** Fetch lineas de producto activas, ordenadas por display_order */
export async function getProductLines(): Promise<ProductLineRow[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('product_lines')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}
