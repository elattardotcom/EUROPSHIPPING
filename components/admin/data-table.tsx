import type { ReactNode, ComponentProps } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table, TableHeader as ShadTableHeader, TableBody as ShadTableBody,
  TableRow as ShadTableRow, TableHead as ShadTableHead, TableCell as ShadTableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Thin light-theme overrides over the shadcn primitives — the shared
// --background/--border/--muted-foreground CSS vars are dark site-wide
// (shared with the public site and client dashboard), so admin tables
// override them explicitly rather than touching globals.css.
export const TableShell = Table

export function TableHeader({ className, ...props }: ComponentProps<typeof ShadTableHeader>) {
  return <ShadTableHeader className={cn("bg-neutral-50", className)} {...props} />
}
export function TableBody(props: ComponentProps<typeof ShadTableBody>) {
  return <ShadTableBody {...props} />
}
export function TableRow({ className, ...props }: ComponentProps<typeof ShadTableRow>) {
  return <ShadTableRow className={cn("border-neutral-100 hover:bg-neutral-50/70", className)} {...props} />
}
export function TableHead({ className, ...props }: ComponentProps<typeof ShadTableHead>) {
  return <ShadTableHead className={cn("text-neutral-500 font-medium text-xs uppercase tracking-wide", className)} {...props} />
}
export function TableCell({ className, ...props }: ComponentProps<typeof ShadTableCell>) {
  return <ShadTableCell className={cn("text-[#17191D]", className)} {...props} />
}

export function TableCard({ children }: { children: ReactNode }) {
  return <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">{children}</div>
}

export function TableToolbar({
  search, onSearchChange, searchPlaceholder = "Search…", filters, actions,
}: {
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex flex-col sm:flex-row gap-3">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder={searchPlaceholder}
              className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#17191D] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400" />
          </div>
        )}
        {filters}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function TablePagination({
  page, totalPages, onChange, totalLabel,
}: { page: number; totalPages: number; onChange: (p: number) => void; totalLabel?: string }) {
  if (totalPages <= 1 && !totalLabel) return null
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100">
      {totalLabel && <p className="text-sm text-neutral-500">{totalLabel}</p>}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}
            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-neutral-500 px-2">{page} / {totalPages}</span>
          <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
