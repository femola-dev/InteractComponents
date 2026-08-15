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
import type { SoundDefinition, SoundPatch } from '@web-kits/audio'

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
 * something, it is a *counter*, and a counter beeps. Forty of them, flat out
 * and then running down, says "still counting" far more plainly than forty
 * clicks would, because a click is over the moment it happens and a tone
 * occupies the gap it sits in.
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
 * The ball dropping into a pocket, and the machine acknowledging it.
 *
 * The first two layers are the drop and have not changed: a triangle falling
 * 420Hz to 190 for the weight of it, brown noise for the rattle. That is the
 * wheel's own sound, and it is the reason this is a *thud* rather than a chime
 * — a roulette wheel does not congratulate you, it just stops.
 *
 * The third layer is the one that answers you, and it is a deliberate reversal
 * of that. This is a shuffle: unlike every other sound in the file, it is not
 * feedback on something you did, it is the machine's *answer* to something you
 * asked. Ending it on a pure thud left the moment mechanically correct and
 * dramatically flat — four seconds of counting that resolves onto a shrug. So
 * the pocket now has a two-note tail rising a fifth, 520Hz to 780, which is the
 * shape a prize machine uses and the shape the ear reads as an outcome.
 *
 * It stays under the drop rather than replacing it — a third of the gain, and
 * a 70ms attack, so the thud is what lands and the tone is what it settles
 * into. The slow attack is doing the work of a delay, which an `Envelope` here
 * has no field for: a sine that takes 70ms to reach full is inaudible under the
 * drop's own transient and only surfaces once that has gone. Loud enough or
 * sharp enough and it becomes a jackpot fanfare, which this is not — you have
 * been given a film, not a win.
 *
 * A sine, alone in a file of squares and triangles. The beeps are counting and
 * want harmonics to cut through their own tempo; this one is a single held note
 * at the end of everything, with nothing left to cut through.
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
    {
      source: { type: 'sine', frequency: { start: 520, end: 780 } },
      envelope: { attack: 0.07, decay: 0.34 },
      gain: 0.09,
    },
  ],
  effects: [{ type: 'reverb', decay: 0.4, mix: 0.14 }],
}

/**
 * The beeps descend as the wheel slows: 1300Hz down to 820 across the throw.
 *
 * Pitch and tempo carrying the same message is the point. The wheel losing
 * energy shows up twice, once in the widening gaps and once in the falling
 * tone, and two channels saying "slowing down" is what makes the last beep land
 * as an ending rather than as a pause.
 *
 * The fall is expressed in cents rather than as a table of frequencies, which
 * is both the honest unit and the one the player can use. The ear hears ratios,
 * so even musical steps *are* a linear ramp in cents — a straight drop from
 * 1300Hz to 820Hz would crawl at the top and plummet at the bottom. And the
 * whole ladder can now ride one sound definition, detuned per hit, because
 * `detune` is the one pitch control a `PlayOptions` carries.
 *
 * -798 cents, which is a minor sixth rather than the fifth this comment used to
 * claim. The endpoints are unchanged and were always the thing being tuned; it
 * is the interval name that was wrong.
 */
const BEEP_HIGH = 1300
const BEEP_LOW = 820
const BEEP_FALL = 1200 * Math.log2(BEEP_LOW / BEEP_HIGH)

/**
 * Where the beep sits, given how far through the throw the wheel is (0 at the
 * press, 1 at the last card). Clamped, because the caller counts real detent
 * crossings and a wheel that overshoots its stop can produce one more than the
 * throw asked for.
 */
export const beepDetune = (progress: number) =>
  BEEP_FALL * Math.min(1, Math.max(0, progress))

/**
 * How much quieter the last beep is than the first — a gentle ramp, down to
 * about 0.75.
 *
 * A wheel does quieten as it loses energy, but ramping it hard over three
 * seconds makes the spin sound like it is receding into the distance rather
 * than settling in front of you.
 */
export const beepVolume = (progress: number) =>
  1 - 0.25 * Math.min(1, Math.max(0, progress))

/**
 * Shuffle: one beep per card, and the pocket the ball drops into behind the
 * last of them.
 *
 * A patch rather than the sequence this used to be, and that is the whole fix.
 * A sequence is a timetable — it booked its beeps against the carousel's
 * keyframe table at the moment it started, and from then on it was playing a
 * recording of a spin rather than the spin in front of you. That worked only as
 * long as the keyframe table described what was on screen, and it never did:
 * the table drove `target`, which is the *input* to `springWheel`, and the
 * wheel you watch is the spring's output. A spring following a ramp sits a
 * fixed distance behind it — about 2ζv/ωn — so at the top of the throw the
 * picture ran a card and a half behind the sound, closing to about a third of a
 * card by the end. Beeps, none of them landing on a card, with the error
 * sliding the whole way down.
 *
 * So the timetable is gone and the wheel triggers its own sound. The carousel
 * already watches the rendered angle to decide which cards to mount; it now
 * beeps off that same signal, one hit per detent the rim actually crosses. The
 * old comment claimed "what you hear is what you see, by construction" — this
 * is the version where that is true, because the thing making the sound is the
 * thing you are looking at.
 *
 * It is also what lets the throw be shaped by physics rather than by a table.
 * The spin now cruises flat and is brought to rest by `springThrow`, and the
 * beeps pick up the whole arc of that for free: they accelerate as the reel
 * spins up (103ms, 87, 85), hold at 85ms for the cruise, and run down through
 * 86ms, 95, 125, 240 as the spring dies. Not one of those numbers is written
 * anywhere. They are what the wheel did.
 *
 * The pocket is the last beat of that same ritardando, at +523ms — and it is
 * the one sound here that waits for the picture rather than for a card. A
 * detent is crossed halfway between two cards, so the final beep sounds while
 * the chosen card is still 308px out and moving; the ball drops half a second
 * later, when the wheel is actually in its seat. Which is why that gap is long,
 * and why it is not a gap.
 *
 * A patch is what makes it possible: `useSound` bakes its options in at hook
 * time and hands back a play function that takes no arguments, so it cannot
 * carry a pitch that changes per hit. `usePatch` accepts an in-memory patch and
 * its `play(name, opts)` takes `PlayOptions` — while still going through the
 * provider's volume and mute, which a bare `defineSound` would bypass.
 */
export const SHUFFLE: SoundPatch = {
  name: 'shuffle',
  sounds: {
    // One definition at the top of the ladder; `beepDetune` walks it down.
    beep: beep(BEEP_HIGH),
    pocket: POCKET,
  },
}
