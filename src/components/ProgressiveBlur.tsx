/**
 * Mirrors the Figma "Progressive Blur" frame (node 77:1717): 67px tall, a
 * PROGRESSIVE background blur of radius 10 whose ramp runs from `startOffset.y`
 * to `endOffset.y` in normalized node height.
 *
 * Two things make this non-obvious:
 *
 * 1. The ramp ends *below* the frame (endOffset 1.93), so the frame's bottom
 *    edge never reaches the full radius — it lands at
 *    `10 × (1 - 0.1154) / (1.9327 - 0.1154)` ≈ 4.87px. Using 10px would be
 *    roughly twice the intended strength.
 *
 * 2. Stacked backdrop-filters compound: blurring an already-blurred layer adds
 *    in quadrature, so N layers of radius r read as r·√N, not r. Each layer's
 *    radius is therefore solved as √(R(k+1)² − R(k)²) against the target ramp,
 *    which makes the cumulative blur at every depth land exactly on Figma's
 *    linear curve instead of overshooting it.
 */
const HEIGHT = 67
const MAX_RADIUS = 10
const RAMP_START = 0.11538461595773697 // startOffset.y — top stays fully sharp
const RAMP_END = 1.932692289352417 // endOffset.y
const COUNT = 10

/** Effective radius at the strip's bottom edge. */
const bottomRadius = (MAX_RADIUS * (1 - RAMP_START)) / (RAMP_END - RAMP_START)

/** Depth (fraction from the top) of ramp step k. */
const depthAt = (k: number) => RAMP_START + (1 - RAMP_START) * (k / COUNT)
/** Target cumulative radius at step k — Figma's ramp is linear in depth. */
const targetAt = (k: number) => (bottomRadius * k) / COUNT

const LAYERS = Array.from({ length: COUNT }, (_, k) => ({
  // Solved so the quadrature sum of layers 0..k equals targetAt(k + 1).
  blur: +Math.sqrt(targetAt(k + 1) ** 2 - targetAt(k) ** 2).toFixed(4),
  // Masks are expressed from the bottom, so depth inverts.
  from: +((1 - depthAt(k + 1)) * 100).toFixed(3),
  to: +((1 - depthAt(k)) * 100).toFixed(3),
}))

/** Smoothstep-shaped alpha ramp — a linear mask reads as an edge of its own. */
function bandMask(from: number, to: number) {
  const span = to - from
  const stops = [
    [0, 1],
    [0.25, 0.89],
    [0.5, 0.5],
    [0.75, 0.11],
    [1, 0],
  ] as const

  const parts = stops.map(
    ([t, alpha]) => `rgba(0,0,0,${alpha}) ${(from + span * t).toFixed(3)}%`,
  )
  return `linear-gradient(to top, ${parts.join(', ')})`
}

export function ProgressiveBlur() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      // Figma fills the frame with black at 0.8% — near-invisible, but it is
      // part of the spec.
      style={{ height: HEIGHT, backgroundColor: 'rgba(0,0,0,0.01)' }}
    >
      {LAYERS.map((layer, i) => {
        const mask = bandMask(layer.from, layer.to)
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
