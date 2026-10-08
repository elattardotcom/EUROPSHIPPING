"use client"

import { Shield, Key } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminSettings() {
  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-neutral-500 text-sm mt-1">Admin panel configuration</p>
      </div>

      {/* Credentials info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Admin access</p>
            <p className="text-neutral-500 text-xs">Credentials are managed through environment variables</p>
          </div>
        </div>

        <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Key className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono">ADMIN_EMAIL</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Key className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono">ADMIN_PASSWORD</span>
          </div>
        </div>

        <p className="text-xs text-neutral-600">
          Values are not shown here for security — check <code className="text-orange-400">ADMIN_EMAIL</code> and{" "}
          <code className="text-orange-400">ADMIN_PASSWORD</code> directly in your{" "}
          <code className="text-neutral-400">.env.local</code> file (local) or in your Vercel project settings (production)
          to view or change them.
        </p>
      </div>

      {/* Session */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <p className="text-white font-semibold text-sm mb-1">Session</p>
        <p className="text-neutral-500 text-xs mb-4">The admin session expires after 30 minutes of inactivity.</p>
        <Button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" })
            window.location.href = "/admin/login"
          }}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm"
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
