import { shopConfig } from '../config'

/** Icono de fibras de algodon - suavidad, naturaleza */
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

/** Icono de tejido pique - trama, estructura, textura */
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

/** Icono de costura premium - precision, artesania */
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

/** Copy sensorial extendido para cada feature */
const sensorialCopy = [
  'Pasas la mano y sentis la diferencia. Fibras largas seleccionadas que respiran con vos, que se suavizan con cada lavado. No es algodon comun: es el punto de partida de algo superior.',
  'Cerrá los ojos y tocá un piqué nuestro. Esa trama elevada, esa estructura que no cede, ese peso justo que dice "esto es otra cosa". El 80% del mercado no conoce esta textura. Vos sí.',
  'Cada costura doble reforzada, cada tintura de alta fijación, cada terminación invisible. Nuestros Buzos Canguro no son solo abrigo: son la declaración de que lo premium se siente en cada detalle.',
]

export function QualitySection() {
  const { quality } = shopConfig

  return (
    <section className="relative py-24 lg:py-36 bg-volcanic-900 overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Warm glow from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-terra-500/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-20 lg:mb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold">
              {quality.label}
            </span>
          </div>

          <h2 className="font-heading text-display-md lg:text-display-lg text-white mb-6">
            {quality.heading}
          </h2>

          <p className="text-body-lg text-white/40 leading-relaxed">
            No hablamos de calidad: la demostramos en cada fibra, cada trama, cada costura.
          </p>
        </div>

        {/* Features grid - 3 columns with generous spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {quality.features.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <div
                key={feature.number}
                className="group relative"
              >
                {/* Card */}
                <div className="relative p-8 lg:p-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-500">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-display-sm font-heading text-terra-500/60">
                      {feature.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-terra-500/10 flex items-center justify-center group-hover:bg-terra-500/15 transition-colors duration-500">
                      <Icon className="w-7 h-7 text-terra-400" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-display-sm text-white mb-4">
                    {feature.title}
                  </h3>

                  {/* Sensorial description */}
                  <p className="text-body-md text-white/50 leading-relaxed mb-6">
                    {sensorialCopy[index]}
                  </p>

                  {/* Subtle divider */}
                  <div className="w-12 h-px bg-terra-500/20 group-hover:w-20 transition-all duration-500" />
                </div>
              </div>
            )
          })}
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
