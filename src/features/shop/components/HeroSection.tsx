import Image from 'next/image'
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
      {/* Background - Andean landscape photo */}
      <div className="absolute inset-0">
        <Image
          src="/images/Hero section.png"
          alt="Paisaje andino con volcanes y salares"
          fill
          priority
          className="object-cover"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20" />
        {/* Bottom fade into page background */}
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

    </section>
  )
}
