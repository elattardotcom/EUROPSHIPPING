"use client"

import { useEffect, useState } from "react"
import { SignupModal } from "./signup-modal"

export function ModalListener() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<"signup" | "login">("signup")

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setStep(detail?.step ?? "signup")
      setShow(true)
    }
    window.addEventListener("open-modal", handler)
    return () => window.removeEventListener("open-modal", handler)
  }, [])

  if (!show) return null
  return <SignupModal onClose={() => setShow(false)} initialStep={step} />
}
