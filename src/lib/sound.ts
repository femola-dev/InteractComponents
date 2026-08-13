/**
 * House sound palette, synthesised rather than sampled.
 *
 * Two sounds, for the two interactions that actually move the carousel: the
 * chevrons stepping it one card, and Shuffle throwing it across the deck.
 * Everything else on the screen — opening the tray, picking a genre, filtering
 * a year — stays silent on purpose. Sound is the scarcest thing in an
 * interface: the moment it accompanies every press it stops marking anything,
 * and the two events that are genuinely *the wheel turning* lose the one signal
 * that set them apart.
 *
 * Both are built from oscillators and noise at call time — there is not a
 * single audio file in the bundle. That is the point of `@web-kits/audio`: a
 * sound is a plain object, so it reads and diffs like the rest of the design
 * tokens, and a pitch can be tuned in a code review rather than in a DAW.
 *
 * Two rules shape both of them:
 *
 * 1. **Nothing is a beep.** Every hit pairs a pitched layer with a filtered
 *    noise transient, and the pitched layer *falls* — real objects lose energy
 *    as they strike. A steady sine is the one thing that always sounds like a
 *    computer.
 * 2. **Everything is quiet.** Layer gains sit between 0.1 and 0.26, under a
 *    master that is turned down again. These should read as texture on a press
 *    you were already making, not as an event of their own.
 *
 * Reduced motion is handled upstream: the library's hooks mute themselves when
 * `prefers-reduced-motion` is set, so a user who has asked for less gets
 * silence without anything here having to ask.
 */
import type { SequenceStep, SoundDefinition } from '@web-kits/audio'

/**
 * One step of the carousel — the wheel passing a stop.
 *
 * A wheel with detents makes a dry wooden click, not a tone, so the pitched
 * layer drops better than an octave inside 55ms and never sits still long
 * enough to be heard as a note. The noise burst under it is shorter still: it
 * is the strike itself, and at 18ms it registers as attack rather than as
 * hiss.
 *
 * Direction lives at the call site as a detune, not in a second definition —
 * see `useSound(DETENT, { detune })` in the carousel. Forward is up, back is
 * down, which is the same convention the wheel's rotation already follows.
 */
export const DETENT: SoundDefinition = {
  layers: [
    {
      source: { type: 'triangle', frequency: { start: 1180, end: 560 } },
      filter: { type: 'lowpass', frequency: 3200 },
      envelope: { decay: 0.055 },
      gain: 0.3,
    },
    {
      source: { type: 'noise', color: 'white' },
      filter: { type: 'bandpass', frequency: 2400, resonance: 1.4 },
      envelope: { decay: 0.018 },
      gain: 0.12,
    },
  ],
}

/**
 * The ball clipping one fret of the roulette wheel.
 *
 * Brighter and tighter than `DETENT` — a highpass instead of a lowpass, a
 * 10ms noise transient up at 3.2kHz, and the whole thing over in under 30ms.
 * A detent is a mechanism finding its stop and has some mass behind it; this
 * is a small hard ball glancing off metal, and it should sound like almost
 * nothing on its own. It only becomes a sound in the aggregate.
 */
const fret = (frequency: number): SoundDefinition => ({
  layers: [
    {
      source: {
        type: 'triangle',
        frequency: { start: frequency, end: frequency * 0.6 },
      },
      filter: { type: 'highpass', frequency: 700 },
      envelope: { decay: 0.028 },
      gain: 0.2,
    },
    {
      source: { type: 'noise', color: 'white' },
      filter: { type: 'bandpass', frequency: 3200, resonance: 2.2 },
      envelope: { decay: 0.01 },
      gain: 0.1,
    },
  ],
})

/**
 * The ball dropping into a pocket. The only part of the spin with any body.
 *
 * Deliberately not a chime or a confirm — a roulette wheel does not congratulate
 * you, it just stops. So the settle is a low wooden thunk: a pitch falling more
 * than an octave into 190Hz over brown noise through a narrow band at 700Hz,
 * with a short room on it so it reads as landing in something rather than on
 * top of it.
 */
const POCKET: SoundDefinition = {
  layers: [
    {
      source: { type: 'triangle', frequency: { start: 420, end: 190 } },
      filter: { type: 'lowpass', frequency: 1600 },
      envelope: { decay: 0.16 },
      gain: 0.26,
    },
    {
      source: { type: 'noise', color: 'brown' },
      filter: { type: 'bandpass', frequency: 700, resonance: 1.1 },
      envelope: { decay: 0.05 },
      gain: 0.14,
    },
  ],
  effects: [{ type: 'reverb', decay: 0.4, mix: 0.14 }],
}

/**
 * Twelve frets and a pocket — enough clatter to read as a spin, few enough to
 * stay under a second. Below about eight it sounds like a ratchet rather than a
 * wheel; past sixteen the tail outlives the carousel's own throw.
 */
const FRET_COUNT = 12

/**
 * The first gap, and the rate the gaps widen by.
 *
 * These two numbers *are* the roulette. A ball slowing down is the only thing
 * separating a spin from a machine gun, so the interval grows geometrically —
 * 32ms between the first pair, 119ms between the last — and the whole spin runs
 * about 0.74s before the ball drops. Evenly spaced ticks at any tempo sound
 * like a metronome; this is the same curve the wheel's own spring is riding.
 */
const FIRST_GAP = 0.032
const SLOWING = 1.14

/**
 * Three pitches, cycled rather than alternated.
 *
 * A ball does not strike the same note twice running — it catches a different
 * edge each time. Two pitches alternating is audibly a pattern; three against a
 * twelve-tick spin never repeats a pair, so the ear hears variation instead of
 * a loop. Deterministic on purpose: a sound that comes out different every
 * press is a sound you cannot tune.
 */
const FRETS = [1980, 2140, 1840]

/**
 * Shuffle: the wheel thrown across the deck.
 *
 * The one place a sequence earns its keep. Shuffle is not a step, it is a spin
 * — the carousel's spring folds the delta onto the short arc and travels every
 * detent between here and there — so a single hit would undersell what is
 * actually happening on screen. The clatter decelerating into the pocket is the
 * audible version of that throw, and it finishes at roughly the moment the
 * wheel does.
 *
 * The volume ramp is small on purpose: down to about 0.6 by the last fret. A
 * ball does quieten as it loses height, but ramping it hard makes the spin
 * sound like it is receding into the distance rather than settling in front of
 * you.
 */
export const ROULETTE: SequenceStep[] = [
  ...Array.from({ length: FRET_COUNT }, (_, i) => ({
    sound: fret(FRETS[i % FRETS.length]),
    // `wait` is measured from the previous step, so step 0 starts the sequence
    // and every one after it is a gap that is 14% wider than the last.
    wait: i === 0 ? 0 : FIRST_GAP * SLOWING ** (i - 1),
    volume: 1 - i * 0.035,
  })),
  { sound: POCKET, wait: 0.17 },
]

/**
 * Master volume for the whole app.
 *
 * The layer gains above are already conservative; this turns the bus down
 * again on top of them. Interface sound competes with whatever the person is
 * actually listening to, and the failure mode is not "too quiet to notice" —
 * it is "loud enough to turn off".
 */
export const MASTER_VOLUME = 0.7
