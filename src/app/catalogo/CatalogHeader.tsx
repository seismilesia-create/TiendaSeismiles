import { MountainIcon } from '@/features/shop/components'

export function CatalogHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <section className="relative bg-volcanic-900 overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* Warm glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-terra-500/15 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-11 h-11 rounded-full bg-terra-500/20 flex items-center justify-center">
            <MountainIcon className="w-5 h-5 text-terra-400" />
          </div>
          <h1 className="font-heading text-display-sm sm:text-display-md text-white">
            {title}
          </h1>
          <p className="text-body-md text-volcanic-500 max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
