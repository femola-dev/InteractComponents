import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import { MiddleTruncate } from '../components/MiddleTruncate'
import { MobileFrame } from '../components/MobileFrame'
import { useRise } from '../components/rise'
import {
  pressable,
  springResponsive,
  transitionFast,
  transitionSmooth,
} from '../lib/motion'
import backdrop from '../assets/images/move-backdrop.jpg'
import posterAvengersEndgame from '../assets/images/posters/avengers-endgame.jpg'
import posterBabyDriver from '../assets/images/posters/baby-driver.jpg'
import posterBlackPanther from '../assets/images/posters/black-panther.jpg'
import posterCasinoRoyale from '../assets/images/posters/casino-royale.jpg'
import posterDieHard from '../assets/images/posters/die-hard.jpg'
import posterEdgeOfTomorrow from '../assets/images/posters/edge-of-tomorrow.jpg'
import posterFuriosaAMadMaxSaga from '../assets/images/posters/furiosa-a-mad-max-saga.jpg'
import posterGladiator from '../assets/images/posters/gladiator.jpg'
import posterGuardiansOfTheGalaxy from '../assets/images/posters/guardians-of-the-galaxy.jpg'
import posterInception from '../assets/images/posters/inception.jpg'
import posterJohnWickChapter4 from '../assets/images/posters/john-wick-chapter-4.jpg'
import posterKillBillVol1 from '../assets/images/posters/kill-bill-vol-1.jpg'
import posterMadMaxFuryRoad from '../assets/images/posters/mad-max-fury-road.jpg'
import posterMissionImpossibleTheFinalReckoning from '../assets/images/posters/mission-impossible-the-final-reckoning.jpg'
import posterSkyfall from '../assets/images/posters/skyfall.jpg'
import posterSpiderManBrandNewDay from '../assets/images/posters/spider-man-brand-new-day.jpg'
import posterTerminator2JudgmentDay from '../assets/images/posters/terminator-2-judgment-day.jpg'
import posterTheDarkKnight from '../assets/images/posters/the-dark-knight.jpg'
import posterTheMatrix from '../assets/images/posters/the-matrix.jpg'
import posterTopGunMaverick from '../assets/images/posters/top-gun-maverick.jpg'
import iconArrowTriangleLeft from '../assets/icons/IconArrowTriangleLeft.svg'
import iconArrowTriangleRight from '../assets/icons/IconArrowTriangleRight.svg'
import iconCalendar from '../assets/icons/IconCalendar2.svg'
import iconClock from '../assets/icons/IconClock.svg'
import iconReview from '../assets/icons/IconReview.svg'
import iconTicket from '../assets/icons/IconTicket.svg'

/** Panel width and the gap between panels, from the design's 40/660 offsets. */
const PANEL_GAP = 20

/** Ties the pill and the tray together as one morphing surface. */
const GENRE_SURFACE = 'genre-surface'

type Detail = {
  /** Panel heading. */
  title: string
  year: string
  runtime: string
  rating: string
  synopsis: string
}

type Slide = {
  /** Top line of the control pill. */
  name: string
  /** Fills the panel edge to edge; the copy sits in its blurred lower third. */
  poster: string
  /** Every genre TMDB lists for the film. Decks are built from these. */
  genres: string[]
  detail: Detail
}

type Deck = {
  /** Bottom line of the control pill — one genre for the whole carousel. */
  genre: string
  slides: Slide[]
}

/**
 * One genre at a time: the carousel is a single genre's deck, so swiping only
 * ever moves between films of that genre. The genre is the pill's fixed bottom
 * line — a heading for what you are swiping through — while the name above it
 * changes per film.
 *
 * Decks are derived from each film's own genre list rather than hand-written,
 * so a film added here shows up automatically under every genre it belongs to.
 *
 * The design left the two neighbouring panels as bare surfaces with a single
 * "Movie Title" label. Once the panel is a poster, a bare one reads as a
 * loading failure rather than a placeholder, so every slide carries a real
 * entry.
 *
 * Copy, artwork and genre lists are TMDB's — the design's own runtime, year and
 * synopsis already matched their Spider-Man record verbatim, so the rest is
 * sourced the same way rather than invented. Ratings are their user score over
 * 20 (79% → 4.0), not the design's placeholder 4.8.
 */
const FILMS: Slide[] = [
  {
    name: 'Spider-Man ―  Brand New Day',
    poster: posterSpiderManBrandNewDay,
    genres: ['Science Fiction', 'Action', 'Adventure'],
    detail: {
      title: 'Spider-Man: Brand New Day',
      year: '2026',
      runtime: '2h 25m',
      rating: '4.0',
      synopsis:
        "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
    },
  },
  {
    name: 'John Wick ―  Chapter 4',
    poster: posterJohnWickChapter4,
    genres: ['Action', 'Thriller', 'Crime'],
    detail: {
      title: 'John Wick: Chapter 4',
      year: '2023',
      runtime: '2h 50m',
      rating: '3.9',
      synopsis:
        'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.',
    },
  },
  {
    name: 'Top Gun ―  Maverick',
    poster: posterTopGunMaverick,
    genres: ['Action', 'Drama'],
    detail: {
      title: 'Top Gun: Maverick',
      year: '2022',
      runtime: '2h 11m',
      rating: '4.1',
      synopsis:
        'After more than thirty years of service as one of the Navy’s top aviators, and dodging the advancement in rank that would ground him, Pete “Maverick” Mitchell finds himself training a detachment of TOP GUN graduates for a specialized mission the likes of which no living pilot has ever seen.',
    },
  },
  {
    name: 'Mission: Impossible ―  The Final Reckoning',
    poster: posterMissionImpossibleTheFinalReckoning,
    genres: ['Action', 'Thriller', 'Adventure'],
    detail: {
      title: 'Mission: Impossible - The Final Reckoning',
      year: '2025',
      runtime: '2h 50m',
      rating: '3.6',
      synopsis:
        "Ethan Hunt and team continue their search for the terrifying AI known as the Entity — which has infiltrated intelligence networks all over the globe — with the world's governments and a mysterious ghost from Hunt's past on their trail. Joined by new allies and armed with the means to shut the Entity down for good, Hunt is in a race against time to prevent the world as we know it from changing forever.",
    },
  },
  {
    name: 'Mad Max ―  Fury Road',
    poster: posterMadMaxFuryRoad,
    genres: ['Action', 'Adventure', 'Science Fiction'],
    detail: {
      title: 'Mad Max: Fury Road',
      year: '2015',
      runtime: '2h 1m',
      rating: '3.8',
      synopsis:
        'An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and most everyone is crazed fighting for the necessities of life. Within this world exist two rebels on the run who just might be able to restore order.',
    },
  },
  {
    name: 'The Dark Knight',
    poster: posterTheDarkKnight,
    genres: ['Action', 'Crime', 'Thriller'],
    detail: {
      title: 'The Dark Knight',
      year: '2008',
      runtime: '2h 32m',
      rating: '4.2',
      synopsis:
        'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    },
  },
  {
    name: 'Avengers ―  Endgame',
    poster: posterAvengersEndgame,
    genres: ['Adventure', 'Science Fiction', 'Action'],
    detail: {
      title: 'Avengers: Endgame',
      year: '2019',
      runtime: '3h 1m',
      rating: '4.1',
      synopsis:
        "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
    },
  },
  {
    name: 'Gladiator',
    poster: posterGladiator,
    genres: ['Action', 'Drama', 'Adventure'],
    detail: {
      title: 'Gladiator',
      year: '2000',
      runtime: '2h 35m',
      rating: '4.1',
      synopsis:
        "After the death of Emperor Marcus Aurelius, his devious son takes power and demotes Maximus, one of Rome's most capable generals who Marcus preferred. Eventually, Maximus is forced to become a gladiator and battle to the death against other men for the amusement of paying audiences.",
    },
  },
  {
    name: 'Inception',
    poster: posterInception,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    detail: {
      title: 'Inception',
      year: '2010',
      runtime: '2h 28m',
      rating: '4.2',
      synopsis:
        'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    },
  },
  {
    name: 'The Matrix',
    poster: posterTheMatrix,
    genres: ['Action', 'Science Fiction'],
    detail: {
      title: 'The Matrix',
      year: '1999',
      runtime: '2h 16m',
      rating: '4.2',
      synopsis:
        'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    },
  },
  {
    name: 'Die Hard',
    poster: posterDieHard,
    genres: ['Action', 'Thriller'],
    detail: {
      title: 'Die Hard',
      year: '1988',
      runtime: '2h 12m',
      rating: '3.9',
      synopsis:
        "High above the city of L.A. a team of terrorists has seized a building, taken hostages, and declared war. One man has manages to escape... An off-duty cop hiding somewhere inside. He's alone, tired... and the only chance anyone has got.",
    },
  },
  {
    name: 'Terminator 2 ―  Judgment Day',
    poster: posterTerminator2JudgmentDay,
    genres: ['Action', 'Thriller', 'Science Fiction'],
    detail: {
      title: 'Terminator 2: Judgment Day',
      year: '1991',
      runtime: '2h 17m',
      rating: '4.1',
      synopsis:
        'Ten years after the events of the original, a reprogrammed T-800 is sent back in time to protect young John Connor from the shape-shifting T-1000. Together with his mother Sarah, he fights to stop Skynet from triggering a nuclear apocalypse.',
    },
  },
  {
    name: 'Casino Royale',
    poster: posterCasinoRoyale,
    genres: ['Adventure', 'Action', 'Thriller'],
    detail: {
      title: 'Casino Royale',
      year: '2006',
      runtime: '2h 24m',
      rating: '3.8',
      synopsis:
        "Le Chiffre, a banker to the world's terrorists, is scheduled to participate in a high-stakes poker game in Montenegro, where he intends to use his winnings to establish his financial grip on the terrorist market. M sends Bond—on his maiden mission as a 00 Agent—to attend this game and prevent Le Chiffre from winning. With the help of Vesper Lynd and Felix Leiter, Bond enters the most important poker game in his already dangerous career.",
    },
  },
  {
    name: 'Skyfall',
    poster: posterSkyfall,
    genres: ['Action', 'Adventure', 'Thriller'],
    detail: {
      title: 'Skyfall',
      year: '2012',
      runtime: '2h 23m',
      rating: '3.6',
      synopsis:
        "When Bond's latest assignment goes gravely wrong, agents around the world are exposed and MI6 headquarters is attacked. While M faces challenges to her authority and position from Gareth Mallory, the new Chairman of the Intelligence and Security Committee, it's up to Bond, aided only by field agent Eve, to locate the mastermind behind the attack.",
    },
  },
  {
    name: 'Kill Bill ―  Vol. 1',
    poster: posterKillBillVol1,
    genres: ['Action', 'Crime'],
    detail: {
      title: 'Kill Bill: Vol. 1',
      year: '2003',
      runtime: '1h 51m',
      rating: '4.0',
      synopsis:
        'An assassin is shot by her ruthless employer, Bill, and other members of their assassination circle – but she lives to plot her vengeance.',
    },
  },
  {
    name: 'Baby Driver',
    poster: posterBabyDriver,
    genres: ['Action', 'Crime'],
    detail: {
      title: 'Baby Driver',
      year: '2017',
      runtime: '1h 53m',
      rating: '3.7',
      synopsis:
        'After being coerced into working for a crime boss, a young getaway driver finds himself taking part in a heist doomed to fail.',
    },
  },
  {
    name: 'Edge of Tomorrow',
    poster: posterEdgeOfTomorrow,
    genres: ['Action', 'Science Fiction'],
    detail: {
      title: 'Edge of Tomorrow',
      year: '2014',
      runtime: '1h 54m',
      rating: '3.8',
      synopsis:
        'Major Bill Cage is an officer who has never seen a day of combat when he is unceremoniously demoted and dropped into combat. Cage is killed within minutes, managing to take an alpha alien down with him. He awakens back at the beginning of the same day and is forced to fight and die again... and again - as physical contact with the alien has thrown him into a time loop.',
    },
  },
  {
    name: 'Black Panther',
    poster: posterBlackPanther,
    genres: ['Action', 'Adventure', 'Science Fiction'],
    detail: {
      title: 'Black Panther',
      year: '2018',
      runtime: '2h 15m',
      rating: '3.7',
      synopsis:
        "King T'Challa returns home to the reclusive, technologically advanced African nation of Wakanda to serve as his country's new leader. However, T'Challa soon finds that he is challenged for the throne by factions within his own country as well as without. Using powers reserved to Wakandan kings, T'Challa assumes the Black Panther mantle to join with ex-girlfriend Nakia, the queen-mother, his princess-kid sister, members of the Dora Milaje (the Wakandan 'special forces') and an American secret agent, to prevent Wakanda from being dragged into a world war.",
    },
  },
  {
    name: 'Guardians of the Galaxy',
    poster: posterGuardiansOfTheGalaxy,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    detail: {
      title: 'Guardians of the Galaxy',
      year: '2014',
      runtime: '2h 1m',
      rating: '4.0',
      synopsis:
        'Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser.',
    },
  },
  {
    name: 'Furiosa ―  A Mad Max Saga',
    poster: posterFuriosaAMadMaxSaga,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    detail: {
      title: 'Furiosa: A Mad Max Saga',
      year: '2024',
      runtime: '2h 29m',
      rating: '3.7',
      synopsis:
        'As the world falls, young Furiosa is snatched from the Green Place of Many Mothers into the hands of a great biker horde led by the warlord Dementus. Sweeping through the wasteland, they encounter the citadel presided over by Immortan Joe. The two tyrants wage war for dominance, and Furiosa must survive many trials as she puts together the means to find her way home.',
    },
  },
]

const deckFor = (genre: string): Deck => ({
  genre,
  slides: FILMS.filter((film) => film.genres.includes(genre)),
})

/** Widest first, so the fullest decks head the tray; ties settle A–Z. */
const DECKS: Deck[] = [...new Set(FILMS.flatMap((film) => film.genres))]
  .map(deckFor)
  .sort(
    (a, b) =>
      b.slides.length - a.slides.length || a.genre.localeCompare(b.genre),
  )

/** The design opens on the filled panel, with a sliver of each neighbour. */
const START_INDEX = 1

/**
 * Panels kept mounted each side of the current one. Two, not one: a panel has
 * to exist off-screen *before* it becomes the visible sliver, or it pops into
 * the edge instead of sliding in. Offset ±1 is that sliver, so ±2 is the
 * nearest position that is genuinely out of frame.
 *
 * This is also what keeps a twenty-film deck affordable. Every panel carries
 * four copies of its poster for the blur ramp, so mounting the whole deck would
 * mean eighty filtered images; the window holds it to twenty at any moment, and
 * only five posters are ever fetched.
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
  const [deck, setDeck] = useState(DECKS[0])
  const [index, setIndex] = useState(() => openingIndex(DECKS[0]))
  const [trayOpen, setTrayOpen] = useState(false)
  const rise = useRise()
  const reducedMotion = useReducedMotion()

  // The house spring for anything travelling between containers. Reduced
  // motion gets the same end state, arrived at instantly.
  const morph: Transition = reducedMotion ? { duration: 0 } : springResponsive

  const looping = loops(deck)
  const count = deck.slides.length

  // While looping the index runs unbounded in both directions and only folds
  // onto the deck at the point of use, which is what makes the seam free: there
  // is no edge to detect and no silent jump back to a cloned panel.
  const current = deck.slides[wrap(index, count)]
  const atStart = !looping && index === 0
  const atEnd = !looping && index === count - 1

  // Offsets are the panel's distance from the current one, so a step re-labels
  // every panel rather than moving a track. Each one animates its own transform
  // to the new offset; the one that mounts at ±2 renders there first time and
  // so has nothing to animate from.
  const panels = []
  for (let offset = -WINDOW; offset <= WINDOW; offset++) {
    const virtual = index + offset
    if (!looping && (virtual < 0 || virtual >= count)) continue
    panels.push({ virtual, offset, slide: deck.slides[wrap(virtual, count)] })
  }

  const chooseGenre = (next: Deck) => {
    setDeck(next)
    setIndex(openingIndex(next))
    setTrayOpen(false)
  }

  return (
    <MobileFrame backdrop={<PosterAmbience src={current.poster} />}>
      {/* Carousel viewport. The entrance belongs here and not on the track:
          Framer composes its own `transform` from an animated `y`, so a track
          that both rose and translated would lose the translate — the rise
          wins and the controls move nothing. One transform, one owner.

          The panels are inset 40px and step by their own width + 20px, taken
          as a percentage of the panel, so the step stays correct as the device
          narrows — a fixed 620px would only be right at the design's 680px.

          Each panel is placed by its own offset rather than by sliding one
          track, because an endless deck has no track to slide: the strip would
          have to grow in one direction forever. Offsets make the row a window
          that renames its panels in place. */}
      <motion.div {...rise(0.12)} className="relative min-h-0 flex-1">
        <div className="absolute inset-y-0 left-[40px] w-[calc(100%-80px)]">
          {panels.map(({ virtual, offset, slide }) => (
            <div
              // Keyed by the unbounded index, so a panel keeps its identity as
              // its offset changes and animates across instead of remounting.
              key={virtual}
              className="absolute inset-0 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-smooth)]"
              style={{
                transform: `translateX(calc(${offset} * (100% + ${PANEL_GAP}px)))`,
              }}
            >
              <Panel slide={slide} hidden={offset !== 0} />
            </div>
          ))}
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
          onClick={() =>
            setIndex((i) => (looping ? i - 1 : Math.max(0, i - 1)))
          }
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
                className="font-ui absolute top-[22px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 px-4 leading-[normal] text-black"
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
          onClick={() =>
            setIndex((i) => (looping ? i + 1 : Math.min(count - 1, i + 1)))
          }
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
          decks={DECKS}
          active={deck}
          morph={morph}
          onChoose={chooseGenre}
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
  decks,
  active,
  morph,
  onChoose,
  onClose,
}: {
  decks: Deck[]
  active: Deck
  morph: Transition
  onChoose: (deck: Deck) => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <motion.div
      layoutId={GENRE_SURFACE}
      transition={morph}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a genre"
      style={{ borderRadius: 30 }}
      className="absolute inset-x-6 bottom-6 z-30 overflow-hidden shadow-[0px_2px_20px_-0.5px_rgba(0,0,0,0.12)]"
    >
      <Glass radius="30px" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transitionSmooth, delay: 0.06 }}
        className="font-ui relative flex flex-col p-4 text-black"
      >
        <p className="px-3 pb-2 text-[12px] font-medium text-black/45">Genre</p>

        {decks.map((entry) => {
          const isActive = entry.genre === active.genre
          return (
            <button
              key={entry.genre}
              type="button"
              onClick={() => onChoose(entry)}
              aria-current={isActive}
              className={`focus-visible:ring-ink/25 flex cursor-pointer items-baseline justify-between rounded-[16px] px-3 py-2.5 text-left outline-none focus-visible:ring-2 ${
                isActive ? 'bg-black/8' : 'hover:bg-black/5'
              }`}
            >
              <span className="text-[20px] font-medium">{entry.genre}</span>
              <span className="text-[13px] text-black/45">
                {entry.slides.length}
                {entry.slides.length === 1 ? ' film' : ' films'}
              </span>
            </button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

/**
 * The frosted fill shared by the keys and the control pill: a color-dodge lift
 * off the backdrop, then a near-opaque white over it. Two stacked layers
 * because the blend mode applies to the first only.
 */
function Glass({ radius }: { radius: string }) {
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
        className="absolute inset-0 bg-[rgba(250,250,250,0.7)]"
        style={{ borderRadius: radius }}
      />
    </div>
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
      className="focus-visible:ring-ink/25 relative grid size-[96px] shrink-0 cursor-pointer place-items-center rounded-full shadow-[0px_2px_20px_0px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-40"
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : pressable.whileTap}
      transition={springResponsive}
    >
      <Glass radius="100px" />
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="relative size-[48px]"
      />
    </motion.button>
  )
}

/**
 * The panel's top 64px sit above the fold, so only its bottom corners round and
 * its content anchors to the bottom edge — which also keeps the layout intact
 * as the panel flexes on a shorter viewport.
 */
function Panel({ slide, hidden }: { slide: Slide; hidden: boolean }) {
  return (
    <article
      // Off-screen panels stay in the flow for the slide, but out of the
      // reading order and the tab sequence.
      aria-hidden={hidden}
      inert={hidden}
      // bg-ink, not the design's bg-tray: the copy is white, so the surface the
      // poster decodes over has to be the dark one, never the light one.
      className="bg-ink relative h-full w-full shrink-0 overflow-hidden rounded-b-[30px]"
    >
      <PosterBackdrop src={slide.poster} />
      <Detail detail={slide.detail} />
    </article>
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
 * the pill's black label with it; holding the backdrop down to a common
 * mid-range means the glass behaves the same on every film.
 */
const AMBIENCE_TINT = 'rgba(0,0,0,0.28)'

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
    <div className="absolute bottom-[52px] left-8 flex w-[401px] max-w-[calc(100%-64px)] flex-col gap-4">
      <div className="flex flex-col gap-3">
        {/* The chips overlap by 1px onto the 6px connectors so the row reads as
            one linked strip rather than three separate pills. */}
        <div className="flex items-center">
          <Chip icon={iconCalendar} label={detail.year} />
          <span className="bg-chip -mr-px size-[6px] shrink-0" />
          <Chip icon={iconClock} label={detail.runtime} />
          <span className="bg-chip -mr-px size-[6px] shrink-0" />
          <Chip icon={iconReview} label={detail.rating} last />
        </div>

        {/* White here, but the chips above keep their black-on-grey — the
            design only inverts the title and synopsis. */}
        <div className="flex flex-col gap-3 text-white">
          <h2 className="font-display text-[48px] leading-[58px]">
            {detail.title}
          </h2>
          {/* Middle-truncated, so the closing line survives the cut. */}
          <MiddleTruncate
            text={detail.synopsis}
            lines={3}
            className="font-body text-[14px] leading-6 tracking-[-0.126px]"
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
  label,
  last,
}: {
  icon: string
  label: string
  last?: boolean
}) {
  return (
    <span
      className={`bg-chip flex shrink-0 items-center gap-1 rounded-[100px] py-0.5 pr-2.5 pl-2 ${last ? '' : '-mr-px'}`}
    >
      <img src={icon} alt="" aria-hidden="true" className="size-4 shrink-0" />
      <span className="font-body text-ink text-[14px] leading-6 tracking-[-0.126px] whitespace-nowrap">
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
          than on the backdrop, so it burns down instead of dodging up. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[296px]"
      >
        <span className="absolute inset-0 rounded-[296px] bg-[rgba(255,255,255,0.65)]" />
        <span className="absolute inset-0 rounded-[296px] bg-[#ddd] mix-blend-color-burn" />
        <span className="bg-tray absolute inset-0 rounded-[296px] mix-blend-darken" />
      </span>

      {/* The design's label group sits at x=24 in the 140px button — 2px left of
          true centre — so the icon reads as leading the text rather than the
          pair floating in the middle. */}
      <span className="relative flex -translate-x-[2px] items-center justify-center gap-2">
        <img
          src={iconTicket}
          alt=""
          aria-hidden="true"
          className="size-4 shrink-0"
        />
        <span className="font-body text-ink text-[14px] leading-6 tracking-[-0.126px] whitespace-nowrap">
          Get Ticket
        </span>
      </span>
    </motion.button>
  )
}
