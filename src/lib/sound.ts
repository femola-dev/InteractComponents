/**
 * House sound palette, synthesised rather than sampled.
 *
 * Two sounds, for the two interactions that actually move the carousel: the
 * chevrons stepping it one card, and Shuffle throwing it across the library.
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
 * Two rules shape everything here:
 *
 * 1. **Nothing is a beep** — with one deliberate exception. Every hit pairs a
 *    pitched layer with a filtered noise transient, and the pitched layer
 *    *falls*, because real objects lose energy as they strike; a pitch that
 *    holds still is the one thing that always sounds like a computer. The
 *    shuffle's pips break the rule on purpose, and say why where they are
 *    defined: a roulette table is a counter rather than an object, and a
 *    counter beeps.
 * 2. **Everything is quiet.** Layer gains sit between 0.04 and 0.3, under a
 *    master that is turned down again. These should read as texture on a press
 *    you were already making, not as an event of their own.
 *
 * Reduced motion is handled upstream: the library's hooks mute themselves when
 * `prefers-reduced-motion` is set, so a user who has asked for less gets
 * silence without anything here having to ask.
 */
import type { SequenceStep, SoundDefinition } from '@web-kits/audio'
import { SPIN_CROSSINGS, SPIN_SECONDS } from './motion'

/**
 * Master volume for the whole app.
 *
 * The layer gains below are already conservative; this turns the bus down again
 * on top of them. Interface sound competes with whatever the person is actually
 * listening to, and the failure mode is not "too quiet to notice" — it is "loud
 * enough to turn off".
 */
export const MASTER_VOLUME = 0.7

/**
 * One step of the carousel — the wheel passing a stop.
 *
 * A wheel with detents makes a dry wooden click, not a tone, so the pitched
 * layer drops better than an octave inside 55ms and never sits still long
 * enough to be heard as a note. The noise burst under it is shorter still: it
 * is the strike itself, and at 18ms it registers as attack rather than as hiss.
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
 * One card going past — a beep, not a click.
 *
 * The rest of this file avoids tones on principle: a pitch that holds still is
 * the one thing that always sounds like a computer, so the detent and the
 * pocket are both strikes that fall away. A roulette table is the exception,
 * and it is an exception with a reason — that sound is not an object hitting
 * something, it is a *counter*, and a counter beeps. Fourteen of them at a
 * tempo that halves says "still counting" far more plainly than fourteen
 * clicks, because a click is over the moment it happens and a tone occupies
 * the gap it sits in.
 *
 * A square for the body, lowpassed hard. Square is what makes it read as a pip
 * rather than a note, but its upper harmonics are pure buzzer, and 3600Hz is
 * where they stop being brightness and start being a smoke alarm. The triangle
 * under it at the same pitch fills the fundamental back in, and 8ms of noise on
 * top gives the attack an edge so it starts rather than fades up.
 */
const beep = (frequency: number): SoundDefinition => ({
  layers: [
    {
      source: { type: 'square', frequency },
      filter: { type: 'lowpass', frequency: 3600 },
      envelope: { attack: 0.004, decay: 0.05 },
      gain: 0.13,
    },
    {
      source: { type: 'triangle', frequency },
      envelope: { attack: 0.003, decay: 0.06 },
      gain: 0.1,
    },
    {
      source: { type: 'noise', color: 'white' },
      filter: { type: 'bandpass', frequency: 3000, resonance: 2 },
      envelope: { decay: 0.008 },
      gain: 0.045,
    },
  ],
})

/**
 * The ball dropping into a pocket. Deliberately not a chime — a roulette wheel
 * does not congratulate you, it just stops.
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
 * The beeps descend as the wheel slows: a fifth down across the fourteen.
 *
 * Geometric, so it falls in even musical steps rather than even hertz — the ear
 * hears ratios, and a linear drop from 1300 to 820 would crawl at the top and
 * plummet at the bottom.
 *
 * Pitch and tempo carrying the same message is the point. The wheel losing
 * energy shows up twice, once in the widening gaps and once in the falling
 * tone, and two channels saying "slowing down" is what makes the last beep land
 * as an ending rather than as a pause.
 */
const BEEP_HIGH = 1300
const BEEP_LOW = 820

const beepAt = (i: number, count: number) =>
  BEEP_HIGH * (BEEP_LOW / BEEP_HIGH) ** (i / Math.max(1, count - 1))

/**
 * Shuffle: one beep per card, at the exact moment that card goes past.
 *
 * The timing is not designed here. `SPIN_CROSSINGS` says when each card reaches
 * the top of the wheel, the carousel animates through that same array as
 * keyframes, and every step below is pinned to it with `at` — absolute
 * placement rather than `wait`, so a beep cannot accumulate drift over fourteen
 * additions. What you hear is what you see, by construction rather than by
 * tuning: the beeping slows because the cards do, from 77ms apart at the throw
 * to 420ms at the last one.
 *
 * The volume ramp is gentle, down to about 0.75 by the last beep. A wheel does
 * quieten as it loses energy, but ramping it hard over three seconds makes the
 * spin sound like it is receding into the distance rather than settling in
 * front of you.
 */
export const ROULETTE: SequenceStep[] = [
  ...SPIN_CROSSINGS.map((at, i) => ({
    sound: beep(beepAt(i, SPIN_CROSSINGS.length)),
    at,
    volume: 1 - i * 0.018,
  })),
  // Last of all, in the gap the table leaves for it: the card has landed and
  // the ball drops into the pocket behind it.
  { sound: POCKET, at: SPIN_SECONDS },
]
