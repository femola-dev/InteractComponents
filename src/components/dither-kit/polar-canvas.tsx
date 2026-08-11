"use client"

import { type RefObject, useEffect, useMemo, useRef } from "react"
import {
  BAYER,
  BORDER_ALPHA,
  backingSize,
  bloomLayerStyle,
  clamp01,
  easeOutCubic,
  prefersReducedMotion,
} from "./dither-paint"
import { rgb } from "./palette"
import { type PieSlice, sliceAtAngle } from "./polar"
import { type PolarChartContextValue, usePolarChart } from "./polar-context"

const TOP = -Math.PI / 2
const TAU = Math.PI * 2
/** css px per backing cell — mirrors dither-paint's CELL for the cartesian canvas. */
const CELL = 2
/** How far a hovered slice's outer edge pushes past the rest, in backing cells. */
const HOVER_LIFT = 3

type LoopArgs = {
  canvas: HTMLCanvasElement
  bloomCanvas: HTMLCanvasElement | null
  cols: number
  rows: number
  cx: number
  cy: number
  outerR: number
  innerR: number
  state: RefObject<PolarChartContextValue>
}

/**
 * The rAF paint loop: sweeps the slices in on first paint (a clock-hand reveal
 * from the top), dithers each wedge with the same ordered-Bayer scatter the
 * cartesian canvas uses (dense at the outer edge, thinning toward the centre —
 * the polar read of "dense at the floor, fading toward the line"), and pushes
 * the hovered slice's outer edge out a few cells. Lives outside the component
 * so this hot closure isn't re-created every render. Returns a cleanup that
 * cancels the loop.
 */
function startPieLoop({
  canvas,
  bloomCanvas,
  cols,
  rows,
  cx,
  cy,
  outerR,
  innerR,
  state,
}: LoopArgs): (() => void) | undefined {
  const c = canvas.getContext("2d")
  if (!c || cols <= 0 || rows <= 0 || outerR <= 0) return undefined
  canvas.width = cols
  canvas.height = rows

  const off = document.createElement("canvas")
  off.width = cols
  off.height = rows
  const octx = off.getContext("2d")
  if (!octx) return undefined

  const bloomCtx = bloomCanvas?.getContext("2d") ?? null
  if (bloomCanvas) {
    bloomCanvas.width = cols
    bloomCanvas.height = rows
  }

  const reduce = prefersReducedMotion()
  const animate = state.current.animate && !reduce
  const duration = state.current.animationDuration

  let raf = 0
  let animStart = 0
  let lastRevision = state.current.revision
  let lastHover: number | null = null
  let lastReveal = -1
  let lastVariant = ""
  let needsPaint = true

  const paint = (slices: PieSlice[], reveal: number, hoverIndex: number | null) => {
    octx.clearRect(0, 0, cols, rows)
    const s = state.current
    const variant = s.variantOf("*")
    const revealEnd = TOP + reveal * TAU

    for (let y = 0; y < rows; y++) {
      const dy = y - cy
      for (let x = 0; x < cols; x++) {
        const dx = x - cx
        const r = Math.hypot(dx, dy)
        if (r < innerR - 0.5 || r > outerR + HOVER_LIFT + 0.5) continue

        let a = Math.atan2(dy, dx)
        while (a < TOP) a += TAU
        const i = sliceAtAngle(slices, a)
        if (i < 0 || a >= revealEnd) continue

        const hovered = hoverIndex === i
        const localOuter = hovered ? outerR + HOVER_LIFT : outerR
        if (r > localOuter) continue

        const seed = s.seedOf(slices[i].name)
        // Radial dither: dense at the wedge's outer edge, thinning toward the
        // centre — the polar counterpart of paintColumn's fade toward the line.
        if (variant === "hatched" && ((x + y) & 3) >= 2) continue
        const density = clamp01((r - innerR) / Math.max(localOuter - innerR, 1))
        const bias = variant === "dotted" ? 0.12 : 0
        const lit = variant === "solid" || density > BAYER[y & 3][x & 3] - bias
        if (variant === "dotted" && !lit) continue
        const boost = hovered ? 1.15 : 1
        const k = (0.3 + density * 0.7) * boost
        const alpha = clamp01(lit ? k : k * 0.4)
        octx.fillStyle = rgb(seed.fill, 1, alpha)
        octx.fillRect(x, y, 1, 1)
      }
    }

    // Bright edges — outer arc + the boundary between adjacent slices — capping
    // the dither the same way paintColumn's border row caps the value line.
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i]
      if (slice.start >= revealEnd) continue
      const seed = state.current.seedOf(slice.name)
      const localOuter = hoverIndex === i ? outerR + HOVER_LIFT : outerR
      octx.strokeStyle = rgb(seed.fill, 1, BORDER_ALPHA)
      octx.lineWidth = 1
      octx.beginPath()
      octx.arc(cx, cy, localOuter, slice.start, Math.min(slice.end, revealEnd))
      octx.stroke()
      if (innerR > 0) {
        octx.beginPath()
        octx.arc(cx, cy, innerR, slice.start, Math.min(slice.end, revealEnd))
        octx.stroke()
      }
      octx.beginPath()
      octx.moveTo(cx + Math.cos(slice.start) * innerR, cy + Math.sin(slice.start) * innerR)
      octx.lineTo(cx + Math.cos(slice.start) * localOuter, cy + Math.sin(slice.start) * localOuter)
      octx.stroke()
    }
  }

  const draw = (now: number) => {
    raf = requestAnimationFrame(draw)
    const s = state.current
    if (!s.ready || !s.pie || s.pie.length === 0) return

    if (bloomCtx) {
      const on = s.bloom !== "off" && (!s.bloomOnHover || s.isMouseInChart)
      if (on) {
        bloomCtx.clearRect(0, 0, cols, rows)
        bloomCtx.drawImage(canvas, 0, 0)
      }
    }

    if (s.revision !== lastRevision) {
      lastRevision = s.revision
      animStart = animate ? now : 0
    }
    if (!animStart && animate) animStart = now
    const prog = animate ? Math.min(1, (now - animStart) / duration) : 1
    const reveal = animate ? easeOutCubic(prog) : 1

    if (reveal !== lastReveal) {
      lastReveal = reveal
      needsPaint = true
    }
    if (s.hoverIndex !== lastHover) {
      lastHover = s.hoverIndex
      needsPaint = true
    }
    // Picks up a live variant tweak (e.g. from a dial) even once the entrance
    // has settled and nothing else would otherwise trigger a repaint.
    const variant = s.variantOf("*")
    if (variant !== lastVariant) {
      lastVariant = variant
      needsPaint = true
    }
    if (!needsPaint) return
    needsPaint = false

    paint(s.pie, reveal, s.hoverIndex)
    c.clearRect(0, 0, cols, rows)
    c.drawImage(off, 0, 0)
  }

  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

/**
 * Dither canvas for `<PieChart>`. Reduces the shared polar context's slice
 * geometry (already computed by `pieSlices()` in polar.ts) to a raster fill —
 * the pie counterpart of `CartesianCanvas`, minus the scrub spring and star
 * field neither a pie nor its legend/tooltip need.
 */
export function PieCanvas() {
  const ctx = usePolarChart()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)

  const { width, height } = ctx.plot
  const { cols, rows } = backingSize(width, height)
  const cx = ctx.center.x / CELL
  const cy = ctx.center.y / CELL
  const outerR = ctx.outerRadius / CELL
  const innerR = ctx.innerRadius / CELL

  const stateRef = useRef(ctx)
  useEffect(() => {
    stateRef.current = ctx
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return startPieLoop({
      canvas,
      bloomCanvas: bloomRef.current,
      cols,
      rows,
      cx,
      cy,
      outerR,
      innerR,
      state: stateRef,
    })
  }, [cols, rows, cx, cy, outerR, innerR])

  const bloomActive = ctx.bloomOnHover ? ctx.isMouseInChart : true
  const bloom = useMemo(
    () => bloomLayerStyle(ctx.bloom, bloomActive),
    [ctx.bloom, bloomActive]
  )
  // The container div is the full measured area; center/radius are plot-local
  // (post-margin), so the canvas has to start at the plot's own origin — the
  // same offset CartesianCanvas applies for its equivalent `pos`.
  const pos = { left: ctx.margins.left, top: ctx.margins.top, width, height } as const

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{ ...pos, imageRendering: "pixelated" }}
      />
      <canvas
        ref={bloomRef}
        className="pointer-events-none absolute"
        style={{
          ...pos,
          transition: "opacity 220ms ease",
          ...(bloom ?? { opacity: 0 }),
        }}
      />
    </>
  )
}
