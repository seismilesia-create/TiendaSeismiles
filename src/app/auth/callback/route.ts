import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    // Collect cookies during exchange so we can apply them to whichever response we return
    const cookieStore: { name: string; value: string; options: CookieOptions }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookieStore.push(...cookiesToSet)
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      let dest = next ?? '/'

      // Check role to redirect admins
      if (!next && data.user) {
        const serviceClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll() { return [] },
              setAll() {},
            },
          }
        )

        const { data: profile } = await serviceClient
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          dest = '/admin/productos'
        }
      }

      const response = NextResponse.redirect(`${origin}${dest}`)

      // Apply all session cookies to the final response
      for (const { name, value, options } of cookieStore) {
        response.cookies.set(name, value, options)
      }

      return response
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=No se pudo confirmar el email`)
}
