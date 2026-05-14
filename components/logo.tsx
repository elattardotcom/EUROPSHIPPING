import Image from "next/image"

// Logo aspect ratio: 1536x1024 = 3:2
// size = height in px, width = size * 1.5
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
  const w = Math.round(size * 1.5)

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
