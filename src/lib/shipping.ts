export type ShippingMethod = 'retiro' | 'cadeteria'

export interface ShippingOption {
  method: ShippingMethod
  label: string
  sublabel: string
  cost: number
  requiresAddress: boolean
  note?: string
}

export const SHIPPING_OPTIONS: Record<ShippingMethod, ShippingOption> = {
  retiro: {
    method: 'retiro',
    label: 'Retiro en persona',
    sublabel: 'Catamarca capital',
    cost: 0,
    requiresAddress: false,
  },
  cadeteria: {
    method: 'cadeteria',
    label: 'Cadetería local',
    sublabel: 'Valle Central',
    cost: 2000,
    requiresAddress: true,
    note: 'Costo estimado, puede variar según distancia',
  },
}

export function getShippingCost(method: ShippingMethod): number {
  return SHIPPING_OPTIONS[method].cost
}

export function isValidShippingMethod(value: unknown): value is ShippingMethod {
  return value === 'retiro' || value === 'cadeteria'
}
