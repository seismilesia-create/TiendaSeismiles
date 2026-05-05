'use client'

import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { shopConfig } from '../config'

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
  )
}

interface CategoriesGridProps {
  defaultTab?: string
}

/** Map productTypeTabs id → catalog `?type=` query value (DB categoría). */
const TAB_ID_TO_CATALOG_TYPE: Record<string, string> = {
  'remeras-lisas': 'remeras-lisas',
  'remeras-estampadas': 'estampadas',
  buzos: 'buzos',
}

export function CategoriesGrid({ defaultTab }: CategoriesGridProps) {
  const { productTypeTabs } = shopConfig
  const initialTab = defaultTab && productTypeTabs.some(t => t.id === defaultTab)
    ? defaultTab
    : productTypeTabs[0].id
  const [activeTab, setActiveTab] = useState(initialTab)

  const currentTab = productTypeTabs.find((t) => t.id === activeTab) ?? productTypeTabs[0]

  // Animated pill indicator under the active tab
  const tabsRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    if (!tabsRef.current) return
    const activeBtn = tabsRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`)
    if (activeBtn) {
      setIndicator({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        ready: true,
      })
    }
  }, [activeTab])

  // Recalculate on resize
  useEffect(() => {
    function handleResize() {
      if (!tabsRef.current) return
      const activeBtn = tabsRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`)
      if (activeBtn) {
        setIndicator((prev) => ({
          ...prev,
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        }))
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab])

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-terra-500" />
            <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold">
              Nuestras líneas
            </span>
            <div className="w-8 h-px bg-terra-500" />
          </div>
          <h2 className="font-heading text-display-md lg:text-display-lg text-volcanic-900">
            Explora la colección
          </h2>
        </div>

        {/* Tab selector with sliding indicator */}
        <div className="flex justify-center mb-10 lg:mb-14">
          <div
            ref={tabsRef}
            className="relative inline-flex items-center gap-1 bg-white border border-sand-200 rounded-full p-1.5 shadow-sm"
          >
            {/* Sliding pill indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-terra-500 rounded-full shadow-lg shadow-terra-500/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.ready ? 1 : 0,
              }}
            />
            {productTypeTabs.map((tab) => (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 px-4 sm:px-6 py-2.5 rounded-full text-body-sm font-medium transition-colors duration-300 whitespace-nowrap inline-flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-volcanic-600 hover:text-terra-500'
                }`}
              >
                {tab.label}
                {tab.comingSoon && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white/25 text-white'
                        : 'bg-terra-100 text-terra-600'
                    }`}
                  >
                    Pronto
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Coming soon panel — replaces the grid for tabs flagged as not yet available */}
        {currentTab.comingSoon ? (
          <div key={activeTab} className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="relative aspect-[16/10] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-gradient-to-br from-volcanic-900 via-volcanic-800 to-terra-900">
              {/* Subtle topo pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-terra-500" />

              <div className="relative h-full flex flex-col items-center justify-center text-center px-8 py-10 lg:px-12">
                <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 bg-terra-500/20 border border-terra-400/30 backdrop-blur-sm rounded-full text-body-xs font-semibold uppercase tracking-widest text-terra-200">
                  <span className="w-1.5 h-1.5 bg-terra-400 rounded-full animate-pulse" />
                  Próximamente
                </span>
                <h3 className="font-heading text-display-md lg:text-display-lg text-white mb-3">
                  {currentTab.label}
                </h3>
                {currentTab.comingSoonMessage && (
                  <p className="text-body-sm lg:text-body-md text-white/70 max-w-md">
                    {currentTab.comingSoonMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
        /* Grid — re-mounted on tab change to trigger entrance animation */
        <div
          key={activeTab}
          className={`flex flex-wrap justify-center gap-4 lg:gap-6 ${
            currentTab.categories.length === 1 ? 'max-w-lg mx-auto' : ''
          }`}
        >
          {currentTab.categories.map((category, index) => {
            const catalogType = TAB_ID_TO_CATALOG_TYPE[currentTab.id] ?? currentTab.id
            const lineaSlug = category.slug.replace(/^linea-/, '')
            return (
            <Link
              key={category.slug}
              href={`/catalogo?type=${catalogType}&linea=${lineaSlug}`}
              data-stagger={index}
              style={{ animationDelay: `${index * 80}ms` }}
              className={`group relative aspect-[4/3] sm:aspect-[3/2] rounded-2xl overflow-hidden animate-fade-in-up transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-warm-lg ${
                currentTab.categories.length === 1
                  ? 'w-full'
                  : 'w-full sm:w-[calc(50%_-_0.5rem)] lg:w-[calc(50%_-_0.75rem)]'
              }`}
            >
              {/* Background: image or gradient */}
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  style={{
                    background: `linear-gradient(135deg, ${category.gradientFrom} 0%, ${category.gradientTo} 100%)`,
                  }}
                />
              )}

              {/* Dark overlay — lighter so the image breathes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent group-hover:from-black/85 transition-all duration-500" />

              {/* Subtle terra accent line that grows on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-terra-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6 lg:p-8">
                <div className="flex justify-between items-start">
                  <span className="text-white/70 text-body-xs font-mono tracking-wider">
                    0{index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-terra-500 group-hover:border-terra-500 group-hover:scale-110 transition-all duration-500 ease-out">
                    <ArrowUpRightIcon className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-heading text-display-sm lg:text-display-md text-white mb-1 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                    {category.title}
                  </h3>
                  <p className="text-body-sm text-white/70 transition-colors duration-300 group-hover:text-white/90">
                    {category.subtitle}
                  </p>

                  {/* Hidden CTA that slides up on hover */}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-body-xs uppercase tracking-widest font-semibold text-terra-300 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    Explorar línea
                    <ArrowUpRightIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
            )
          })}
        </div>
        )}
      </div>
    </section>
  )
}
