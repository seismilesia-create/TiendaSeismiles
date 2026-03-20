import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/unsub?status=invalid', request.url))
  }

  const service = createServiceClient()

  const { data: subscriber } = await service
    .from('newsletter_subscribers')
    .select('id, is_active')
    .eq('unsubscribe_token', token)
    .single()

  if (!subscriber) {
    return NextResponse.redirect(new URL('/newsletter/unsub?status=invalid', request.url))
  }

  if (!subscriber.is_active) {
    return NextResponse.redirect(new URL('/newsletter/unsub?status=already', request.url))
  }

  await service
    .from('newsletter_subscribers')
    .update({ is_active: false })
    .eq('id', subscriber.id)

  return NextResponse.redirect(new URL('/newsletter/unsub?status=success', request.url))
}
