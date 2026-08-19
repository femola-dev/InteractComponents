/**
 * A damped harmonic oscillator, solved rather than integrated.
 *
 * The equation is the textbook one — a mass on a spring in a viscous medium,
 * with the spring pulling toward a moving target:
 *
 *     ẍ + 2ζω·ẋ + ω²(x − x_target) = 0
 *
 * Almost every spring in UI code integrates that numerically, one step per
 * frame. This does not: the equation has a closed-form solution, and stepping
 * it forward by `dt` is a matter of evaluating that solution at `t = dt` with
 * the current position and velocity as the initial conditions. Three things
 * follow, and they are the whole reason for the file:
 *
 *   - **It is frame-rate independent, exactly.** Not approximately, the way a
 *     small fixed timestep is. The same gesture settles identically at 60Hz,
 *     120Hz and on a laptop dropping to 24 under load. A Euler or Verlet step
 *     has truncation error proportional to `dt`, so on a stuttering frame the
 *     motion is subtly different — usually stiffer — than it was a moment ago.
 *   - **It cannot blow up.** An explicit integrator on a stiff spring diverges
 *     once `dt > 2/ω`; a 200ms hitch on a stiff spring is enough, and the
 *     result is a value that oscillates to infinity in three frames. There is
 *     no stability criterion here because nothing is being approximated. That
 *     is also why there is no `dt` clamp: a long frame is simply evaluated at
 *     its true length, and the exponential decay handles it.
 *   - **Its parameters mean something.** ω and ζ are the physical constants,
 *     so overshoot and settling time can be computed rather than dialled in —
 *     see `overshoot` and `settlingTime` below, which are the two numbers
 *     anyone tuning this actually cares about.
 *
 * Underdamped, critically damped and overdamped are genuinely different
 * solutions, not one formula with a parameter, which is why there are three
 * branches. The critical case is not a rounding of the other two: at exactly
 * ζ = 1 the two roots of the characteristic equation coincide and the solution
 * picks up a factor of `t` that neither neighbour has.
 */

/** Position and velocity. Velocity has to be carried between frames — it is
 *  half the state, and a spring that forgets it is just an exponential ease. */
export type SpringState = {
  x: number
  v: number
}

/**
 * Advance `state` toward `target` by `dt` seconds, in place.
 *
 * @param omega Undamped angular frequency ω, in radians per second. The
 *   oscillation the spring would have with no damping at all; `2π × f`.
 * @param zeta  Damping ratio ζ. Below 1 overshoots, 1 is the fastest approach
 *   that does not, above 1 crawls in without ever crossing.
 */
export function springStep(
  state: SpringState,
  target: number,
  omega: number,
  zeta: number,
  dt: number,
): void {
  if (dt <= 0) return

  // Solved in the target's frame: d is the displacement the oscillator has to
  // kill, and the whole solution below describes d decaying to zero.
  const d = state.x - target
  const v = state.v

  if (zeta < 1) {
    /* Underdamped. Decaying sinusoid at the *damped* frequency ω_d, which is
       lower than ω — damping does not only shrink the oscillation, it slows
       it, and at ζ = 0.7 the period is already 40% longer than the undamped
       one. */
    const wd = omega * Math.sqrt(1 - zeta * zeta)
    const decay = Math.exp(-zeta * omega * dt)
    const c1 = d
    const c2 = (v + zeta * omega * d) / wd
    const cos = Math.cos(wd * dt)
    const sin = Math.sin(wd * dt)

    state.x = target + decay * (c1 * cos + c2 * sin)
    state.v =
      decay * ((c2 * wd - zeta * omega * c1) * cos - (c1 * wd + zeta * omega * c2) * sin)
    return
  }

  if (zeta === 1) {
    /* Critically damped. The repeated root gives `(c1 + c2·t)·e^(−ωt)` — the
       linear factor is what lets the value still travel while already decaying,
       and it is why this reaches the target faster than any overdamped spring
       despite never crossing it. */
    const decay = Math.exp(-omega * dt)
    const c1 = d
    const c2 = v + omega * d

    state.x = target + (c1 + c2 * dt) * decay
    state.v = (c2 - omega * (c1 + c2 * dt)) * decay
    return
  }

  /* Overdamped. Two real roots, two independent decay rates: the fast one
     dies almost immediately and the slow one is what the long tail is made of.
     This is the branch that feels like syrup, and it is here for completeness
     rather than because anything on the page uses it. */
  const root = omega * Math.sqrt(zeta * zeta - 1)
  const r1 = -zeta * omega + root
  const r2 = -zeta * omega - root
  const c2 = (v - r1 * d) / (r2 - r1)
  const c1 = d - c2
  const e1 = Math.exp(r1 * dt)
  const e2 = Math.exp(r2 * dt)

  state.x = target + c1 * e1 + c2 * e2
  state.v = c1 * r1 * e1 + c2 * r2 * e2
}

/**
 * Peak overshoot as a fraction of the step, for an underdamped spring released
 * from rest — `exp(−πζ / √(1 − ζ²))`.
 *
 * The useful shape of that curve, for picking a ζ: 0.5 overshoots by 16%, 0.6
 * by 9.5%, 0.7 by 4.6%, 0.8 by 1.5%, 0.9 by 0.2%. Past about 0.85 the bounce
 * is smaller than a pixel on anything and the spring may as well be critical.
 */
export function overshoot(zeta: number): number {
  if (zeta >= 1) return 0
  return Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta))
}

/**
 * Roughly how long until the oscillator stays within 2% of its target, in
 * seconds — the standard `4 / ζω` estimate, which is just asking when the
 * `e^(−ζωt)` envelope has fallen to 0.02.
 *
 * Note what it says: settling time depends on the *product* ζω, so a spring can
 * be made to arrive sooner by stiffening it or by damping it harder, and those
 * two have opposite effects on how it feels getting there.
 */
export function settlingTime(omega: number, zeta: number): number {
  return 4 / (zeta * omega)
}
