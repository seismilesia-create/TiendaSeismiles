import Image from 'next/image'
import Link from 'next/link'

const AUDIENCES = [
  {
    label: 'Hombres',
    href: '/tienda/hombres',
    image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=500&fit=crop&crop=top',
  },
  {
    label: 'Mujeres',
    href: '/tienda/mujeres',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&crop=top',
  },
  {
    label: 'Niños',
    href: '/tienda/ninos',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop&crop=top',
  },
]

export function AudienceSection() {
  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl lg:text-3xl text-volcanic-900 text-center mb-10">
          Para quien estas comprando?
        </h2>

        <div className="flex items-center justify-center gap-10 sm:gap-14 lg:gap-24">
          {AUDIENCES.map((audience) => (
            <Link
              key={audience.label}
              href={audience.href}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden ring-4 ring-sand-200 group-hover:ring-terra-400 transition-all duration-300 group-hover:scale-105 shadow-lg">
                <Image
                  src={audience.image}
                  alt={audience.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
                />
              </div>
              <span className="text-body-sm sm:text-body-md font-semibold text-volcanic-800 group-hover:text-terra-500 transition-colors uppercase tracking-wide">
                {audience.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
