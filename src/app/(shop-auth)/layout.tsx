import Image from 'next/image'
import Link from 'next/link'

export default function ShopAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo-seismiles.png"
              alt="Seismiles Textil"
              width={140}
              height={60}
              className="h-10 w-auto brightness-[0.35] contrast-[1.1]"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
