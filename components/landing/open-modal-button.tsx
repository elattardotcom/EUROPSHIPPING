"use client"

interface Props {
  step: "signup" | "login"
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function OpenModalButton({ step, className, style, children }: Props) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-modal", { detail: { step } }))
  }
  return (
    <button onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  )
}
