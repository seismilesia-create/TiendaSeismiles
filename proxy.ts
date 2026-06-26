import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { LAUNCH_ENABLED, LAUNCH_DATE } from '@/features/shop/config'

// ============================================================
// MODO LANZAMIENTO — Bloqueo total del sitio público
// ------------------------------------------------------------
// Mientras LAUNCH_ENABLED sea true y todavía no llegó LAUNCH_DATE,
// cualquier ruta pública se redirige a la home (pantalla "coming
// soon" con la cuenta regresiva). Quedan accesibles: las APIs/
// webhooks (pagos), el panel admin y el login (para gestionar
// antes del lanzamiento). Al llegar la fecha se desbloquea solo.
// Para apagarlo antes: LAUNCH_ENABLED = false en features/shop/config.ts.
// ============================================================

// Prefijos que NO se bloquean durante el modo lanzamiento.
const LAUNCH_ALLOWED_PREFIXES = ['/api', '/auth', '/admin', '/login', '/registro', '/update-password']

function isLaunchLocked(request: NextRequest) {
  if (!LAUNCH_ENABLED) return false
  if (Date.now() >= LAUNCH_DATE.getTime()) return false

  const { pathname } = request.nextUrl
  // La home muestra la pantalla de lanzamiento: nunca redirigir (evita loop).
  if (pathname === '/') return false
  if (LAUNCH_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return false
  }
  return true
}

export async function proxy(request: NextRequest) {
  if (isLaunchLocked(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
