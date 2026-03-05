import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import { AdminSidebar } from '@/features/shop/components/admin/AdminSidebar'

export default async function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/login')

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminSidebar />

      {/* Main content - offset for sidebar on desktop, top bar on mobile */}
      <main className="lg:pl-56 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
