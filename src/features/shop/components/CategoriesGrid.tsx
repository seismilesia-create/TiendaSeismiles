'use client'

import { useState } from 'react'
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

export function CategoriesGrid({ defaultTab }: CategoriesGridProps) {
  const { productTypeTabs } = shopConfig
  const initialTab = defaultTab && productTypeTabs.some(t => t.id === defaultTab)
    ? defaultTab
    : productTypeTabs[0].id
  const [activeTab, setActiveTab] = useState(initialTab)

  const currentTab = productTypeTabs.find((t) => t.id === activeTab) ?? productTypeTabs[0]

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-4">
            Nuestras lineas
          </p>
          <h2 className="font-heading text-display-md lg:text-display-lg text-volcanic-900">
            Explora la coleccion
          </h2>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 lg:mb-14">
          {productTypeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-body-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-terra-500 text-white shadow-lg shadow-terra-500/25'
                  : 'bg-white text-volcanic-600 hover:text-terra-500 hover:bg-sand-100 border border-sand-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={`flex flex-wrap justify-center gap-4 lg:gap-6 ${
          currentTab.categories.length === 1 ? 'max-w-lg mx-auto' : ''
        }`}>
          {currentTab.categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/tienda/${category.slug}`}
              data-stagger={index}
              className={`group relative aspect-[4/3] sm:aspect-[3/2] rounded-2xl overflow-hidden ${
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${category.gradientFrom} 0%, ${category.gradientTo} 100%)`,
                  }}
                />
              )}

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/80 transition-all duration-300" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6 lg:p-8">
                <div className="flex justify-between items-start">
                  <span className="text-white/60 text-body-xs font-mono">
                    0{index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <ArrowUpRightIcon className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-display-sm lg:text-display-md text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-body-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    {category.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
