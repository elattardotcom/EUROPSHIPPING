"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  color?: string
  className?: string
}

export function AnimatedCounter({ to, prefix = "", suffix = "", decimals = 0, duration = 1800, color, className = "" }: Props) {
  const [value,   setValue]   = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(parseFloat((ease * to).toFixed(decimals)))
      if (p < 1) requestAnimationFrame(tick)
      else setValue(to)
    }
    requestAnimationFrame(tick)
  }, [started, to, duration, decimals])

  return (
    <span ref={ref} style={color ? { color } : undefined} className={className}>
      {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString("fr-FR")}{suffix}
    </span>
  )
}
