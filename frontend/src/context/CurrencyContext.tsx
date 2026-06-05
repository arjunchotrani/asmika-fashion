'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export const CURRENCIES = [
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
]

type Currency = typeof CURRENCIES[number]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
  convertPrice: (inrPrice: number | null | undefined) => string
  currencies: typeof CURRENCIES
  ratesLoaded: boolean
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0])
  const [rates, setRates] = useState<Record<string, number>>({})
  const [ratesLoaded, setRatesLoaded] = useState(false)

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/INR')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates(data.rates)
          setRatesLoaded(true)
        }
      })
      .catch(() => setRatesLoaded(true)) // fallback: show INR prices
  }, [])

  function convertPrice(inrPrice: number | null | undefined): string {
    if (inrPrice == null || inrPrice === 0) return 'Price on Enquiry'
    if (currency.code === 'INR') {
      return `₹ ${inrPrice.toLocaleString('en-IN')}`
    }
    const rate = rates[currency.code]
    if (!rate) return `₹ ${inrPrice.toLocaleString('en-IN')}`
    const converted = inrPrice * rate
    // Yen has no decimal, others round to nearest unit
    const rounded = currency.code === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100
    return `${currency.symbol} ${rounded.toLocaleString()}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, currencies: CURRENCIES, ratesLoaded }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
