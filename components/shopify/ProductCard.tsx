"use client"

import Image from "next/image"
import { Package, Boxes, Wifi, WifiOff } from "lucide-react"

export interface ProductCardData {
  id:        string
  title:     string
  image_url: string | null
  price:     number
  currency:  string
  stock:     number | null
  storeName: string
}

const CURRENCY_INFO: Record<string, { flag: string; label: string }> = {
  EUR: { flag: "🇪🇺", label: "Europe"    },
  USD: { flag: "🇺🇸", label: "USA"       },
  GBP: { flag: "🇬🇧", label: "UK"        },
  CAD: { flag: "🇨🇦", label: "Canada"    },
  AUD: { flag: "🇦🇺", label: "Australia" },
  MAD: { flag: "🇲🇦", label: "Maroc"     },
  TND: { flag: "🇹🇳", label: "Tunisie"   },
  DZD: { flag: "🇩🇿", label: "Algérie"   },
  AED: { flag: "🇦🇪", label: "EAU"       },
  SAR: { flag: "🇸🇦", label: "Arabie"    },
}

function StockIndicator({ stock }: { stock: number | null }) {
  if (stock === null) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/60 text-xs text-neutral-500">
        <WifiOff className="w-3 h-3" />
        <span className="font-mono">— stock</span>
      </div>
    )
  }

  const color =
    stock === 0   ? "text-red-400 border-red-500/40 bg-red-500/10" :
    stock < 20    ? "text-amber-400 border-amber-500/40 bg-amber-500/10" :
    stock < 100   ? "text-sky-400 border-sky-500/40 bg-sky-500/10" :
                    "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"

  const dot =
    stock === 0 ? "bg-red-500" : stock < 20 ? "bg-amber-500" : stock < 100 ? "bg-sky-500" : "bg-emerald-500"

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-sm border text-xs font-mono font-medium ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dot}`} />
      {stock === 0 ? "Rupture" : `${stock} art.`}
    </div>
  )
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const info = CURRENCY_INFO[product.currency] ?? { flag: "🌍", label: "" }

  const formatted = new Intl.NumberFormat("fr-FR", {
    style:    "currency",
    currency: product.currency,
    minimumFractionDigits: 2,
  }).format(product.price)

  const stockPct = product.stock !== null
    ? Math.min(100, Math.round((product.stock / 500) * 100))
    : null

  const barColor =
    stockPct === null  ? "" :
    stockPct === 0     ? "bg-red-500" :
    stockPct < 10      ? "bg-amber-500" :
    stockPct < 40      ? "bg-sky-500" :
                         "bg-emerald-500"

  return (
    <div className="group relative bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(249,115,22,0.25)]">

      {/* Corner glow on hover */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Image */}
      <div className="relative aspect-square bg-neutral-900 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width:640px) 50vw, 260px"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
            <Package className="w-14 h-14 text-neutral-800" />
          </div>
        )}

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

        {/* Scan line */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

        {/* Stock badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <StockIndicator stock={product.stock} />
        </div>

        {/* Country flag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900/85 backdrop-blur-sm border border-neutral-700/60 text-sm">
            <span>{info.flag}</span>
            <span className="text-[10px] text-neutral-400 font-medium">{info.label}</span>
          </div>
        </div>

        {/* Sync status bottom-right of image */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {product.stock !== null
            ? <Wifi className="w-3.5 h-3.5 text-emerald-500/70" />
            : <WifiOff className="w-3.5 h-3.5 text-neutral-600" />
          }
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="text-white/90 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {product.title}
        </h3>

        {/* Stock bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] uppercase tracking-widest text-neutral-600 font-semibold">
              {product.stock === null ? "Stock — en attente sync" : "Niveau de stock"}
            </span>
            {product.stock !== null && (
              <span className="text-[9px] text-neutral-500 font-mono">{stockPct}%</span>
            )}
          </div>
          <div className="h-[3px] bg-neutral-800 rounded-full overflow-hidden">
            {stockPct !== null
              ? <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${stockPct}%` }} />
              : <div className="h-full w-full bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-700 animate-pulse rounded-full" />
            }
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-0.5">Prix COD</p>
            <p className="text-2xl font-bold tabular-nums bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              {formatted}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-0.5">Boutique</p>
            <p className="text-neutral-400 text-xs truncate max-w-[90px]">{product.storeName}</p>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}
