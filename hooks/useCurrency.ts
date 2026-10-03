"use client"

import { useState, useEffect, useCallback } from "react"

const SYMBOLS: Record<string, string> = {
  EUR: "€", USD: "$", GBP: "£", MAD: "DH",
}

function readCurrency(): string {
  if (typeof window === "undefined") return "EUR"
  return (localStorage.getItem("site-currency") ?? "eur").toUpperCase()
}

export function useCurrency() {
  const [currency, setCurrency] = useState<string>(readCurrency)
  const [rates,    setRates]    = useState<Record<string, number>>({})
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    // Fetch today's rates
    fetch("/api/rates")
      .then(r => r.ok ? r.json() : {})
      .then((r: Record<string, number>) => setRates(r))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Sync currency preference across tabs and same-tab (settings dispatches StorageEvent)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "site-currency" && e.newValue) {
        setCurrency(e.newValue.toUpperCase())
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Convert a EUR amount to the selected currency
  const convert = useCallback((eurAmount: number): number => {
    if (currency === "EUR") return eurAmount
    const rate = rates[currency]
    return rate ? eurAmount * rate : eurAmount
  }, [currency, rates])

  // Format a EUR amount in the selected currency
  const fmt = useCallback((eurAmount: number, decimals = 2): string => {
    const converted = convert(eurAmount)
    const sym = SYMBOLS[currency] ?? currency

    // Show 0 decimals for large whole numbers to keep UI clean
    const useDec = decimals === 0 ? 0 : (Number.isInteger(converted) ? 0 : decimals)

    if (currency === "MAD") {
      return `${converted.toFixed(useDec)} ${sym}`
    }
    return `${sym}${converted.toFixed(useDec)}`
  }, [currency, convert])

  // Short format (no decimals) for charts/stats
  const fmtShort = useCallback((eurAmount: number): string => fmt(eurAmount, 0), [fmt])

  return { currency, rates, loading, convert, fmt, fmtShort, symbol: SYMBOLS[currency] ?? currency }
}
