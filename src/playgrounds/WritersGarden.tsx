import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
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
  LAYOUTS,
  MUTED,
  PAGE,
  PANEL_BADGE,
  PANEL_BADGE_BACK,
  PANEL_BADGE_IMG,
  PANEL_BADGE_OFFSET,
  PANEL_BADGE_STAGE,
  PANEL_BADGE_STAGE_OFFSET,
  PANEL_BLUR,
  PANEL_GAP,
  PANEL_INSET,
  PANEL_MUTED,
  PANEL_PAD,
  PANEL_RADIUS,
  PANEL_TINT,
  PANEL_TINT_FLAT,
  PANEL_W,
  PLATE,
  RAIL_BLEED,
  REST_SCALE,
  TILE_GAP,
  TILE_H,
  TILE_PITCH,
  TILE_RADIUS,
  TILE_W,
  VERTICAL_PITCH,
  iconArrowUpRight,
  iconDotGrid,
  type Badge,
  type LayoutMode,
} from '../lib/writersGarden'
import { ease, springMorph } from '../lib/motion'
import { SpinningBadge } from '../components/SpinningBadge'
import { BadgeHelix } from '../components/BadgeHelix'
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

  /* ---- Layout ----
   *
   * The rail runs sideways or the badges wind up a helix, and the two share
   * everything except how they are laid out: the same twelve badges, the same
   * `active`, the same caption, the same requirements panel. Which means the
   * toggle only has to swap the middle of the page — nothing below it knows
   * which mode it is in.
   *
   * The helix needs WebGL and it needs motion, so under reduced motion it falls
   * back to a plain vertical column. That is not a degraded helix, it is a
   * different, quieter layout — a helix that does not turn is just a list of
   * badges at odd angles.
   */
  const [layout, setLayout] = useState<LayoutMode>('horizontal')
  const vertical = layout === 'vertical'
  const helix = vertical && !reducedMotion

  /**
   * The continuous badge index the vertical scroller is at.
   *
   * A ref, not state. It changes on every scroll event — pointer rate, not
   * render rate — and the only thing that reads it is a WebGL frame loop that
   * is already running. Putting it in state would re-render the page, the
   * caption and the panel sixty times a second to deliver a number React never
   * looks at.
   */
  const helixTarget = useRef(0)
  const columnRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([])

  const setSlotRef = useCallback(
    (i: number) => (node: HTMLButtonElement | null) => {
      slotRefs.current[i] = node
    },
    [],
  )

  /**
   * Drive the helix from the vertical scroller.
   *
   * Same division of labour as the horizontal rail: the browser owns the scroll
   * position — with real snapping, a real scrollbar, touch flings and keyboard —
   * and this only converts it into the one number the renderer wants. The
   * weight, the lag and the overshoot are the spring's job, downstream of here.
   *
   * With the helix running, `active` is deliberately *not* set from here: the
   * renderer reports whichever badge is nearest the front, and that is the
   * *damped* index rather than the raw scroll one — so the caption changes when
   * the badge has actually arrived at the front, not the moment the scroll
   * crosses the halfway mark. Without the helix there is no damped index and
   * nothing downstream to report it, so this reads it off the scroll directly.
   */
  useEffect(() => {
    const column = columnRef.current
    if (!column || !vertical) return

    const read = () => {
      const index = column.scrollTop / VERTICAL_PITCH
      helixTarget.current = index
      if (!helix) {
        setActive(Math.min(BADGES.length - 1, Math.max(0, Math.round(index))))
      }
    }
    read()

    const clampIndex = (i: number) => Math.min(BADGES.length - 1, Math.max(0, i))

    /* ---- Grab ----
     *
     * `snap-mandatory` and a JS write to `scrollTop` are incompatible: the write
     * is not a user gesture, so the browser re-snaps on the very next frame and
     * the helix springs back out from under the hand. So the drag switches
     * snapping off for its own duration and back on once it has settled — which
     * is also the whole reason the helix winds *continuously* under a drag
     * rather than a notch at a time.
     */
    let snapOff = false
    let settleTimer = 0

    const releaseSnap = () => {
      if (snapOff) return
      snapOff = true
      column.style.scrollSnapType = 'none'
    }
    const restoreSnap = () => {
      if (!snapOff) return
      snapOff = false
      column.style.scrollSnapType = ''
    }

    /**
     * Land on a badge, then hand the scroller back to the browser's snapping.
     *
     * Deferred rather than immediate, because restoring `snap-mandatory` while a
     * smooth scroll is still in flight makes the browser fight its own
     * animation — it snaps to wherever the scroll had got to and abandons the
     * rest of it.
     */
    const settleOn = (i: number) => {
      const target = clampIndex(i)
      clearTimeout(settleTimer)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const behavior = reduced ? 'auto' : 'smooth'
      column.scrollTo({ top: target * VERTICAL_PITCH, behavior })
      if (behavior === 'auto') restoreSnap()
      else settleTimer = window.setTimeout(restoreSnap, 480)
    }

    let dragId: number | null = null
    let dragFrom = 0
    let dragFromScroll = 0
    let dragVelocity = 0
    let dragLastY = 0
    let dragLastAt = 0

    const onPointerDown = (event: PointerEvent) => {
      // Touch is left alone, exactly as on the horizontal rail: it already has
      // the platform's own drag-scroll, with a fling and a rubber band this
      // could only approximate. Mouse and pen have no drag-scroll at all, so
      // there it is pure gain — and on a helix it is the natural gesture, since
      // the thing being turned looks like something you would take hold of.
      if (event.pointerType === 'touch' || event.button !== 0) return

      dragId = event.pointerId
      dragFrom = event.clientY
      dragFromScroll = column.scrollTop
      dragLastY = event.clientY
      dragLastAt = performance.now()
      dragVelocity = 0
      dragged.current = false
    }

    const onPointerMove = (event: PointerEvent) => {
      if (dragId !== event.pointerId) return

      const dy = event.clientY - dragFrom
      // A few pixels of slop, so a click that shivers is still a click — and
      // nothing happens until it is crossed. The pointer is deliberately not
      // captured on `pointerdown`, because a capture still open at `pointerup`
      // retargets the `click` to the capturing element, and the slot's own
      // click — the one that centres it — would never fire.
      if (!dragged.current) {
        if (Math.abs(dy) <= 3) return
        dragged.current = true
        clearTimeout(settleTimer)
        releaseSnap()
        column.setPointerCapture(event.pointerId)
        column.style.cursor = 'grabbing'
      }

      /* Plus, where the rail subtracts — the one line of it whose sign differs,
         and the reason is the helix rather than the gesture.
         A card's height above the camera is `(i − index) · RISE`, so a *rising*
         index carries every card downward and badge i+1 sits above badge i.
         That is the reverse of a document, where scrolling on pushes content up
         and the next thing arrives from below. Feed that mapping the rail's sign
         and the cards climb while the hand pulls down; `DRAG_DIRECTION` puts the
         cards back under the hand, which is the only thing a grab can mean. */
      column.scrollTop = dragFromScroll + DRAG_DIRECTION * dy

      const now = performance.now()
      const dt = now - dragLastAt
      if (dt > 0) {
        // Smoothed, because the release reads this exactly once: an unsmoothed
        // sample lets the last two pixels of a long gesture decide the flick.
        const sample = ((event.clientY - dragLastY) / dt) * 1000
        dragVelocity = dragVelocity * 0.7 + sample * 0.3
        dragLastY = event.clientY
        dragLastAt = now
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (dragId !== event.pointerId) return
      dragId = null
      // A press that never became a drag is left to the slot's own handler.
      if (!dragged.current) return
      column.style.cursor = ''

      // A flick throws the helix on past where it was let go of, capped at one
      // pitch: this is twelve discrete things, and overshooting six of them to
      // land somewhere nobody aimed at is not momentum, it is a loss of control.
      const throw_ = Math.max(
        -VERTICAL_PITCH,
        Math.min(VERTICAL_PITCH, dragVelocity * 0.12),
      )
      // Same flip as the drag itself: the throw has to continue the gesture, so
      // it travels the way the scroll was already going.
      settleOn(
        Math.round((column.scrollTop + DRAG_DIRECTION * throw_) / VERTICAL_PITCH),
      )
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
      if (!step) return
      event.preventDefault()
      const focused = slotRefs.current.indexOf(document.activeElement as HTMLButtonElement)
      if (focused >= 0) {
        slotRefs.current[clampIndex(focused + step)]?.focus()
        return
      }
      settleOn(Math.round(column.scrollTop / VERTICAL_PITCH) + step)
    }

    // Tabbing to a badge brings it to the front, on the same `:focus-visible`
    // guard the horizontal rail uses and for the same reason — a pointer press
    // focuses the button before anything has moved.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.matches?.(':focus-visible')) return
      const i = slotRefs.current.indexOf(target as HTMLButtonElement)
      if (i < 0) return
      column.scrollTo({ top: i * VERTICAL_PITCH, behavior: 'smooth' })
    }

    column.addEventListener('scroll', read, { passive: true })
    column.addEventListener('keydown', onKeyDown)
    column.addEventListener('focusin', onFocusIn)
    column.addEventListener('pointerdown', onPointerDown)
    column.addEventListener('pointermove', onPointerMove)
    column.addEventListener('pointerup', onPointerUp)
    // A drag that ends outside the window never fires `pointerup`, and without
    // this the scroller would keep the grab — and its snapping switched off —
    // for good.
    column.addEventListener('pointercancel', onPointerUp)
    return () => {
      clearTimeout(settleTimer)
      restoreSnap()
      column.removeEventListener('scroll', read)
      column.removeEventListener('keydown', onKeyDown)
      column.removeEventListener('focusin', onFocusIn)
      column.removeEventListener('pointerdown', onPointerDown)
      column.removeEventListener('pointermove', onPointerMove)
      column.removeEventListener('pointerup', onPointerUp)
      column.removeEventListener('pointercancel', onPointerUp)
    }
  }, [vertical, helix])

  /**
   * Carry the focused badge across a layout change.
   *
   * Switching modes rebuilds the middle of the page, and the new rail starts at
   * whatever scroll offset a fresh element has, which is zero. Without this,
   * every toggle would silently throw you back to Tulip. `scrollTo` with
   * `behavior: 'auto'` because this happens on the frame the layout appears —
   * there is nothing to animate from.
   */
  useLayoutEffect(() => {
    if (vertical) {
      const column = columnRef.current
      if (!column) return
      column.scrollTop = active * VERTICAL_PITCH
      helixTarget.current = active
      return
    }
    const scroller = scrollerRef.current
    const tile = tileRefs.current[active]
    if (!scroller || !tile) return
    scroller.scrollLeft = tile.offsetLeft + TILE_W / 2 - scroller.clientWidth / 2
    // `active` is intentionally absent: this runs when the *layout* changes, and
    // re-running it on every badge change would fight the rail's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical])

  /* ---- The requirements panel — node 318:22783 ----
   *
   * A disclosure, not a modal. The rail underneath stays live and the panel is
   * a readout of whichever badge is centred, exactly like the caption it opens
   * from — so there is one `active` and no second copy of it to go stale. Wheel
   * the rail with the panel open and the panel follows.
   *
   * That is also why focus is not moved into it. A modal would trap focus and
   * need a close button to release it; a disclosure leaves focus on its trigger,
   * where Enter closes it again and `aria-expanded` says so. The design draws no
   * close control, and this is the reading of it that does not need one.
   */
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!panelOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setPanelOpen(false)
      // Escape can be pressed from anywhere on the page, including from inside
      // the panel's own text if somebody has tabbed into it. Put focus
      // somewhere deliberate rather than leaving it on a node about to unmount.
      triggerRef.current?.focus()
    }

    /**
     * Anywhere outside dismisses.
     *
     * On `pointerdown`, not `click`, so a press that lands on a rail tile
     * closes the panel *and* still lets the tile's own click centre it — one
     * gesture, both outcomes, which is what dismissing by pointing at the thing
     * behind ought to do. Waiting for `click` would order them the other way
     * and make the second half feel like a separate action.
     *
     * The trigger is excluded because it is a toggle and would otherwise be
     * closed here and reopened by its own handler in the same gesture.
     */
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setPanelOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    // Capture, so a handler that stops propagation on the way up — the rail's
    // drag start, for one — cannot swallow the dismissal.
    window.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [panelOpen])

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
        // One attribute write per *change*, not per frame. `data-active` is
        // the contract the hover layer and any CSS read; React's `active`
        // state stays the caption's source of truth.
        tileRefs.current[nearest]?.setAttribute('data-active', 'false')
        tileRefs.current[bestIndex]?.setAttribute('data-active', 'true')
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
      const behavior = reduced.matches ? 'auto' : 'smooth'
      scroller.scrollTo({ left: offsetFor(target), behavior })
      // An instant scroll has already landed, so snapping can come straight
      // back; only the smooth one needs the animation to finish first.
      if (behavior === 'auto') restoreSnap()
      else settleTimer = window.setTimeout(restoreSnap, 480)
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

      // If a tile itself holds focus, move the focus and let `focusin` do the
      // scrolling — otherwise the rail would slide out from under the focus
      // ring and leave it pointing at a tile nobody is on. When focus is on
      // the rail as a whole there is nothing to move, so it just scrolls.
      const focused = tileRefs.current.indexOf(
        document.activeElement as HTMLButtonElement,
      )
      if (focused >= 0) {
        const next = Math.min(BADGES.length - 1, Math.max(0, focused + step))
        tileRefs.current[next]?.focus()
        return
      }
      settleOn(nearest + step)
    }

    /**
     * Tabbing to a tile brings it to the centre.
     *
     * Gated on `:focus-visible` rather than firing for every focus: a mouse
     * `pointerdown` on a tile focuses the button *before* the drag has moved a
     * pixel, and an unguarded handler would scroll the rail back to the grab
     * point on every drag start. `:focus-visible` is exactly the distinction —
     * it is false for pointer focus and true for keyboard focus.
     */
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.matches?.(':focus-visible')) return
      const i = tileRefs.current.indexOf(target as HTMLButtonElement)
      if (i < 0) return
      releaseSnap()
      settleOn(i)
    }

    // Non-passive: React registers its own `onWheel` as passive at the root,
    // where `preventDefault` is a no-op and logs a console warning.
    scroller.addEventListener('wheel', onWheel, { passive: false })
    scroller.addEventListener('keydown', onKeyDown)
    scroller.addEventListener('pointerdown', onPointerDown)
    scroller.addEventListener('pointermove', onPointerMove)
    scroller.addEventListener('pointerup', onPointerUp)
    scroller.addEventListener('pointercancel', onPointerUp)
    scroller.addEventListener('focusin', onFocusIn)

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
      scroller.removeEventListener('focusin', onFocusIn)
    }
    // Rebuilt across a layout change. The horizontal rail unmounts in vertical
    // mode, so without this the listeners would stay bound to a detached
    // element and the *new* scroller — a different node — would come back dead.
  }, [vertical])


  /**
   * Pointer-reactive tilt — the one layer GSAP owns.
   *
   * The division of labour matters, because two writers on one `transform`
   * property is a fight neither wins. The rAF loop above owns the *surface*
   * (`[data-card-surface]`): scale from focus, boil offset — scroll-driven,
   * every visible tile, every frame. GSAP owns the *button*
   * (`[data-card]`): tilt and lift — pointer-driven, one tile at a time.
   * Different elements, so neither ever reads the other's output, and the
   * tilt composes over the scale for free because the button is the parent.
   *
   * `quickTo` rather than a tween per move: one reusable tween per property
   * per tile, built once here, then fed a number on each flush. A `gsap.to`
   * on every `pointermove` would allocate a timeline sixty times a second.
   */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    // Coarse pointers get nothing: a tilt keyed to a cursor that does not
    // exist would fire once on tap and stick. Reduced motion likewise — the
    // scroll layer degrades on its own, this layer simply does not run.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    const ctx = gsap.context(() => {
      /**
       * The reaction's dimensions. Bigger than a typical card tilt on
       * purpose — this plate is 498x517, and values tuned for a 300px card
       * read as nothing at this size.
       */
      /** Degrees. X is the shallower axis: the plate is taller than it is
       *  wide, so equal angles do not read as equal amounts of tilt. */
      const TILT_X = 8
      const TILT_Y = 10
      /** Resting lift once hovered, before the pointer's own contribution. */
      const LIFT = -10
      /** How far the plate slides toward the pointer, in px. Small — it is
       *  parallax, not a drag. */
      const SHIFT_X = 4
      const SHIFT_Y = -3
      const HOVER_SCALE = 1.025
      const GLOW = 0.55
      /** Spec'd band is 0.25-0.35; the same figure drives the pointer-follow
       *  so entry and tracking are one continuous motion rather than a fast
       *  snap handing over to a slow follow. */
      const DUR = 0.3

      type Tilt = {
        tile: HTMLButtonElement
        surface: HTMLDivElement
        rotateX: (v: number) => void
        rotateY: (v: number) => void
        shiftX: (v: number) => void
        lift: (v: number) => void
        scale: (v: number) => void
        glowX: (v: number) => void
        glowY: (v: number) => void
      }

      const tilts: Tilt[] = []
      const cleanups: (() => void)[] = []

      /** The tile under the pointer, and the last pointer position on it.
       *  Read once per frame rather than acted on per event — a mouse can
       *  outrun the compositor, and only the newest position matters. */
      let hovered: Tilt | null = null
      let pointerX = 0
      let pointerY = 0
      let queued = false

      const flush = () => {
        queued = false
        const t = hovered
        if (!t) return
        // Measured on the surface, not the button: the plate is drawn at the
        // focused size and scaled down, so it overflows its layout box by
        // ~89px a side. The button's rect would put the reaction's neutral
        // point off the visual centre of everything but the centred tile.
        // Read once per frame, and only for the single tile being hovered.
        const rect = t.surface.getBoundingClientRect()
        if (!rect.width || !rect.height) return

        // -1 at one edge, 0 dead centre, +1 at the other.
        const xPercent = ((pointerX - rect.left) / rect.width - 0.5) * 2
        const yPercent = ((pointerY - rect.top) / rect.height - 0.5) * 2

        // Y is negated: pushing the pointer down should tip the top of the
        // plate away from the viewer, not toward it. Getting this backwards
        // is the difference between a solid object and a bad hologram.
        t.rotateY(xPercent * TILT_Y)
        t.rotateX(yPercent * -TILT_X)
        t.shiftX(xPercent * SHIFT_X)
        t.lift(LIFT + yPercent * SHIFT_Y)

        // The highlight runs on the raw 0-1 fraction, not the signed one.
        t.glowX((xPercent * 0.5 + 0.5) * 100)
        t.glowY((yPercent * 0.5 + 0.5) * 100)
      }

      for (let i = 0; i < BADGES.length; i++) {
        const tile = tileRefs.current[i]
        const surface = cardRefs.current[i]
        if (!tile || !surface) continue

        // The perspective lives inside the button's own transform, so no
        // ancestor needs a `perspective` — which matters here, because the
        // ancestor is the scroller and giving it a 3D context would promote
        // twelve tiles at once.
        //
        // 1200 rather than the usual 900: perspective has to be read against
        // the size of the thing in it, and the plate is 517 tall. At 900 the
        // near edge projects ~4.6px past its resting position at full tilt,
        // which on a rail whose clip box used to have zero slack was most of
        // the reason the bottom edge cut. ~2.5x the element is the sane band.
        //
        // The transform origin is the button's centre, which is also the
        // plate's centre — the plate is drawn larger but centred on the same
        // point — so the tilt is symmetric about what is actually visible.
        gsap.set(tile, { transformPerspective: 1200, transformOrigin: 'center center' })

        // `power3.out` throughout, and no `back`/`elastic` anywhere: the
        // brief asks for no bounce on entry, and a plate this large
        // overshooting its own scale reads as a wobble, not as life.
        const ease = 'power3.out'
        const t: Tilt = {
          tile,
          surface,
          // Every transform property lives on the *button*, never the
          // surface — the scroll loop owns the surface's transform and two
          // writers on one property is a fight neither wins. The button is
          // the surface's parent, so a 1.025 here composes on top of the
          // loop's 0.64-to-1 rather than overwriting it.
          rotateX: gsap.quickTo(tile, 'rotationX', { duration: DUR, ease }),
          rotateY: gsap.quickTo(tile, 'rotationY', { duration: DUR, ease }),
          shiftX: gsap.quickTo(tile, 'x', { duration: DUR, ease }),
          lift: gsap.quickTo(tile, 'y', { duration: DUR, ease }),
          scale: gsap.quickTo(tile, 'scale', { duration: DUR, ease }),
          // Unitless 0-100; the stylesheet turns them into percentages. A
          // bare number has no unit for GSAP to mis-infer on a custom
          // property, which `%` and `px` both invite.
          glowX: gsap.quickTo(surface, '--pointer-x', { duration: DUR, ease }),
          glowY: gsap.quickTo(surface, '--pointer-y', { duration: DUR, ease }),
        }
        tilts.push(t)

        const onEnter = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
          hovered = t
          pointerX = event.clientX
          pointerY = event.clientY
          // Promoted only for the duration of the interaction. Left on
          // permanently it would pin the raster scale of a tile that spends
          // most of its life at 0.64 and has to survive being blown up to 1.
          tile.style.willChange = 'transform'

          // Lift and scale land before the pointer has moved a pixel, so the
          // card answers the arrival itself rather than waiting for the first
          // `pointermove` to tell it something happened.
          t.lift(LIFT)
          t.scale(HOVER_SCALE)
          // Shadow depth and edge come up together on one tween. Both are
          // paint, not transform, so they run on enter/leave only and never
          // per pointer move.
          gsap.to(surface, {
            '--glow': GLOW,
            '--lift': 1,
            '--edge': 1,
            duration: DUR,
            ease: 'power3.out',
            overwrite: 'auto',
          })
          flush()
        }

        const onMove = (event: PointerEvent) => {
          if (hovered !== t) return
          pointerX = event.clientX
          pointerY = event.clientY
          if (queued) return
          queued = true
          requestAnimationFrame(flush)
        }

        const onLeave = () => {
          if (hovered === t) hovered = null
          t.rotateX(0)
          t.rotateY(0)
          t.shiftX(0)
          t.lift(0)
          t.scale(1)
          t.glowX(50)
          t.glowY(50)
          gsap.to(surface, {
            '--glow': 0,
            '--lift': 0,
            '--edge': 0,
            duration: 0.4,
            ease: 'power3.out',
            overwrite: 'auto',
            // Dropped only once the tile is actually back at rest, so the
            // return tween itself still runs on a promoted layer.
            onComplete: () => {
              tile.style.willChange = ''
            },
          })
        }

        tile.addEventListener('pointerenter', onEnter)
        tile.addEventListener('pointermove', onMove)
        tile.addEventListener('pointerleave', onLeave)
        // A drag that starts on a tile and ends elsewhere never fires
        // `pointerleave`, so the tile would hold its tilt for good.
        tile.addEventListener('pointercancel', onLeave)
        cleanups.push(() => {
          tile.removeEventListener('pointerenter', onEnter)
          tile.removeEventListener('pointermove', onMove)
          tile.removeEventListener('pointerleave', onLeave)
          tile.removeEventListener('pointercancel', onLeave)
          tile.style.willChange = ''
        })
      }

      return () => {
        for (const off of cleanups) off()
      }
    }, scrollerRef)

    // `revert()` kills every tween the context made *and* restores the
    // inline styles it wrote, so the buttons go back to untransformed rather
    // than keeping whatever rotation they were mid-tween on.
    return () => ctx.revert()
    // Same as the loop above: the tiles it binds to are gone in vertical mode.
  }, [vertical])

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
    /* The rail owns the viewport; the header and the caption float over it.
       Previously all three were rows in a flex column, so the rail only ever
       got what the other two left — and what they left was the wrong shape for
       both layouts. The helix wants height above all else, because its whole
       subject is the cards above and below the focused one. The horizontal rail
       wants the room to let a focused plate overflow its 332px layout box
       without being clipped. Splitting the difference between a header, a rail
       and a caption gave neither.
       So: `h-svh` exactly, not `min-h-svh` — this is a board, not a document,
       and it must not be able to grow a scrollbar. */
    <div className="font-lausanne relative h-svh w-full overflow-hidden bg-white">
      {/* Node 318:21420 — the rail, now the full viewport. */}
      <div className="absolute inset-0 flex items-center">
        {vertical ? (
          <VerticalRail
            columnRef={columnRef}
            setSlotRef={setSlotRef}
            active={active}
            helix={helix}
            targetRef={helixTarget}
            onFront={setActive}
            dragged={dragged}
          />
        ) : (
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
          data-card-rail
          className="scroll-hidden relative flex h-full w-full cursor-grab touch-pan-y snap-x snap-mandatory select-none items-center overflow-x-auto overflow-y-hidden outline-none"
          style={{
            gap: TILE_GAP,
            // Enough lead-in and lead-out that the first and last tiles can
            // reach the centre. Without it the rail can only centre the
            // middle ten, and the two ends are permanently small.
            paddingInline: `calc(50% - ${TILE_W / 2}px)`,
            // The focused tile overflows its box by 92.5px each way; the
            // rail has to let that out or the grow is clipped at the tile
            // edge. Plus `RAIL_BLEED`, because matching the overflow exactly
            // leaves the plate's edges sitting on the clip line — see the
            // constant for what that costs.
            paddingBlock: (FOCUS_H - TILE_H) / 2 + RAIL_BLEED,
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
              data-card
              data-active={i === active}
              className="relative shrink-0 cursor-pointer snap-center bg-transparent p-0"
              style={{ width: TILE_W, height: TILE_H }}
            >
              <div
                ref={setCardRef(i)}
                data-card-surface
                className="badge-shimmer card-glow absolute top-1/2 left-1/2 overflow-clip"
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
                  // Stagger the shimmer so each badge sweeps in sequence.
                  '--shimmer-delay': `${i * 0.25}s`,
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
                  // Cast because `CSSProperties` has no room for a custom
                  // property, and `--shimmer-delay` is one.
                } as CSSProperties}
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
        )}
      </div>

      {/* Node 317:17934 — the title pill, with the layout toggle beside it.
          The toggle is not in the design; it is set in the pill's own language
          — same black, same radius — so it reads as part of the header rather
          than as a control bolted onto the page.

          `pointer-events-none` on the bar and `auto` on the toggle: the rail
          now runs the full height of the viewport, so this sits *on top of* its
          scroll surface. Left solid it would be a dead strip across the top
          where the wheel does nothing and a drag cannot start — and the pill is
          a label, so it has no business swallowing either. Only the control
          takes the pointer back. */}
      <div className="pointer-events-none absolute top-9 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <div className="flex items-center justify-center gap-3 rounded-xl bg-black py-3 pr-5 pl-3">
          <img src={iconDotGrid} alt="" className="size-10 shrink-0" />
          <p className="text-[40px] leading-[1.0008] font-semibold tracking-[-0.8px] whitespace-nowrap text-white">
            {COPY.title}
          </p>
        </div>
        <div className="pointer-events-auto">
          <LayoutToggle value={layout} onChange={setLayout} />
        </div>
      </div>

      {/* Node 312:3165 — the caption, which is the rail's readout. Floating for
          the same reason as the header, and transparent to the pointer for the
          same reason too — this one matters more, because at 482×154 in the
          middle of the bottom edge it would otherwise be a hole in the helix's
          scroll surface exactly where a thumb lands. */}
      <div
        // 62 = the design's 38 off the bottom edge, plus 24 to lift it clear of
        // it. The board had the caption as the last row of a column, where its
        // gap came from the page's own bottom padding; floating it took that
        // away and left it sitting low.
        className="pointer-events-none absolute bottom-[62px] left-1/2 z-20 w-[482px] max-w-[calc(100%-48px)] -translate-x-1/2 overflow-clip p-5"
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

            {/* A button, not the design's link. It opens a panel on this page
                rather than going anywhere, and the arrow is the only thing
                about it that suggests otherwise — kept because it is the
                design's, and because the panel does arrive from up and to the
                right of the caption, which is roughly what it points at. */}
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              aria-expanded={panelOpen}
              aria-controls={PANEL_ID}
              // `pointer-events-auto` because the card around it is transparent
              // to the pointer — see the note there. This is the one thing in
              // the caption that takes it back.
              className="group pointer-events-auto relative flex shrink-0 cursor-pointer items-center justify-center gap-1 bg-transparent p-0"
            >
              {/* Both sit above the fill: the fill is later in the DOM, so
                  without a stacking context of their own it would paint over
                  the very text it is meant to sit behind. */}
              <p className="relative z-[1] text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px] whitespace-nowrap text-black transition-colors duration-300 ease-out group-hover:text-white group-focus-visible:text-white motion-reduce:transition-none">
                {COPY.requirements}
              </p>
              {/* The arrow is an `<img>` of an SVG with a hard-coded
                  `fill="black"`, so `currentColor` cannot reach it and the
                  text's own colour transition does nothing here. Inverting
                  the whole image is the one lever left, and on a glyph that
                  is pure black on transparent it lands on exactly white. */}
              <img
                src={iconArrowUpRight}
                alt=""
                className="relative z-[1] size-5 shrink-0 transition-[filter] duration-300 ease-out group-hover:invert group-focus-visible:invert motion-reduce:transition-none"
              />
              {/* The underline and the hover fill are the same element.

                  It is laid out at its *full* height — the button's 20.02px
                  plus 4px below and 4px above — and then scaled down on the Y
                  axis to roughly 2/28 of that, which is the 2px rule as drawn.
                  So one property carries the whole hover.

                  The 4px above is the balance the design asks for: the rule
                  already sits 4px below the button, so the block has to clear
                  the top by the same 4px or the text ends up sitting low in
                  its own fill. `calc(100% + 8px)` is those two edges.

                  The scale is a rounded constant rather than an exact ratio,
                  which costs nothing: it is only ever wrong about the *resting*
                  rule, by four ten-thousandths of a pixel, and the expanded
                  state is `scaleY(1)` and therefore exact by construction.

                  `origin-bottom` is what makes it grow only upward: the bottom
                  edge is the fixed point, so the rule lifts into a block
                  instead of inflating from its middle. And scaling rather than
                  animating `height` keeps it on the compositor — a solid fill
                  has no detail to lose to a 14x stretch. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[4px] origin-bottom scale-y-[0.0714] bg-black transition-transform duration-300 ease-out group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
                style={{ height: 'calc(100% + 8px)' }}
              />
            </button>
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

      {/* Node 318:22783 — the requirements panel. */}
      <AnimatePresence>
        {panelOpen && (
          <RequirementsPanel
            ref={panelRef}
            badge={badge}
            morph={morph}
            reduced={reducedMotion}
            heavyFilters={heavyFilters}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Rail or helix.
 *
 * A radiogroup rather than two toggle buttons, because the options are
 * mutually exclusive and that is the difference the roles carry: `aria-pressed`
 * on a pair of buttons says "two independent switches, both currently off but
 * one", where a radiogroup says "one setting, two values". Roving tabindex to
 * match — a radiogroup is one tab stop, and the arrows move within it.
 */
function LayoutToggle({
  value,
  onChange,
}: {
  value: LayoutMode
  onChange: (next: LayoutMode) => void
}) {
  const modes = Object.keys(LAYOUTS) as LayoutMode[]
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (from: number, step: number) => {
    // Wrapping, which is what a radiogroup does — arrowing off the end of a
    // two-option group and stopping there is indistinguishable from a dead key.
    const next = (from + step + modes.length) % modes.length
    onChange(modes[next])
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Badge layout"
      className="flex shrink-0 items-center gap-1 rounded-xl bg-black p-1"
    >
      {modes.map((mode, i) => {
        const selected = mode === value
        return (
          <button
            key={mode}
            ref={(node) => {
              refs.current[i] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            // One tab stop for the group: only the selected option is
            // reachable by Tab, and the arrows do the rest.
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(mode)}
            onKeyDown={(event) => {
              const step =
                event.key === 'ArrowRight' || event.key === 'ArrowDown'
                  ? 1
                  : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                    ? -1
                    : 0
              if (!step) return
              event.preventDefault()
              move(i, step)
            }}
            className={`cursor-pointer rounded-lg px-4 py-2 text-[20px] leading-[1.0008] font-semibold tracking-[-0.4px] whitespace-nowrap transition-colors duration-200 ${
              selected ? 'bg-white text-black' : 'bg-transparent text-white/55 hover:text-white'
            }`}
          >
            {LAYOUTS[mode]}
          </button>
        )
      })}
    </div>
  )
}

/**
 * The vertical layout: a scroller of transparent snap targets over a helix.
 *
 * The split is the point. Every visible thing is in the canvas, and every
 * *interactive* thing is a real focusable button in a real scroll container
 * above it — so the helix costs nothing in accessibility terms. A screen reader
 * gets a listbox of twelve named options, the keyboard gets arrows and Tab, and
 * touch gets the platform's own fling and snap. The canvas is `aria-hidden`
 * scenery drawn from the position that scroller reports. (The scrollbar itself
 * is hidden, matching the horizontal rail — `scroll-hidden` — so the snap
 * targets and the keyboard are carrying the whole affordance.)
 *
 * That is the same bargain the horizontal rail strikes — the browser owns the
 * scroll position, the renderer owns everything downstream of it — and it is
 * why neither layout needed a scroll-hijacking library to feel like anything.
 */
/**
 * Which way a drag on the helix moves the scroll.
 *
 * +1, against the horizontal rail's implicit −1, and it is the helix that
 * inverts rather than the gesture: a card's height above the camera is
 * `(i − index) · RISE`, so a rising index carries every card *downward* and
 * badge i+1 sits above badge i, where a document does the opposite. Held as a
 * named constant rather than a stray `+` because it is the single place the two
 * rails disagree, and a bare sign is exactly the kind of thing that gets
 * "tidied" back to matching the other one.
 */
const DRAG_DIRECTION = 1

/**
 * How far the design's 498×517 card is scaled down for the flat vertical
 * column — the no-WebGL and reduced-motion path.
 *
 * 0.44 puts the card at 228px in a 260px pitch, so it keeps about 30px of air
 * between one card and the next. One factor for the whole card, so the corner
 * radius and the badge's offsets inside it stay the design's numbers rather
 * than becoming a second set to keep in step.
 */
const FALLBACK_CARD = 0.44

function VerticalRail({
  columnRef,
  setSlotRef,
  active,
  helix,
  targetRef,
  onFront,
  dragged,
}: {
  columnRef: RefObject<HTMLDivElement | null>
  setSlotRef: (i: number) => (node: HTMLButtonElement | null) => void
  active: number
  helix: boolean
  targetRef: { current: number }
  onFront: (index: number) => void
  /** Set by a drag that actually moved, read by the click that follows it. */
  dragged: RefObject<boolean>
}) {
  return (
    // Full height, because the scroller's percentage-height lead-in and
    // lead-out resolve against it — and because the helix has nothing to show
    // in a short box: its subject is the cards above and below the focused one.
    <div className="relative h-full w-full">
      {helix && (
        <BadgeHelix
          badges={BADGES}
          targetRef={targetRef}
          onFront={onFront}
          fog={PAGE}
          className="pointer-events-none absolute inset-0"
        />
      )}

      <div
        ref={columnRef}
        tabIndex={0}
        role="listbox"
        aria-label="Badges"
        aria-orientation="vertical"
        // `cursor-grab` because it is one: mouse and pen can take hold of the
        // helix and turn it. `select-none` so a drag does not leave a trail of
        // selected slot labels behind it.
        className="scroll-hidden absolute inset-0 cursor-grab snap-y snap-mandatory select-none overflow-y-auto outline-none"
      >
        {/* Half a viewport of lead-in and lead-out, so the first and last badge
            can reach the centre. A percentage *height* — unlike the horizontal
            rail's percentage padding, which resolves against width and would be
            meaningless here — and it resolves because the scroller is
            `absolute inset-0` and so has a definite height of its own. */}
        <div
          aria-hidden
          className="shrink-0"
          style={{ height: `calc(50% - ${VERTICAL_PITCH / 2}px)` }}
        />
        {BADGES.map((item, i) => (
          <button
            key={item.name}
            ref={setSlotRef(i)}
            type="button"
            role="option"
            aria-selected={i === active}
            aria-label={`${item.name} badge`}
            className="block w-full shrink-0 cursor-grab snap-center bg-transparent p-0"
            style={{ height: VERTICAL_PITCH }}
            onClick={() => {
              // A pointerup after a drag still fires a click on whatever slot
              // the cursor ended over, and centring on that would undo the
              // drag. Same guard the horizontal rail's tiles use.
              if (dragged.current) return
              columnRef.current?.scrollTo({ top: i * VERTICAL_PITCH, behavior: 'smooth' })
            }}
          >
            {/* Nothing in helix mode — the canvas behind is the whole picture.
                Without WebGL, or under reduced motion, this is the layout: the
                same cards in a plain column, scrolling and snapping exactly the
                same way, minus the winding. The card is the design's 498×517
                scaled down to sit in the pitch with air around it, so every
                offset inside it is the design's own number times one factor. */}
            {!helix && (
              <div
                className="relative mx-auto overflow-clip"
                style={{
                  width: FOCUS_W * FALLBACK_CARD,
                  height: FOCUS_H * FALLBACK_CARD,
                  background: PLATE,
                  borderRadius: TILE_RADIUS * FALLBACK_CARD,
                }}
              >
                <img
                  src={item.art}
                  alt=""
                  draggable={false}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="pointer-events-none absolute max-w-none"
                  style={{
                    width: BADGE_IMG * FALLBACK_CARD,
                    height: BADGE_IMG * FALLBACK_CARD,
                    left: BADGE_IMG_X * FALLBACK_CARD,
                    top: BADGE_IMG_Y * FALLBACK_CARD,
                  }}
                />
              </div>
            )}
          </button>
        ))}
        <div
          aria-hidden
          className="shrink-0"
          style={{ height: `calc(50% - ${VERTICAL_PITCH / 2}px)` }}
        />
      </div>
    </div>
  )
}

/** Wired to the trigger's `aria-controls`, so the two have to agree on it. */
const PANEL_ID = 'writers-garden-requirements'

/**
 * The side panel — node 318:22783, "Frame 470".
 *
 * A glass card floated over the right of the page: the badge small at the top,
 * its name at 56px, the sentence the caption already shows with a tagline above
 * it, and the four things that actually earn it.
 *
 * It is `fixed` rather than absolute. The page root is `min-h-svh` with
 * `overflow-hidden`, so an absolute panel would be pinned to a box that is the
 * viewport's height *or taller* — on a short window the panel's bottom inset
 * would hang below the fold. Fixed measures the viewport itself, which is what
 * "32 off every edge" means on a board that has no fixed height.
 */
const RequirementsPanel = forwardRef<
  HTMLElement,
  {
    badge: Badge
    morph: ReturnType<typeof captionMorph>
    reduced: boolean | null
    heavyFilters: boolean
  }
>(function RequirementsPanel({ badge, morph, reduced, heavyFilters }, ref) {
  return (
    <motion.aside
      ref={ref}
      id={PANEL_ID}
      role="region"
      aria-label={COPY.panelLabel(badge.name)}
      /* The panel slides in from off the right edge — its own width plus its
         inset, so it starts fully clear of the viewport and no corner of it is
         ever half-drawn against the page edge.
         `springMorph` rather than a tween: at ζ = 32 / 2√300 ≈ 0.92 it lands
         without overshoot, which a surface this size needs — a 541px card that
         bounces reads as a bug — while still arriving with the weight of a
         spring instead of a fixed number of milliseconds. */
      initial={reduced ? { opacity: 0 } : { x: PANEL_W + PANEL_INSET }}
      animate={reduced ? { opacity: 1 } : { x: 0 }}
      /* Out faster than in, and on a tween. Dismissal should feel like the
         panel got out of the way, not like it was let down gently — and a
         spring's tail keeps a `backdrop-filter` surface on screen, repainting,
         for a good 150ms after it has visually gone. */
      exit={
        reduced
          ? { opacity: 0, transition: { duration: 0.15 } }
          : {
              x: PANEL_W + PANEL_INSET,
              transition: { duration: 0.24, ease: ease.smooth },
            }
      }
      transition={reduced ? { duration: 0.15 } : springMorph}
      className="fixed z-40 flex flex-col overflow-y-auto overflow-x-clip"
      style={{
        top: PANEL_INSET,
        right: PANEL_INSET,
        bottom: PANEL_INSET,
        width: PANEL_W,
        maxWidth: `calc(100% - ${PANEL_INSET * 2}px)`,
        borderRadius: PANEL_RADIUS,
        padding: PANEL_PAD,
        /* The design's fill is a 7% tint over a 250px backdrop blur, and the
           blur is what does the separating — the tint alone lands within a
           couple of levels of the plates behind it.
           Tier-gated on the same check the ghost name uses. A 541×960
           `backdrop-filter` is a full-surface readback and re-blur every frame,
           and it is composited *while* the panel is travelling 573px; on a
           machine that cannot afford it the panel is the one thing on the page
           that would stutter. Below tier 2 it gets the flat plate instead —
           which stops the rail rather than softening it, but at that point
           stopping it is the honest trade. */
        background: heavyFilters ? PANEL_TINT : PANEL_TINT_FLAT,
        backdropFilter: heavyFilters ? `blur(${PANEL_BLUR}px)` : undefined,
        WebkitBackdropFilter: heavyFilters ? `blur(${PANEL_BLUR}px)` : undefined,
      }}
    >
      {/* Node 318:22904 — the badge, small, and turning.
          Outside the cross-fade below on purpose. `SpinningBadge` owns a WebGL
          context, and a page gets about sixteen of those before the browser
          starts dropping the oldest out from under whoever still holds it — so
          it must not be keyed on the badge, which changes every time the rail
          moves. It stays mounted for the panel's life and dissolves its own
          texture instead.
          The stage is wider than the 100px frame the design draws, because a
          quad under perspective magnifies its near edge as it turns; the badge
          still *rests* at exactly the design's size. See `SPIN_HEADROOM`. */}
      <div
        className="relative shrink-0"
        style={{
          width: PANEL_BADGE,
          height: PANEL_BADGE,
          marginBottom: PANEL_GAP,
        }}
      >
        <SpinningBadge
          src={badge.art}
          size={PANEL_BADGE_STAGE}
          back={PANEL_BADGE_BACK}
          className="pointer-events-none absolute max-w-none"
          style={{
            left: PANEL_BADGE_STAGE_OFFSET,
            top: PANEL_BADGE_STAGE_OFFSET,
          }}
          /* Reduced motion, no WebGL, or a shader that would not build. The
             same normalised export placed the same way the rail places it: the
             image is `BADGE_BOX` units wide against a `BADGE_SIZE` frame, so it
             is drawn proportionally larger and backed off by the margin. No CSS
             drop-shadow — the SVG carries the design's own. */
          fallback={
            <img
              src={badge.art}
              alt=""
              draggable={false}
              decoding="async"
              className="pointer-events-none absolute max-w-none"
              style={{
                width: PANEL_BADGE_IMG,
                height: PANEL_BADGE_IMG,
                left: PANEL_BADGE_OFFSET,
                top: PANEL_BADGE_OFFSET,
              }}
            />
          }
        />
      </div>

      {/* `popLayout` rather than the caption's absolute stack. The caption can
          reserve its tallest state and overlap two copies inside it; this
          column is 600px of heading, copy and four rows, and reserving the
          tallest of twelve would leave a visible hole under the short ones.
          popLayout takes the *outgoing* copy out of flow instead, so the
          incoming one lays out normally and the panel keeps scrolling like an
          ordinary block — the same blur-morph, none of the bookkeeping. */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={badge.name}
          {...morph}
          // `shrink-0` because the panel is a column flex *and* the scroll
          // container: without it a content column taller than a short viewport
          // is squeezed to fit rather than being allowed to overflow, and the
          // scrollbar it needs never appears.
          className="flex w-full shrink-0 flex-col items-start"
          style={{ gap: PANEL_GAP }}
        >
          {/* Node 318:22801. The panel's heading, and the only place the badge
              name is set as type rather than as the rail's 200px scenery. */}
          <h2 className="text-[56px] leading-[1.0008] font-semibold tracking-[-1.12px] text-black">
            {badge.name}
          </h2>

          {/* Node 321:23254 — one text node in Figma, two lines here. The
              second is the caption's sentence; only the first is the panel's
              own. Both at 1.5 rather than the page's 1.0008: this is the one
              block of running copy on the page and it is the only thing that
              has to be read rather than recognised. */}
          <div
            className="w-full text-[20px] leading-[1.5] font-semibold tracking-[-0.4px]"
            style={{ color: PANEL_MUTED }}
          >
            <p>{badge.tagline}</p>
            <p>{badge.detail}</p>
          </div>

          {/* Node 321:23259 — what earns it. A list, because it is one, and
              four of them for every badge so the column's shape does not lurch
              as the rail moves under an open panel. */}
          <ul
            className="flex w-full list-none flex-col p-0"
            style={{ gap: PANEL_GAP }}
          >
            {badge.requirements.map((requirement) => (
              <li key={requirement.label} className="flex items-center gap-3">
                <img
                  src={requirement.icon}
                  alt=""
                  className="size-6 shrink-0"
                  draggable={false}
                />
                <span className="text-[24px] leading-[1.0008] font-semibold tracking-[-0.48px] text-black">
                  {requirement.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  )
})

/**
 * From the reference site's measured vocabulary: two eases carry the whole
 * thing, and `power2.out` is ~60% of every tween on it. This is that curve —
 * GSAP's `power2` is a cubic — at the 0.3s the same audit found clustered
 * under UI feedback. Nothing here has earned `back` or `elastic`.
 */
const CAPTION_EASE = [0.215, 0.61, 0.355, 1] as const

/** How long the outgoing line has to itself before the incoming one starts. */
const CAPTION_LEAD = 0.04

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
 * The exit also runs shorter than the entrance, and the entrance waits a beat.
 * A symmetric cross-fade puts both strings at 50% at the midpoint, and for the
 * two-line name that is the morph working — but the detail underneath is three
 * lines of body copy that wrap differently for every badge, and two of those
 * superimposed at equal weight is unreadable soup. Weighting it — the old text
 * mostly gone before the new one is legible — keeps a real overlap, so it is
 * still one thing changing rather than a hard cut, while never showing two
 * paragraphs at equal strength.
 *
 * Reduced motion keeps the cross-fade, since something has to cover the swap,
 * and drops the blur and the travel.
 */
function captionMorph(reduced: boolean | null) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2, ease: CAPTION_EASE } },
      exit: { opacity: 0, transition: { duration: 0.2, ease: CAPTION_EASE } },
    } as const
  }
  return {
    initial: { opacity: 0, y: 5, filter: 'blur(4px)' },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        opacity: { duration: 0.3, ease: CAPTION_EASE, delay: CAPTION_LEAD },
        y: { duration: 0.3, ease: CAPTION_EASE, delay: CAPTION_LEAD },
        filter: { duration: 0.38, ease: CAPTION_EASE, delay: CAPTION_LEAD },
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      filter: 'blur(4px)',
      transition: { duration: 0.22, ease: CAPTION_EASE },
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
