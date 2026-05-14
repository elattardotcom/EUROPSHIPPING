import Image from "next/image"

export function Logo({
  size = 200,
  className,
  showBg = true,
}: {
  size?: number
  className?: string
  showBg?: boolean
}) {
  const width  = Math.round(size * 1.5)
  const height = size

  return (
    <Image
      src="/logo.png"
      alt="CODShipEurope"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: "contain", background: showBg ? "transparent" : undefined }}
      priority
    />
  )
}
