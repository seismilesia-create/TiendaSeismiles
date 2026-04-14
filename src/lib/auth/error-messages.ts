/**
 * Supabase devuelve los errores de auth en ingles. Este helper los traduce a
 * mensajes en espanol apropiados para mostrar al usuario.
 *
 * Matcheo por substring (no por igualdad estricta) porque Supabase a veces
 * agrega contexto extra al final del mensaje (ej. "... after X seconds").
 * Si no matchea nada, devolvemos un mensaje generico — nunca filtramos el
 * string original al usuario para no exponer detalles internos.
 */

interface ErrorRule {
  match: RegExp
  message: string
}

const RULES: ErrorRule[] = [
  // Login
  {
    match: /invalid login credentials/i,
    message: 'Email o contrasena incorrectos.',
  },
  {
    match: /email not confirmed/i,
    message: 'Tenes que confirmar tu email antes de iniciar sesion. Revisa tu bandeja.',
  },

  // Signup
  {
    match: /user already registered|already registered|already been registered/i,
    message: 'Ya existe una cuenta con ese email. Inicia sesion o recupera tu contrasena.',
  },
  {
    match: /signup (is )?disabled/i,
    message: 'El registro esta temporalmente deshabilitado. Intenta mas tarde.',
  },
  {
    match: /signup requires a valid password/i,
    message: 'La contrasena es requerida.',
  },

  // Password validation
  {
    match: /password should be at least (\d+) characters/i,
    message: 'La contrasena debe tener al menos 6 caracteres.',
  },
  {
    match: /new password should be different from the old password/i,
    message: 'La contrasena nueva debe ser distinta a la anterior.',
  },
  {
    match: /weak password/i,
    message: 'La contrasena es demasiado debil. Usa una combinacion mas larga y variada.',
  },

  // Email validation
  {
    match: /unable to validate email address|invalid (email )?format|invalid email/i,
    message: 'El email no tiene un formato valido.',
  },

  // Rate limiting
  {
    match: /email rate limit exceeded|rate limit/i,
    message: 'Demasiados intentos. Espera unos minutos antes de reintentar.',
  },
  {
    match: /for security purposes, you can only request this once every (\d+) seconds/i,
    message: 'Por seguridad, esperas unos segundos antes de volver a intentarlo.',
  },

  // Token / session
  {
    match: /token has expired|jwt expired|session (has )?expired/i,
    message: 'Tu sesion expiro. Inicia sesion de nuevo.',
  },
  {
    match: /invalid token|token not found/i,
    message: 'El enlace ya no es valido. Solicita uno nuevo.',
  },

  // User state
  {
    match: /user not found/i,
    message: 'No encontramos una cuenta con ese email.',
  },
]

const FALLBACK = 'Algo salio mal. Intenta de nuevo.'

/** Traduce un mensaje de error de Supabase Auth al espanol. */
export function translateAuthError(rawMessage: string | null | undefined): string {
  if (!rawMessage) return FALLBACK
  for (const rule of RULES) {
    if (rule.match.test(rawMessage)) return rule.message
  }
  // No matchamos nada conocido. Loggeamos el original para poder agregarlo
  // a la tabla si se repite, pero no lo exponemos al usuario.
  console.warn('[auth] untranslated error message:', rawMessage)
  return FALLBACK
}
