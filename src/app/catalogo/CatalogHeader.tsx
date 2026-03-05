import { MountainIcon } from '@/features/shop/components'

export function CatalogHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <section className="bg-sand-50 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-terra-500/10 flex items-center justify-center">
            <MountainIcon className="w-5 h-5 text-terra-500" />
          </div>
          <h1 className="font-heading text-display-sm sm:text-display-md text-volcanic-900">
            {title}
          </h1>
          <p className="text-body-md text-volcanic-600 max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
