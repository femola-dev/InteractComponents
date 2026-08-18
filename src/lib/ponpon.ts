/**
 * Motion primitives from the ponpon-mania.com architecture (Justine Soulié &
 * Patrick Heng), ported off their stack.
 *
 * The original is Nuxt + OGL + GSAP + Lenis. None of that is here, and none of
 * it is the point — what transfers is four decisions that are framework-free
 * by nature, so this file has no React in it and no dependencies at all:
 *
 *   1. Tier once at boot, then branch off *named intent*, never a raw number.
 *   2. Spend the frame budget where the eye is; let the periphery run slower.
 *   3. Damp frame-rate-independently, so 120Hz and 60Hz feel identical.
 *   4. Quantize the boil's clock, and keep its amplitude nearly invisible.
 *
 * The order matters. Tier and budget set the ceiling for everything after, so
 * they come first even though the boil is the part you can see.
 */

/* ---- 0. Small maths ---- */

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

/** Hermite ease between two edges. The house curve for mapping a distance to a
 *  weight — linear ramps read as mechanical at the ends. */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/* ---- 1. Capability tiering ---- */

export type Tier = 0 | 1 | 2 | 3

/**
 * Read the GPU's renderer string once and bucket it.
 *
 * This is a heuristic and it is meant to be: the string is a vendor-formatted
 * marketing name, not a capability list, and the browser may withhold it
 * entirely. So the buckets are coarse and the fallback is the *middle* of the
 * range, not the bottom — an unknown GPU on a modern browser is far more likely
 * to be adequate than to be a software rasteriser, and starting everyone at
 * tier 0 would punish the majority for the browser's privacy setting.
 *
 * The live probe below is what actually catches a machine this misjudges.
 */
function probeRenderer(): Tier {
  if (typeof document === 'undefined') return 2

  let gl: WebGLRenderingContext | null = null
  try {
    gl = document.createElement('canvas').getContext('webgl')
  } catch {
    return 0
  }
  if (!gl) return 0

  const ext = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = ext
    ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '')
    : ''
  const r = renderer.toLowerCase()

  // A software rasteriser is the one case worth being certain about — it is
  // never fast enough, and it announces itself by name.
  if (!r) return 2
  if (/swiftshader|llvmpipe|software|basic render/.test(r)) return 0
  // Apple silicon and any discrete part: full quality.
  if (/apple m\d|rtx|radeon rx|geforce|arc a\d/.test(r)) return 3
  // Intel/AMD integrated graphics: competent, not generous.
  if (/intel|uhd|iris|vega|radeon/.test(r)) return 1
  return 2
}

/**
 * Demote — never promote — on measured frame time.
 *
 * Promotion is deliberately impossible. A machine that starts fast and stays
 * fast has nothing to gain, while one that starts fast and *drops* usually did
 * so because something expensive appeared on screen; promoting it back would
 * put the expensive thing straight back and set up an oscillation.
 */
function probeFrames(onDemote: (t: Tier) => void) {
  if (typeof requestAnimationFrame === 'undefined') return

  let frames = 0
  let start = 0

  const tick = (now: number) => {
    if (!start) start = now
    frames++
    // ~1s of real frames, long enough to survive one janky first paint.
    if (now - start < 1000) {
      requestAnimationFrame(tick)
      return
    }
    const fps = (frames * 1000) / (now - start)
    if (fps < 30) onDemote(0)
    else if (fps < 50) onDemote(1)
  }

  requestAnimationFrame(tick)
}

/** `?tier=0` — see the low-end experience without owning low-end hardware.
 *  Built at the same time as the tiers on purpose: an untestable tiering
 *  system rots, because nobody can tell when they have broken tier 0. */
function tierOverride(): Tier | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('tier')
  if (raw === null) return null
  const n = Number(raw)
  return n === 0 || n === 1 || n === 2 || n === 3 ? n : null
}

let tier: Tier = 2
let initialised = false
const listeners = new Set<() => void>()

/**
 * Subscribe to demotions.
 *
 * The tier is not static: the renderer string gives a first guess synchronously,
 * and the frame probe can lower it a second later. Anything that branched on
 * the guess has to hear about that, or a machine that fails the probe keeps
 * whatever the guess turned on — which is exactly the machine that could not
 * afford it.
 */
export function onTierChange(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Detect once, stamp the answer on `<html>`, and let CSS branch off it too —
 * `html.is-gpu-0 .some-effect { display: none }` needs no JS to reach it.
 */
export function initCapability() {
  if (initialised || typeof document === 'undefined') return
  initialised = true

  const forced = tierOverride()
  const stamp = () => {
    const el = document.documentElement
    el.classList.remove('is-gpu-0', 'is-gpu-1', 'is-gpu-2', 'is-gpu-3')
    el.classList.add(`is-gpu-${tier}`)
    listeners.forEach((l) => l())
  }

  if (forced !== null) {
    tier = forced
    stamp()
    return
  }

  tier = probeRenderer()
  stamp()
  probeFrames((demoted) => {
    if (demoted < tier) {
      tier = demoted
      stamp()
    }
  })
}

export const getTier = () => tier

/**
 * Quality decisions as named intent, never as `tier < 2` scattered through the
 * codebase. This indirection is the highest-leverage idea in the whole
 * architecture: when a feature has to be cut on weak hardware you change one
 * getter here instead of hunting comparisons through forty files, and the call
 * site reads as what it wants rather than what it is afraid of.
 */
export const capability = {
  /** The hand-drawn wobble. First thing to go — it is pure garnish, and it
   *  writes a transform to every visible card on every quantised step. */
  get useBoil() {
    return tier >= 2
  },
  /** Damping at all. At tier 0 the scroll snaps to its true position rather
   *  than easing toward it: a laggy smooth-scroll is worse than no smoothing. */
  get useDamping() {
    return tier >= 1
  },
  /** Per-card shadow and blur. Cheap to draw once, expensive to composite
   *  every frame while a dozen of them are being transformed. */
  get useHeavyFilters() {
    return tier >= 2
  },
  /** Backing-store resolution ladder. Not a constant — the reference site
   *  renders at 1.5 on a machine that reports 2.0, because the last half of
   *  a device pixel ratio costs a third of the fill rate and shows almost
   *  nothing. */
  get dpr() {
    const raw = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
    if (tier >= 3) return Math.min(raw, 2)
    if (tier >= 2) return Math.min(raw, 1.5)
    return 1
  },
}

/* ---- 2. Adaptive frame budgeting ---- */

/**
 * Two ceilings, both tier-derived.
 *
 * `focused` is the interval for whatever the user is looking at; `peripheral`
 * is for everything else. Nobody can perceive that an element at the edge of
 * the frame is animating at 45fps. Everybody perceives the one they are
 * looking at hitching. So the budget is not spread evenly — it is spent where
 * the eye is and starved everywhere else.
 */
export function frameBudget() {
  return {
    focused: tier > 2 ? 1 / 55 : 1 / 45,
    peripheral: tier > 1 ? 1 / 30 : 1 / 20,
  }
}

/* ---- 3. Frame-rate-independent damping ---- */

/**
 * Exponential damp. The correct replacement for `current += (target - current)
 * * 0.1`, which is the single most common motion bug on the web: that naive
 * lerp converges twice as fast on a 120Hz display as on a 60Hz one, so the
 * same code feels like two different products on two different machines.
 *
 * `lambda` is a rate, not a fraction — roughly "e-foldings per second". 8 is
 * a soft follow, 20 is nearly immediate.
 */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  target + (current - target) * Math.exp(-lambda * dt)

export type SmoothDampState = { value: number; velocity: number }

/**
 * A critically-damped spring with velocity memory — Unity's `SmoothDamp`.
 *
 * The difference from `damp` is the carried velocity, and it is the difference
 * between motion that feels *weighted* and motion that feels *laggy*: a plain
 * damp restarts from zero speed every time the target moves, while this one
 * carries momentum through a direction change and still never overshoots.
 * Ten lines, and it is the biggest single "feel" win available.
 *
 * `smoothTime` is roughly the time to arrive, in seconds.
 */
export function smoothDamp(
  state: SmoothDampState,
  target: number,
  smoothTime: number,
  dt: number,
  maxSpeed = Infinity,
) {
  const omega = 2 / Math.max(0.0001, smoothTime)
  const x = omega * dt
  // Padé approximation of exp(-x) — cheaper than Math.exp in a hot loop and
  // indistinguishable over the range a frame delta can produce.
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)

  let change = state.value - target
  const maxChange = maxSpeed * smoothTime
  change = clamp(change, -maxChange, maxChange)
  const goal = state.value - change

  const temp = (state.velocity + omega * change) * dt
  state.velocity = (state.velocity - omega * temp) * exp
  let output = goal + (change + temp) * exp

  // Kill the tail: without this the spring converges asymptotically and never
  // stops writing transforms, which keeps the compositor awake forever.
  if (target - state.value > 0 === output > target) {
    output = target
    state.velocity = (output - target) / dt
  }

  state.value = output
  return output
}

/* ---- 4. The boil ---- */

/**
 * Quantised clock. `floor(t * step) / step` snaps time to `step` states per
 * second, so anything driven by it *pops* between discrete positions instead
 * of sliding — the hand-drawn convention of animating on twos or fives, where
 * holding a frame reads as deliberate rather than as a dropped one.
 *
 * The default 5 is the reference site's. Feeding a shader continuous time
 * instead is the difference between "hand-drawn" and "wobbly video", and it is
 * the mistake everyone makes first.
 */
export const boilTime = (seconds: number, step = 5) => Math.floor(seconds * step) / step

/**
 * A two-axis boil offset, in pixels.
 *
 * The original is a fragment shader displacing UVs by a *spatial* sine — the
 * surface coordinate is inside the sine's argument, so different parts of one
 * image wobble by different amounts and its edges undulate like a wet ink
 * line. The DOM has no per-pixel hook, so `seed` stands in for the spatial
 * term: each element gets its own phase and the row wobbles out of sync
 * instead of sliding as a block. It is the coarse version of the same idea.
 *
 * Amplitude is the part to leave alone. 1.5px is a pixel and a half — nearly
 * invisible on any single frame and unmistakable in aggregate. Past ~3px it
 * stops reading as alive and starts reading as broken, and that restraint is
 * the whole craft of it.
 */
export function boilOffset(seed: number, seconds: number, amplitude = 1.5) {
  const t = boilTime(seconds)
  return {
    x: Math.sin(t * 4 + seed * 1.7) * amplitude,
    y: Math.cos(t * 3.3 + seed * 2.3) * amplitude,
  }
}
