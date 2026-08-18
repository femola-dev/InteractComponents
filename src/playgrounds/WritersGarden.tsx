import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BADGES,
  BADGE_IMG,
  BADGE_IMG_X,
  BADGE_IMG_Y,
  COPY,
  FOCUS_H,
  FOCUS_W,
  GHOST,
  GHOST_BLUR,
  GHOST_FOCUS_Y,
  GHOST_REST_Y,
  GHOST_SIZE,
  GHOST_TRACKING,
  MUTED,
  PLATE,
  REST_SCALE,
  TILE_GAP,
  TILE_H,
  TILE_PITCH,
  TILE_RADIUS,
  TILE_W,
  iconArrowUpRight,
  iconDotGrid,
} from '../lib/writersGarden'
import {
  boilOffset,
  capability,
  damp,
  frameBudget,
  getTier,
  initCapability,
  onTierChange,
  smoothstep,
} from '../lib/ponpon'

/**
 * Writers Garden — Figma node 312:2975.
 *
 * The board shows one frame of a horizontal rail: a centred badge at full size
 * with its name behind it, smaller badges either side, and a caption under it
 * describing whichever one is centred. Everything interesting about it is the
 * part the board cannot show, so the scroll is the design here, not a garnish
 * on top of one.
 *
 * The motion follows the ponpon-mania architecture in `src/lib/ponpon.ts`, in
 * the order that skill insists on — tier, then budget, then damping, then the
 * boil — because the last one is the only visible one and it is the one that
 * ruins a page when the first three are missing.
 *
 * Native scroll rather than a smooth-scroll library. The reference site runs
 * Lenis, but Lenis exists to synthesise momentum the platform withholds, and
 * on a horizontal rail with `scroll-snap` the platform already provides most
 * of it: touch flings, keyboard, and a scrollbar that means something to a
 * screen reader. The two it withholds — a mouse wheel, which the browser will
 * not route to a horizontal box at all, and a mouse *drag*, which does not
 * exist — are added here, and both drive `scrollLeft` directly so the native
 * one stays the only scroll position there is.
 *
 * What is worth taking from the reference is the *damping* — so the browser
 * owns the scroll position and this owns the weighted value the visuals read
 * from, which is the half that actually shows.
 */

/** One tile's live animation state, kept out of React on purpose. */
type CardState = {
  /** 1 at dead centre, 0 a full pitch away. */
  focus: number
  /** Written to the DOM last frame, so an unchanged value writes nothing. */
  lastTransform: string
  lastGhost: string
}

export function WritersGarden() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  /**
   * The two boxes are different elements and only one of them can be measured.
   *
   * `tileRefs` are the buttons — the rail's layout boxes, laid out in a row
   * inside the scroller, and the only things whose `offsetLeft` means a
   * position in the rail. `cardRefs` are the drawn plates *inside* them, which
   * are absolutely positioned and so report an `offsetLeft` relative to their
   * own button — the same number for every tile, and nothing to do with where
   * the tile is. Measure the first, write to the second.
   */
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const ghostRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const [active, setActive] = useState(0)
  const reducedMotion = useReducedMotion()
  /** Set by a drag that actually moved, read by the click that follows it —
   *  a pointerup after a drag still fires a click on the tile under the
   *  cursor, and centring on that tile would undo the drag. */
  const dragged = useRef(false)
  const tier = useTier()
  // Read once per render rather than per element: twelve tiles asking the same
  // getter twelve times is twelve reads of a value that cannot change mid-paint.
  const heavyFilters = tier >= 2 && capability.useHeavyFilters

  const setTileRef = useCallback(
    (i: number) => (node: HTMLButtonElement | null) => {
      tileRefs.current[i] = node
    },
    [],
  )
  const setCardRef = useCallback(
    (i: number) => (node: HTMLDivElement | null) => {
      cardRefs.current[i] = node
    },
    [],
  )
  const setGhostRef = useCallback(
    (i: number) => (node: HTMLParagraphElement | null) => {
      ghostRefs.current[i] = node
    },
    [],
  )

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const states: CardState[] = BADGES.map(() => ({
      focus: 0,
      lastTransform: '',
      lastGhost: '',
    }))

    // The damped stand-in for `scrollLeft`. The browser's value is the truth;
    // this is the value with weight, and it is what every transform reads.
    let rendered = scroller.scrollLeft
    let raf = 0
    let last = performance.now()
    let peripheralAccum = 0
    let nearest = -1

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)

      // Clamped because a background tab hands back a delta of several
      // seconds on return, and an unclamped one makes `exp(-λ·dt)` collapse
      // to zero — the rail would teleport instead of catching up.
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now

      const soft = capability.useDamping && !reduced.matches
      // λ=14 arrives in about a fifth of a second: enough weight to feel like
      // the rail has mass, not enough to feel like input lag.
      rendered = soft ? damp(rendered, scroller.scrollLeft, 14, dt) : scroller.scrollLeft

      const centre = rendered + scroller.clientWidth / 2
      const seconds = now / 1000

      peripheralAccum += dt
      const budget = frameBudget()
      const peripheralDue = peripheralAccum >= budget.peripheral
      if (peripheralDue) peripheralAccum = 0

      let bestIndex = 0
      let bestDistance = Infinity

      for (let i = 0; i < states.length; i++) {
        const tile = tileRefs.current[i]
        if (!tile) continue

        const state = states[i]
        // `offsetLeft` is layout, so the tile's own scale transform does not
        // feed back into the measurement that produces it.
        const cardCentre = tile.offsetLeft + TILE_W / 2
        const absolute = Math.abs((cardCentre - centre) / TILE_PITCH)
        if (absolute < bestDistance) {
          bestDistance = absolute
          bestIndex = i
        }

        // Offscreen tiles are not animated at all — but they are parked in
        // their rest state once, so a tile that scrolls away mid-grow does
        // not come back still holding a stale transform. 1.6 pitches is the
        // reference site's `inViewPadding` idea: warm up just before entry.
        const visible = absolute < 1.6
        if (!visible) {
          if (state.focus !== 0) {
            state.focus = 0
            writeCard(i, REST_SCALE, 0, 0)
            writeGhost(i, GHOST_REST_Y)
          }
          continue
        }

        // The focused tile updates every frame. Everything else is on the
        // peripheral budget — nobody can see that a tile at the edge of the
        // frame is easing at 30fps, and everybody sees the centre one hitch.
        const isFocused = absolute < 0.5
        if (!isFocused && !peripheralDue) continue

        // Focus falls off across exactly one pitch, so at rest — with snap
        // holding a tile dead centre — precisely one tile is at 1 and its
        // neighbours are at 0, which is the state the board draws.
        const focus = smoothstep(1, 0, absolute)
        state.focus = focus

        const scale = REST_SCALE + (1 - REST_SCALE) * focus

        let bx = 0
        let by = 0
        if (capability.useBoil && !reduced.matches) {
          // Seeded by index so the rail wobbles out of phase with itself
          // rather than sliding as one block, and damped by focus so the
          // centred tile — the one being read — is the steadiest thing on
          // screen rather than the busiest.
          const boil = boilOffset(i, seconds, 1.5 * (1 - 0.6 * focus))
          bx = boil.x
          by = boil.y
        }

        writeCard(i, scale, bx, by)
        writeGhost(i, (1 - focus) * GHOST_REST_Y)
      }

      if (bestIndex !== nearest) {
        nearest = bestIndex
        setActive(bestIndex)
      }
    }

    const writeCard = (i: number, scale: number, x: number, y: number) => {
      const card = cardRefs.current[i]
      if (!card) return
      const value = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
      if (value === states[i].lastTransform) return
      states[i].lastTransform = value
      card.style.transform = value
    }

    const writeGhost = (i: number, y: number) => {
      const ghost = ghostRefs.current[i]
      if (!ghost) return
      const value = `translate3d(-50%, ${y.toFixed(1)}px, 0)`
      if (value === states[i].lastGhost) return
      states[i].lastGhost = value
      ghost.style.transform = value
    }

    /* ---- Gestures ----
     *
     * `snap-mandatory` and a JS write to `scrollLeft` are incompatible: the
     * write is not a user gesture, so the browser re-snaps on the very next
     * frame and the rail springs back out from under the hand. So every
     * JS-driven gesture switches snapping off for its own duration, moves the
     * rail freely — which is the whole reason the tiles grow *continuously*
     * under a drag instead of a notch at a time — and switches it back on once
     * the rail has settled on a tile again.
     */
    let snapOff = false
    let settleTimer = 0

    const releaseSnap = () => {
      if (snapOff) return
      snapOff = true
      scroller.style.scrollSnapType = 'none'
    }

    const restoreSnap = () => {
      if (!snapOff) return
      snapOff = false
      scroller.style.scrollSnapType = ''
    }

    /** Where the rail has to sit for tile `i` to be dead centre. `offsetLeft`
     *  is layout, so the tile's own scale transform cannot feed back into it. */
    const offsetFor = (i: number) => {
      const tile = tileRefs.current[i]
      return tile ? tile.offsetLeft + TILE_W / 2 - scroller.clientWidth / 2 : 0
    }

    /** Which tile a given scroll offset is nearest to. */
    const indexAt = (left: number) => {
      const centreAt = left + scroller.clientWidth / 2
      let best = 0
      let bestDistance = Infinity
      for (let i = 0; i < BADGES.length; i++) {
        const tile = tileRefs.current[i]
        if (!tile) continue
        const distance = Math.abs(tile.offsetLeft + TILE_W / 2 - centreAt)
        if (distance < bestDistance) {
          bestDistance = distance
          best = i
        }
      }
      return best
    }

    /**
     * Land on a tile, then hand the rail back to the browser's snapping.
     *
     * The restore is deferred rather than immediate because restoring
     * `snap-mandatory` while a smooth scroll is still in flight makes the
     * browser fight its own animation — it snaps to wherever the scroll had
     * got to and abandons the rest of it.
     */
    const settleOn = (i: number) => {
      const target = Math.min(BADGES.length - 1, Math.max(0, i))
      clearTimeout(settleTimer)
      scroller.scrollTo({ left: offsetFor(target), behavior: 'smooth' })
      settleTimer = window.setTimeout(restoreSnap, 480)
    }

    /**
     * A vertical wheel does nothing to a horizontally-scrolling box — the
     * browser only routes wheel deltas to the axis they were made on, so a
     * mouse (and a trackpad pushed straight up) leaves this rail untouched
     * while a sideways two-finger swipe works. That asymmetry is invisible to
     * whoever is using a mouse: the page just looks broken.
     *
     * So both axes are accepted, the larger one wins, and it is applied to the
     * rail's own axis proportionally — not as a step. Proportional is the
     * point: it is what puts the tile mid-grow while the wheel is still
     * turning, instead of only ever showing the two end states.
     */
    let wheelIdle = 0
    /** The tile the wheel gesture started on, and how far it has asked for
     *  since. Both reset when the gesture ends. */
    let wheelFrom = -1
    let wheelAccum = 0

    const endWheel = () => {
      const landed = indexAt(scroller.scrollLeft)
      // A mouse wheel deals in notches of ~100px against a pitch of 481, so
      // proportional scrolling alone would let a whole notch land back on the
      // tile it started from and read as a dead wheel. A gesture that asked
      // for a direction and got nowhere is given the one tile it meant.
      const target =
        landed === wheelFrom && Math.abs(wheelAccum) > 20
          ? wheelFrom + Math.sign(wheelAccum)
          : landed
      wheelFrom = -1
      wheelAccum = 0
      settleOn(target)
    }

    const onWheel = (event: WheelEvent) => {
      let delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      // Firefox reports mouse wheels in lines, not pixels, and a raw 3 would
      // move the rail three pixels a notch.
      if (event.deltaMode === 1) delta *= 16

      // Nothing on this page scrolls vertically, so the wheel has no other
      // job and can be taken outright.
      event.preventDefault()

      releaseSnap()
      if (wheelFrom < 0) wheelFrom = nearest
      wheelAccum += delta
      scroller.scrollLeft += delta

      // A trackpad flick arrives as a long inertia tail of dozens of events;
      // the gesture is over when they stop, not when the first one lands.
      clearTimeout(wheelIdle)
      wheelIdle = window.setTimeout(endWheel, 90)
    }

    /* ---- Grab ---- */

    let dragId: number | null = null
    let dragFrom = 0
    let dragFromScroll = 0
    let dragVelocity = 0
    let dragLastX = 0
    let dragLastAt = 0

    const onPointerDown = (event: PointerEvent) => {
      // Touch is left alone. It already has the platform's own drag-scroll,
      // with a fling and a rubber band that this could only approximate, and
      // taking it over would trade a native gesture for a worse copy. Mouse
      // and pen have no drag-scroll at all, so there they are pure gain.
      if (event.pointerType === 'touch' || event.button !== 0) return

      dragId = event.pointerId
      dragFrom = event.clientX
      dragFromScroll = scroller.scrollLeft
      dragLastX = event.clientX
      dragLastAt = performance.now()
      dragVelocity = 0
      dragged.current = false
    }

    const onPointerMove = (event: PointerEvent) => {
      if (dragId !== event.pointerId) return

      const dx = event.clientX - dragFrom
      // A few pixels of slop, so a click that shivers is still a click — and
      // nothing at all happens until it is crossed. In particular the pointer
      // is not captured on `pointerdown`, because a capture that is still open
      // at `pointerup` retargets the `click` to the capturing element, and the
      // tile's own click — the one that centres it — would never fire.
      if (!dragged.current) {
        if (Math.abs(dx) <= 3) return
        dragged.current = true
        clearTimeout(settleTimer)
        clearTimeout(wheelIdle)
        releaseSnap()
        scroller.setPointerCapture(event.pointerId)
        scroller.style.cursor = 'grabbing'
      }

      scroller.scrollLeft = dragFromScroll - dx

      const now = performance.now()
      const dt = now - dragLastAt
      if (dt > 0) {
        // Smoothed, because the release reads this exactly once: an unsmoothed
        // sample lets the last two pixels of a long gesture decide the flick.
        const sample = ((event.clientX - dragLastX) / dt) * 1000
        dragVelocity = dragVelocity * 0.7 + sample * 0.3
        dragLastX = event.clientX
        dragLastAt = now
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (dragId !== event.pointerId) return
      dragId = null
      // A click that never became a drag is left to the tile's own handler.
      if (!dragged.current) return
      scroller.style.cursor = ''

      // A flick throws the rail on past where it was let go of. Capped at one
      // pitch, so however hard it is thrown it advances by one badge — this is
      // a rail of twelve discrete things, and overshooting six of them to land
      // somewhere nobody aimed at is not momentum, it is a loss of control.
      const throw_ = Math.max(-TILE_PITCH, Math.min(TILE_PITCH, dragVelocity * 0.12))
      settleOn(indexAt(scroller.scrollLeft - throw_))
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
      if (!step) return
      event.preventDefault()
      settleOn(nearest + step)
    }

    // Non-passive: React registers its own `onWheel` as passive at the root,
    // where `preventDefault` is a no-op and logs a console warning.
    scroller.addEventListener('wheel', onWheel, { passive: false })
    scroller.addEventListener('keydown', onKeyDown)
    scroller.addEventListener('pointerdown', onPointerDown)
    scroller.addEventListener('pointermove', onPointerMove)
    scroller.addEventListener('pointerup', onPointerUp)
    scroller.addEventListener('pointercancel', onPointerUp)

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settleTimer)
      clearTimeout(wheelIdle)
      scroller.removeEventListener('wheel', onWheel)
      scroller.removeEventListener('keydown', onKeyDown)
      scroller.removeEventListener('pointerdown', onPointerDown)
      scroller.removeEventListener('pointermove', onPointerMove)
      scroller.removeEventListener('pointerup', onPointerUp)
      scroller.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  /** Scroll tile `i` to the centre.
   *
   *  Computed rather than delegated to `scrollIntoView`, because the element
   *  being centred is the one carrying the scale transform — `scrollIntoView`
   *  measures the *rendered* box and would aim at a tile 1.556× its layout
   *  width, landing off-centre by however much it had already grown.
   *  `offsetLeft` is layout, so it is immune to that. */
  const centreOn = (i: number) => {
    const scroller = scrollerRef.current
    const tile = tileRefs.current[i]
    if (!scroller || !tile) return
    scroller.scrollTo({
      left: tile.offsetLeft + TILE_W / 2 - scroller.clientWidth / 2,
      behavior: 'smooth',
    })
  }

  const badge = BADGES[active]
  const morph = captionMorph(reducedMotion)

  return (
    <div className="font-lausanne flex min-h-svh w-full flex-col items-center overflow-hidden bg-white pt-9 pb-[38px]">
      {/* Node 317:17934 — the title pill. */}
      <div className="flex shrink-0 items-center justify-center gap-3 rounded-xl bg-black py-3 pr-5 pl-3">
        <img src={iconDotGrid} alt="" className="size-10 shrink-0" />
        <p className="text-[40px] leading-[1.0008] font-semibold tracking-[-0.8px] whitespace-nowrap text-white">
          {COPY.title}
        </p>
      </div>

      {/* Node 318:21420 — the rail. `min-h-0` so the row absorbs the leftover
          height instead of forcing the page taller than the viewport. */}
      <div className="flex min-h-0 w-full flex-1 items-center">
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="listbox"
          aria-label="Badges"
          // `relative` is load-bearing, not cosmetic: it makes the scroller
          // the tiles' offsetParent, so their `offsetLeft` is a position in
          // the scrolled content and comparable to `scrollLeft`. Without it
          // they measure from the page and the two coordinate spaces differ by
          // wherever the rail happens to sit.
          className="scroll-hidden relative flex w-full cursor-grab touch-pan-y snap-x snap-mandatory select-none items-center overflow-x-auto overflow-y-hidden outline-none"
          style={{
            gap: TILE_GAP,
            // Enough lead-in and lead-out that the first and last tiles can
            // reach the centre. Without it the rail can only centre the
            // middle ten, and the two ends are permanently small.
            paddingInline: `calc(50% - ${TILE_W / 2}px)`,
            // The focused tile overflows its box by 89px each way; the rail
            // has to let that out or the grow is clipped at the tile edge.
            paddingBlock: (FOCUS_H - TILE_H) / 2,
          }}
        >
          {BADGES.map((item, i) => (
            <button
              key={item.name}
              ref={setTileRef(i)}
              type="button"
              onClick={() => {
                if (dragged.current) return
                centreOn(i)
              }}
              aria-label={`${item.name} badge`}
              role="option"
              aria-selected={i === active}
              className="relative shrink-0 cursor-pointer snap-center bg-transparent p-0"
              style={{ width: TILE_W, height: TILE_H }}
            >
              <div
                ref={setCardRef(i)}
                className="absolute top-1/2 left-1/2 overflow-clip"
                style={{
                  // Drawn at the focused size and centred on the layout box by
                  // margin rather than by a translate, so the hot loop can
                  // write a pure `translate3d(...) scale(...)` with nothing to
                  // preserve in it.
                  width: FOCUS_W,
                  height: FOCUS_H,
                  marginLeft: -FOCUS_W / 2,
                  marginTop: -FOCUS_H / 2,
                  background: PLATE,
                  borderRadius: TILE_RADIUS,
                  // Every tile scales about its own centre, so the rail's
                  // rhythm is unchanged by which one is grown.
                  transformOrigin: 'center center',
                  // Matches the first frame the loop will write. Without it the
                  // rail paints once at full size before the first rAF and the
                  // tiles visibly snap down.
                  transform: `scale(${REST_SCALE})`,
                  // Deliberately no `will-change: transform`. It promotes the
                  // layer, but it also pins the scale Chrome rasterises at —
                  // and these tiles are born at 0.64, so the layer would be
                  // rastered small and then blown up on focus, which is the
                  // exact blur the focused-size layout above exists to avoid.
                  // The loop writes `translate3d(...)`, and a 3D transform
                  // promotes the layer anyway, without the pinning.
                }}
              >
                {/* Node 317:17849 — the name, behind the badge and clipped by
                    the tile. Not a label: at 200px it is scenery. */}
                <p
                  ref={setGhostRef(i)}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 font-semibold whitespace-nowrap"
                  style={{
                    // Figma's own offset — slung below the tile's centre, not
                    // on it. The loop then translates it down from here.
                    top: `calc(50% + ${GHOST_FOCUS_Y}px)`,
                    color: GHOST,
                    fontSize: GHOST_SIZE,
                    lineHeight: 1.0008,
                    letterSpacing: GHOST_TRACKING,
                    filter: heavyFilters
                      ? `blur(${GHOST_BLUR}px)`
                      : undefined,
                    transform: `translate3d(-50%, ${GHOST_REST_Y}px, 0)`,
                    // Same reasoning as the tile: the loop's `translate3d`
                    // does the promoting. A blurred 200px glyph is expensive
                    // to re-raster, and a pure translation never asks it to.
                  }}
                >
                  {item.name}
                </p>

{/* Placed, not fitted. Every export is normalised to the same
                    box — a 230-unit badge frame with 32 units of margin — so
                    this is one rule for all twelve rather than a size and an
                    origin carried per badge. `object-fit` has nothing to do
                    here: the box is square and so is the image.

                    No CSS drop-shadow either. The export carries the design's
                    own shadow as an SVG filter, which is what the margin is
                    making room for. */}
                <img
                  src={item.art}
                  alt=""
                  // A native image drag would hijack the grab the instant it
                  // starts over a badge, which is most of the tile.
                  draggable={false}
                  // Only the first three can be on screen at load.
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="pointer-events-none absolute max-w-none"
                  style={{
                    width: BADGE_IMG,
                    height: BADGE_IMG,
                    left: BADGE_IMG_X,
                    top: BADGE_IMG_Y,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Node 312:3165 — the caption, which is the rail's readout. */}
      <div
        className="w-[482px] max-w-[calc(100%-48px)] shrink-0 overflow-clip p-5"
        style={{ background: PLATE, borderRadius: 16 }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex w-full items-start gap-4">
            {/* `mode="wait"` would leave the row empty between names and
                collapse the card's height. These two overlap instead, which
                is also what the morph needs — see `captionMorph`. */}
            <div className="relative min-w-px flex-1">
              <AnimatePresence initial={false}>
                <motion.p
                  key={badge.name}
                  {...morph}
                  className="absolute inset-x-0 top-0 text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px] text-black"
                >
                  {badge.name}
                </motion.p>
              </AnimatePresence>
              {/* Holds the row's height while the two names are both absolute. */}
              <p className="invisible text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px]">
                {badge.name}
              </p>
            </div>

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="relative flex shrink-0 items-center justify-center gap-1"
            >
              <p className="text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px] whitespace-nowrap text-black">
                {COPY.requirements}
              </p>
              <img src={iconArrowUpRight} alt="" className="size-6 shrink-0" />
              <span className="absolute -bottom-[3px] left-0 h-0.5 w-full bg-black" />
            </a>
          </div>

          <div className="relative">
            <AnimatePresence initial={false}>
              <motion.p
                key={badge.name}
                {...morph}
                className="absolute inset-x-0 top-0 text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px]"
                style={{ color: MUTED }}
              >
                {badge.detail}
              </motion.p>
            </AnimatePresence>
            <p
              className="invisible text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px]"
              aria-hidden="true"
            >
              {LONGEST_DETAIL}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * From the reference site's measured vocabulary: two eases carry the whole
 * thing, and `power2.out` is ~60% of every tween on it. This is that curve —
 * GSAP's `power2` is a cubic — at the 0.3s the same audit found clustered
 * under UI feedback. Nothing here has earned `back` or `elastic`.
 */
const CAPTION_EASE = [0.215, 0.61, 0.355, 1] as const

/**
 * The caption's blur morph — the house pattern from `PlaygroundSwitcher`.
 *
 * The blur is what makes it a morph. Opacity alone reads as two separate
 * strings swapping places; a line that defocuses as it leaves and pulls sharp
 * as it arrives reads as one line changing its mind. Which is what this is —
 * the caption is a readout of whichever badge is centred, not a list of
 * messages taking turns.
 *
 * Three details carry it:
 *
 * - The blur outlasts the fade, 0.38 against 0.3. If they end together the
 *   text is fully opaque and fully sharp at the same instant and the last
 *   frame is a hard cut; running the blur on past the fade means the arriving
 *   line is still coming into focus after it has finished appearing, which is
 *   the whole read.
 * - The travel drops from the old 8px to 5. A morph is a thing resolving in
 *   place, and past about 6px the eye starts tracking the movement instead —
 *   at which point it is two lines sliding past each other again.
 * - Blur and opacity stay on curves rather than springs. Both have a legal
 *   range with a hard floor, and a spring that overshoots `blur(0px)` or
 *   `opacity: 1` clamps — which shows up as a flicker on the last frame.
 *
 * Reduced motion keeps the cross-fade, since something has to cover the swap,
 * and drops the blur and the travel.
 */
function captionMorph(reduced: boolean | null) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2, ease: CAPTION_EASE },
    } as const
  }
  return {
    initial: { opacity: 0, y: 5, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -5, filter: 'blur(4px)' },
    transition: {
      opacity: { duration: 0.3, ease: CAPTION_EASE },
      y: { duration: 0.3, ease: CAPTION_EASE },
      filter: { duration: 0.38, ease: CAPTION_EASE },
    },
  } as const
}

/** The caption is absolutely positioned so its two states can cross-fade, so
 *  something has to hold the card open. Reserving the tallest entry keeps the
 *  card from resizing as the rail moves — a caption that grew and shrank under
 *  a scroll would be the most distracting thing on the page. */
const LONGEST_DETAIL = BADGES.reduce(
  (longest, b) => (b.detail.length > longest.length ? b.detail : longest),
  '',
)

/**
 * The tier, as a React value.
 *
 * `initCapability` is called from `getSnapshot` rather than from an effect so
 * the renderer probe — which is synchronous — has already run by the first
 * paint. An effect would render everything at the default tier first and only
 * correct it a frame later, which on the machines that matter means turning
 * the expensive path on and then off in front of the user.
 */
function useTier() {
  return useSyncExternalStore(
    onTierChange,
    () => {
      initCapability()
      return getTier()
    },
    () => 2,
  )
}
