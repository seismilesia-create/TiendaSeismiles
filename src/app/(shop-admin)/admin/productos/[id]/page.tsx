import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminProduct } from '@/features/shop/services/admin-products'
import { ProductForm } from '@/features/shop/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Editar Producto | Admin Seismiles' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getAdminProduct(id)

  if (!product) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/productos"
          className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
        >
          Productos
        </Link>
        <span className="text-volcanic-300">/</span>
        <span className="text-body-sm text-volcanic-900 font-medium">{product.nombre}</span>
      </div>

      <h1 className="font-heading text-2xl text-volcanic-900 mb-8">Editar producto</h1>

      <ProductForm
        product={{
          id: product.id,
          nombre: product.nombre,
          slug: product.slug,
          descripcion: product.descripcion,
          precio: product.precio,
          categoria: product.categoria,
          linea: product.linea,
          genero: product.genero,
          cuidado: product.cuidado,
          detalles: product.detalles,
          activo: product.activo,
          destacado: product.destacado,
          colores: product.colores.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            hex: c.hex,
            imagenes: (c.imagenes ?? []).map((img) => ({
              id: img.id,
              url: img.url,
              orden: img.orden,
            })),
          })),
          variantes: product.variantes.map((v) => ({
            color_id: v.color_id,
            talle: v.talle,
            stock: v.stock,
          })),
        }}
      />
    </div>
  )
}
