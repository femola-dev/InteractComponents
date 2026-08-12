import type { CSSProperties } from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion'
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * The spring each digit column rolls on. This is the only animation in the
 * component: the columns *are* the morph, so there is no second spring on the
 * value itself to chase (two coupled springs read as mush, and driving the
 * display value through React state re-rendered every column every frame).
 *
 * These are `springResponsive` from src/lib/motion — the house spring whose own
 * doc names counters as a use. Copied as fields rather than imported because
 * `useSpring` takes `SpringOptions`, and the token is a `Transition` carrying a
 * `type: 'spring'` that does not belong here; keep the two in step by hand.
 *
 * `restDelta` is in the strip's own units, which are percent of a ten-cell
 * strip: 0.01 is a hundredth of a percent, roughly a thousandth of one digit's
 * travel — well under a pixel at any size this is set at.
 */
const DIGIT_SPRING = {
  stiffness: 400,
  damping: 30,
  mass: 0.8,
  restDelta: 0.01,
}

/**
 * How fast the strip must travel before it blurs at all, in strip-percent per
 * second. Tuned to the spring above: one digit of travel peaks around 80, a
 * full 9→0 rewind an order of magnitude past that — so a single tick gets a
 * suggestion of blur and only the long hauls saturate.
 */
const BLUR_VELOCITY = 200

/** House blur ceiling. Past ~2px the digits stop reading as digits. */
const BLUR_MAX = 2

/**
 * Seconds of head start per place, ones leading — the lag that makes a row of
 * columns read as one odometer rather than ten independent springs.
 *
 * Scaled with the spring: it is a fraction of the roll, not a fixed pause, so a
 * spring ~1.7× faster than the old one wants a stagger ~1.7× tighter or the
 * tail of the figure is still settling long after the head has landed.
 */
const DIGIT_STAGGER = 0.007

/**
 * Splitting a number into per-character boxes drops the kerning and shaping the
 * font applies across adjacent glyphs, so the strip renders wider than the same
 * string as text.
 *
 * Rather than model which part of that is kerning, measure both ends against the
 * live type: the string as the design sets it, and the sum of its characters
 * boxed individually. The difference spread over the boxes is the correction —
 * exact by construction, and it re-derives itself if the type ever changes.
 *
 * "The string as the design sets it" is the *skeleton* — every digit as a `0` —
 * not the current value. Open Runde has no `tnum` table, so its digits stay
 * proportional however the CSS asks for tabular figures (see below), and
 * measuring the live value would fold "this reading happens to be full of 1s"
 * into the correction: the figure would squeeze and re-space as it rolled.
 * All-zeros is what the boxes actually occupy, so the offset is pure kerning
 * plus tracking and holds for every value of the same shape.
 */
function useFitOffset(text: string, tracking: string, host: HTMLElement | null) {
  const [offset, setOffset] = useState(0)

  const skeleton = [...text]
    .map((char) => (DIGITS.includes(char) ? '0' : char))
    .join('')

  useLayoutEffect(() => {
    if (!host || skeleton.length === 0) return

    const cs = getComputedStyle(host)
    const probe = (content: string, letterSpacing: string) => {
      const el = document.createElement('span')
      el.textContent = content
      Object.assign(el.style, {
        font: cs.font,
        fontFeatureSettings: cs.fontFeatureSettings,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing,
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: 'pre',
        pointerEvents: 'none',
      })
      host.appendChild(el)
      const width = el.getBoundingClientRect().width
      el.remove()
      return width
    }

    // Target: the whole skeleton, kerned, with the design's tracking.
    const target = probe(skeleton, tracking)
    // What the boxes actually occupy: each character measured alone, unspaced.
    // Digits are already zeros here, which is what the columns size themselves
    // from.
    const boxed = [...skeleton].reduce(
      (sum, char) => sum + probe(char, 'normal'),
      0,
    )

    setOffset((target - boxed) / skeleton.length)
    // Keyed on the skeleton, not the value: every string of the same shape
    // measures the same, so scrubbing doesn't re-measure.
  }, [skeleton, tracking, host])

  return offset
}

/**
 * One cell of the 0–9 strip, faded by how far the strip is from showing it.
 *
 * This is the morph. Without it the window is a filmstrip: ten fully-inked
 * glyphs scrolling past a slot, which at the house spring's speed reads as
 * mechanical churn. Fading everything but the two digits the strip currently
 * straddles turns the same travel into a cross-dissolve — 4→7 becomes a 4
 * dissolving into a 7 through the glyphs between, rather than a reel of them.
 *
 * Linear in distance, so the two live cells' opacities always sum to 1 and the
 * column holds a constant amount of ink. At rest the distance is an exact
 * integer: one cell at 1, the other nine at 0, and the figure is crisp.
 *
 * Its own component for the rules of hooks — one `useTransform` per cell.
 */
function DigitCell({
  digit,
  position,
}: {
  digit: number
  /** The strip's live position in digits — 2.5 is halfway from a 2 to a 3. */
  position: MotionValue<number>
}) {
  const opacity = useTransform(position, (p) =>
    Math.max(0, 1 - Math.abs(p - digit)),
  )

  return (
    <motion.span className="block" style={{ height: '1lh', opacity }}>
      {DIGITS[digit]}
    </motion.span>
  )
}

/**
 * One digit's clipped window with the 0–9 strip rolling behind it.
 *
 * Its own component because of the rules of hooks — the strip needs a spring per
 * column, and columns are produced in a `.map`.
 *
 * The strip is positioned as a **percentage** rather than in `lh`: it is ten
 * 1lh cells, so one digit is exactly 10%, and a numeric motion value is what
 * `useVelocity` needs (a `"…lh"` string can't be differentiated).
 *
 * Blur comes off that velocity, which gives motion blur for free and, more
 * usefully, makes it proportional to how far the digit actually travels — a
 * one-step tick barely blurs, a 9→0 rewind smears and lands crisp. Capped at 2px
 * to stay in the house blur family and well under the cost ceiling.
 *
 * Blur and the cells' cross-dissolve ({@link DigitCell}) are the two halves of
 * the morph, and both are driven off the same spring: the blur softens the
 * edges, the dissolve keeps only the glyphs being travelled between inked. One
 * without the other is either a crisp filmstrip or a ghost with hard edges.
 *
 * The strip is centred in the box because this is a *synthesised* tabular
 * figure: the box is a `0` wide and Open Runde's digits are not, so a left-set
 * `1` would sit against the previous digit with its slack trailing. A real
 * tabular font centres each glyph in the shared advance; this does the same.
 */
function DigitColumn({
  digit,
  delay,
  boxStyle,
}: {
  digit: number
  delay: number
  boxStyle: CSSProperties
}) {
  const reducedMotion = useReducedMotion()

  const target = -digit * 10
  const y = useSpring(target, DIGIT_SPRING)
  const velocity = useVelocity(y)

  const translate = useTransform(y, (v) => `${v}%`)
  // Back out of percent into digits, which is what the cells fade against.
  const position = useTransform(y, (v) => -v / 10)
  const filter = useTransform(velocity, (v) =>
    reducedMotion
      ? 'blur(0px)'
      : `blur(${Math.min(Math.abs(v) / BLUR_VELOCITY, BLUR_MAX).toFixed(2)}px)`,
  )

  useEffect(() => {
    if (reducedMotion) {
      y.jump(target)
      return
    }
    // `useSpring` has no delay option, so the stagger is a timer. Ones place
    // leads, higher places follow — natural odometer.
    const timer = setTimeout(() => y.set(target), delay * 1000)
    return () => clearTimeout(timer)
  }, [target, delay, y, reducedMotion])

  return (
    <span
      aria-hidden="true"
      className="relative inline-block overflow-hidden"
      style={boxStyle}
    >
      <span className="invisible">0</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col text-center will-change-transform"
        style={{ y: translate, filter }}
      >
        {DIGITS.map((d, i) => (
          <DigitCell key={d} digit={i} position={position} />
        ))}
      </motion.span>
    </span>
  )
}

/**
 * Odometer figures: each digit sits in a clipped column and the 0–9 strip rolls
 * to the one being shown, staggered so the ones place leads. See
 * {@link DigitColumn} for the roll and its velocity-derived blur, and
 * {@link DigitCell} for the cross-dissolve that keeps it from reading as a
 * filmstrip.
 *
 * React renders here once per value change, not once per animation frame — the
 * springs live in motion values, so scrubbing the chart that drives this doesn't
 * reconcile a hundred elements per frame against the canvas's own rAF loop.
 *
 * What keeps the columns from drifting as the digits change:
 *
 * - Tabular figures — but **synthesised**, not asked for. Open Runde ships no
 *   `tnum` table (its GSUB is aalt/case/frac/locl/ordn/zero), so the
 *   `tabular-nums` class below is inert on the sheet's own type and its digits
 *   keep their proportional advances: a `1` is 0.19em narrower than a `0`,
 *   ~6px at the design's 32px. Every box is therefore sized to a `0` and its
 *   glyph centred inside, which is what a tabular font would have done. The
 *   class stays for the `system-ui` fallback, which mostly does have `tnum`.
 * - Columns are keyed from the **right**. The value crosses digit counts
 *   ($9,900 → $10,100), and keying from the left would renumber every column at
 *   that point, rolling digits that never actually changed.
 * - Each column sizes itself from an invisible `0` rather than `1ch`: `ch` is the
 *   advance of a *plain* zero, and the sheet turns on the slashed `zero` feature,
 *   whose advance differs.
 * - `tracking` comes in as a margin, not letter-spacing. Chrome does not apply
 *   letter-spacing between atomic inlines, so a column strip set as inline-blocks
 *   renders wider than the same string set as text unless the caller's tracking
 *   is re-applied per box.
 *
 * Heights are in `lh` so the strip inherits whatever line-height the caller sets
 * — the caller owns the type, this owns the motion. Every character, separators
 * and prefix included, gets the same clipped 1lh box: `overflow: hidden` moves an
 * inline-block's baseline to its bottom edge, and mixing trimmed and untrimmed
 * boxes would set the commas at a different height from the digits.
 *
 * Per-digit boxes give up cross-digit kerning — the pairs the font would
 * normally tighten are now separate boxes — so the figure sits a little wider
 * than the same string as static text.
 */
export function RollingNumber({
  value,
  prefix,
  className,
  tracking = '0px',
}: {
  value: number
  /** Rendered in the same flow, unanimated — the design sets the amount and its
   *  currency mark as one text node. */
  prefix?: string
  className?: string
  /** The caller's letter-spacing, re-applied per box. See above. */
  tracking?: string
}) {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const chars = [...(prefix ?? ''), ...formatted]

  const [host, setHost] = useState<HTMLSpanElement | null>(null)
  const fit = useFitOffset(chars.join(''), tracking, host)

  /** Every box: same clipped 1lh, no inherited spacing, and the measured
   *  correction as its margin — see useFitOffset. */
  const box = {
    height: '1lh',
    letterSpacing: 'normal',
    marginRight: `${fit.toFixed(3)}px`,
  } as const

  return (
    <span
      ref={setHost}
      className={`tabular-nums ${className ?? ''}`}
      // The rolling strip is decorative; screen readers get the plain figure.
      role="text"
      aria-label={`${prefix ?? ''}${formatted}`}
    >
      {chars.map((char, i) => {
        const fromRight = chars.length - 1 - i
        const digit = DIGITS.indexOf(char)

        if (digit < 0) {
          return (
            <span
              key={`sep-${fromRight}`}
              aria-hidden="true"
              className="inline-block overflow-hidden"
              style={box}
            >
              {char}
            </span>
          )
        }

        return (
          <DigitColumn
            key={`digit-${fromRight}`}
            digit={digit}
            delay={fromRight * DIGIT_STAGGER}
            boxStyle={box}
          />
        )
      })}
    </span>
  )
}
