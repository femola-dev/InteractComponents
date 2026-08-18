import confetti from 'canvas-confetti'

/**
 * The burst that lands with the "community created" screen.
 *
 * Three shots rather than one, because a single blast reads as a page effect
 * while a sequence reads as a reaction: the opening burst comes from where the
 * card is, two cannons fire in from the lower corners a beat later, and a slow
 * high spray drifts down over the top of both. Total flight is about two
 * seconds, which is roughly how long the screen takes to be read.
 *
 * Returns its own teardown. The screen it fires on can be swept away mid-flight
 * — the restart button is right there — and pending timeouts landing on an
 * unmounted screen would keep throwing paper at whatever replaced it.
 */
export function celebrate(colors: string[]) {
  /* `disableForReducedMotion` covers the shots themselves, but the timers are
     ours; bailing here means we never schedule them either. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const timers: number[] = []
  const shot = (options: confetti.Options) =>
    void confetti({ colors, disableForReducedMotion: true, scalar: 0.9, ticks: 220, ...options })

  shot({ particleCount: 90, spread: 78, startVelocity: 46, origin: { y: 0.42 } })

  timers.push(
    window.setTimeout(() => {
      /* Angled inwards from just above the bottom corners, so the arcs cross in
         front of the card instead of raining down the edges of the window. */
      shot({ particleCount: 55, angle: 62, spread: 62, origin: { x: 0, y: 0.72 } })
      shot({ particleCount: 55, angle: 118, spread: 62, origin: { x: 1, y: 0.72 } })
    }, 220)
  )

  timers.push(
    window.setTimeout(() => {
      /* The tail: slower, wider, and heavier decay, so it hangs rather than
         shoots and gives the whole thing something to settle out of. */
      shot({ particleCount: 45, spread: 120, startVelocity: 30, decay: 0.92, origin: { y: 0.34 } })
    }, 520)
  )

  return () => {
    timers.forEach(window.clearTimeout)
    confetti.reset()
  }
}
