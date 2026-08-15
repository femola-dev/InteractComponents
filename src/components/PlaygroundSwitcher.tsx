import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { playgrounds } from '../playgrounds/registry'
import { ChevronIcon } from './icons'
import {
  ease,
  pressable,
  springPill,
  springResponsive,
  transitionSmooth,
} from '../lib/motion'

type Props = {
  activeId: string
  onSelect: (id: string) => void
}

/**
 * The pill's border, both edges. Its width/height are `border-box` while the
 * faces are measured content-box and positioned against the padding box, so the
 * ring has to be added back or each face sits 1px tight on every side.
 */
const HAIRLINE = 2

/**
 * Pagination through the playground registry — prev/next at the ends, the
 * current page's name between them. Floats over the bottom of the device bezel:
 * the mockup deliberately bleeds off the bottom edge, so the switcher overlays
 * it rather than reserving a row and cutting the screen short.
 *
 * At rest it is a small dot pill — one dot per playground, the current one
 * widened — and it springs open into the full pager on hover or keyboard focus.
 * The collapsed state still says where you are and how many there are, so the
 * chrome shrinks without the wayfinding going with it.
 *
 * ## How the morph is built
 *
 * Both states are mounted at all times, stacked absolutely inside the pill, and
 * the pill's own width and height are animated between the two measured sizes.
 * The obvious alternative — Framer's `layout` prop, mounting one state at a
 * time — is wrong for this: layout projection animates a box by *scaling* it,
 * so every child that isn't itself projected gets visibly stretched on the way
 * across, which on text and 5px dots is exactly the smear you are trying to
 * avoid. Animating real width/height keeps both layers laid out correctly on
 * every frame, and lets the box carry a spring while the contents cross-fade on
 * their own curve.
 */
export function PlaygroundSwitcher({ activeId, onSelect }: Props) {
  const reducedMotion = useReducedMotion()
  const index = Math.max(
    0,
    playgrounds.findIndex((p) => p.id === activeId),
  )
  // Which way the label should slide — set by the control that caused the change.
  const directionRef = useRef(1)

  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  // Hover is a pointer affordance. On touch there is nothing to hover with and
  // no cheap way to reveal the pager, so coarse pointers get it open always.
  const hoverCapable = useHoverCapable()
  const expanded = !hoverCapable || hovered || keyboardFocus

  const [dotsRef, dotsSize] = useMeasure()
  const [pagerRef, pagerSize] = useMeasure()
  const target = expanded ? pagerSize : dotsSize

  const go = (delta: number) => {
    directionRef.current = delta
    const next = (index + delta + playgrounds.length) % playgrounds.length
    onSelect(playgrounds[next].id)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    go(delta)
  }

  const slide = reducedMotion ? 0 : 10 * directionRef.current
  const instant = { duration: 0 }
  const box = reducedMotion ? instant : springPill

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ ...transitionSmooth, delay: 0.35 }}
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <motion.div
        role="group"
        aria-label="Playground component"
        // Focusable while collapsed, so a keyboard reaches the pager at all —
        // the buttons inside are inert until it opens. Arrow keys work from
        // here as well as from the buttons.
        tabIndex={0}
        onKeyDown={onKeyDown}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        // Only keyboard focus pins it open: a mouse click on a chevron would
        // otherwise leave the pager stuck open after the pointer has left.
        onFocusCapture={(event) => {
          if (
            event.target instanceof HTMLElement &&
            event.target.matches(':focus-visible')
          ) {
            setKeyboardFocus(true)
          }
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setKeyboardFocus(false)
          }
        }}
        // Sized only once both layers have been measured. `useMeasure` reads
        // them in a layout effect, so that lands before the first paint.
        animate={
          target
            ? { width: target.width + HAIRLINE, height: target.height + HAIRLINE }
            : false
        }
        transition={box}
        style={target ? undefined : { width: 'max-content' }}
        // Near-opaque: at 100% zoom the pill sits over the reading pane's blur
        // strip, but once the page scrolls it floats over live body text.
        //
        // `before:` is an invisible hover buffer, not decoration: collapsed, the
        // pill is a ~70×22 target, and without a margin of slop around it the
        // open/close flickers as the pointer grazes the edge.
        className={`shadow-elevated pointer-events-auto relative rounded-full border border-hairline bg-white/95 backdrop-blur-md outline-none before:absolute before:-inset-3 before:content-[''] ${
          expanded ? '' : 'cursor-pointer'
        }`}
      >
        {/* Both layers are centred in the box rather than pinned to a corner,
            so during the morph the arrows travel outwards from the middle and
            the dots shrink towards it — the two states share a centre of mass
            instead of one sliding out from under the other. */}
        <Layer visible={!expanded} reducedMotion={reducedMotion}>
          <div
            ref={dotsRef}
            aria-hidden
            className="flex shrink-0 items-center gap-1 px-2.5 py-2"
          >
            {playgrounds.map((playground) => (
              <motion.span
                key={playground.id}
                // The active dot stretches to a capsule rather than just
                // darkening: position in the set reads at a glance, at a size
                // where a colour difference alone would not.
                animate={{
                  width: playground.id === activeId ? 14 : 5,
                  backgroundColor:
                    playground.id === activeId ? '#000000' : '#d4d4d4',
                }}
                transition={reducedMotion ? instant : springResponsive}
                className="block h-[5px] shrink-0 rounded-full"
              />
            ))}
          </div>
        </Layer>

        <Layer visible={expanded} reducedMotion={reducedMotion}>
          {/* `shrink-0` on both faces and on the label well: mid-morph the pill
              is narrower than whichever face is arriving, and a face that
              shrinks to fit would reflow on every frame of the spring. They
              overflow the box instead — which is what the cross-fade hides. */}
          <div ref={pagerRef} className="flex shrink-0 items-center gap-1 p-1">
            <PagerButton
              direction="left"
              label="Previous playground"
              onActivate={() => go(-1)}
            />

            {/* Fixed width so the pill doesn't resize as names change length,
                and so the label stays centred between the two arrows. */}
            <div
              aria-live="polite"
              className="relative flex h-8 w-[168px] shrink-0 items-center justify-center overflow-hidden"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeId}
                  initial={{ opacity: 0, x: slide, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -slide, filter: 'blur(2px)' }}
                  transition={transitionSmooth}
                  className="absolute text-[12px] tracking-[-0.108px] whitespace-nowrap text-ink"
                >
                  {playgrounds[index].label}
                </motion.span>
              </AnimatePresence>
            </div>

            <PagerButton
              direction="right"
              label="Next playground"
              onActivate={() => go(1)}
            />
          </div>
        </Layer>
      </motion.div>
    </motion.div>
  )
}

/**
 * One of the pill's two faces. Always mounted — `inert` and transparent when it
 * is not the current one, so the hidden layer can't be clicked or tabbed into
 * and screen readers skip it.
 *
 * The blur is what sells the morph. Opacity alone reads as two things swapping;
 * a layer that defocuses as it leaves and pulls sharp as it arrives reads as
 * one thing changing shape. Scale is on a spring so the arrival has the same
 * physics as the box; opacity and blur are on curves, because a spring on
 * either can overshoot past its own legal range and flicker at the ends.
 */
function Layer({
  visible,
  reducedMotion,
  children,
}: {
  visible: boolean
  reducedMotion: boolean | null
  children: React.ReactNode
}) {
  return (
    <motion.div
      inert={!visible}
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        filter: visible ? 'blur(0px)' : 'blur(4px)',
        scale: visible ? 1 : 0.92,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              // The incoming face waits a beat: the box is already springing
              // open, and content that arrives with it fights the movement
              // instead of following it.
              opacity: { duration: 0.2, ease: ease.smooth, delay: visible ? 0.04 : 0 },
              filter: { duration: 0.26, ease: ease.smooth },
              scale: springResponsive,
            }
      }
      className="absolute inset-0 flex items-center justify-center"
    >
      {children}
    </motion.div>
  )
}

/** Natural size of an element, tracked across content and font changes. */
function useMeasure() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  const read = useCallback(() => {
    const node = ref.current
    if (!node) return
    // `offsetWidth`, not `getBoundingClientRect`: the node sits inside a layer
    // that animates `scale`, and a rect is post-transform — measuring it would
    // feed the box a size that shrinks with its own cross-fade.
    const { offsetWidth: width, offsetHeight: height } = node
    setSize((current) =>
      current && current.width === width && current.height === height
        ? current
        : { width, height },
    )
  }, [])

  // Layout effect, not effect: this runs before the browser paints, so the pill
  // is never shown at the wrong size on its first frame.
  useLayoutEffect(() => {
    read()
    const node = ref.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [read])

  return [ref, size] as const
}

/** True when the device has a real pointer that can hover. */
function useHoverCapable() {
  const [capable, setCapable] = useState(
    () =>
      typeof window === 'undefined' ||
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setCapable(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return capable
}

function PagerButton({
  direction,
  label,
  onActivate,
}: {
  direction: 'left' | 'right'
  label: string
  onActivate: () => void
}) {
  const single = playgrounds.length < 2

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={single}
      onClick={onActivate}
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-outline outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:cursor-default disabled:opacity-30"
      whileHover={single ? undefined : { scale: 1.08, backgroundColor: '#f2f2f2' }}
      whileTap={single ? undefined : pressable.whileTap}
      transition={springResponsive}
    >
      <ChevronIcon direction={direction} />
    </motion.button>
  )
}
