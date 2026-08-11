"use client"

import { useEffect, useMemo, useRef } from "react"
import type { AreaVariant } from "./chart-context"
import {
  BAYER,
  BORDER_ALPHA,
  backingSize,
  type BloomInput,
  bloomLayerStyle,
  clamp01,
} from "./dither-paint"
import { cn } from "./lib"
import { type DitherColor, rgb, seedOfColor } from "./palette"
import { useChartDimensions } from "./use-chart-dimensions"

export type StackSegment = { key: string; fraction: number; color: DitherColor }

/**
 * A single 100%-stacked strip, painted with the same ordered-Bayer dither and
 * bloom glow the cartesian/polar canvases use — the allocation bar's read of
 * `<PieCanvas>`/`<CartesianCanvas>`, so it doesn't look like a different
 * product bolted onto the same page. No entrance reveal or scrub spring: a
 * flat strip has no "curve drawing on" or crosshair to animate, so this
 * repaints once per input change instead of running a persistent rAF loop.
 */
export function StackStrip({
  segments,
  variant = "gradient",
  bloom = "off",
  hoveredKey = null,
  className,
}: {
  segments: StackSegment[]
  variant?: AreaVariant
  bloom?: BloomInput
  hoveredKey?: string | null
  className?: string
}) {
  const { ref, size } = useChartDimensions<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { width, height } = size
    const { cols, rows } = backingSize(width, height)
    const c = canvas.getContext("2d")
    if (!c || cols <= 0 || rows <= 0) return
    canvas.width = cols
    canvas.height = rows

    const total = segments.reduce((sum, s) => sum + Math.max(0, s.fraction), 0) || 1
    let cursor = 0
    const bounds = segments.map((s) => {
      const x0 = cursor
      const w = (Math.max(0, s.fraction) / total) * cols
      cursor += w
      return { ...s, x0, x1: x0 + w }
    })

    c.clearRect(0, 0, cols, rows)
    for (let x = 0; x < cols; x++) {
      const seg = bounds.find((b) => x >= b.x0 && x < b.x1) ?? bounds[bounds.length - 1]
      if (!seg) continue
      const seed = seedOfColor(seg.color)
      const dim = hoveredKey != null && hoveredKey !== seg.key ? 0.35 : 1
      for (let y = 0; y < rows; y++) {
        // Subtle top-to-bottom lift — denser toward the floor, the strip's
        // read of paintColumn's fade toward the value line.
        const density = 0.35 + 0.5 * (y / Math.max(rows - 1, 1))
        if (variant === "hatched" && ((x + y) & 3) >= 2) continue
        const bias = variant === "dotted" ? 0.12 : 0
        const lit = variant === "solid" || density > BAYER[y & 3][x & 3] - bias
        if (variant === "dotted" && !lit) continue
        const alpha = clamp01((lit ? 0.55 + density * 0.35 : 0.2) * dim)
        c.fillStyle = rgb(seed.fill, 1, alpha)
        c.fillRect(x, y, 1, 1)
      }
      // Bright top cap — the same border treatment that caps every dither fill.
      c.fillStyle = rgb(seed.fill, 1, BORDER_ALPHA * dim)
      c.fillRect(x, 0, 1, 1)
    }
    // Segment dividers.
    c.fillStyle = "white"
    for (let i = 1; i < bounds.length; i++) {
      const x = Math.round(bounds[i].x0)
      c.fillRect(Math.max(0, x - 1), 0, 2, rows)
    }

    const bloomCanvas = bloomRef.current
    if (bloomCanvas) {
      bloomCanvas.width = cols
      bloomCanvas.height = rows
      const bctx = bloomCanvas.getContext("2d")
      bctx?.clearRect(0, 0, cols, rows)
      bctx?.drawImage(canvas, 0, 0)
    }
  }, [size, segments, variant, hoveredKey])

  const bloomStyle = useMemo(() => bloomLayerStyle(bloom, true), [bloom])

  return (
    <div ref={ref} className={cn("relative h-full w-full", className)}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
        style={{ imageRendering: "pixelated" }}
      />
      <canvas
        ref={bloomRef}
        className="pointer-events-none absolute inset-0 size-full"
        style={bloomStyle ?? { opacity: 0 }}
      />
    </div>
  )
}
