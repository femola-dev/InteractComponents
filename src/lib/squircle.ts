/**
 * Figma's corner smoothing, as an SVG path.
 *
 * CSS cannot express this. `border-radius` draws a circular arc, and
 * `corner-shape: superellipse()` — the one property that varies the curve —
 * varies it *inside* the radius box, pulling the outline toward the corner
 * point. Figma's smoothing does the opposite: it keeps the arc's curvature at
 * the apex and extends the curve outward along both edges, so a smoothed corner
 * occupies more of the edge than an unsmoothed one of the same radius. Those
 * are different shapes, and at 60% the difference is visible — the smoothed
 * corner reads as *rounder*, which is the whole point of it.
 *
 * The construction is the one from Figma's own write-up, "Desperately seeking
 * squircles". Each corner is three pieces, mirrored about its diagonal:
 *
 *   1. a cubic that leaves the straight edge with zero curvature,
 *   2. a circular arc of the original radius across the apex,
 *   3. the mirror of (1), rejoining the next edge.
 *
 * The arc is what keeps the corner recognisably a 12px radius; the cubics are
 * the smoothing. Smoothing `s` sets how much of the 90° the arc still covers —
 * `90 × (1 − s)`, so 60% leaves a 36° arc and hands the other 54° to the
 * cubics — and how far the corner reaches along each edge: `p = (1 + s) × R`.
 * At R=12, s=0.6 that is 19.2px per corner, against 12px unsmoothed.
 */

type SquircleSpec = {
  width: number
  height: number
  /** Corner radius in px, as set in Figma. */
  radius: number
  /** Figma's corner smoothing, 0–1 (its UI shows this as a percentage). */
  smoothing: number
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/**
 * The four control lengths one corner is built from, in the order they are
 * consumed along the edge: `a` and `b` split the run-up cubic's handles, `c`
 * and `d` place its end point where the arc begins.
 *
 * `p` is the corner's full reach along the edge. Two corners share each side,
 * so neither may take more than half of the shorter dimension — past that the
 * opposing corners would cross and the path would fold over itself. Clamping
 * `p` also clamps the smoothing that can actually be delivered, which is why
 * the arc is measured from the clamped value rather than from the argument.
 */
function cornerParams(radius: number, smoothing: number, budget: number) {
  const p = Math.min((1 + smoothing) * radius, budget)

  // What the clamp above left us. Un-clamped this is just `smoothing`.
  const effective = Math.min(smoothing, budget / radius - 1)

  const arcMeasure = 90 * (1 - effective)
  const arcSectionLength =
    Math.sin(toRadians(arcMeasure / 2)) * radius * Math.SQRT2

  // The angle the cubic has to turn through before the arc picks up, split
  // between the two symmetric halves of the corner.
  const angleAlpha = (90 - arcMeasure) / 2
  const angleBeta = 45 * effective

  const p3ToP4 = radius * Math.tan(toRadians(angleAlpha / 2))
  const c = p3ToP4 * Math.cos(toRadians(angleBeta))
  const d = c * Math.tan(toRadians(angleBeta))

  // Whatever reach is left over after the arc and the cubic's tail is the
  // straight-ish run-up, split 2:1 across the two handles — that ratio is what
  // makes curvature leave the edge at zero rather than stepping.
  const b = (p - arcSectionLength - c - d) / 3
  const a = 2 * b

  return { a, b, c, d, p, arcSectionLength, radius }
}

/**
 * A closed path for a `width × height` box with all four corners smoothed
 * equally. Drawn clockwise from the top edge, in absolute user units — pair it
 * with a `viewBox` of the same size.
 */
export function squirclePath({
  width,
  height,
  radius,
  smoothing,
}: SquircleSpec): string {
  // A radius past half the short side has no room for an arc at all.
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
  if (r === 0) return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`

  const { a, b, c, d, p, arcSectionLength } = cornerParams(
    r,
    Math.max(0, Math.min(smoothing, 1)),
    Math.min(width, height) / 2,
  )

  const arc = `a ${r} ${r} 0 0 1`

  return [
    `M ${width - p} 0`,
    // Top-right.
    `c ${a} 0 ${a + b} 0 ${a + b + c} ${d}`,
    `${arc} ${arcSectionLength} ${arcSectionLength}`,
    `c ${d} ${c} ${d} ${b + c} ${d} ${a + b + c}`,
    `L ${width} ${height - p}`,
    // Bottom-right.
    `c 0 ${a} 0 ${a + b} ${-d} ${a + b + c}`,
    `${arc} ${-arcSectionLength} ${arcSectionLength}`,
    `c ${-c} ${d} ${-(b + c)} ${d} ${-(a + b + c)} ${d}`,
    `L ${p} ${height}`,
    // Bottom-left.
    `c ${-a} 0 ${-(a + b)} 0 ${-(a + b + c)} ${-d}`,
    `${arc} ${-arcSectionLength} ${-arcSectionLength}`,
    `c ${-d} ${-c} ${-d} ${-(b + c)} ${-d} ${-(a + b + c)}`,
    `L 0 ${p}`,
    // Top-left.
    `c 0 ${-a} 0 ${-(a + b)} ${d} ${-(a + b + c)}`,
    `${arc} ${arcSectionLength} ${-arcSectionLength}`,
    `c ${c} ${-d} ${b + c} ${-d} ${a + b + c} ${-d}`,
    'Z',
  ].join(' ')
}
