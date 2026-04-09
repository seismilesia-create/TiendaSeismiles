import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminProducts, getProductsForExport } from '@/features/shop/services/admin-products'
import { ProductsTable } from '@/features/shop/components/admin/ProductsTable'
import { CatalogBulkActions } from '@/features/shop/components/admin/CatalogBulkActions'

export const metadata: Metadata = { title: 'Productos | Admin SEISMILES' }

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  )
}

export default async function AdminProductsPage() {
  const [products, exportData] = await Promise.all([
    getAdminProducts(),
    getProductsForExport(),
  ])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-2xl text-volcanic-900">Productos</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            {products.length} producto{products.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      {/* Bulk actions */}
      <div className="mb-6">
        <CatalogBulkActions exportData={exportData} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-sand-200/60">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand-100 mb-4">
            <PlusIcon className="w-7 h-7 text-volcanic-500" />
          </div>
          <h2 className="font-heading text-lg text-volcanic-900 mb-2">Sin productos aun</h2>
          <p className="text-body-sm text-volcanic-500 mb-6">Crea tu primer producto para empezar a llenar la tienda.</p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terra-500 hover:bg-terra-600 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
          >
            <PlusIcon className="w-4 h-4" />
            Crear primer producto
          </Link>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  )
}
