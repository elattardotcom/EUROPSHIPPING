"use client"
import { Logo } from "@/components/logo"

export default function LogoPreview() {
  return (
    <div className="p-12 flex flex-col items-center gap-12 bg-neutral-950 min-h-screen">
      <h1 className="text-white text-2xl font-bold">Logo Preview</h1>

      {/* Large on dark */}
      <div className="flex items-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <Logo size={200} showBg={true} />
          <p className="text-neutral-500 text-sm">Avec fond (200px)</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="bg-neutral-900 p-6 rounded-2xl">
            <Logo size={200} showBg={false} />
          </div>
          <p className="text-neutral-500 text-sm">Sans fond (200px)</p>
        </div>
      </div>

      {/* Small sizes */}
      <div className="flex items-center gap-8">
        {[16, 24, 32, 48, 64, 96].map(s => (
          <div key={s} className="flex flex-col items-center gap-2">
            <Logo size={s} showBg={true} />
            <p className="text-neutral-600 text-xs">{s}px</p>
          </div>
        ))}
      </div>

      {/* On white bg */}
      <div className="bg-white p-8 rounded-2xl flex items-center gap-8">
        {[48, 96, 120].map(s => (
          <Logo key={s} size={s} showBg={true} />
        ))}
      </div>
    </div>
  )
}
