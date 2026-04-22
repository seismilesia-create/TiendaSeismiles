'use client'

import { useMemo } from 'react'
import { shopConfig } from '../config'
import type { CrossSellRule } from '../types'
import type { CartItem } from '../stores/cart-store'
import type { CatalogProductFromDB } from '../services/product-lines'

export interface CrossSellSuggestion {
  rule: CrossSellRule
  /** Todos los productos que califican como target de la regla, con destacados primero. */
  candidates: CatalogProductFromDB[]
}

function triggerMatches(
  linea: string | undefined,
  categoria: string | undefined,
  rule: CrossSellRule,
): boolean {
  if (rule.triggerLinea && linea !== rule.triggerLinea) return false
  if (rule.triggerCategoria && categoria !== rule.triggerCategoria) return false
  return Boolean(rule.triggerLinea || rule.triggerCategoria)
}

function targetMatches(
  linea: string | undefined,
  categoria: string | undefined,
  rule: CrossSellRule,
): boolean {
  if (rule.targetLinea && linea !== rule.targetLinea) return false
  if (rule.targetCategoria && categoria !== rule.targetCategoria) return false
  return Boolean(rule.targetLinea || rule.targetCategoria)
}

/**
 * Devuelve la regla por la cual este item es trigger de un cross-sell ACTIVO
 * (i.e. hay un target en el carrito vinculado a esa regla). `null` si no.
 * Se usa para mostrar el modal de confirmación al remover.
 */
export function getTriggerRule(item: CartItem, items: CartItem[]): CrossSellRule | null {
  for (const rule of shopConfig.crossSellRules) {
    if (!triggerMatches(item.linea, item.categoria, rule)) continue
    const hasBoundTarget = items.some((i) => i.crossSellRuleId === rule.id)
    if (hasBoundTarget) return rule
  }
  return null
}

/**
 * Devuelve la regla por la cual este item es target (tiene descuento).
 * `null` si el item no es target.
 */
export function getTargetRule(item: CartItem): CrossSellRule | null {
  if (!item.crossSellRuleId) return null
  return shopConfig.crossSellRules.find((r) => r.id === item.crossSellRuleId) ?? null
}

/**
 * Hook principal: calcula la sugerencia activa para mostrar en el carrito.
 * Una sugerencia requiere: (a) un trigger en el carrito, (b) no tener ya el
 * target agregado, (c) tener al menos un candidato en el catálogo.
 */
export function useCrossSell(
  items: CartItem[],
  allProducts: CatalogProductFromDB[],
): { suggestion: CrossSellSuggestion | null } {
  const suggestion = useMemo<CrossSellSuggestion | null>(() => {
    if (items.length === 0) return null

    for (const rule of shopConfig.crossSellRules) {
      const hasTrigger = items.some((i) =>
        triggerMatches(i.linea, i.categoria, rule) && !i.crossSellRuleId,
      )
      if (!hasTrigger) continue

      const alreadyHasTarget = items.some((i) => i.crossSellRuleId === rule.id)
      if (alreadyHasTarget) continue

      const inCartIds = new Set(items.map((i) => i.productId))
      const candidates = allProducts
        .filter((p) => targetMatches(p.linea, p.categoria, rule) && !inCartIds.has(p.id))
        // Destacados primero; dentro de cada grupo, orden original del catálogo.
        .sort((a, b) => Number(b.destacado) - Number(a.destacado))
      if (candidates.length === 0) continue

      return { rule, candidates }
    }

    return null
  }, [items, allProducts])

  return { suggestion }
}
