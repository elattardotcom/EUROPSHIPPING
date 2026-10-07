import { Suspense } from "react"
import StoresPage from "@/components/cod/stores"

export default function Page() {
  return (
    <div className="relative p-4 md:p-6">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundImage: "linear-gradient(rgba(249,115,22,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.035) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, #000 0%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, #000 0%, transparent 75%)",
      }} />
      <Suspense fallback={null}>
        <StoresPage />
      </Suspense>
    </div>
  )
}
