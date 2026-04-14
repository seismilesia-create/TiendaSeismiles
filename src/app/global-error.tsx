'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FAF8F5',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <p
              style={{
                fontSize: '5rem',
                fontWeight: 800,
                color: '#2C2420',
                margin: '0 0 0.5rem',
                lineHeight: 1,
              }}
            >
              500
            </p>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#2C2420',
                margin: '0 0 0.75rem',
              }}
            >
              Algo salió mal
            </h1>
            <p style={{ color: '#6B5B45', margin: '0 0 2rem', lineHeight: 1.6 }}>
              Ocurrió un error inesperado. Intentá recargar la página.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#2C2420',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
