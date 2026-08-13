import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { MotionValue, Transition } from 'framer-motion'
import { useSequence, useSound } from '@web-kits/audio/react'
import { MiddleTruncate } from '../components/MiddleTruncate'
import { MobileFrame } from '../components/MobileFrame'
import { useRise } from '../components/rise'
import { FILMS } from '../lib/films'
import type { Detail, Slide } from '../lib/films'
import {
  pressable,
  springMorph,
  springResponsive,
  springWheel,
  transitionFast,
  transitionSmooth,
} from '../lib/motion'
import { DETENT, ROULETTE } from '../lib/sound'
import backdrop from '../assets/images/move-backdrop.jpg'
import iconArrowTriangleLeft from '../assets/icons/IconArrowTriangleLeft.svg'
import iconArrowTriangleRight from '../assets/icons/IconArrowTriangleRight.svg'
import iconCalendar from '../assets/icons/IconCalendar2.svg'
import iconClock from '../assets/icons/IconClock.svg'
import iconReview from '../assets/icons/IconReview.svg'
import iconTicket from '../assets/icons/IconTicket.svg'
import iconCheckmark from '../assets/icons/IconCheckmark1Small.svg'
import iconChevronTriangleDown from '../assets/icons/IconChevronTriangleDownMedium.svg'
import iconFilterCircle from '../assets/icons/IconFilterCircle.svg'
import iconFilter from '../assets/icons/IconFilter2.svg'
import iconFilterAscending from '../assets/icons/IconFilterAscending.svg'
import iconFilterDescending from '../assets/icons/IconFilterDescending.svg'
import iconDice from '../assets/icons/IconDice6.svg'
import iconSword from '../assets/icons/IconSword.svg'
import iconRockingHorse from '../assets/icons/IconRockingHorse.svg'
import iconEmojiLol from '../assets/icons/IconEmojiLol.svg'
import iconAudio from '../assets/icons/IconAudio.svg'
import iconMouth from '../assets/icons/IconMouth.svg'
import iconRobot from '../assets/icons/IconRobot3.svg'
import iconVolleyball from '../assets/icons/IconVolleyball.svg'

/** Panel width and the gap between panels, from the design's 40/660 offsets. */
const PANEL_GAP = 20

/**
 * The carousel is a wheel, not a track: the panels are chords on one circle and
 * a step is a rotation of the whole thing, so a card leaves by tipping away and
 * dropping under the rim rather than sliding flat off the edge.
 *
 * This is the one free parameter — everything else in the geometry follows from
 * it. 14° is the point where the arc is unmistakable on the neighbouring slivers
 * (they tilt 14° and fall ~76px) while the centre card is still square enough to
 * read as a poster rather than as a card mid-throw. Past ~20° the title starts
 * to look dropped; under ~8° the wheel flattens back into a track.
 */
const WHEEL_STEP_DEG = 14

/**
 * Radius that puts consecutive cards exactly one pitch apart *along the chord*,
 * which is what the eye measures — not along the arc.
 *
 * chord = 2R·sin(θ/2), so R = pitch / 2sin(θ/2). Solving it rather than picking
 * a radius is what keeps the design's 20px gutter at every width: the pitch is
 * measured, so a narrower device tightens the circle instead of letting the
 * cards drift apart or, worse, overlap. `Math.PI / 360` is θ/2 in radians with
 * the halving folded in.
 */
const wheelRadius = (pitch: number) =>
  pitch / (2 * Math.sin((WHEEL_STEP_DEG * Math.PI) / 360))

/**
 * How much a card shrinks per detent away from the top of the wheel.
 *
 * The design draws each neighbour at 524.645×766.856 against the centre card's
 * 600×877 — the same 0.874 on both axes *and* on the 30px corner — so a card
 * that steps off the top reads as falling away from the viewer, not just
 * tipping. Tilt alone put every card on the same plane; this is the depth cue
 * that separates the rim from the card in front of it.
 *
 * Applied per detent rather than per slot, so it compounds outward and, more to
 * the point, is continuous: the scale is solved from the wheel's live angle, so
 * a card grows into the centre over the whole travel instead of snapping a size
 * when the index changes.
 */
const SEAT_SCALE = 0.874

/** The panel's corner. Bottom always; top only once it's off the fold. */
const PANEL_RADIUS = 30

/** Ties the pill and the tray together as one morphing surface. */
const GENRE_SURFACE = 'genre-surface'

/**
 * The warm white every frosted surface is made of, as bare channels so the
 * alpha can be composed per surface.
 *
 * 252/250/246 rather than the design's flat 250: two points of blue removed is
 * imperceptible as a colour and unmistakable as a temperature, and it is what
 * stops the tray reading as a grey card dropped onto a warm screen.
 */
const GLASS_WHITE = '252,250,246'

/**
 * One hue per glyph.
 *
 * The design draws every icon in black, which is correct and completely mute:
 * seven genre rows in the tray are seven identical black marks, and the panel's
 * three meta chips say year, runtime and rating in exactly the same voice. So
 * each glyph takes a colour of its own, and the colour does the sorting the
 * shapes were being asked to do alone.
 *
 * These are all mid-tone and desaturated a little off pure — nothing here is a
 * primary. A saturated icon set on a screen that is mostly film poster stops
 * being playful and starts being a toolbar, and the panel's chips have to sit
 * over a photograph without competing with it.
 *
 * Kept as one table rather than scattered at the call sites so the set can be
 * read — and re-balanced — as a set.
 */
const HUE = {
  arrow: '#3b63c4',
  calendar: '#2e9457',
  clock: '#7b5bd6',
  review: '#e0a400',
  ticket: '#e0503a',
  dice: '#e0503a',
  filter: '#1b8b9e',
  check: '#2e9457',
  /** The year chip's disclosure caret — an affordance, not a subject. */
  chevron: '#8a8178',
} as const

type Deck = {
  /** Bottom line of the control pill — one genre for the whole carousel. */
  genre: string
  slides: Slide[]
}

/** The year chip's resting state: no year filter, the whole genre. */
const ANY_YEAR = 'any'

type SortKey = 'featured' | 'rating' | 'newest' | 'oldest' | 'runtime'

/**
 * What the design's filter key opens.
 *
 * The three that matter for a film are the three each panel already states —
 * its rating, its year, its runtime — so the menu sorts by exactly those and
 * nothing else, rather than inventing axes the library has no data for
 * (popularity, watchlist, box office). Year gets both directions because it is
 * the one where the opposite end is a genuinely different request: newest is
 * "what's out", oldest is "what's canon".
 *
 * `featured` is the library's own order, kept as the default so the tray opens
 * on the deck the design ships rather than on a sorted view of it.
 */
const SORT_MENU: { key: SortKey; label: string; icon: string; hue: string }[] = [
  { key: 'featured', label: 'Featured', icon: iconFilter, hue: HUE.filter },
  { key: 'rating', label: 'Top rated', icon: iconReview, hue: HUE.review },
  {
    key: 'newest',
    label: 'Newest first',
    icon: iconFilterDescending,
    hue: HUE.arrow,
  },
  {
    key: 'oldest',
    label: 'Oldest first',
    icon: iconFilterAscending,
    hue: HUE.clock,
  },
  { key: 'runtime', label: 'Longest first', icon: iconClock, hue: HUE.check },
]

/** "1h 39m" → 99. Either part can be missing, so both are read on their own. */
const runtimeMinutes = (runtime: string) => {
  const hours = /(\d+)\s*h/.exec(runtime)
  const mins = /(\d+)\s*m/.exec(runtime)
  return (hours ? Number(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0)
}

/**
 * Comparators, or `null` for the library's own order.
 *
 * None of them break ties: `Array.prototype.sort` is stable, so films that
 * match on the sorted field keep the library order behind it. That is what
 * makes Featured the base every other sort is a rearrangement of, and it keeps
 * a re-sort of the same deck deterministic.
 */
const SORTS: Record<SortKey, ((a: Slide, b: Slide) => number) | null> = {
  featured: null,
  rating: (a, b) => Number(b.detail.rating) - Number(a.detail.rating),
  newest: (a, b) => Number(b.detail.year) - Number(a.detail.year),
  oldest: (a, b) => Number(a.detail.year) - Number(b.detail.year),
  runtime: (a, b) =>
    runtimeMinutes(b.detail.runtime) - runtimeMinutes(a.detail.runtime),
}

const filmsIn = (genre: string, year: string) =>
  FILMS.filter(
    (film) =>
      film.genres.includes(genre) &&
      (year === ANY_YEAR || film.detail.year === year),
  )

/**
 * The single place the three controls meet: genre picks the pool, year narrows
 * it, sort orders what is left. Cheap enough at forty films to run on every
 * change rather than caching decks per combination.
 */
const buildDeck = (genre: string, year: string, sort: SortKey): Deck => {
  const slides = filmsIn(genre, year)
  const compare = SORTS[sort]
  // `filmsIn` already returns a fresh array, so this sorts a copy of the
  // library and not the library.
  return { genre, slides: compare ? slides.sort(compare) : slides }
}

/**
 * The years the year menu offers, newest first — scoped to the genre, and only
 * years that actually have a film in it. A menu of every year in the library
 * would let you pick 1952 in a genre that starts in 1977 and land on an empty
 * deck; scoping it means every row in the menu is a deck you can reach.
 */
const yearsIn = (genre: string) =>
  [
    ...new Set(
      FILMS.filter((film) => film.genres.includes(genre)).map(
        (film) => film.detail.year,
      ),
    ),
  ].sort((a, b) => Number(b) - Number(a))

/**
 * The tray's menu — the design's seven genres, in its order, each with its own
 * glyph. Fixed rather than derived from `FILMS`: the design is a standing menu
 * of what the app offers, not a report of what happens to be loaded, so a genre
 * keeps its row whether or not anything currently fills it.
 *
 * Every row is filled — the library carries 35 to 40 films for each — but a
 * year filter can empty one, so the tray keeps its `available` guard rather
 * than assuming stock.
 */
/**
 * A hue and a tile for each, running warm to cool down the list.
 *
 * The order is the design's and is not sorted by colour — but it happens to
 * fall vermilion, amber, mustard, violet, pink, teal, green, which reads as a
 * deliberate ramp rather than as seven arbitrary swatches. Each `tint` is its
 * own `hue` lifted to around 92% white: the tile is the glyph's own colour at
 * the strength a 24px square can carry without becoming a button.
 */
const GENRE_MENU: {
  genre: string
  icon: string
  hue: string
  tint: string
}[] = [
  { genre: 'Action', icon: iconSword, hue: '#e0503a', tint: '#fbe3de' },
  {
    genre: 'Animation',
    icon: iconRockingHorse,
    hue: '#e08a1e',
    tint: '#fceed8',
  },
  { genre: 'Comedy', icon: iconEmojiLol, hue: '#c99a00', tint: '#f9f1cf' },
  { genre: 'Musical', icon: iconAudio, hue: '#7b5bd6', tint: '#ebe5fb' },
  { genre: 'Romance', icon: iconMouth, hue: '#d9438c', tint: '#fbe1ee' },
  { genre: 'Sci-Fi', icon: iconRobot, hue: '#1b8b9e', tint: '#d9eff3' },
  { genre: 'Sport', icon: iconVolleyball, hue: '#2e9457', tint: '#dcf1e3' },
]

/** The design opens on the filled panel, with a sliver of each neighbour. */
const START_INDEX = 1

/**
 * Panels kept mounted each side of the current one. Two, not one: a panel has
 * to exist off-screen *before* it becomes the visible sliver, or it pops into
 * the edge instead of sliding in. Offset ±1 is that sliver, so ±2 is the
 * nearest position that is genuinely out of frame.
 *
 * This is also what makes a forty-film deck affordable, and what lets the
 * posters live on TMDB's CDN rather than in the repo. Every panel carries four
 * copies of its poster for the blur ramp, so mounting a whole deck would mean
 * 160 filtered images and forty poster fetches; the window holds that to twenty
 * images and five fetches, whatever the deck's size.
 *
 * A spin costs more than a step, because the window travels with the rim and
 * every card it crosses mounts on the way past. That is bounded by the spin's
 * length rather than the deck's, which is why `shuffle` folds its delta onto
 * the short arc — the worst case is half a deck, not all of it, and each of
 * those mounts lives for about one frame.
 */
const WINDOW = 2

/**
 * A deck loops only if it can fill the window without showing the same poster
 * twice at once — below that the wrap is visible as duplication rather than as
 * continuation, so those decks keep the clamped ends instead.
 */
const loops = (deck: Deck) => deck.slides.length > WINDOW * 2

/** Index is monotonic while looping, so it has to fold onto the deck. */
const wrap = (i: number, length: number) => ((i % length) + length) % length

/** Land mid-deck where there is room, so both neighbours show as slivers. */
const openingIndex = (deck: Deck) =>
  Math.min(START_INDEX, deck.slides.length - 1)

export function Move() {
  // The three tray controls are the state; the deck is derived from them. Held
  // apart rather than as one deck object so a control only has to say what it
  // changed — the deck is always the three read together, and there is no way
  // to set one and forget to rebuild.
  const [genre, setGenre] = useState(GENRE_MENU[0].genre)
  const [year, setYear] = useState(ANY_YEAR)
  const [sort, setSort] = useState<SortKey>('featured')
  const deck = useMemo(() => buildDeck(genre, year, sort), [genre, year, sort])

  const [index, setIndex] = useState(START_INDEX)
  const [trayOpen, setTrayOpen] = useState(false)
  const rise = useRise()
  const reducedMotion = useReducedMotion()

  // The only three sounds on the screen, and all three are the wheel: two ways
  // of stepping it and one of throwing it. Nothing else here makes a noise —
  // the tray, the chips and the ticket are all silent — which is what leaves
  // these audible as *movement* rather than as a click track under the UI.
  //
  // Forward and back share one definition, detuned either way at the call site
  // rather than written out twice: they are the same mechanism heard from the
  // same wheel, and ±110 cents is about a semitone — enough to tell them apart
  // blind, small enough that a run of steps still sounds like one object.
  const playForward = useSound(DETENT, { detune: 110 })
  const playBack = useSound(DETENT, { detune: -110 })
  const { play: playSpin } = useSequence(ROULETTE)

  // The pill and the tray are one surface, so the box between them is driven by
  // a spring rather than a duration: the travel is long and mostly vertical, and
  // a real spring decelerates into the new size instead of arriving on a clock.
  // `springMorph` is damped just short of critical, so it reads smooth in both
  // directions with no bounce at a box this size. Reduced motion gets the same
  // end state, arrived at instantly.
  const morph: Transition = reducedMotion ? { duration: 0 } : springMorph

  const looping = loops(deck)
  const count = deck.slides.length

  // While looping the index runs unbounded in both directions and only folds
  // onto the deck at the point of use, which is what makes the seam free: there
  // is no edge to detect and no silent jump back to a cloned panel.
  const current = deck.slides[wrap(index, count)]
  const atStart = !looping && index === 0
  const atEnd = !looping && index === count - 1

  // The wheel's pitch is measured rather than assumed, so the circle tightens
  // with the device instead of the cards drifting apart or overlapping. The
  // viewport and the cards are the same box, so its width *is* the card width.
  const viewport = useRef<HTMLDivElement>(null)
  const [pitch, setPitch] = useState(600 + PANEL_GAP)
  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) =>
      setPitch(entry.contentRect.width + PANEL_GAP),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Rotate about a point one radius below the centre of the cards, expressed in
  // the cards' own box so every slot resolves it to the same place on screen —
  // that shared pivot is what makes them one wheel rather than five independently
  // arcing panels. Below, not above, so the wheel is convex and the neighbours
  // fall away under the rim the way numbers do on a roulette.
  const origin = `50% calc(50% + ${wheelRadius(pitch)}px)`

  // The wheel's true state, in degrees. A `useSpring` and not an `animate`
  // target: the spring integrates one continuous position, so a press that
  // arrives while the wheel is still turning adds to the velocity already in it
  // instead of restarting the solve. Holding Next spins up; tapping it once
  // steps one detent and settles.
  const target = useMotionValue(index * WHEEL_STEP_DEG)
  useEffect(() => {
    target.set(index * WHEEL_STEP_DEG)
  }, [index, target])
  const spring = useSpring(target, springWheel)
  // Reduced motion reads the target directly — same end state, no travel. Both
  // hooks still run, so the swap is a choice of which value to render, not a
  // conditional hook.
  const wheel = reducedMotion ? target : spring
  const rotate = useTransform(wheel, (degrees) => -degrees)

  // Which cards are mounted follows the wheel's *live* angle, not the target.
  // On a single step the two are the same, but on a long throw — a shuffle
  // across the deck — this is what makes the spin a spin: cards mount and fly
  // past as the rim reaches them, instead of the destination swinging in alone
  // out of an empty frame. It costs one render per detent crossed, not one per
  // frame, because only the rounded value is state.
  const [rim, setRim] = useState(index)
  useMotionValueEvent(wheel, 'change', (degrees) => {
    const detent = Math.round(degrees / WHEEL_STEP_DEG)
    setRim((previous) => (previous === detent ? previous : detent))
  })

  // A card's angle is fixed to the wheel; turning the wheel is what moves it.
  // The window rides the rim so it always brackets what is actually on screen.
  const panels = []
  for (let offset = -WINDOW; offset <= WINDOW; offset++) {
    const virtual = rim + offset
    if (!looping && (virtual < 0 || virtual >= count)) continue
    panels.push({ virtual, slide: deck.slides[wrap(virtual, count)] })
  }

  // The years this genre actually has, and how many films each genre keeps
  // under the year in force — the tray needs both to keep every row it offers
  // reachable.
  const years = useMemo(() => yearsIn(genre), [genre])
  const counts = useMemo(
    () =>
      new Map(
        GENRE_MENU.map(({ genre }) => [genre, filmsIn(genre, year).length]),
      ),
    [year],
  )

  // Any control that rebuilds the deck lands the wheel back at the opening
  // index: the old index points into a deck that no longer exists, and a
  // re-sort would otherwise leave the wheel on whatever film happened to
  // inherit that slot. The next deck is built here rather than read from the
  // memo because that has not recomputed yet at the time of the call.
  //
  // The wheel *jumps* to that index rather than spinning to it. A step within a
  // deck is travel and should read as travel, but a new deck has no cards
  // between here and there to travel past — a filter that cut forty films to
  // three would otherwise spin the rim through thirty-odd empty detents, and
  // the carousel would sit blank for the length of the throw. `jump` also
  // clears the spring's velocity, so a rebuild mid-spin lands still.
  const rebuild = (
    next: Partial<{ genre: string; year: string; sort: SortKey }>,
  ) => {
    const nextGenre = next.genre ?? genre
    const nextYear = next.year ?? year
    const nextSort = next.sort ?? sort
    const nextIndex = openingIndex(buildDeck(nextGenre, nextYear, nextSort))

    setGenre(nextGenre)
    setYear(nextYear)
    setSort(nextSort)
    setIndex(nextIndex)
    setRim(nextIndex)

    const degrees = nextIndex * WHEEL_STEP_DEG
    target.jump(degrees)
    spring.jump(degrees)
  }

  // Genre is the tray's headline choice, so picking one closes it. Year and
  // sort are refinements of that same choice — the tray stays open so they can
  // be combined without reopening it each time.
  const chooseGenre = (next: string) => {
    rebuild({ genre: next })
    setTrayOpen(false)
  }

  // Shuffle stays inside the current deck — the tray is a genre menu, so the
  // die is "another film in this genre", not "any film at all". Rerolls until
  // it lands somewhere new, so a shuffle never looks like a dead button.
  const shuffle = () => {
    if (count > 1) {
      const here = wrap(index, count)
      let next = here
      while (next === here) next = Math.floor(Math.random() * count)
      // Move by a delta rather than assigning, so a looping deck keeps its
      // unbounded index. Now that the travel is visible as rotation, the delta
      // is folded onto the short arc: a plain `next - here` would spin a
      // forty-film deck 39 detents forward to reach the card one step back.
      let delta = next - here
      if (looping) {
        if (delta > count / 2) delta -= count
        else if (delta < -count / 2) delta += count
      }
      setIndex((i) => i + delta)
    }
    // Fires either way. A one-film deck has nowhere to shuffle to, but the key
    // was still pressed, and silence there reads as a broken button rather
    // than as an empty deck.
    playSpin()
    setTrayOpen(false)
  }

  return (
    <MobileFrame backdrop={<PosterAmbience src={current.poster} />}>
      {/* Carousel viewport. The entrance belongs here and not on the track:
          Framer composes its own `transform` from an animated `y`, so a track
          that both rose and translated would lose the translate — the rise
          wins and the controls move nothing. One transform, one owner.

          The panels are inset 40px, and the wheel they ride is sized from that
          measured width, so the design's 20px gutter survives a narrower
          device.

          An endless deck has no track to slide — the strip would have to grow
          in one direction forever — so nothing here translates. The cards are
          bolted to the wheel at fixed angles and only the wheel turns, which is
          also why the whole carousel animates as a single composited transform
          however many cards are mounted. */}
      <motion.div {...rise(0.12)} className="relative min-h-0 flex-1">
        <div
          ref={viewport}
          className="absolute inset-y-0 left-[40px] w-[calc(100%-80px)]"
        >
          <motion.div
            className="absolute inset-0"
            style={{ rotate, transformOrigin: origin }}
          >
            {panels.map(({ virtual, slide }) => (
              <div
                // Keyed by the unbounded index, so a card keeps its identity —
                // and therefore its seat on the wheel — as the rim moves past.
                key={virtual}
                className="absolute inset-0"
                // Static: a card's seat never changes. The rotation the eye
                // sees is the wheel's, and it composes with this one because
                // both turn about the same pivot.
                //
                // Stacked by distance from the top of the wheel. A card this
                // tall cannot tilt without its lower inner corner swinging
                // inside its neighbour — 600×888 boxes 20px apart collide past
                // about 2.6° of rotation, so there is no step angle worth
                // having that avoids it. Ordering them is the fix rather than
                // the workaround: the near card passes in front, the overlap
                // reads as the fan of a rim seen edge-on, and what would have
                // been a corner clipping through becomes depth.
                style={{
                  transform: `rotate(${virtual * WHEEL_STEP_DEG}deg)`,
                  transformOrigin: origin,
                  zIndex: WINDOW - Math.abs(virtual - rim),
                }}
              >
                {/* The settled card owns the reading order, not whichever one
                    happens to be passing the top of the wheel mid-spin. */}
                <Panel
                  slide={slide}
                  wheel={wheel}
                  virtual={virtual}
                  hidden={virtual !== index}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Control bar — 96px keys flush to each end of a 24px gutter, with no
          surface of its own: only the keys are glass. */}
      <motion.div
        {...rise(0.18)}
        className="relative flex h-[96px] shrink-0 items-center gap-2 px-6"
      >
        <ControlKey
          label="Previous"
          icon={iconArrowTriangleLeft}
          disabled={atStart}
          onClick={() => {
            playBack()
            setIndex((i) => (looping ? i - 1 : Math.max(0, i - 1)))
          }}
        />

        {/* Holds the pill's footprint whether or not the pill is here, so the
            two keys never move while the tray is open. */}
        <div className="relative h-[96px] min-w-0 flex-1">
          {!trayOpen && (
            <motion.button
              layoutId={GENRE_SURFACE}
              transition={morph}
              type="button"
              onClick={() => setTrayOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={false}
              aria-label={`Genre: ${deck.genre}. Choose another`}
              style={{ borderRadius: 100 }}
              className="focus-visible:ring-ink/25 absolute inset-0 cursor-pointer overflow-hidden shadow-[0px_2px_20px_-0.5px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2"
            >
              <Glass radius="100px" />
              {/* `leading-[normal]` on both lines, not the inherited 1.5: the
                  design trims each line to the font's own line box (17px at
                  14px, 29px at 24px), which is what keeps the two-line block
                  optically centred under the 22px top offset. `px-4` is ours —
                  it only engages once the pill narrows past the design's 424px
                  and the labels truncate. */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...transitionSmooth, delay: 0.06 }}
                className="font-ui absolute top-[22px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 px-4 leading-[normal] text-ink-soft"
              >
                <span className="truncate text-[14px] font-medium whitespace-pre">
                  {current.name}
                </span>
                <span className="truncate text-center text-[24px] font-medium">
                  {deck.genre}
                </span>
              </motion.div>
            </motion.button>
          )}
        </div>

        <ControlKey
          label="Next"
          icon={iconArrowTriangleRight}
          disabled={atEnd}
          onClick={() => {
            playForward()
            setIndex((i) => (looping ? i + 1 : Math.min(count - 1, i + 1)))
          }}
        />
      </motion.div>

      {/* Dismiss layer. Separate from the tray so it can fade on its own — the
          tray itself must never be inside AnimatePresence, or an exiting tray
          and the returning pill would hold the same layoutId at once and the
          morph would have two masters. */}
      <AnimatePresence>
        {trayOpen && (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close genres"
            onClick={() => setTrayOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionFast}
            className="absolute inset-0 z-20 cursor-default bg-black/25"
          />
        )}
      </AnimatePresence>

      {trayOpen && (
        <GenreTray
          genre={deck.genre}
          year={year}
          years={years}
          sort={sort}
          counts={counts}
          morph={morph}
          onChooseGenre={chooseGenre}
          onChooseYear={(next) => rebuild({ year: next })}
          onChooseSort={(next) => rebuild({ sort: next })}
          onShuffle={shuffle}
          onClose={() => setTrayOpen(false)}
        />
      )}
    </MobileFrame>
  )
}

/**
 * The pill's other state. It carries the same `layoutId`, so Framer treats the
 * two as one surface and interpolates the box — pill to tray and back — instead
 * of cross-fading two separate elements.
 *
 * Only the container morphs. Its contents fade, because a layout animation
 * scales the subtree and text caught in that stretches as it goes.
 */
function GenreTray({
  genre,
  year,
  years,
  sort,
  counts,
  morph,
  onChooseGenre,
  onChooseYear,
  onChooseSort,
  onShuffle,
  onClose,
}: {
  genre: string
  year: string
  years: string[]
  sort: SortKey
  counts: Map<string, number>
  morph: Transition
  onChooseGenre: (genre: string) => void
  onChooseYear: (year: string) => void
  onChooseSort: (sort: SortKey) => void
  onShuffle: () => void
  onClose: () => void
}) {
  const [menu, setMenu] = useState<'year' | 'sort' | null>(null)


  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Escape unwinds one layer at a time: the menu that is over the tray
      // first, and the tray only once nothing is over it.
      if (menu) setMenu(null)
      else onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menu, onClose])

  // A year the genre no longer offers can't survive a genre change — the rows
  // for those genres are disabled — so the chip only ever shows a live filter.
  const filtered = year !== ANY_YEAR
  const sorted = sort !== 'featured'
  const activeSort =
    SORT_MENU.find((entry) => entry.key === sort) ?? SORT_MENU[0]

  return (
    <motion.div
      layoutId={GENRE_SURFACE}
      transition={morph}
      role="dialog"
      aria-modal="true"
      aria-label="Movie genre"
      style={{ borderRadius: 30 }}
      // 128px each side is the pill's own footprint — the 24px gutter, a 96px
      // key and the 8px gap — so the tray is exactly as wide as the pill it
      // grows out of, and the morph is pure vertical travel.
      //
      // The 12px padding is load-bearing: with the 32px header, the 16px below
      // it, the seven 40px rows on their 2px gaps, the 12px above Shuffle and
      // its 32px key, the box measures the design's 408px exactly.
      className="absolute inset-x-[128px] bottom-6 z-30 overflow-hidden p-3 shadow-[0px_2px_20px_-0.5px_rgba(0,0,0,0.12)]"
    >
      {/* The one glass surface here that is not a lens.
          The keys and the pill are small enough to see through and still read;
          the tray covers half the panel, and anything the poster still shows
          through it — the title, the chips, the edge of the card — competes
          with seven genre rows for the same attention. So it stops the panel
          rather than softening it: the blur is wide enough that nothing under
          it has an edge left, and the white over that is heavy enough that what
          little survives is a colour cast, not content. What you get is opaque
          frosted glass that still belongs to the film behind it. */}
      <Glass radius="30px" blur={64} saturate={2} />

      {/* The rest of the way to opaque, faded in on the morph rather than
          applied flat.
          The tray and the pill are one surface, and the pill is a lens at the
          shared 0.7 — so a tray that mounted already blocking would swap the
          fill in the first frame of a morph that is still pill-sized and still
          in the control bar. Starting at the pill's own tint and thickening as
          the box grows keeps it one surface for the whole travel. Compounded
          over the layer beneath, 0.77 here lands at an effective 0.93.
          One-way: the tray unmounts on close rather than exiting (it cannot
          hold the shared `layoutId` at the same time as the returning pill), so
          there is no fade back. That reads fine — on the way out the eye is
          following a box that is collapsing into the bar, not its fill. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={morph}
        style={{ borderRadius: 30 }}
        className="pointer-events-none absolute inset-0 bg-[rgba(252,250,246,0.77)]"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transitionSmooth, delay: 0.06 }}
        className="relative flex flex-col items-center gap-4"
      >
        {/* 32px, not the title's own height: the year chip is the tallest
            thing in the row, so it sets the band and the heading centres to
            it. Stacked above the rows now that both chips open a menu over
            them — without the z-index the later rows would paint on top.
            `px-2` on top of the tray's own 12 is the design's 20px inset — the
            header is held in a touch tighter than the rows, which run to the
            tray's padding so their highlight can reach past the label. */}
        <header className="relative z-20 flex h-8 w-full shrink-0 items-center gap-2 px-2">
          {/* The one place the display face appears outside a panel heading. */}
          <h2 className="font-display trim-cap min-w-0 flex-1 text-[24px] leading-[normal] text-ink-soft">
            Movie Genre
          </h2>

          {/* The design's two chips, now both live: the year narrows the deck
              and the filter key orders it. They anchor their menus, so the
              wrapper is the positioning context for both. */}
          <div className="relative flex shrink-0 items-center gap-2">
            {/* Sized by its contents, as the design has it — the asymmetric
                10/4 padding is what makes the chevron sit tight to the edge
                while the calendar glyph keeps its breathing room. */}
            <button
              type="button"
              onClick={() => setMenu(menu === 'year' ? null : 'year')}
              aria-haspopup="menu"
              aria-expanded={menu === 'year'}
              aria-label={`Year: ${filtered ? year : 'all years'}. Filter by year`}
              className="focus-visible:ring-ink/25 relative flex cursor-pointer items-center gap-2 rounded-[25px] py-1 pr-1 pl-2.5 shadow-[0px_0.5px_5px_0px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2"
            >
              <Glass radius="25px" />
              {/* A live filter darkens its own chip to the row highlight, so
                  the tray says what it is showing without a second badge. */}
              {filtered && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[25px]"
                  style={{ backgroundColor: `${HUE.calendar}24` }}
                />
              )}
              <span className="relative flex items-center gap-1">
                <Glyph
                  src={iconCalendar}
                  tint={HUE.calendar}
                  className="size-4 shrink-0"
                />
                <span
                  className={`font-body text-[16px] leading-6 font-medium tracking-[-0.144px] whitespace-nowrap ${
                    filtered ? 'text-ink-soft' : 'text-ink-faint'
                  }`}
                >
                  {filtered ? year : 'All'}
                </span>
              </span>
              {/* Wrapped rather than tinted in place: the mask lives on the
                  span's own background, so the element carrying it cannot also
                  be the one Framer rotates without the two fighting over
                  `transform`. */}
              <motion.span
                className="relative shrink-0"
                animate={{ rotate: menu === 'year' ? 180 : 0 }}
                transition={springResponsive}
              >
                <Glyph
                  src={iconChevronTriangleDown}
                  tint={HUE.chevron}
                  className="size-4"
                />
              </motion.span>
            </button>

            <button
              type="button"
              onClick={() => setMenu(menu === 'sort' ? null : 'sort')}
              aria-haspopup="menu"
              aria-expanded={menu === 'sort'}
              aria-label={`Sort: ${activeSort.label}. Change order`}
              className="focus-visible:ring-ink/25 relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-[25px] shadow-[0px_0.5px_5px_0px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2"
            >
              <Glass radius="25px" />
              {/* The wash takes the chosen sort's own colour, so the key and
                  the glyph it is showing agree — the same trick the genre rows
                  play, one level up. */}
              {sorted && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[25px]"
                  style={{ backgroundColor: `${activeSort.hue}24` }}
                />
              )}
              {/* The key keeps the design's glyph while the order is the house
                  one, and takes the chosen sort's own glyph once it isn't —
                  the same key, reading back the choice it holds. */}
              <Glyph
                src={sorted ? activeSort.icon : iconFilterCircle}
                tint={sorted ? activeSort.hue : HUE.filter}
                className="relative size-4"
              />
            </button>

            <AnimatePresence>
              {menu === 'year' && (
                <FilterMenu key="year" label="Filter by year">
                  <MenuRow
                    label="All years"
                    selected={!filtered}
                    onClick={() => {
                      onChooseYear(ANY_YEAR)
                      setMenu(null)
                    }}
                  />
                  {years.map((entry) => (
                    <MenuRow
                      key={entry}
                      label={entry}
                      selected={entry === year}
                      onClick={() => {
                        onChooseYear(entry)
                        setMenu(null)
                      }}
                    />
                  ))}
                </FilterMenu>
              )}

              {menu === 'sort' && (
                <FilterMenu key="sort" label="Sort films">
                  {SORT_MENU.map((entry) => (
                    <MenuRow
                      key={entry.key}
                      icon={entry.icon}
                      hue={entry.hue}
                      label={entry.label}
                      selected={entry.key === sort}
                      onClick={() => {
                        onChooseSort(entry.key)
                        setMenu(null)
                      }}
                    />
                  ))}
                </FilterMenu>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Dismiss layer for whichever menu is open. Inside the tray and under
            the header, so a click anywhere on the rows closes the menu without
            also picking a genre, while the two chips stay live. */}
        {menu && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenu(null)}
            className="absolute inset-0 z-10 cursor-default"
          />
        )}

        <div className="flex w-full shrink-0 flex-col items-center gap-3">
          <div className="flex w-full flex-col gap-[2px]">
            {GENRE_MENU.map(({ genre: row, icon, hue, tint }) => {
              const isActive = row === genre
              // The menu is fixed but what is behind a row is not: with a year
              // in force a genre can hold nothing. It still shows — the
              // design's menu is the offer, not the inventory — but it does
              // not pretend to be choosable, which is also what stops a genre
              // and a year combining into an empty deck.
              const available = (counts.get(row) ?? 0) > 0

              return (
                <button
                  key={row}
                  type="button"
                  disabled={!available}
                  onClick={() => onChooseGenre(row)}
                  aria-current={isActive}
                  // The selected row is washed in its own genre's colour
                  // rather than the neutral grey the design used — `1f` is
                  // hex alpha, about 12%, which is as far as a hue can go
                  // behind 16px text before it starts competing with it.
                  // Hover stays grey on purpose: the colour means *chosen*,
                  // and a pointer passing over a row has not chosen anything.
                  style={isActive ? { backgroundColor: `${hue}1f` } : undefined}
                  className={`focus-visible:ring-ink/25 relative flex h-[40px] w-full items-center gap-3 rounded-[10px] pr-3 pl-2 text-left outline-none focus-visible:ring-2 ${
                    available
                      ? 'cursor-pointer hover:bg-[rgba(85,85,85,0.06)]'
                      : 'cursor-default opacity-35'
                  }`}
                >
                  {/* The glyph sits on its own tile rather than bare on the
                      glass. It is what gives the list a spine: the row
                      highlight is a wash the same weight as the tray, so
                      without an opaque chip the icons dissolved into it, and a
                      24px tile at a 4px corner reads as an app mark against
                      the 10px row. */}
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-[4px]"
                    style={{ backgroundColor: tint }}
                  >
                    <Glyph src={icon} tint={hue} className="size-4" />
                  </span>
                  {/* 16px here against the panel chips' 14px — the tray is the
                      one surface you read at arm's length rather than glance
                      at, so the design steps the menu up a size. */}
                  <span className="font-body text-[16px] leading-6 font-medium tracking-[-0.144px] whitespace-nowrap text-ink-soft">
                    {row}
                  </span>
                  {/* The tick takes the row's own hue, so the answer to
                      "which genre is on?" is the same colour in the list as it
                      is on the tile. */}
                  {isActive && (
                    <Glyph
                      src={iconCheckmark}
                      tint={hue}
                      className="ml-auto size-5 shrink-0"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <motion.button
            type="button"
            onClick={onShuffle}
            // Fully round, unlike the 10px rows above it: the rows are a list
            // and share the list's corner, the Shuffle key is a button and
            // takes the same capsule as every other key on the screen.
            className="focus-visible:ring-ink/25 bg-key flex cursor-pointer items-center gap-2 rounded-[100px] py-2 pr-3.5 pl-3 outline-none focus-visible:ring-2"
            whileHover={{ scale: 1.04 }}
            whileTap={pressable.whileTap}
            transition={springResponsive}
          >
            <Glyph src={iconDice} tint={HUE.dice} className="size-4 shrink-0" />
            <span className="font-body text-[14px] leading-4 font-medium tracking-[-0.126px] whitespace-nowrap text-ink-soft">
              Shuffle
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * The surface both header menus drop onto — the same glass as the tray, and
 * lighter still, because it stacks over the genre rows and has to separate from
 * them as cleanly as the tray separates from the poster.
 *
 * No blur on this one. The tray clips it, so everything behind the menu *is*
 * the tray's own near-opaque fill — there is nothing left underneath with an
 * edge to soften, and a second backdrop root over the first would cost a
 * repaint for no visible change. The step up in tint and the drop shadow are
 * what lift it off the rows.
 *
 * Scrolling lives on the inner list, not on this box: an absolutely positioned
 * child of a scroll container scrolls away with the content, so a `Glass` on
 * the scroller itself would slide off the top of its own menu.
 *
 * Anchored top-right and scaled from that corner, so it reads as coming out of
 * the chip that opened it rather than appearing beside it.
 */
function FilterMenu({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <motion.div
      role="menu"
      aria-label={label}
      initial={{ opacity: 0, scale: 0.92, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -6 }}
      transition={springResponsive}
      style={{ borderRadius: 16, transformOrigin: 'top right' }}
      className="absolute top-[calc(100%+8px)] right-0 z-30 w-max min-w-[128px] overflow-hidden shadow-[0px_2px_20px_-0.5px_rgba(0,0,0,0.12)]"
    >
      <Glass radius="16px" tint={0.97} />
      {/* Capped at seven rows and change: the tray is a fixed 408px and the
          menu must not run past its bottom edge, which `overflow-hidden` on the
          tray would clip rather than scroll. */}
      <div className="relative flex max-h-[240px] flex-col overflow-y-auto p-1">
        {children}
      </div>
    </motion.div>
  )
}

/** One choice in either header menu. A row shorter and a size down from the
 *  genre rows — this is a refinement of the choice below it, not a peer. */
function MenuRow({
  icon,
  hue,
  label,
  selected,
  onClick,
}: {
  icon?: string
  /** Only meaningful alongside `icon`; the year menu's rows carry neither. */
  hue?: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`focus-visible:ring-ink/25 flex h-8 w-full shrink-0 cursor-pointer items-center gap-2 rounded-[8px] px-2 text-left outline-none focus-visible:ring-2 ${
        selected ? 'bg-[rgba(85,85,85,0.1)]' : 'hover:bg-[rgba(85,85,85,0.06)]'
      }`}
    >
      {icon && (
        <Glyph src={icon} tint={hue ?? HUE.filter} className="size-4 shrink-0" />
      )}
      <span className="font-body text-[14px] leading-5 tracking-[-0.126px] whitespace-nowrap text-ink-soft">
        {label}
      </span>
      {/* Always occupies its slot, checked or not, so the widest row sets the
          menu's width once and picking a different row doesn't resize it. */}
      <span className="ml-auto flex size-4 shrink-0 pl-2">
        {selected && (
          <Glyph src={iconCheckmark} tint={HUE.check} className="size-4" />
        )}
      </span>
    </button>
  )
}

/**
 * The frosted fill shared by the keys, the control pill and the tray: a
 * color-dodge lift off the backdrop, then a near-opaque white over it. Two
 * stacked layers because the blend mode applies to the first only.
 *
 * `blur` belongs on the white layer rather than the wrapper, so the backdrop is
 * sampled *after* the dodge has lifted it — blurring first would average the
 * poster down to a flat field and leave the dodge nothing to catch.
 *
 * `tint` is the white layer's alpha. It defaults to the design's 0.7, which is
 * a lens: the poster stays visible through it, only softened. Surfaces that
 * have to *stop* the poster rather than soften it raise it — see the tray.
 *
 * `saturate` rides with the blur, and only earns its place at the high tints.
 * A wide blur averages a poster towards grey and a heavy white then washes out
 * what little is left, so the surface goes dead; pushing saturation back up
 * before the white lands keeps the colour of the film underneath without
 * keeping any of its detail.
 */
function Glass({
  radius,
  blur,
  tint = 0.7,
  saturate = 1,
}: {
  radius: string
  blur?: number
  tint?: number
  saturate?: number
}) {
  const filter = blur ? `blur(${blur}px) saturate(${saturate})` : undefined

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ borderRadius: radius }}
    >
      <div
        className="absolute inset-0 bg-[rgba(38,38,38,0.2)] mix-blend-color-dodge"
        style={{ borderRadius: radius }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          backgroundColor: `rgba(${GLASS_WHITE},${tint})`,
          backdropFilter: filter,
          WebkitBackdropFilter: filter,
        }}
      />
    </div>
  )
}

/**
 * A tinted icon.
 *
 * Every exported SVG here is a single-colour stencil — `fill="black"`, or
 * `#444` on the chevrons — which is exactly what makes them impossible to
 * recolour as an `<img>`. Masking turns that limitation into the mechanism: the
 * file becomes an alpha channel and the span's own background shows through the
 * glyph, so one asset serves any hue without a second export from Figma and
 * without inlining a `<path>` whose vector data we don't own.
 *
 * `block` is not optional. A bare `<span>` is inline, and width/height do not
 * apply to inline boxes — the icon would collapse to nothing everywhere it is
 * not already a flex or grid child.
 */
function Glyph({
  src,
  tint,
  className,
}: {
  src: string
  tint: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`block ${className ?? ''}`}
      style={{
        backgroundColor: tint,
        // Quoted. Vite inlines an SVG under 4KB as a `data:` URI, and every
        // icon here is — unquoted, the commas and parentheses inside that URI
        // would terminate the `url()` early and the glyph would vanish in the
        // production build while working perfectly in dev.
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

function ControlKey({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string
  icon: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      // A flat wash, not the pill's two-layer glass: the design steps the two
      // arrow keys back off the surface the pill and the tray share, so the
      // control bar has one lens in the middle and two plain discs either side
      // rather than three competing panes.
      className="focus-visible:ring-ink/25 relative grid size-[96px] shrink-0 cursor-pointer place-items-center rounded-full bg-[rgba(252,250,246,0.45)] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-40"
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : pressable.whileTap}
      transition={springResponsive}
    >
      <Glyph src={icon} tint={HUE.arrow} className="relative size-[48px]" />
    </motion.button>
  )
}

/**
 * The centre panel's top 64px sit above the fold, so only its bottom corners
 * round and its content anchors to the bottom edge — which also keeps the
 * layout intact as the panel flexes on a shorter viewport.
 *
 * Off the centre, both of those stop being true: the design's neighbours are
 * whole cards, scaled down and rounded on all four corners, because a card that
 * has fallen away from the viewer is no longer cropped by the fold. Rather than
 * switch either property on the index — which would pop mid-travel — both are
 * solved from the wheel's live angle, so the top corner opens and the card
 * shrinks over the same continuous throw the rotation takes.
 */
function Panel({
  slide,
  wheel,
  virtual,
  hidden,
}: {
  slide: Slide
  wheel: MotionValue<number>
  virtual: number
  hidden: boolean
}) {
  // Detents from the top of the wheel: the card sitting there is the one whose
  // seat matches the wheel's own angle, so the difference is the distance.
  const distance = useTransform(wheel, (degrees) =>
    Math.abs(degrees / WHEEL_STEP_DEG - virtual),
  )
  // Scaled about the card's own centre, so it keeps its seat on the rim and
  // only its size changes — the radius the geometry solves stays untouched.
  const scale = useTransform(distance, (d) => SEAT_SCALE ** d)
  // Full corner by one detent out, which is the first seat the design draws.
  const topRadius = useTransform(
    distance,
    (d) => `${PANEL_RADIUS * Math.min(1, d)}px`,
  )

  return (
    <motion.article
      // Off-screen panels stay in the flow for the slide, but out of the
      // reading order and the tab sequence.
      aria-hidden={hidden}
      inert={hidden}
      style={{
        scale,
        borderTopLeftRadius: topRadius,
        borderTopRightRadius: topRadius,
      }}
      // bg-ink-soft, not the design's bg-tray: the copy is white, so the
      // surface the poster decodes over has to be the dark one, never the
      // light one — and warm near-black rather than #000, so a poster fading
      // in over it never crosses a dead grey on the way.
      className="bg-ink-soft relative h-full w-full shrink-0 overflow-hidden rounded-b-[30px]"
    >
      <PosterBackdrop src={slide.poster} />
      <Detail detail={slide.detail} />
    </motion.article>
  )
}

/**
 * The light around the phone belongs to whichever film is on screen: the
 * current poster, blown past the device's own frame and blurred past
 * legibility, so the backdrop reads as colour spilling off the card rather than
 * as a second picture competing with it.
 *
 * Radius is the whole point — at anything less than this the poster stays
 * recognisable and the eye starts reading it as content. `saturate` compensates
 * for the wash that a blur this wide leaves behind, since averaging a poster
 * over that radius pulls every hue towards the same grey.
 *
 * Overscanned far harder than the panel's 6%: `blur()` samples outside the
 * element's box, and a radius this large would otherwise thin all four device
 * edges to transparency — the scale has to outrun the radius, not just clear it.
 */
const AMBIENCE_BLUR = 96
const AMBIENCE_SCALE = 1.45

/**
 * The shipped backdrop stays underneath as the floor. Posters decode
 * asynchronously, and the control keys blend against whatever is behind them —
 * `mix-blend-color-dodge` over nothing is a flash of bare white on first paint.
 *
 * The tint over the top is what keeps that dodge in range. Posters vary wildly
 * in key, and a bright one lifted by the keys' blend clips to white and takes
 * the pill's label with it; holding the backdrop down to a common mid-range
 * means the glass behaves the same on every film.
 *
 * A deep plum rather than plain black, at the same strength. Pure black over a
 * blurred poster kills the hue along with the brightness and leaves the frame
 * grey — the one thing the ambience is there to avoid, since its whole job is
 * to be the colour of whatever film is on screen. Tinting warm-violet takes the
 * same light out while leaving the picture's own colour standing.
 */
const AMBIENCE_TINT = 'rgba(26,14,32,0.30)'

function PosterAmbience({ src }: { src: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <>
      <img
        src={backdrop}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />

      {/* Keyed on the poster so a slide swaps the layer rather than mutating
          it: the outgoing copy stays mounted and fades under the incoming one,
          which is the only way to cross-fade two different `filter` results —
          animating `src` on one element would hard-cut. */}
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : transitionSmooth}
          style={{
            scale: AMBIENCE_SCALE,
            filter: `blur(${AMBIENCE_BLUR}px) saturate(1.3)`,
          }}
          className="absolute inset-0 size-full object-cover"
        />
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{ backgroundColor: AMBIENCE_TINT }}
      />
    </>
  )
}

/**
 * Where the panel used to be one flat sheet of smoked glass over the device
 * backdrop, it is now the poster — sharp along the top, ramping into a heavy
 * blur beneath the copy.
 *
 * The ramp is layer blur, not backdrop blur: stacked copies of the poster at
 * increasing radii, each masked in from lower down the panel, so the sharp
 * edition shows through at the top and the widest radius wins at the bottom.
 * The ten-`backdrop-filter` recipe in `ProgressiveBlur` reads much the same,
 * but would put three backdrop roots inside a track that transforms on every
 * slide; plain `filter` on a static image composites once and then sits still.
 *
 * Each copy is overscanned 6%, since `blur()` samples past the element's box
 * and would otherwise thin the panel's own edges into transparency.
 */
const BLUR_STEPS = [
  { radius: 10, from: 30, to: 66 },
  { radius: 26, from: 14, to: 46 },
  { radius: 52, from: 0, to: 30 },
]

/**
 * Opaque below `from`, gone by `to`, both measured up from the panel's bottom.
 * The intermediate stops are a smoothstep — a straight ramp between two radii
 * shows up as a band of its own.
 */
function rampMask(from: number, to: number) {
  const span = to - from
  const stops = [
    [0, 1],
    [0.25, 0.89],
    [0.5, 0.5],
    [0.75, 0.11],
    [1, 0],
  ] as const

  const parts = stops.map(
    ([t, alpha]) => `rgba(0,0,0,${alpha}) ${(from + span * t).toFixed(2)}%`,
  )
  return `linear-gradient(to top, ${parts.join(', ')})`
}

/**
 * Posters run bright and busy, so blur alone won't hold the copy — this is the
 * floor of contrast under it. It replaces the design's flat `bg-scrim`, which
 * only ever had one depth of panel to sit on.
 */
const SCRIM =
  'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.74) 16%, rgba(0,0,0,0.42) 36%, rgba(0,0,0,0.14) 56%, rgba(0,0,0,0) 74%)'

function PosterBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <img
        src={src}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />

      {BLUR_STEPS.map((step) => {
        const mask = rampMask(step.from, step.to)
        return (
          <img
            key={step.radius}
            src={src}
            alt=""
            className="absolute inset-0 size-full scale-[1.06] object-cover"
            style={{
              filter: `blur(${step.radius}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}

      <div className="absolute inset-0" style={{ background: SCRIM }} />
    </div>
  )
}

function Detail({ detail }: { detail: Detail }) {
  return (
    // 32px off the card's bottom, not the 52 the block used to carry: the
    // design drops the whole group so the Get Ticket key sits closer to the
    // card's edge than to the synopsis above it, which is what stops the copy
    // reading as floating in the middle of the scrim.
    <div className="absolute bottom-[32px] left-8 flex w-[451px] max-w-[calc(100%-64px)] flex-col gap-4">
      <div className="flex flex-col gap-3">
        {/* The chips overlap by 2px onto the 6px connectors so the row reads as
            one linked strip rather than three separate pills — at 1px the
            capsule's own curve still left a hairline of backdrop showing
            through the join. */}
        <div className="flex items-center">
          <Chip icon={iconCalendar} hue={HUE.calendar} label={detail.year} />
          <span className="bg-chip -mr-[2px] size-[6px] shrink-0" />
          <Chip icon={iconClock} hue={HUE.clock} label={detail.runtime} />
          <span className="bg-chip -mr-[2px] size-[6px] shrink-0" />
          <Chip
            icon={iconReview}
            hue={HUE.review}
            label={detail.rating}
            last
          />
        </div>

        {/* White here, but the chips above keep their black-on-grey — the
            design only inverts the title and synopsis. */}
        <div className="flex flex-col gap-3 text-white">
          <h2 className="font-display text-[48px] leading-[58px]">
            {detail.title}
          </h2>
          {/* Middle-truncated, so the closing line survives the cut. 16px now,
              up from 14: the design sets the synopsis at the same size as the
              tray's rows, which makes the panel's one run of prose the only
              14px thing on the card that wasn't a chip. */}
          <MiddleTruncate
            text={detail.synopsis}
            lines={3}
            className="font-body text-[16px] leading-6 tracking-[-0.144px]"
            style={{ fontFeatureSettings: '"ss07" 1, "ss06" 1' }}
          />
        </div>
      </div>

      <TicketButton />
    </div>
  )
}

function Chip({
  icon,
  hue,
  label,
  last,
}: {
  icon: string
  hue: string
  label: string
  last?: boolean
}) {
  return (
    <span
      className={`bg-chip flex shrink-0 items-center gap-1 rounded-[100px] py-0.5 pr-2.5 pl-2 ${last ? '' : '-mr-[2px]'}`}
    >
      <Glyph src={icon} tint={hue} className="size-4 shrink-0" />
      {/* The label stays warm near-black while the glyph carries the colour:
          three coloured numbers in a row would read as three states rather
          than as one strip of facts. */}
      <span className="font-body text-ink-soft text-[14px] leading-6 tracking-[-0.126px] whitespace-nowrap">
        {label}
      </span>
    </span>
  )
}

function TicketButton() {
  return (
    <motion.button
      type="button"
      className="focus-visible:ring-ink/25 relative h-[48px] w-[140px] cursor-pointer overflow-hidden rounded-[296px] shadow-[0px_2px_15px_0px_rgba(125,125,125,0.1)] outline-none focus-visible:ring-2"
      whileHover={{ scale: 1.04 }}
      whileTap={pressable.whileTap}
      transition={springResponsive}
    >
      {/* A lighter recipe than the keys': the button sits on the panel rather
          than on the backdrop, so it settles down onto it instead of dodging
          up. The burn layer the design used to carry is gone — over a poster
          it dragged the key towards whatever hue was behind it, and the two
          layers left do the whole job: a near-opaque white, then the tray grey
          at a fifth strength darkening only what is already lighter than it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[296px]"
      >
        <span className="absolute inset-0 rounded-[296px] bg-[rgba(255,255,255,0.7)]" />
        <span className="bg-tray/20 absolute inset-0 rounded-[296px] mix-blend-darken" />
      </span>

      {/* The design's label group sits at x=24 in the 140px button — 2px left of
          true centre — so the icon reads as leading the text rather than the
          pair floating in the middle. */}
      <span className="relative flex -translate-x-[2px] items-center justify-center gap-2">
        <Glyph src={iconTicket} tint={HUE.ticket} className="size-4 shrink-0" />
        <span className="font-body text-ink-soft text-[16px] leading-6 font-semibold tracking-[-0.144px] whitespace-nowrap">
          Get Ticket
        </span>
      </span>
    </motion.button>
  )
}
