export function CatalogHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <section className="relative bg-gradient-to-b from-sand-100 via-sand-50 to-sand-50 overflow-hidden border-b border-sand-200">
      {/* Oversized brand watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display text-[5rem] sm:text-[8rem] lg:text-[12rem] leading-none text-volcanic-900/[0.04] tracking-[0.05em] uppercase whitespace-nowrap">
          SEISMILES
        </span>
      </div>

      {/* Soft warm glow on top */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-terra-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mountain silhouette at the bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-16 lg:h-24 text-volcanic-900/[0.06] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0,120 L0,85 L80,40 L160,70 L260,20 L360,60 L460,15 L560,55 L660,25 L760,5 L860,50 L960,30 L1060,55 L1160,20 L1200,45 L1200,120 Z" />
      </svg>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        {/* Badge with dividers */}
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-terra-500" />
          <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold">
            Colección completa
          </span>
          <div className="w-8 h-px bg-terra-500" />
        </div>

        {/* Headline — display font, much bigger */}
        <h1 className="font-display text-[2.75rem] sm:text-[4rem] lg:text-[5.5rem] leading-[0.95] tracking-[0.02em] uppercase text-volcanic-900 mb-6">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-body-md lg:text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
