export function Logo({
  size = 200,
  className,
  showBg = true,
}: {
  size?: number
  className?: string
  showBg?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {showBg && <circle cx="100" cy="100" r="100" fill="#0a0a0a" />}

      {/* 300° arc from lower-right to lower-left counterclockwise via top */}
      <path
        d="M 133 156 A 65 65 0 1 0 67 156"
        stroke="#f97316"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Arrowhead at lower-left end, pointing right-down */}
      <polygon points="67,156 48,132 38,150" fill="#f97316" />

      {/* Dot at lower-right start */}
      <circle cx="133" cy="156" r="13" fill="#f97316" />
    </svg>
  )
}
