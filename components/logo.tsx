import Image from "next/image"

// Logo aspect ratio: 611x488 ≈ 1.25:1
// size = height in px, width = size * 1.25
export function Logo({
  size = 48,
  className,
  showBg = true,
}: {
  size?: number
  className?: string
  showBg?: boolean
}) {
  const h = size
  const w = Math.round(size * 1.25)

  return (
    <Image
      src="/logo.png"
      alt="CODShipEurope"
      width={w}
      height={h}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  )
}
