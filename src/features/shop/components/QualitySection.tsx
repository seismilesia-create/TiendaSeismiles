import Image from 'next/image'
import { shopConfig } from '../config'

/** Icono de fibras de algodón */
function CottonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="16" cy="10" r="3" />
      <circle cx="11" cy="14" r="2.5" />
      <circle cx="21" cy="14" r="2.5" />
      <circle cx="13" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M16 21v6" />
      <path d="M14 25l2 2 2-2" />
    </svg>
  )
}

/** Icono de tejido pique */
function WeaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8h20" />
      <path d="M6 14h20" />
      <path d="M6 20h20" />
      <path d="M6 26h20" />
      <path d="M10 6v22" />
      <path d="M16 6v22" />
      <path d="M22 6v22" />
      <rect x="10" y="8" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.15" />
      <rect x="16" y="14" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.15" />
      <rect x="10" y="20" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.15" />
    </svg>
  )
}

/** Icono de costura premium */
function StitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 4l4 8-4 8 4 8" />
      <path d="M24 4l-4 8 4 8-4 8" />
      <path d="M12 8h8" />
      <path d="M12 16h8" />
      <path d="M12 24h8" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="24" r="1" fill="currentColor" />
    </svg>
  )
}

const featureIcons = [CottonIcon, WeaveIcon, StitchIcon]

export function QualitySection() {
  const { quality } = shopConfig

  return (
    <section className="relative py-20 lg:py-28 bg-volcanic-900 overflow-hidden">
      {/* Warm glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-terra-500/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-16 lg:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold">
              {quality.label}
            </span>
          </div>

          <h2 className="font-heading text-display-md lg:text-display-lg text-white mb-6">
            {quality.heading}
          </h2>

          <p className="text-body-lg text-white/60 leading-relaxed">
            No hablamos de calidad: la demostramos en cada fibra, cada trama, cada costura.
          </p>
        </div>

        {/* Two-column layout: image + features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Product image */}
          <div className="relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src={quality.imageUrl}
                alt="Detalle de calidad SEISMILES"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-volcanic-900/40 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-2 h-2 rounded-full bg-terra-500" />
              <span className="text-body-xs text-white/80 uppercase tracking-widest font-semibold">
                Control de calidad en cada prenda
              </span>
            </div>
          </div>

          {/* Right - Features stacked */}
          <div className="flex flex-col gap-6">
            {quality.features.map((feature, index) => {
              const Icon = featureIcons[index]
              return (
                <div
                  key={feature.number}
                  className="group relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-500"
                >
                  <div className="flex gap-5">
                    {/* Icon */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-terra-500/10 flex items-center justify-center group-hover:bg-terra-500/15 transition-colors duration-500">
                      <Icon className="w-6 h-6 text-terra-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-body-xs text-terra-500/60 font-mono">
                          {feature.number}
                        </span>
                        <h3 className="font-heading text-lg text-white">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-body-sm text-white/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-20 lg:mt-28 flex items-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-body-xs text-white/20 uppercase tracking-widest font-semibold whitespace-nowrap">
            Forjada a 6000 metros
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </section>
  )
}
