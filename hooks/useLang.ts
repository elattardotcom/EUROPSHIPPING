"use client"

import { useState, useEffect } from "react"

export type Lang = "fr" | "en"

export function useLang(): [Lang, (l: Lang | ((prev: Lang) => Lang)) => void] {
  const [lang, setLangState] = useState<Lang>("fr")

  useEffect(() => {
    const saved = localStorage.getItem("site-lang") as Lang | null
    if (saved === "fr" || saved === "en") setLangState(saved)

    const onStorage = (e: StorageEvent) => {
      if (e.key === "site-lang" && (e.newValue === "fr" || e.newValue === "en")) {
        setLangState(e.newValue)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setLang = (value: Lang | ((prev: Lang) => Lang)) => {
    setLangState(prev => {
      const next = typeof value === "function" ? value(prev) : value
      localStorage.setItem("site-lang", next)
      // Notify other useLang instances in the same tab
      window.dispatchEvent(new StorageEvent("storage", { key: "site-lang", newValue: next }))
      return next
    })
  }

  return [lang, setLang]
}
