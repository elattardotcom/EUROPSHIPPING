"use client"

import { Loader2 } from "lucide-react"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Confirm", destructive = true, loading, onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white text-[#17191D] border border-neutral-200 rounded-xl shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#17191D]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-500">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-neutral-200 text-neutral-700 hover:bg-neutral-50">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={e => { e.preventDefault(); onConfirm() }}
            disabled={loading}
            className={destructive
              ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400"}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5 inline" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
