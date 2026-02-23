import Link from 'next/link'

const AUDIENCES = [
  {
    label: 'Hombres',
    href: '/tienda/hombres',
    gradient: 'from-volcanic-700 to-volcanic-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white/80">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Mujeres',
    href: '/tienda/mujeres',
    gradient: 'from-terra-400 to-terra-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white/80">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Ninos',
    href: '/tienda/ninos',
    gradient: 'from-volcanic-400 to-volcanic-300',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white/80">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M18 21v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 6 19.5V21" />
      </svg>
    ),
  },
]

export function AudienceSection() {
  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl lg:text-3xl text-volcanic-900 text-center mb-10">
          Para quien estas comprando?
        </h2>

        <div className="flex items-center justify-center gap-10 sm:gap-16 lg:gap-24">
          {AUDIENCES.map((audience) => (
            <Link
              key={audience.label}
              href={audience.href}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${audience.gradient} flex items-center justify-center ring-4 ring-transparent group-hover:ring-terra-300 transition-all duration-300 group-hover:scale-105`}>
                {audience.icon}
              </div>
              <span className="text-body-sm sm:text-body-md font-medium text-volcanic-700 group-hover:text-terra-500 transition-colors">
                {audience.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
