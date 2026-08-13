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
