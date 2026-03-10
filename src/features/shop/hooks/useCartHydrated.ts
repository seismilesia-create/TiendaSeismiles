'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function useCartHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
