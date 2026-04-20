import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/customer'
import { getUserFavoriteProducts } from '@/features/shop/services/product-lines'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { ProfileNav } from '../ProfileNav'
import { signout } from '@/actions/auth'

export const metadata: Metadata = {
  title: 'Mis favoritos | SEISMILES',
  description: 'Tus productos favoritos en SEISMILES.',
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  )
}

export default async function FavoritosPage() {
  const user = await requireAuth()
  if (!user) redirect('/login')

  const products = await getUserFavoriteProducts(user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10">
        <div className="w-14 h-14 rounded-full bg-volcanic-900 text-white flex items-center justify-center text-xl font-semibold shrink-0">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {user.fullName && (
            <h1 className="font-heading text-display-sm text-volcanic-900">{user.fullName}</h1>
          )}
          <p className="text-body-md text-volcanic-500">{user.email}</p>
        </div>
        <form action={signout}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm text-volcanic-500 hover:text-red-500 hover:bg-red-50 border border-sand-200 transition-all">
            <LogoutIcon className="w-4 h-4" />
            Cerrar sesión
          </button>
        </form>
      </div>

      <ProfileNav active="favoritos" />

      {/* Favorites grid */}
      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={true}
              isLoggedIn={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            strokeLinecap="round" strokeLinejoin="round"
            className="w-12 h-12 text-volcanic-300 mb-4">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="font-heading text-display-xs text-volcanic-900">
            No tenés favoritos
          </p>
          <p className="mt-2 text-body-sm text-volcanic-500 text-center">
            Explorá nuestro catálogo y guardá los productos que más te gusten.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 px-6 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      )}
    </div>
  )
}
