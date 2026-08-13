import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  /**
   * Fills the device behind its children, clipped to the 60px corner. A node
   * rather than a src: the backdrop is not always one static image — a page
   * may cross-fade or blur its own layers into this slot — and the frame has
   * no business knowing which. It only owns the box they fill.
   */
  backdrop?: ReactNode
  children: ReactNode
}

/**
 * Portrait phone shell — the mirror image of `DeviceFrame`.
 *
 * `DeviceFrame` shows the *top* of a device and lets it bleed off the bottom of
 * the viewport (`rounded-t`, `border-b-0`). This design does the opposite: the
 * phone is 1426px tall on a 1024px artboard, positioned at y=-471, so its top —
 * dynamic island included — sits above the fold and only the bottom is on
 * screen. Hence `rounded-b` / `border-t-0`, and no island: it isn't visible in
 * this frame, so rendering one would invent chrome the design doesn't show.
 *
 * The Figma bottom edge lands at y=956 of the 1024 artboard, leaving 68px of
 * white beneath the phone. That gap is kept rather than trimmed — it is exactly
 * where the floating PlaygroundSwitcher sits, so the control bar underneath the
 * children stays clear of it instead of being overlaid.
 *
 * No horizontal padding: the design insets the panel by 40px but the control
 * bar by 24px, so the children own their own gutters.
 *
 * svh, not dvh, so the frame doesn't resize as mobile browser chrome hides.
 */

/**
 * The gap between the screen and the bezel ring around it, and the two corner
 * radii that gap has to keep concentric.
 *
 * The design nests two device masks: the screen at 680 wide on a 52px corner,
 * and "Most Most outer device mask" at 696 on a 60px one — 8px further out on
 * every side, which is exactly the difference between the radii. That is what
 * makes the ring look machined rather than drawn: a constant-width gap all the
 * way round, instead of a band that pinches at the corners.
 */
const BEZEL = 8
const SCREEN_RADIUS = 52
const BEZEL_RADIUS = SCREEN_RADIUS + BEZEL
export function MobileFrame({ backdrop, children }: Props) {
  // The device fills the viewport exactly, so anything that makes the document
  // even slightly taller — a dev overlay, a mobile URL bar collapsing and
  // handing back the difference between svh and lvh — turns into a scroll that
  // drags the entire layout with it. Nothing here is meant to scroll, so the
  // document is pinned for as long as this frame owns the screen.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      // Capped rather than fixed at 1100. A hard height would overflow a
      // shorter viewport, and with the document pinned there would be no way to
      // scroll to what fell off — so it holds 1100 where there is room and
      // yields below it, the same bargain the spacing tokens make.
      className="flex h-[min(100svh,1100px)] w-full justify-center px-3 pb-[68px]"
    >
      {/* `min-h-0` so the panel — the only flexible child — absorbs the loss on
          a short viewport instead of pushing the control bar off screen. */}
      <div className="relative flex min-h-0 w-full max-w-[680px] flex-col">
        {/* The screen. It carries the clip and no stroke of its own: the design
            moved the device's one outline out to the ring below, so an edge
            here as well would draw a second, tighter phone inside the first. */}
        <div
          className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-hidden pb-6"
          style={{
            borderBottomLeftRadius: SCREEN_RADIUS,
            borderBottomRightRadius: SCREEN_RADIUS,
          }}
        >
          {backdrop && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {backdrop}
            </div>
          )}

          {children}

          {/* Home indicator, floated in the 23px strip below the control bar. */}
          <div className="bg-edge absolute bottom-[8px] left-1/2 h-[5px] w-[144px] -translate-x-1/2 rounded-[100px]" />
        </div>

        {/* The bezel ring, drawn outside the screen rather than on it.
            A sibling and not a child, because the screen clips — anything
            inside it can only ever be drawn on the edge, never beyond it.
            `border-t-0` for the same reason the screen has no top corner: the
            device's top is above the fold, so the ring is two rails running off
            the top of the frame and a rounded foot at the bottom.
            It hangs 8px into the 68px strip below the phone. That is the
            design's own overhang and there is room for it — the strip is where
            the floating PlaygroundSwitcher sits, and it keeps the other 60. */}
        <div
          aria-hidden="true"
          className="border-edge pointer-events-none absolute top-0 border-[1.5px] border-t-0"
          style={{
            left: -BEZEL,
            right: -BEZEL,
            bottom: -BEZEL,
            borderBottomLeftRadius: BEZEL_RADIUS,
            borderBottomRightRadius: BEZEL_RADIUS,
          }}
        />
      </div>
    </motion.div>
  )
}
