import { motion, type HTMLMotionProps } from 'framer-motion'

type Props = HTMLMotionProps<'section'> & {
  /** Insights holds more than the frame can show at once and scrolls
   *  internally to reach the rest; Performance's content is sized (via its
   *  own clamps) to always fit, so it never needs to. Either way the sheet
   *  itself is a fixed box — it doesn't grow, shrink, or move. */
  scrollable?: boolean
}

/**
 * The shared shell for both Portfolio views (performance and insights) —
 * same radius, shadow, border, and padding, and — critically — the same
 * fixed sizing (80px clear above it, filling the rest of the frame below
 * that, plus 200px more), so the card is the exact same box in both views
 * and swapping one for the other under the sweep never moves or resizes it.
 * The 80px comes off the sheet's own height rather than its parent's, so it
 * stays self-contained here instead of leaking into the page wrapper.
 *
 * The extra 200px runs the sheet's bottom edge — rounded corners and all —
 * well past DeviceFrame's own clipping bounds, the same way DeviceFrame's
 * outer bezel has no bottom edge of its own. So it's the frame's rectangular
 * clip that ends the sheet, not the sheet's own corner radius: there's
 * nothing for a user to scroll or resize into that would ever reveal it.
 *
 * `shrink-0` is load-bearing: this is a flex item in a column flex parent,
 * and without it the flex algorithm shrinks the sheet right back down to fit
 * the parent — silently undoing the extra height regardless of what it's
 * set to.
 */
export function PortfolioSheet({ scrollable = false, ...props }: Props) {
  return (
    <motion.section
      {...props}
      className={`shadow-panel border-panel-ring font-figure mt-[80px] h-[calc(100%_+_120px)] w-full max-w-[748px] shrink-0 rounded-[40px] border bg-white px-5 pt-8 pb-[clamp(36px,5vh,56px)] font-semibold sm:px-[39px] sm:pt-[clamp(24px,4vh,39px)] ${
        scrollable ? 'scroll-hidden overflow-y-auto' : 'overflow-hidden'
      }`}
    />
  )
}
