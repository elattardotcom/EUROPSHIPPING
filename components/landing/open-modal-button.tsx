"use client"

import { useRouter } from "next/navigation"

interface Props {
  step: "signup" | "login"
  plan?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function OpenModalButton({ step, className, style, children }: Props) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(step === "login" ? "/auth/login" : "/auth/register")}
      className={className}
      style={style}
    >
      {children}
    </button>
  )
}
