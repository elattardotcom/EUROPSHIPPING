import type { ReactNode } from "react"

export function KpiCard({
  label, value, sub, icon: Icon, onClick, active,
}: {
  label: string
  value: ReactNode
  sub?: string
  icon?: React.ElementType
  onClick?: () => void
  active?: boolean
}) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag onClick={onClick}
      className={`rounded-xl bg-white border p-4 text-left transition-colors ${
        active ? "border-orange-400 ring-1 ring-orange-400/30" : "border-neutral-200 hover:border-neutral-300"
      } ${onClick ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
      </div>
      <p className="text-2xl font-bold text-[#17191D] leading-none">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1.5">{sub}</p>}
    </Tag>
  )
}
