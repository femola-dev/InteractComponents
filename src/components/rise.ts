import { useReducedMotion } from 'framer-motion'
import { transitionSmooth } from '../lib/motion'

/**
 * The shared entrance: fade + 6px lift + a blur that clears — never a plain
 * fade. Returns a `rise(delay)` factory so it can be called inside `.map()`
 * without breaking the rules of hooks.
 *
 * Collapses to no motion when the viewer has asked for reduced motion.
 */
export function useRise() {
  const reducedMotion = useReducedMotion()

  return (delay = 0) =>
    reducedMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 6, filter: 'blur(2px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { ...transitionSmooth, delay },
        }
}
