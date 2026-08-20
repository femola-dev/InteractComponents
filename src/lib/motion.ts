/**
 * House motion presets for Framer Motion. Mirrors the token block in
 * src/index.css so JS and CSS animation never drift apart. Import these into
 * components instead of writing inline easing/duration/spring values.
 *
 * Framer Motion wants easing as a cubic-bezier control-point array
 * ([x1, y1, x2, y2]), not a CSS string — these arrays correspond 1:1 to the
 * --ease-* custom properties in index.css.
 */
import type { SpringOptions, Transition, Variants } from 'framer-motion'

export const ease = {
  smooth: [0.22, 1, 0.36, 1],
  out: [0.17, 1, 0.32, 1],
  spring: [0.35, 1.55, 0.65, 1],
  inOut: [0.66, 0, 0.34, 1],
} as const

export const duration = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.28,
} as const

/** Default transition for almost everything. */
export const transitionSmooth: Transition = {
  duration: duration.slow,
  ease: ease.smooth,
}

/** Snappy feedback for press/hover state changes. */
export const transitionFast: Transition = {
  duration: duration.fast,
  ease: ease.smooth,
}

/** For anything that should feel weighty and alive: sliders, drag handles,
 *  counters, cards flying between containers (pair with the `layout` prop). */
export const springResponsive: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.8,
}

/** For a large surface changing shape — a pill growing into a tray and back.
 *  Softer and heavier than `springResponsive`: at a 0.92 damping ratio it
 *  settles without visible overshoot, which a box this size needs, while still
 *  carrying the weight of a real spring rather than a fixed-duration ease. */
export const springMorph: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 32,
  mass: 1,
}

/**
 * A panel changing state in place — the membership composer becoming its own
 * receipt, and anything else where a box resizes while its contents swap.
 *
 * Critically damped by construction rather than by eye: ζ = c / 2√(km) =
 * 46.5 / 2√(540 × 1) = 1.00. That is the exact boundary between overshoot and
 * crawl, and the fastest a second-order system can reach its target *without
 * passing it*, which is the entire requirement here — a box that overshoots its
 * own height reads as jelly. Every spring in this file that is allowed to
 * overshoot (`springPill`, `springOvershoot`) is small, or horizontal, or both.
 *
 * ωn = √(k/m) ≈ 23.2 rad/s puts the 2% settle at 5.8/ωn ≈ 0.25s, so the height
 * arrives just as the crossfade underneath it finishes rather than after it.
 *
 * Worth naming explicitly wherever `layout` is used: Framer's own default
 * layout transition sits near ζ ≈ 0.55, which is visibly springy on a surface
 * of any size.
 */
export const springSnap: Transition = {
  type: 'spring',
  stiffness: 540,
  damping: 46.5,
  mass: 1,
}

/**
 * A rail travelling between two widths — the membership dashboard's sidebar
 * minimising and maximising.
 *
 * `SpringOptions`, not `Transition`, and that is the point of it. A `Transition`
 * spring on an `animate` prop is re-solved from the value's current position
 * every time the target changes; a `useSpring` integrates one continuous state,
 * so velocity survives a new target. Double-click the collapse control and the
 * rail turns around carrying the speed it already had, instead of stopping dead
 * and restarting — which is the difference between a control with mass and two
 * animations queued back to back.
 *
 * Snappy by construction rather than by eye. ωn = √(k/m) = √2100 ≈ 45.8 rad/s
 * and ζ = c / 2√(km) = 62 / 2√2100 ≈ 0.68, which puts:
 *
 *   - peak at tp = π/ωn√(1-ζ²) ≈ 93ms — the edge is *past* its target by then
 *   - overshoot at e^(-πζ/√(1-ζ²)) ≈ 5.6%, about 9px on the 167px travel
 *   - settled (2%) at 4/ζωn ≈ 130ms
 *
 * Two things are doing the work, and they are independent — which is worth
 * knowing before reaching for either.
 *
 * **ωn is the speed.** It is the only knob that makes this arrive sooner, and
 * both times above scale as 1/ωn. Raising it is what took this from a 160ms
 * peak to a 93ms one. Past ωn ≈ 55 the whole travel fits inside about four
 * frames and the rail stops reading as a thing that moved — it reads as a cut,
 * and then the only motion left on screen is the overshoot coming back, which
 * looks like a glitch rather than a settle.
 *
 * **ζ is the snap.** The overshoot is what separates snappy from merely fast:
 * `springSnap` next to this is critically damped, and feels eased at any speed
 * you set it to because it never passes anything. Below ζ ≈ 0.6 the return trip
 * becomes a second visible bounce, and a full-height boundary wobbling twice
 * reads as a bug rather than as weight.
 *
 * Nothing else needs retuning when these move. Every fade in the sidebar is
 * keyed to the rail's *width* rather than to a clock (see `FADE` in
 * MembershipDashboard), so the choreography holds at any speed this spring
 * runs at.
 *
 * `restDelta`/`restSpeed` are looser than the library's 0.001/0.01 defaults on
 * purpose: this value is a layout width, so every frame it moves reflows the
 * table beside it and re-evaluates its container queries. Half a pixel is below
 * what a boundary can show, and stopping there saves an asymptotic tail that
 * costs real layout work and displays as nothing — which matters more at this
 * ωn, where the tail would otherwise be a larger share of the whole move.
 */
export const springRail: SpringOptions = {
  stiffness: 2100,
  damping: 62,
  mass: 1,
  restDelta: 0.5,
  restSpeed: 8,
}

/**
 * A small pill snapping open into a wider one — the bottom switcher's hover
 * morph, and anything else where the shape change *is* the interaction.
 *
 * Deliberately livelier than `springMorph`. That one is tuned for a large
 * surface where overshoot reads as a wobble; here the box is ~40px tall and the
 * travel is mostly horizontal, so a little elasticity is the point. At
 * ζ = c / 2√(km) = 26 / 2√(340 × 1) ≈ 0.71 the width passes its target by
 * roughly 4% and comes back once — a pill that snaps rather than inflates —
 * and ωn = √(k/m) ≈ 18.4 rad/s settles it in about 4/ζωn ≈ 0.30s.
 *
 * Below ζ ≈ 0.6 the return trip becomes a second visible bounce and the pill
 * reads as rubbery; above ζ ≈ 0.85 the overshoot disappears and it is just
 * `springMorph` with extra steps.
 */
export const springPill: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 26,
  mass: 1,
}

/**
 * A detented wheel: the Move carousel's rotation, and anything else that steps
 * between fixed stops under its own momentum.
 *
 * `SpringOptions`, not `Transition`, because this drives a `useSpring` motion
 * value rather than an `animate` prop — the difference matters. A `Transition`
 * spring is re-solved from rest each time the target changes; a `useSpring`
 * integrates one continuous state, so velocity survives a new target. That is
 * the whole point here: hold the next key and each press lands on a wheel that
 * is already moving, and the steps compound into one accelerating spin instead
 * of restarting as a queue of identical hops.
 *
 * Tuned as a real second-order system rather than by eye. With
 * ζ = c / 2√(km) = 24 / 2√(200 × 1.1) ≈ 0.81 it is underdamped just enough to
 * pass the detent and settle back into it — the click of a wheel finding its
 * stop — and ωn = √(k/m) ≈ 13.5 rad/s puts that settle at roughly 4/ζωn ≈ 0.37s.
 * Push ζ to 1 and it creeps in dead; drop it to 0.6 and the overshoot reads as
 * a wobble rather than a detent.
 *
 * `restDelta` is in degrees, since that is the unit the wheel's value carries.
 */
export const springWheel: SpringOptions = {
  stiffness: 200,
  damping: 24,
  mass: 1.1,
  restDelta: 0.01,
}

/**
 * The shuffle's throw, in two acts: a flat fast cruise, then a spring that
 * catches it and lets it die.
 *
 * What was here before was one timing table — fourteen keyframe times on a
 * geometric ritardando, with the audio reading the same array so the clicks
 * could not drift from the cards. It is gone, and what replaced it is both
 * smaller and more honest, because the table was authoring the wrong half.
 *
 * A wheel's *throw* is a decision: how fast, how long. Its *ending* is not —
 * that is just what a mass with drag does when you stop pushing it, and every
 * number in a hand-built ritardando is a guess at a curve physics already
 * knows. So the cruise is the only thing authored here, and the end is
 * `springThrow` released into the final detent with the cruise's velocity still
 * in it.
 *
 * Three things the table had to fake now fall out for free:
 *
 * - **The wheel eases in.** `springWheel` needs ~0.3s to reach cruise from
 *   rest, so the reel spins up instead of starting at full speed.
 * - **The sound follows.** The beeps fire on real detent crossings, so they
 *   accelerate, hold, and slow down with the picture without knowing any of
 *   these numbers.
 * - **The ritardando is real.** It is a second-order settle, not 1.14 per step.
 */
export const SPIN_SECONDS = 4

/**
 * Seconds per card at cruise — the beat of the throw, and the one number that
 * sets how fast the whole thing feels.
 *
 * 85ms is about as tight as the beeps can be packed and still be counted: the
 * pip's own envelope runs ~54ms, so at this spacing each one has died before
 * the next lands. Under about 70ms they smear into a buzz and the wheel stops
 * sounding like it is counting anything.
 *
 * The old table only touched this tempo for its first two cards before the
 * ritardando took over — average gap across the throw was 206ms. Holding it
 * flat for the whole cruise is most of why this reads so much faster now, and
 * none of it is a higher top speed.
 */
const SPIN_TEMPO = 0.085

/**
 * The tail the spring gets to itself, out of the four seconds.
 *
 * Sized by the *last card*, not by the spring's own settling time. A
 * second-order settle is asymptotic: the final card is over the top of the
 * wheel long before the maths finishes, and everything after that is a wheel
 * the eye has already read as stopped. Give the spring the full time it wants
 * to land within a fifth of a degree and you buy half a second of dead air.
 *
 * So this is set by where the card *arrives*: 1.1s puts the wheel within eight
 * pixels of its seat at almost exactly four seconds. The last detent crossing
 * is 520ms before that and is not the end of anything — at that moment the card
 * is still half a pitch out and travelling — which is the distinction that
 * matters here and the one that used to be got wrong.
 */
export const SPIN_SETTLE = 1.1

/** The driven half: constant speed, no easing, from the press to the handover. */
export const SPIN_THROW = SPIN_SECONDS - SPIN_SETTLE

/**
 * Cards crossed under power, and cards coasted after it — 34 and 3.
 *
 * The coast is the length of the ritardando, and it trades directly against how
 * cleanly the card arrives. Both come out of one relation: a spring sheds v over
 * a distance d ≈ v/ωn and takes ~5.9/ζωn to actually get there, so
 *
 *     coast (cards) ≈ rate × ζ × arrival-time / 5.9
 *
 * At 11.7 cards/s and a 1.1s tail that is three, and three is what fits. Five
 * was tried and it is where this went wrong: a spring soft enough to coast five
 * cards is still 300px from its seat when the last card crosses, and crawls the
 * rest over another 800ms. The ritardando sounded better and the card never
 * quite landed — the ending you could hear and the ending you could see were
 * half a second apart.
 *
 * So the gaps are the ones three cards buy:
 *
 *     85ms · 86 · 95 · 125 · 240 · [pocket at +523]
 *
 * Nothing chose those. They are what a spring crossing evenly spaced detents
 * does, and the widening accelerates because the approach is exponential. The
 * pocket is the last beat of the same curve — it lands on the arrival, which is
 * half a pitch and half a second past the final crossing, and that long last
 * interval is the ritardando resolving rather than a gap in it.
 */
export const SPIN_CRUISE_DETENTS = Math.round(SPIN_THROW / SPIN_TEMPO)
export const SPIN_COAST_DETENTS = 3

/**
 * Cards the wheel travels in total.
 *
 * Nearly three times what the old table ran, and the cost is not what the count
 * suggests. The carousel mounts every card the rim crosses, and each panel
 * carries four copies of its poster for the blur ramp — but the window is five
 * panels wide whatever the throw does, so the *concurrent* load is fixed. What
 * scales is fetches, and those are bounded by the deck rather than by the
 * throw: 37 crossings of a 38-film deck is one lap, and a second lap would be
 * the browser's cache.
 */
export const SPIN_DETENTS = SPIN_CRUISE_DETENTS + SPIN_COAST_DETENTS

/** Cards per second at cruise. Multiply by the wheel's step for degrees. */
export const SPIN_CRUISE_RATE = SPIN_CRUISE_DETENTS / SPIN_THROW

/**
 * The wheel dying: a spring released into the last detent with the throw's
 * velocity still in it.
 *
 * Solved from the two things the throw hands it, not tuned by eye. To shed a
 * velocity v over a distance d without sailing past the target, a second-order
 * system wants ωn ≈ v/d. The cruise runs at 34 cards / 2.9s × 14° = 164°/s, the
 * coast is three cards of 14° = 42°, so ωn ≈ 3.9 rad/s. At mass 1 that is
 * `stiffness = ωn²` ≈ 15.3, and `damping = 2ζωn` ≈ 7.35 puts ζ at 0.94.
 *
 * Soft numbers by the standards of the rest of this file, and they should be:
 * every other spring here settles a control in a few hundred milliseconds, and
 * this one is a wheel with a second of momentum left in it.
 *
 * Just under critical, not over. Overdamping reads as the wheel being *held*
 * rather than running out — and it is slower, since the dominant pole of an
 * overdamped pair drifts towards zero. At ζ = 0.94 the overshoot is a few
 * thousandths of a degree: the wheel does not back up, it simply stops
 * arriving.
 *
 * This is a `Transition` and not a `SpringOptions` because it drives an
 * `animate()` call rather than a `useSpring` — the throw is a discrete event
 * with a beginning, not a value being tracked.
 */
export const springThrow: Transition = {
  type: 'spring',
  stiffness: 15.3,
  damping: 7.35,
  mass: 1,
}

/**
 * How close the wheel has to be to its seat to count as arrived, as a fraction
 * of one card.
 *
 * A fraction and not a pixel count, because one detent *is* one card pitch by
 * construction — the wheel's radius is solved from the measured pitch — so this
 * is about eight pixels at the design's 620px card and stays proportionate on a
 * narrower device.
 *
 * There has to be a threshold at all because the approach is exponential and
 * "arrived" never strictly happens. The two obvious signals are both wrong: the
 * final detent crossing is half a pitch out with 950px/s still on the card, and
 * Framer's own `onComplete` calls the spring finished with 22px to go and
 * 187px/s of movement left, because its rest thresholds are tuned for values at
 * pixel scale and this one is in degrees. Eight pixels is where the card reads
 * as stopped.
 */
export const SPIN_ARRIVED = 0.013

/**
 * The speed the reveal's blur leaves at, so it rides the settle exactly.
 *
 * The trick is that a spring is linear, so two values given the same spring and
 * the same *normalised* initial velocity trace the same curve whatever their
 * units. The wheel enters the coast at `SPIN_CRUISE_RATE` cards per second with
 * `SPIN_COAST_DETENTS` cards to go; divide one by the other and the cards
 * cancel, leaving the fraction-of-the-journey per second that a focus running
 * 1 → 0 has to start at to arrive in step with it.
 *
 * Negative because the blur is leaving while the wheel is arriving.
 *
 * This is what makes "the card comes into focus as it eases into place" a fact
 * rather than a pair of animations tuned until they looked close. Retune
 * `springThrow` and the two stay locked, because neither of them is holding a
 * duration.
 */
export const SPIN_FOCUS_RATE = -SPIN_CRUISE_RATE / SPIN_COAST_DETENTS

/** Badges, pops, anything that should overshoot slightly before settling. */
export const springOvershoot: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 15,
  mass: 0.6,
}

/** Standard entrance: fade + 6px rise + blur that clears. Never a plain fade. */
export const fadeBlurIn: Variants = {
  hidden: { opacity: 0, y: 6, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: transitionSmooth,
  },
}

/** Tooltip entrance: smaller rise, faster. */
export const tooltipIn: Variants = {
  hidden: { opacity: 0, y: 4, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: transitionFast,
  },
}

/**
 * Blur morph: one surface becoming a different surface in the same place.
 *
 * Not a crossfade with blur bolted on. A plain opacity dissolve puts both
 * states on screen at 50% for a moment and the eye reads it as two things
 * overlapping — text over text, edges over edges. Blurring each state as it
 * leaves and unblurring the one arriving destroys the high-frequency detail
 * exactly while both are visible, so the midpoint has nothing legible to
 * double up. What survives is the low-frequency shape, which is the part that
 * is actually shared between the two states — and that reads as one surface
 * changing rather than two surfaces swapping.
 *
 * Symmetric on purpose: same duration, same easing, same 6px both directions,
 * so at t = 0.5 the two states are exact complements — 50% opacity and 3px of
 * blur each. Any asymmetry here shows up as a visible "dip" where the box is
 * momentarily empty.
 *
 * 6px is scaled to 13px type: enough that a glyph loses its identity, little
 * enough that a 32px button keeps its silhouette. The 0.985 scale is doing
 * almost nothing on its own — it exists so the blur has a direction.
 *
 * Spread onto both branches of an `AnimatePresence` and let the parent's
 * `layout` (see `springSnap`) carry the height. Use `mode="popLayout"` so the
 * outgoing copy leaves the flow immediately and the box starts resizing to the
 * incoming one on frame one, rather than waiting for the exit to finish.
 */
export const blurMorph = {
  initial: { opacity: 0, filter: 'blur(6px)', scale: 0.985 },
  animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit: { opacity: 0, filter: 'blur(6px)', scale: 0.985 },
  transition: { duration: 0.24, ease: ease.smooth },
} as const

/** Press feedback for any tappable element. 0.98, not 0.9 — a firm press,
 *  not a collapse. Spread this onto motion.button/div via whileTap. */
export const pressable = {
  whileTap: { scale: 0.98 },
  transition: transitionFast,
}

/** Drag inertia for sliders/handles: momentum on release, soft elastic
 *  boundaries instead of a hard stop. Spread onto a draggable motion element. */
export const dragPhysics = {
  dragElastic: 0.15,
  dragTransition: {
    power: 0.3,
    timeConstant: 200,
    bounceStiffness: 400,
    bounceDamping: 40,
  },
}
