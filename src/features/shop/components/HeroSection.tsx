import Link from 'next/link'
import { shopConfig } from '../config'
import { MountainIcon } from './MountainIcon'

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

export function HeroSection() {
  const { hero } = shopConfig

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden">
      {/* Background - Andean landscape gradient (placeholder until real photo) */}
      <div className="absolute inset-0">
        {/* Multi-layer gradient simulating an Andean volcanic landscape */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/30 via-[#C9956B]/20 to-sand-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-volcanic-900/10 via-transparent to-volcanic-900/5" />

        {/* Subtle mountain silhouette using CSS shapes */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%]">
          <svg viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M0 400V280L180 180L320 240L480 120L600 200L720 80L840 160L960 60L1080 140L1200 100L1320 180L1440 120V400H0Z" fill="url(#mountain-gradient)" opacity="0.08" />
            <path d="M0 400V320L200 260L400 300L560 200L700 280L860 160L1000 240L1140 180L1300 220L1440 200V400H0Z" fill="url(#mountain-gradient)" opacity="0.05" />
            <defs>
              <linearGradient id="mountain-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2C2420" />
                <stop offset="100%" stopColor="#5C5347" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom fade into sand background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAF8] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-volcanic-900/5 mb-8 animate-fade-in">
            <MountainIcon className="w-4 h-4 text-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
              {hero.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-display-lg sm:text-display-xl lg:text-[4.5rem] leading-[1.05] text-volcanic-900 mb-6 animate-fade-in-up">
            {hero.headline}
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg lg:text-xl text-volcanic-500 leading-relaxed max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            {hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              href={hero.ctaPrimary.href}
              className="group flex items-center gap-2 px-8 py-4 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-md font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg"
            >
              {hero.ctaPrimary.text}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href={hero.ctaSecondary.href}
              className="group flex items-center gap-2 px-8 py-4 bg-white/70 backdrop-blur-sm hover:bg-white text-volcanic-900 text-body-md font-semibold rounded-xl border border-volcanic-900/10 transition-all duration-300 hover:shadow-warm"
            >
              {hero.ctaSecondary.text}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative element - large mountain icon */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] hidden lg:block pointer-events-none">
        <MountainIcon className="w-[500px] h-[500px]" />
      </div>
    </section>
  )
}
