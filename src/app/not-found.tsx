import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-volcanic-900 mb-2">404</p>
        <h1 className="text-2xl font-semibold text-volcanic-900 mb-3">
          Pagina no encontrada
        </h1>
        <p className="text-volcanic-500 mb-8 leading-relaxed">
          La pagina que buscas no existe o fue movida. Explora nuestro catalogo o volve al inicio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/catalogo"
            className="px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Ver catalogo
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-sand-300 hover:border-volcanic-400 text-volcanic-700 text-sm font-semibold rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
