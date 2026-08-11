"use client"

import { type RefObject, useEffect, useMemo, useRef } from "react"
import { type ChartContextValue, useChart } from "./chart-context"
import {
  backingSize,
  bloomLayerStyle,
  easeOutCubic,
  paintColumn,
  prefersReducedMotion,
  resample,
} from "./dither-paint"
import { rgb, seedOfColor } from "./palette"

type Star = { key: string; xi: number; depth: number; phase: number }
type Surface = { top: number[]; floor: number[] }

type LoopArgs = {
  canvas: HTMLCanvasElement
  bloomCanvas: HTMLCanvasElement | null
  cols: number
  rows: number
  state: RefObject<ChartContextValue>
  targets: RefObject<Record<string, Surface>>
  stars: RefObject<Star[]>
}

/**
 * The requestAnimationFrame paint loop — eases each series toward its target
 * surface, paints the dither fill (with the entrance reveal), then layers the
 * crosshair marker and winking stars on top. Lives outside the component so the
 * component stays small and this hot closure isn't re-created on every render.
 * Returns a cleanup that cancels the loop.
 */
function startCartesianLoop({
  canvas,
  bloomCanvas,
  cols,
  rows,
  state,
  targets,
  stars,
}: LoopArgs): (() => void) | undefined {
  const c = canvas.getContext("2d")
  if (!c || cols <= 0 || rows <= 0) return undefined
  canvas.width = cols
  canvas.height = rows

  const off = document.createElement("canvas")
  off.width = cols
  off.height = rows
  const octx = off.getContext("2d")
  if (!octx) return undefined

  // Bloom layer: a blurred, additive copy of the crisp canvas.
  const bloomCtx = bloomCanvas?.getContext("2d") ?? null
  if (bloomCanvas) {
    bloomCanvas.width = cols
    bloomCanvas.height = rows
  }

  const reduce = prefersReducedMotion()
  // Fraction of the remaining distance the surface closes per frame *at 60fps*.
  // Converted to a time-based factor each frame (see `ease` in `draw`) so the
  // morph takes the same wall-clock time on a 120Hz display as on a 60Hz one.
  const SMOOTH_60 = 0.18
  const FRAME_MS = 1000 / 60
  const animate = state.current.animate && !reduce
  const duration = state.current.animationDuration
  const current: Record<string, Surface> = {}

  /**
   * Where the scrub *wants* to be, in backing columns — the raw target the
   * spring below chases. `null` when nothing is being scrubbed.
   *
   * A live hover reads the pointer *continuously*. Deriving it from the snapped
   * data index instead moves it in steps of (cols−1)/(n−1) — around 25 columns
   * on a 14-point series — so the seam would jump between points rather than
   * track the cursor. A controlled `markerIndex` (a committed point, not a live
   * hover) still lands exactly on its data point.
   */
  const scrubTarget = (s: ChartContextValue) => {
    if (s.isMouseInChart && s.hoverIndex != null) {
      const px = s.cursorX - s.margins.left
      const frac = px / Math.max(s.plot.width, 1)
      return Math.max(0, Math.min(1, frac)) * (cols - 1)
    }
    if (s.markerIndex != null && s.dataLength > 1) {
      return (s.markerIndex / (s.dataLength - 1)) * (cols - 1)
    }
    return null
  }

  // Damped harmonic oscillator for the scrub seam: F = −k·x − c·v, a = F/m.
  // Locking the seam to the pointer 1:1 reads as rigid — the shade is a body of
  // colour, and a body has inertia. These are the house `springResponsive`
  // values (see src/lib/motion.ts), kept literal because the kit is vendored and
  // does not import from the app: ω₀ = √(k/m) ≈ 22.4 rad/s, ζ = c/(2√(km)) ≈
  // 0.84 — just under critical, so it settles in ~0.2s with a trace of overshoot.
  const SCRUB_K = 400
  const SCRUB_C = 30
  const SCRUB_M = 0.8
  // Integration substep. A spring integrated at one step per display frame goes
  // unstable when frames are long; capping the step at ~4ms keeps it accurate
  // and makes the motion identical at 60Hz and 120Hz.
  const SUB_MS = 1000 / 240

  // `reveal` (0–1) sweeps the fill in left-to-right on first paint.
  const paintFill = (intensity: number, reveal: number, scrubCol: number) => {
    octx.clearRect(0, 0, cols, rows)
    const s = state.current
    const stacked = s.stackType === "stacked" || s.stackType === "percent"
    const revealCols = Math.ceil(reveal * cols)
    // Everything right of the scrub point paints in `trailColor` — body only,
    // so the series line still traces the whole span.
    const trailSeed = s.trailColor ? seedOfColor(s.trailColor) : null
    const splitCol =
      trailSeed !== null && scrubCol >= 0 ? scrubCol : Infinity
    s.configKeys.forEach((key, si) => {
      const cur = current[key]
      if (!cur) return
      const seed = s.seedOf(key)
      const variant = s.seriesSpecs[key]?.variant ?? "gradient"
      const isLine =
        (s.seriesSpecs[key]?.kind ??
          (s.chartType === "line" ? "line" : "area")) === "line"
      const emphasis = s.selectedDataKey ?? s.focusDataKey
      const dim = emphasis !== null && emphasis !== key ? 0.3 : 1
      // Overlapping (non-stacked) layers thin out front-to-back so they
      // read as distinct layers instead of a muddy blend.
      const sparse = stacked ? 0 : si * 0.14
      for (let x = 0; x < cols; x++) {
        if (x > revealCols) break
        // For a value that dips below the zero baseline the value line ends up
        // *below* the floor in pixels; paintColumn needs the higher edge first,
        // so order the pair (a no-op for the common positive case).
        const a = cur.top[x] ?? 0
        const b = cur.floor[x] ?? 0
        paintColumn(octx, x, Math.min(a, b), Math.max(a, b), seed, {
          variant,
          intensity,
          dim,
          stacked: stacked && !isLine,
          sparse,
          bodySeed: x > splitCol && trailSeed ? trailSeed : seed,
        })
      }
    })
  }

  let raf = 0
  let tick = 0
  let last = 0
  let animStart = 0
  let lastProg = -1
  let lastRevision = state.current.revision
  let entranceReported = !animate
  let intensity = 0
  let needsFill = true
  let lastPaintSig = ""
  let lastSelected: string | null | undefined = Symbol() as never
  let prevNow = 0
  // The left-to-right reveal is an entrance: it belongs to the chart appearing,
  // not to its data changing. Once it has played, later revisions morph instead.
  let hasRevealed = !animate
  let wasMoving = false
  // Scrub spring state: position (backing columns) and velocity (columns/s).
  // At rest it parks at the right edge, so leaving the chart lets the shade
  // retreat off the end rather than blinking away.
  let scrubPos = cols - 1
  let scrubVel = 0
  let wasScrubbing = false

  const draw = (now: number) => {
    raf = requestAnimationFrame(draw)
    const s = state.current
    if (!s.ready) return
    // Clamped so a backgrounded tab doesn't hand back a multi-second frame and
    // snap the surface to its target on return.
    const frameMs = prevNow ? Math.min(50, now - prevNow) : FRAME_MS
    prevNow = now
    const ease = reduce ? 1 : 1 - Math.pow(1 - SMOOTH_60, frameMs / FRAME_MS)
    // Keep the bloom layer in sync with the crisp canvas while it's active.
    if (bloomCtx) {
      const on =
        s.bloom !== "off" && (!s.bloomOnHover || s.isMouseInChart || s.hovered)
      if (on) {
        bloomCtx.clearRect(0, 0, cols, rows)
        bloomCtx.drawImage(canvas, 0, 0)
      }
    }
    const tgt = targets.current
    if (s.revision !== lastRevision) {
      lastRevision = s.revision
      if (hasRevealed) {
        // Fast-forward past the wipe. `prog` is immediately 1, so the whole
        // curve stays painted and the surface lerp below eases it into its new
        // shape — a morph, where re-running the reveal would read as a reload.
        animStart = now - duration
      } else {
        animStart = 0
        lastProg = -1
        entranceReported = false
      }
    }
    if (!animStart) animStart = now
    const prog = animate ? Math.min(1, (now - animStart) / duration) : 1
    const progChanged = prog !== lastProg
    // Tell the context the reveal is done so DOM markers fade in in sync.
    if (prog >= 1 && !entranceReported) {
      entranceReported = true
      hasRevealed = true
      s.markEntranceDone()
    }

    let moving = false
    for (const key of s.configKeys) {
      const t = tgt[key]
      if (!t) continue
      const cur = current[key]
      if (!cur || cur.top.length !== cols) {
        current[key] = { top: t.top.slice(), floor: t.floor.slice() }
        needsFill = true
        continue
      }
      for (let x = 0; x < cols; x++) {
        const dt = t.top[x] - cur.top[x]
        const df = t.floor[x] - cur.floor[x]
        if (Math.abs(dt) > 0.01 || Math.abs(df) > 0.01) {
          cur.top[x] += dt * ease
          cur.floor[x] += df * ease
          moving = true
        } else {
          cur.top[x] = t.top[x]
          cur.floor[x] = t.floor[x]
        }
      }
    }
    for (const key of Object.keys(current)) {
      if (!tgt[key]) {
        delete current[key]
        needsFill = true
      }
    }
    // A dither fill re-scatters its pixels as the surface moves, so mid-morph
    // both the old and new shapes are partly legible. A hair of blur masks that
    // and clears the moment it settles. Written only on the flip — setting it
    // every frame would invalidate the compositor's cached filter each time.
    if (moving !== wasMoving) {
      wasMoving = moving
      canvas.style.filter = moving && !reduce ? "blur(1.5px)" : "blur(0px)"
    }
    if (moving) needsFill = true
    const emphasisNow = s.selectedDataKey ?? s.focusDataKey
    if (emphasisNow !== lastSelected) {
      lastSelected = emphasisNow
      needsFill = true
    }

    const itTarget = s.isMouseInChart || s.hovered ? 1 : 0
    let settling = false
    if (Math.abs(intensity - itTarget) > 0.001) {
      intensity += (itTarget - intensity) * 0.16
      settling = true
      needsFill = true
    } else intensity = itTarget

    // --- Scrub spring -------------------------------------------------------
    const target = scrubTarget(s)
    const scrubbing = target !== null
    const springTo = target ?? cols - 1
    if (reduce) {
      scrubPos = springTo
      scrubVel = 0
    } else if (scrubbing && !wasScrubbing) {
      // Entering the plot: start under the pointer. Springing in from the rest
      // position would fly the seam across the chart before it could follow.
      scrubPos = springTo
      scrubVel = 0
    } else {
      // Semi-implicit Euler, substepped so the result is frame-rate independent.
      let remaining = frameMs
      while (remaining > 0) {
        const h = Math.min(SUB_MS, remaining) / 1000
        remaining -= SUB_MS
        const accel =
          (-SCRUB_K * (scrubPos - springTo) - SCRUB_C * scrubVel) / SCRUB_M
        scrubVel += accel * h
        scrubPos += scrubVel * h
      }
    }
    wasScrubbing = scrubbing
    // Sub-column precision: below this the seam cannot move a pixel anyway.
    const scrubSettling =
      !reduce &&
      (Math.abs(scrubPos - springTo) > 0.05 || Math.abs(scrubVel) > 0.05)
    if (scrubSettling) needsFill = true
    // Once parked at rest with nothing scrubbing, the split switches off so the
    // last column isn't left tinted.
    const scrubCol = scrubbing || scrubSettling ? scrubPos : -1
    // ------------------------------------------------------------------------

    // Live hover wins; the controlled markerIndex (e.g. a committed point)
    // is the fallback shown when nothing is hovered.
    const marker = s.hoverIndex != null ? s.hoverIndex : s.markerIndex
    const winkDue = !reduce && now - last >= 100
    // Repaint when a tweak-driven paint input changes (variant, stacking) so
    // the panel updates the fill live — without resetting the entrance reveal.
    // The scrub column is in the signature because the trail split is a paint
    // input: without it the fill would keep its colours while the seam moved.
    // Rounded, so it repaints per backing column rather than per sub-pixel step.
    const paintSig = `${s.stackType}|${s.configKeys
      .map((k) => s.seriesSpecs[k]?.variant ?? "")
      .join(",")}|${s.trailColor ? Math.round(scrubCol) : ""}`
    const sigChanged = paintSig !== lastPaintSig
    if (sigChanged) {
      lastPaintSig = paintSig
      needsFill = true
    }
    if (
      !(
        moving ||
        settling ||
        // The seam keeps easing after the pointer has left the chart, so the
        // loop has to stay awake until the spring has actually come to rest.
        scrubSettling ||
        winkDue ||
        marker != null ||
        progChanged ||
        sigChanged
      )
    )
      return
    if (progChanged) {
      lastProg = prog
      needsFill = true
    }
    if (winkDue) {
      last = now
      tick += 1
    }

    // Reveal front (left-to-right) — stars + crosshair stay behind it so
    // they don't float over the not-yet-drawn area during the entrance.
    const reveal = animate ? easeOutCubic(prog) : 1
    const revealCols = reveal * cols

    if (needsFill) {
      paintFill(intensity, reveal, scrubCol)
      needsFill = false
    }
    c.clearRect(0, 0, cols, rows)
    c.drawImage(off, 0, 0)

    // Rounded only here, at the point of drawing: one backing column is ~2 CSS
    // px, so the crosshair tracks the pointer smoothly rather than snapping.
    // Gated on `scrubbing`, not on the spring: the crosshair marks where the
    // pointer is, so it goes with the pointer instead of coasting to the edge
    // behind it — only the shade carries the follow-through.
    const mx = scrubbing && scrubPos >= 0 ? Math.round(scrubPos) : -1
    if (mx >= 0 && mx <= revealCols) {
      for (const key of s.configKeys) {
        const cur = current[key]
        if (!cur) continue
        const seed = s.seedOf(key)
        const my = Math.round(cur.top[mx] ?? 0)
        // Full-height column + a chunky marker block at the point — the
        // series colour at higher opacity, so it reads on either theme.
        c.fillStyle = rgb(seed.fill, 1, 0.55)
        for (let y = my; y < rows; y++) c.fillRect(mx, y, 1, 1)
        c.fillStyle = rgb(seed.fill)
        c.fillRect(mx - 1, my - 1, 3, 3)
      }
    }

    for (const star of stars.current) {
      const cur = current[star.key]
      if (!cur) continue
      const sx = Math.round(
        (star.xi / Math.max(s.dataLength - 1, 1)) * (cols - 1)
      )
      if (sx > revealCols) continue // behind the reveal front
      const top = cur.top[sx] ?? 0
      const floor = cur.floor[sx] ?? rows - 1
      const sy = Math.round(top + star.depth * (floor - top))
      const tw = reduce ? 0.85 : (Math.sin((tick + star.phase) * 0.35) + 1) / 2
      const lift = tw * (0.7 + 0.3 * intensity)
      if (lift < 0.55 || sy < 0 || sy >= rows) continue
      // Sparkles glint in the series colour via opacity (the `lift` wink)
      // rather than a lighter shade — so they never read as stray white
      // pixels on a light background.
      const starColor = s.seedOf(star.key).fill
      c.fillStyle = rgb(starColor, 1, lift)
      c.fillRect(sx, sy, 1, 1)
      // At the peak of a wink the star flares into a 4-point glint.
      if (tw > 0.9) {
        c.fillStyle = rgb(starColor, 1, lift * 0.6 * (tw - 0.9) * 10)
        c.fillRect(sx - 1, sy, 1, 1)
        c.fillRect(sx + 1, sy, 1, 1)
        c.fillRect(sx, sy - 1, 1, 1)
        c.fillRect(sx, sy + 1, 1, 1)
      }
    }
  }

  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

/**
 * Continuous dither canvas for area and line charts. Each series is reduced to a
 * `[top, floor]` band per backing column: areas fill from their value line down
 * to their floor; lines fill only a thin glow band hugging the line. The shared
 * {@link paintColumn} renders the ordered-dither scatter, capped by the bright
 * series line, with winking stars + scrub crosshair on top.
 */
export function CartesianCanvas() {
  const ctx = useChart()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)

  const { width, height } = ctx.plot
  const { cols, rows } = backingSize(width, height)
  const { ready, chartType, configKeys, bands, seriesSpecs, y, dataLength } = ctx

  // Memoized: the pricey bit in the render path — a `resample` per series to
  // the backing column count. The canvas re-renders on every hover/cursor tick
  // (it consumes ctx), so without this the whole surface is rebuilt each time.
  // Pinned to the exact ctx fields it reads, plus the backing geometry.
  const targets = useMemo(() => {
    const out: Record<string, Surface> = {}
    if (!ready) return out
    const h = height || 1
    const glow = Math.max(6, Math.round(rows * 0.16))
    const defaultKind = chartType === "line" ? "line" : "area"
    for (const key of configKeys) {
      const band = bands[key]
      if (!band) continue
      const line = (seriesSpecs[key]?.kind ?? defaultKind) === "line"
      const top = band.map((b) => (y(b[1]) / h) * (rows - 1))
      const floor = band.map((b, i) =>
        line ? Math.min(rows - 1, top[i] + glow) : (y(b[0]) / h) * (rows - 1)
      )
      out[key] = { top: resample(top, cols), floor: resample(floor, cols) }
    }
    return out
  }, [ready, chartType, configKeys, bands, seriesSpecs, y, height, rows, cols])

  // Memoized: the star field is deterministic — only its shape (series ×
  // column count) matters, so it need not be rebuilt on unrelated re-renders.
  const stars = useMemo(() => {
    const out: Star[] = []
    const per = Math.max(4, Math.round(cols / 14))
    configKeys.forEach((key, k) => {
      for (let i = 0; i < per; i++) {
        const seed = i * 67 + 13 + k * 131
        out.push({
          key,
          xi: seed % Math.max(dataLength, 1),
          depth: ((seed * 53 + 7) % 100) / 100,
          phase: (seed * 41) % 360,
        })
      }
    })
    return out
  }, [configKeys, dataLength, cols])

  // The RAF loop reads these through refs so it always sees the latest values
  // without re-subscribing. Refs are written in an effect (never during
  // render) — mutating a ref mid-render is a React anti-pattern that tears
  // under Strict Mode / concurrent rendering.
  const stateRef = useRef(ctx)
  const targetsRef = useRef(targets)
  const starsRef = useRef(stars)
  useEffect(() => {
    stateRef.current = ctx
    targetsRef.current = targets
    starsRef.current = stars
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return startCartesianLoop({
      canvas,
      bloomCanvas: bloomRef.current,
      cols,
      rows,
      state: stateRef,
      targets: targetsRef,
      stars: starsRef,
    })
  }, [cols, rows])

  const bloomActive = ctx.bloomOnHover
    ? ctx.isMouseInChart || ctx.hovered
    : true
  const bloom = bloomLayerStyle(ctx.bloom, bloomActive)
  const pos = {
    left: ctx.margins.left,
    top: ctx.margins.top,
    width,
    height,
  } as const

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{
          ...pos,
          imageRendering: "pixelated",
          // The rAF loop toggles `filter` when the surface starts and stops
          // moving; this transition is what makes it ramp rather than snap.
          transition: "filter 220ms cubic-bezier(0.17, 1, 0.32, 1)",
        }}
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
