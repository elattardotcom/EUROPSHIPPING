"use client"

interface Props {
  step: "signup" | "login"
  plan?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function OpenModalButton({ step, plan, className, style, children }: Props) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-modal", { detail: { step, plan } }))
  }
  return (
    <button onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  )
}
