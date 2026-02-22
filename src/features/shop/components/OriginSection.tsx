import Link from 'next/link'
import { shopConfig } from '../config'
import { MountainIcon } from './MountainIcon'

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

export function OriginSection() {
  const { origin } = shopConfig

  return (
    <section id="origen" className="py-20 lg:py-32 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left - Visual / Stats */}
          <div className="relative">
            {/* Volcanic landscape card */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              {/* Gradient simulating volcanic landscape */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#8B7355] via-[#5C5347] to-volcanic-900" />

              {/* Atmospheric layers */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#D4A574]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-volcanic-900/60 to-transparent" />
              </div>

              {/* Mountain silhouette */}
              <svg viewBox="0 0 400 500" fill="none" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                <path d="M0 500V350L60 280L120 320L180 220L240 290L300 180L360 250L400 200V500H0Z" fill="url(#origin-mountain)" opacity="0.15" />
                <path d="M0 500V380L80 340L160 370L220 280L300 330L380 260L400 290V500H0Z" fill="url(#origin-mountain)" opacity="0.1" />
                <defs>
                  <linearGradient id="origin-mountain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2C2420" />
                    <stop offset="100%" stopColor="#1A1614" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Coordinates badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                <MapPinIcon className="w-4 h-4 text-terra-400" />
                <span className="text-body-xs text-white/80 font-mono tracking-wide">
                  {origin.coordinates}
                </span>
              </div>

              {/* Location label */}
              <div className="absolute top-6 right-6">
                <span className="text-body-xs text-white/50 uppercase tracking-widest font-semibold">
                  {origin.location}
                </span>
              </div>

              {/* Stats overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex gap-12">
                  {origin.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="font-heading text-display-lg text-white leading-none">
                        {stat.value}
                        <span className="text-terra-400 text-display-sm">m</span>
                      </p>
                      <p className="text-body-xs text-white/50 uppercase tracking-wider mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative mountain icon behind the card */}
            <div className="absolute -right-8 -top-8 opacity-[0.04] pointer-events-none hidden lg:block">
              <MountainIcon className="w-48 h-48" />
            </div>
          </div>

          {/* Right - Story */}
          <div className="lg:py-8">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-terra-500" />
              <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold">
                Nuestro origen
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-display-md lg:text-display-lg text-volcanic-900 mb-8">
              {origin.heading}
            </h2>

            {/* Paragraphs */}
            <div className="space-y-5 mb-10">
              {origin.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-body-md text-volcanic-500 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key phrase */}
            <blockquote className="relative pl-6 mb-10 border-l-2 border-terra-500/30">
              <p className="font-heading text-body-lg lg:text-xl text-volcanic-700 italic">
                &ldquo;Somos de la montana, para la ciudad.&rdquo;
              </p>
            </blockquote>

            {/* CTA */}
            <Link
              href={origin.cta.href}
              className="group inline-flex items-center gap-2 text-body-md font-semibold text-volcanic-900 hover:text-terra-500 transition-colors duration-300"
            >
              {origin.cta.text}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
