import { shopConfig } from '../config'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
  )
}

export function InstagramSection() {
  const { instagram } = shopConfig

  return (
    <section className="py-20 lg:py-28 bg-white border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <InstagramIcon className="w-5 h-5 text-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold">
              Instagram
            </span>
          </div>
          <h2 className="font-heading text-display-md lg:text-display-lg text-volcanic-900 mb-4">
            {instagram.heading}
          </h2>
          <p className="text-body-md text-volcanic-500 max-w-md mx-auto">
            {instagram.subtitle}
          </p>
        </div>

        {/* Photo grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-12">
          {instagram.photos.map((photo, index) => (
            <a
              key={index}
              href={shopConfig.brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden"
            >
              {/* Gradient placeholder (urban + andean vibe) */}
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  background: `linear-gradient(${135 + index * 30}deg, ${photo.gradientFrom} 0%, ${photo.gradientTo} 100%)`,
                }}
              />

              {/* Subtle texture */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
              }} />

              {/* Content placeholder - simulated lifestyle photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center opacity-30 group-hover:opacity-40 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center mx-auto mb-3">
                    <InstagramIcon className="w-7 h-7 text-white/60" />
                  </div>
                  <p className="text-body-xs text-white/50 max-w-[140px]">{photo.alt}</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-volcanic-900/0 group-hover:bg-volcanic-900/30 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-90">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ArrowUpRightIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={instagram.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl border border-volcanic-900/10 bg-white hover:bg-volcanic-900 text-volcanic-900 hover:text-white text-body-md font-semibold transition-all duration-300 hover:shadow-warm-lg"
          >
            <InstagramIcon className="w-5 h-5" />
            {instagram.cta.text}
            <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  )
}
