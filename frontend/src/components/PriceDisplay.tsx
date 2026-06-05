'use client'

import { useCurrency } from '@/context/CurrencyContext'

interface PriceDisplayProps {
  price?: number | null
  className?: string
}

export function PriceDisplay({ price, className }: PriceDisplayProps) {
  const { convertPrice } = useCurrency()
  return <span className={className}>{convertPrice(price)}</span>
}
