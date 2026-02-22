import Link from 'next/link'
import { shopConfig } from '../config'

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
  )
}

export function CategoriesGrid() {
  const { categories } = shopConfig

  return (
    <section className="py-20 lg:py-28 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-4">
            Nuestras lineas
          </p>
          <h2 className="font-heading text-display-md lg:text-display-lg text-volcanic-900">
            Explora la coleccion
          </h2>
        </div>

        {/* Grid - 2x2 on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/tienda/${category.slug}`}
              className="group relative aspect-[4/3] sm:aspect-[3/2] rounded-2xl overflow-hidden"
            >
              {/* Gradient background (placeholder for product photos) */}
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${category.gradientFrom} 0%, ${category.gradientTo} 100%)`,
                }}
              />

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  }}
                />
              </div>

              {/* Dark overlay for text readability on hover */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6 lg:p-8">
                {/* Top - Number badge */}
                <div className="flex justify-between items-start">
                  <span className="text-white/40 text-body-xs font-mono">
                    0{index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <ArrowUpRightIcon className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* Bottom - Title & subtitle */}
                <div>
                  <h3 className="font-heading text-display-sm lg:text-display-md text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-body-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    {category.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
