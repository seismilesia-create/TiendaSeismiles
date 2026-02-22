import Link from 'next/link'
import Image from 'next/image'
import { shopConfig } from '../config'
import type { ProductLineRow } from '../services/product-lines'

interface FooterProps {
  productLines: ProductLineRow[]
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  )
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
  )
}

export function Footer({ productLines }: FooterProps) {
  const { brand, footer } = shopConfig

  return (
    <footer className="bg-volcanic-900 text-volcanic-300 relative overflow-hidden">
      {/* Main footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Columna 1: Marca */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/images/logo-seismiles.png"
                alt="Seismiles Textil"
                width={120}
                height={52}
                className="h-12 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="text-body-sm text-volcanic-400 leading-relaxed mb-5">
              {footer.tagline}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-volcanic-800 hover:bg-terra-500 flex items-center justify-center transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-volcanic-300" />
              </a>
              <a
                href={brand.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-volcanic-800 hover:bg-terra-500 flex items-center justify-center transition-colors"
              >
                <WhatsappIcon className="w-4 h-4 text-volcanic-300" />
              </a>
            </div>
          </div>

          {/* Columna 2: Tienda - DINAMICA desde Supabase */}
          <div>
            <h3 className="font-heading text-white text-body-md mb-4">Tienda</h3>
            <ul className="space-y-2.5">
              {productLines.map((line) => (
                <li key={line.id}>
                  <Link
                    href={`/tienda/${line.slug}`}
                    className="text-body-sm text-volcanic-400 hover:text-terra-400 transition-colors"
                  >
                    {line.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tienda"
                  className="text-body-sm text-volcanic-400 hover:text-terra-400 transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Empresas */}
          <div>
            <h3 className="font-heading text-white text-body-md mb-4">Empresas</h3>
            <ul className="space-y-2.5">
              {footer.columns[1].links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-volcanic-400 hover:text-terra-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Ayuda */}
          <div>
            <h3 className="font-heading text-white text-body-md mb-4">Ayuda</h3>
            <ul className="space-y-2.5">
              {footer.columns[2].links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-volcanic-400 hover:text-terra-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-volcanic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body-xs text-volcanic-500">
              {footer.copyright}
            </p>
            <div className="flex items-center gap-3">
              {footer.paymentMethods.map((method) => (
                <span
                  key={method.slug}
                  className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-volcanic-400 bg-volcanic-800 rounded"
                >
                  {method.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Watermark gigante */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none" aria-hidden="true">
        <span className="font-heading text-[8rem] sm:text-[12rem] lg:text-[16rem] leading-none text-volcanic-800/30 whitespace-nowrap">
          SEISMILES
        </span>
      </div>
    </footer>
  )
}
