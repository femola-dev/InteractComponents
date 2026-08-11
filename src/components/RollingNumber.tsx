import type { CSSProperties } from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * The spring each digit column rolls on. This is the only animation in the
 * component: the columns *are* the morph, so there is no second spring on the
 * value itself to chase (two coupled springs read as mush, and driving the
 * display value through React state re-rendered every column every frame).
 */
const DIGIT_SPRING = {
  stiffness: 160,
  damping: 26,
  mass: 0.9,
}

/**
 * Splitting a number into per-character boxes drops the kerning and shaping the
 * font applies across adjacent glyphs, so the strip renders wider than the same
 * string as text.
 *
 * Rather than model which part of that is kerning, measure both ends against the
 * live type: the string as the design sets it, and the sum of its characters
 * boxed individually. The difference spread over the boxes is the correction —
 * exact by construction, and it re-derives itself if the type ever changes.
 */
function useFitOffset(text: string, tracking: string, host: HTMLElement | null) {
  const [offset, setOffset] = useState(0)

  useLayoutEffect(() => {
    if (!host || text.length === 0) return

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

    // Target: the whole string, kerned, with the design's tracking.
    const target = probe(text, tracking)
    // What the boxes actually occupy: each character measured alone, unspaced.
    // Digits all measure as `0` under tabular figures, which is what the columns
    // size themselves from.
    const boxed = [...text].reduce(
      (sum, char) => sum + probe(DIGITS.includes(char) ? '0' : char, 'normal'),
      0,
    )

    setOffset((target - boxed) / text.length)
    // Keyed on length, not the value: with tabular figures every string of the
    // same shape measures the same, so scrubbing doesn't re-measure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.length, tracking, host])

  return offset
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
  const y = useSpring(target, { ...DIGIT_SPRING, restDelta: 0.01 })
  const velocity = useVelocity(y)

  const translate = useTransform(y, (v) => `${v}%`)
  const filter = useTransform(velocity, (v) =>
    reducedMotion
      ? 'blur(0px)'
      : `blur(${Math.min(Math.abs(v) / 250, 2).toFixed(2)}px)`,
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
        className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
        style={{ y: translate, filter }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="block" style={{ height: '1lh' }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

/**
 * Odometer figures: each digit sits in a clipped column and the 0–9 strip rolls
 * to the one being shown, staggered so the ones place leads. See
 * {@link DigitColumn} for the roll itself and its velocity-derived blur.
 *
 * React renders here once per value change, not once per animation frame — the
 * springs live in motion values, so scrubbing the chart that drives this doesn't
 * reconcile a hundred elements per frame against the canvas's own rAF loop.
 *
 * What keeps the columns from drifting as the digits change:
 *
 * - `tabular-nums`, so a 1 occupies the same width as a 0.
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
            delay={fromRight * 0.012}
            boxStyle={box}
          />
        )
      })}
    </span>
  )
}
