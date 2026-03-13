'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFavorite } from '@/actions/favorites'

interface HeartButtonProps {
  productId: string
  productSlug: string
  isFavorited: boolean
  isLoggedIn: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function HeartButton({
  productId,
  productSlug,
  isFavorited,
  isLoggedIn,
  size = 'sm',
  className = '',
}: HeartButtonProps) {
  const [optimistic, setOptimistic] = useState(isFavorited)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Keep optimistic state synced with server state
  if (isFavorited !== optimistic && !isPending) {
    setOptimistic(isFavorited)
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    const prev = optimistic
    setOptimistic(!prev)

    startTransition(async () => {
      const result = await toggleFavorite(productId, productSlug)
      if (result.error) {
        setOptimistic(prev)
      }
    })
  }

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimistic ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`${sizeClasses} rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
        shadow-sm hover:bg-white hover:scale-110 transition-all duration-200
        ${isPending ? 'opacity-60' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={optimistic ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${iconSize} transition-colors duration-200 ${
          optimistic ? 'text-red-500' : 'text-volcanic-600'
        }`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
