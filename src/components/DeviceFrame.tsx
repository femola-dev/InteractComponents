import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SweepCanvas } from './sweep'

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      // An explicit height rather than `flex-1`: the inner reading pane can only
      // scroll if its ancestors resolve to a definite height, and the parent is
      // now min-height-only so the page can grow. `min-h-frame-floor` then wins
      // once the viewport is too short to read in — the frame stops shrinking
      // and the page scrolls instead of the article squeezing to nothing.
      // svh, not dvh, so the frame doesn't resize as mobile browser chrome hides.
      className="flex h-svh min-h-frame-floor w-full justify-center px-3 pt-6 sm:px-6 sm:pt-frame-top"
    >
      {/* Outer bezel ring */}
      <div className="relative flex min-h-0 w-full max-w-[1156px] rounded-t-[40px] border-[1.5px] border-b-0 border-hairline p-[7px] sm:rounded-t-[45px]">
        {/* Inner screen */}
        <div className="relative flex min-h-0 w-full overflow-hidden rounded-t-[34px] border-[1.5px] border-b-0 border-hairline bg-white sm:rounded-t-[39px]">
          {/* Notch: dynamic-island pill on mobile, webcam bar on desktop */}
          <div className="absolute top-0 left-1/2 z-20 h-[22px] w-[110px] -translate-x-1/2 rounded-b-[13px] border-[1.5px] border-t-0 border-hairline sm:w-[142px]" />
          {children}
          {/* Sits inside the screen's overflow-hidden so the sweep is clipped
              to the mockup rather than the browser window. */}
          <SweepCanvas />
        </div>
      </div>
    </motion.div>
  )
}
