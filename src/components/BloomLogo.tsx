import type { CSSProperties } from 'react'
import { cn } from '../lib/utils'
import logoBase from '../assets/icons/get-started/logo-base.svg'
import logoNoise from '../assets/icons/get-started/logo-noise.svg'
import logoPetal from '../assets/icons/get-started/logo-periwinkle.svg'

/**
 * The Bloom mark — Figma node 344:4992, and the same component again three
 * times over in the card's badge cluster (344:5178, 344:5182, 344:5186).
 *
 * Three stacked layers, which is how the file draws it:
 *
 *   1. a rounded square filled with a blue vertical gradient,
 *   2. the same square again in yellow at 5% under `mix-blend-mode: overlay`,
 *      which is what warms the blue rather than tinting it, and
 *   3. the "Periwinkle" flower, rotated.
 *
 * Only the flower's angle differs between instances: 29.03° in the rail and on
 * the largest badge, 42.49° and 55.22° on the two small ones.
 *
 * The geometry below replaces what Figma exports for a rotated child, which is
 * a `container-type: size` box sized with `hypot()` against `cqw`/`cqh` units.
 * That form is exact but opaque, and it re-derives the same two numbers at every
 * size. Solving it once instead: Figma gives the flower's *rotated bounding box*
 * as an inset, so with W and H the inset's width and height,
 *
 *     W = w·|cos θ| + h·|sin θ|      H = w·|sin θ| + h·|cos θ|
 *
 * inverts to the unrotated w and h. Doing that for all four instances lands on
 * the same pair of ratios — 0.6666 and 0.6440 of the mark — and on the same
 * centre, 48.64% / 48.35%, very slightly up and to the left of the square's own.
 * So the flower is one shape at one relative size, and `angle` is genuinely the
 * only thing that varies.
 */

/** The flower's unrotated box, as a fraction of the mark. */
const PETAL = { width: 0.6666, height: 0.644 }

/** Where the flower's centre sits in the mark, as a fraction of it. */
const PETAL_CENTER = { x: 0.4864, y: 0.4835 }

/**
 * The flower's own drop shadow, baked into its artboard the way the tile discs'
 * are. The exported SVG is 1.19× the shape horizontally and vertically, so it
 * has to hang outside the box or the shadow crops.
 */
const PETAL_BLEED = { x: '-9.5%', y: '-9.84%' }

export type Spin = {
  /** Seconds per full revolution. */
  seconds: number
  /** 1 turns clockwise, -1 counter-clockwise. */
  direction: 1 | -1
}

export function BloomLogo({
  size,
  angle = 29.03,
  spin,
  className,
  style,
}: {
  size: number
  /** Counter-clockwise, in degrees, as the file measures it. */
  angle?: number
  /** Turns the flower — and only the flower. Omit to leave it at rest. */
  spin?: Spin
  className?: string
  /** Placement. Kept as a style rather than a class so callers can pass the
   *  file's fractional offsets (7.384px, 16.258px) without minting arbitrary
   *  Tailwind values for each one. */
  style?: CSSProperties
}) {
  const width = size * PETAL.width
  const height = size * PETAL.height
  const base = -angle

  return (
    /* Merged rather than concatenated, and the size stays inline because it is
       fractional. The position has to be a *class* so a caller can override it:
       the badge cluster places all three of these with `absolute`, and an inline
       `position: relative` here would beat that class outright and drop them
       back into the flow. */
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width: size, height: size, ...style }}
    >
      <img src={logoBase} alt="" aria-hidden className="absolute inset-0 size-full" />
      <img
        src={logoNoise}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full mix-blend-overlay"
      />
      {/* Two nested boxes, because the flower carries two rotations that must
          not share an element: the outer one holds the angle the file draws it
          at, the inner one turns.

          The turn is a CSS keyframe animation and not a Framer one, and this is
          the second time that distinction has bitten this page. Framer's
          `repeat: Infinity` never started here, because this cluster renders
          inside `AnimatePresence initial={false}` — which mounts descendants
          straight at their `animate` values without running a transition, so the
          loop had nothing to kick it off.

          That it worked in dev and not in production is `StrictMode`: React
          double-mounts in development, and the second mount is no longer the
          presence context's *initial* render, so the animation ran. Production
          mounts once, the suppression stands, and the gears sit still. A
          keyframe animation is outside presence entirely and cannot be
          suppressed by it — and it runs on the compositor rather than through
          JS, which for three elements turning forever is where it belongs. */}
      <div
        className="absolute"
        style={{
          width,
          height,
          left: size * PETAL_CENTER.x - width / 2,
          top: size * PETAL_CENTER.y - height / 2,
          transform: `rotate(${base}deg)`,
        }}
      >
        <div
          className={`relative size-full ${spin ? 'animate-spin motion-reduce:animate-none' : ''}`}
          style={
            spin
              ? {
                  animationDuration: `${spin.seconds}s`,
                  animationTimingFunction: 'linear',
                  // Tailwind's `spin` keyframes run clockwise; a counter-rotating
                  // gear plays the same keyframes backwards.
                  animationDirection: spin.direction === -1 ? 'reverse' : 'normal',
                }
              : undefined
          }
        >
        {/* The bleed is carried by a box rather than by the image's own
            offsets: an absolutely positioned replaced element with all four
            offsets set still resolves `width: auto` to its intrinsic size, so
            it would sit at 15.87px whatever the mark's size. Stretching a plain
            div and letting the image fill it is the shape Figma exports too. */}
        <div
          className="absolute"
          style={{
            top: PETAL_BLEED.y,
            bottom: PETAL_BLEED.y,
            left: PETAL_BLEED.x,
            right: PETAL_BLEED.x,
          }}
        >
          <img src={logoPetal} alt="" aria-hidden className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
