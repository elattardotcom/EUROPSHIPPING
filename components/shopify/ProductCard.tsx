"use client"

import Image from "next/image"
import { Package } from "lucide-react"
import type { PresentmentPrice } from "@/lib/shopify"
import { getLocalizedPrice } from "@/lib/shopify"

interface Product {
  id:                 string
  title:              string
  image_url:          string | null
  price:              number
  currency:           string
  presentment_prices: PresentmentPrice[]
}

interface Props {
  product:      Product
  countryCode:  string
  currencyCode: string
}

const FLAG: Record<string, string> = {
  FR:"🇫🇷", DE:"🇩🇪", ES:"🇪🇸", IT:"🇮🇹", PT:"🇵🇹", BE:"🇧🇪",
  US:"🇺🇸", GB:"🇬🇧", CA:"🇨🇦", AU:"🇦🇺", MA:"🇲🇦", TN:"🇹🇳",
}

export function ProductCard({ product, countryCode, currencyCode }: Props) {
  const local   = getLocalizedPrice(product.presentment_prices, currencyCode)
  const amount  = local?.amount ?? product.price
  const code    = local?.currencyCode ?? product.currency

  const formatted = new Intl.NumberFormat("fr-FR", {
    style:    "currency",
    currency: code,
  }).format(amount)

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all group">
      {/* Image */}
      <div className="relative aspect-square bg-neutral-800 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-neutral-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 mb-3">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-orange-400 font-bold text-lg">{formatted}</span>
          <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-lg flex items-center gap-1">
            {FLAG[countryCode] ?? "🌍"} {countryCode}
          </span>
        </div>
      </div>
    </div>
  )
}
