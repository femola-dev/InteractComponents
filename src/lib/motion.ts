/**
 * House motion presets for Framer Motion. Mirrors the token block in
 * src/index.css so JS and CSS animation never drift apart. Import these into
 * components instead of writing inline easing/duration/spring values.
 *
 * Framer Motion wants easing as a cubic-bezier control-point array
 * ([x1, y1, x2, y2]), not a CSS string — these arrays correspond 1:1 to the
 * --ease-* custom properties in index.css.
 */
import type { Transition, Variants } from 'framer-motion'

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
