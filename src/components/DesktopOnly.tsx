import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeBlurIn, transitionSmooth } from '../lib/motion'

import iconPhone from '../assets/icons/icon-phone.svg'
import avatarFemolaaa from '../assets/images/femolaaa.png'

/**
 * Narrowest viewport the playgrounds are built for.
 *
 * Not an arbitrary phone/tablet line: `DeviceFrame` renders a desktop mockup
 * that maxes out at 1156px, and several playgrounds hang real affordances off
 * hover (the switcher's morph, the minimap, the pie tooltip). Below about this
 * width the frame stops reading as a monitor and the hover-only paths become
 * unreachable, so the honest thing is to say so rather than reflow into a
 * layout nobody designed.
 */
const MIN_WIDTH = 1024

const QUERY = `(min-width: ${MIN_WIDTH}px)`

/**
 * True when the viewport is wide enough for the playgrounds.
 *
 * Read once during the initial state so the first paint is already correct —
 * a mobile visitor should never see a frame of the desktop mockup before the
 * notice replaces it — then kept live via a listener, so resizing a desktop
 * window narrow crosses into the notice and back out again.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window === 'undefined' || window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = () => setIsDesktop(mql.matches)
    // Sync once on mount as well: between the state initialiser and this effect
    // the viewport can already have changed (orientation, chrome collapsing).
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

/**
 * Renders `children` on a desktop-width viewport, and a plain explanatory
 * screen everywhere else. Wrap the whole app in it.
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop()
  return isDesktop ? <>{children}</> : <SmallScreenNotice />
}

/**
 * The phone the notice is drawn inside (Figma 332:4551) — outline, dynamic
 * island, and the fade that dissolves the outline before the bottom edge.
 *
 * Every measurement is a fraction of the artboard *width*, not height. The
 * frame composes a 680.66px phone on a 730px column, so the ratios below are
 * that column read as the viewport: 93.24% wide, a 15.34% corner, an island
 * 24.77% across. Scaling by width keeps the device square with itself at any
 * aspect ratio — driving the corner radius off height would oval it on a phone
 * and flatten it on a tablet. Each one caps at the design's own px value, so
 * above a 730px viewport the mockup stops growing and centers, exactly as it
 * sits on the 1440px artboard.
 *
 * The phone is 210% of its own width tall and deliberately overflows the
 * bottom; `overflow-hidden` on the parent crops it rather than scrolling.
 *
 * The one thing not taken proportionally is the fade. In the frame it is a
 * fixed 233px band that leaves a sliver of outline visible below it — an
 * artifact of a 730×1024 artboard, and on a 390×844 phone the same fractions
 * would put it two-thirds up the screen with 300px of outline re-emerging
 * underneath. Anchored to the bottom of the viewport instead, the outline
 * dissolves once and stays gone, which is what the band is for. Stops are the
 * design's exactly.
 */
function PhoneMockup() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 -translate-x-1/2 border-[1.5px] border-solid border-[#ccc]"
        style={{
          top: 'min(10.27vw, 75px)',
          width: 'min(93.24vw, 680.66px)',
          height: 'min(195.75vw, 1429px)',
          borderRadius: 'min(15.34vw, 112px)',
        }}
      >
        {/* Centered, unlike the frame's 3.9px offset — on a device mockup that
            reads as a mistake rather than as intent. */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full border-[1.5px] border-solid border-[#ccc]"
          style={{
            top: 'min(5.76vw, 42.06px)',
            width: 'min(24.77vw, 180.8px)',
            height: 'min(7.09vw, 51.73px)',
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[30vh]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, rgb(255,255,255) 0%, rgba(255,255,255,0.98) 14%, rgba(255,255,255,0.92) 27%, rgba(255,255,255,0.82) 39%, rgba(255,255,255,0.67) 50%, rgba(255,255,255,0.5) 61%, rgba(255,255,255,0.32) 72%, rgba(255,255,255,0.17) 82%, rgba(255,255,255,0.06) 92%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  )
}

/**
 * The notice itself (Figma 332:4549). Deliberately the plainest surface in the
 * app — no bezel, no sweep, no sound — because it is the one screen that has to
 * work on a device none of the rest was drawn for.
 *
 * The frame is drawn at 539px of content inside an oversized phone mockup, so
 * every size here is fluid rather than fixed: each `clamp()` caps at the
 * design's own value and scales down by viewport width below it. The gate opens
 * under 1024px, so that range has to cover a 320px phone and a narrow desktop
 * window with one set of numbers.
 *
 * The body copy stays at a flat 14px. It is the one measurement in the frame
 * already sized for a phone, and scaling it down with everything else would buy
 * proportion at the cost of legibility — the opposite of the point.
 */
function SmallScreenNotice() {
  // Same bargain `MobileFrame` makes: the notice fills the viewport exactly, so
  // anything that makes the document even slightly taller — a mobile URL bar
  // collapsing and handing back the difference between svh and lvh — becomes a
  // scroll that drags the whole screen with it. Nothing here is meant to move,
  // so the document is pinned for as long as the notice owns it, and restored
  // on the way out when a resize crosses back into desktop.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    // Kills iOS rubber-banding, which `overflow: hidden` alone does not.
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscroll
    }
  }, [])

  return (
    <motion.main
      variants={fadeBlurIn}
      initial="hidden"
      animate="visible"
      className="relative flex h-svh flex-col items-center justify-center overflow-hidden overscroll-none bg-white py-12 text-center"
      style={{ gap: 'clamp(20px, 6vw, 32px)', paddingInline: 'clamp(24px, 9vw, 71px)' }}
    >
      <PhoneMockup />

      <motion.img
        src={iconPhone}
        alt=""
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...transitionSmooth, delay: 0.08 }}
        className="relative shrink-0"
        style={{ width: 'clamp(32px, 9vw, 40px)', height: 'clamp(32px, 9vw, 40px)' }}
      />

      <div className="relative flex w-full flex-col items-center" style={{ gap: 'clamp(20px, 5.2vw, 28px)' }}>
        <div className="flex w-full flex-col items-center" style={{ gap: 'clamp(14px, 4.4vw, 24px)' }}>
          {/* Two lines by design, not by wrapping — the break sits between the
              question and the answer, so it has to survive every width. */}
          <h1
            className="max-w-[447px] font-display text-ink"
            style={{ fontSize: 'clamp(24px, 7.5vw, 40px)', lineHeight: 1.2 }}
          >
            Visiting on Mobile?
            <br />
            Kindly visit on Desktop
          </h1>

          <div className="flex max-w-[524px] flex-col items-center gap-2 font-body text-[14px] font-medium leading-[24px] tracking-[-0.126px] text-outline">
            <p>
              Components Interaction isn’t available for Mobile Experience Yet, the
              interaction studies were built for a pointer and a wide screen — hover,
              drag, and a desktop-sized canvas. On a phone they'd be a worse version
              of themselves.
            </p>
            <p>Thank you.</p>
          </div>
        </div>

        {/* The tap target is the padding, not the 24px avatar and 70px of text.
            20px above, 12px on the other three sides, puts it at 56px tall —
            clear of the 44px minimum a thumb needs — and the `-mb-3` cancels
            the bottom half so the credit still sits where the frame puts it. */}
        <a
          href="https://x.com/femolaaa"
          target="_blank"
          rel="noreferrer"
          aria-label="@femolaaa on X"
          className="-mb-3 flex items-center gap-[7px] rounded-full px-3 pt-[20px] pb-3 font-body text-[14px] font-medium leading-[24px] tracking-[-0.126px] text-ink transition-opacity duration-150 active:opacity-60"
        >
          <img src={avatarFemolaaa} alt="" className="size-6 shrink-0 rounded-full object-cover" />
          @femolaaa
        </a>
      </div>
    </motion.main>
  )
}
