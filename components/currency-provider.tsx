"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY"
type Currency = { code: CurrencyCode; name: string; symbol: string }

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
]

type CurrencyContextValue = {
  currency: Currency
  rate: number
  setCurrency: (currency: Currency) => void
  convert: (value: number) => number
  format: (value: number, options?: Intl.NumberFormatOptions) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState(currencies[0])
  const [rate, setRate] = useState(1)
  const rates = useRef(new Map<string, number>([["USD", 1]]))

  useEffect(() => {
    const cachedRate = rates.current.get(currency.code)
    if (cachedRate != null) {
      setRate(cachedRate)
      return
    }
    let cancelled = false
    fetch(`/api/markets/exchange-rate?currency=${currency.code}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Exchange rate unavailable")))
      .then((result: { rate: number }) => {
        if (!cancelled && Number.isFinite(result.rate)) {
          rates.current.set(currency.code, result.rate)
          setRate(result.rate)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRate(1)
          setCurrency(currencies[0])
        }
      })
    return () => { cancelled = true }
  }, [currency.code])

  const convert = (value: number) => value * rate
  const format = (value: number, options: Intl.NumberFormatOptions = {}) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: currency.code, ...options }).format(convert(value))

  return <CurrencyContext.Provider value={{ currency, rate, setCurrency, convert, format }}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider")
  return context
}