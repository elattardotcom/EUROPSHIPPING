import { Suspense } from "react"
import StoresPage from "@/components/cod/stores"
import { GridBackground } from "@/components/dashboard/hud-accents"

export default function Page() {
  return (
    <div className="relative p-4 md:p-6">
      <GridBackground />
      <Suspense fallback={null}>
        <StoresPage />
      </Suspense>
    </div>
  )
}
