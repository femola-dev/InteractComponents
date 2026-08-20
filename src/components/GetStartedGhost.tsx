import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeBlurIn } from '../lib/motion'
import {
  GHOST,
  GHOST_BODY,
  GHOST_DEEP,
  HAIRLINE,
  INK,
  type GhostLayout,
} from '../lib/getStarted'

/**
 * The fourteen rail destinations the Figma file never drew, as ghost frames.
 *
 * The board only specifies Get Started, so every other nav row had nowhere to
 * go — clicking Reports moved the selected pill and left the onboarding card on
 * screen, which reads as a broken tab rather than as a different page. This
 * fills that in the same voice `RailGhostViews` uses on Chat View: real text for
 * the one thing a placeholder cannot say — the destination's name — and ghost
 * boxes for everything the design never wrote.
 *
 * Three rules carry the set:
 *
 *   Geometry. Every frame is the onboarding card's own — 515 wide, the same
 *   radius, the same elevation, the same 20px gutter — so switching destinations
 *   changes what the card contains and never where it sits. The column's top
 *   edge at y=192 is the fixed thing.
 *
 *   Strength. Real text at the app's full strength, placeholders in the muted
 *   pair. `GHOST_DEEP` marks what would carry value — a thumbnail, a row's
 *   title, a filled meter — and `GHOST` everything else. That one step of
 *   contrast is what gives a frame internal hierarchy.
 *
 *   Shape. The body is chosen by the destination's own `ghost` archetype, not
 *   shared. A vault of documents gets columns, a player gets a stage and a
 *   queue, storage gets a meter. See `GhostLayout` for why eight archetypes and
 *   not fourteen bespoke frames.
 *
 * Every dimension below is authored, never random. A width re-rolled per render
 * makes the whole frame shimmer on each state change; these make each row a
 * different length and keep it that length.
 *
 * What is deliberately absent everywhere: the badge cluster. Three gears turning
 * over the corner is Get Started's own ornament, not shell furniture, and
 * leaving them spinning above a placeholder would promise the page is loading.
 */

function Bar({ w, h = 8, deep = false }: { w: number | string; h?: number; deep?: boolean }) {
  return (
    <div
      aria-hidden
      className="shrink-0 rounded-full"
      style={{ width: w, height: h, background: deep ? GHOST_DEEP : GHOST }}
    />
  )
}

function Block({
  w,
  h,
  r = 8,
  deep = false,
  grow = false,
  className,
  children,
}: {
  w: number | string
  h?: number
  r?: number
  deep?: boolean
  /** Absorb the body's leftover height instead of taking a fixed one. */
  grow?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      aria-hidden
      className={`${grow ? 'min-h-0 flex-1' : 'shrink-0'} ${className ?? ''}`}
      style={{ width: w, height: grow ? undefined : h, borderRadius: r, background: deep ? GHOST_DEEP : GHOST }}
    >
      {children}
    </div>
  )
}

function Disc({ size = 24, deep = false }: { size?: number; deep?: boolean }) {
  return <Block w={size} h={size} r={size / 2} deep={deep} />
}

function Rule() {
  return <div aria-hidden className="h-px w-full shrink-0" style={{ background: HAIRLINE }} />
}

/**
 * A body that runs edge to edge, for the row-based frames. Rows carry `flex-1`
 * so they share the slack evenly — a list filling its page is what a list does,
 * and it beats leaving a gap under the last row.
 */
function Rows({ children }: { children: ReactNode }) {
  return <div className="flex h-full w-full flex-col items-start gap-[8px]">{children}</div>
}

/** A body that sits inside the gutter, for the block-based frames. */
function Pad({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  return (
    <div className="flex h-full w-full flex-col items-start px-[20px] pb-[4px]" style={{ gap }}>
      {children}
    </div>
  )
}

/** A row that stretches to share its body's leftover height. */
function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex w-full min-h-0 flex-1 items-center ${className ?? ''}`}>{children}</div>
  )
}

/* ---- stats: Overview, Reports ------------------------------------------- */

/** Bar heights for the chart, as fractions of its plot area. */
const PLOT = [0.42, 0.68, 0.55, 0.83, 0.61, 1, 0.74, 0.47, 0.9, 0.66, 0.79, 0.53]

function StatsBody() {
  return (
    <Pad>
      <div className="flex w-full shrink-0 gap-[11px]">
        {[62, 48, 71].map((v, i) => (
          <Block key={i} w={151} h={62} className="flex flex-col justify-center gap-[8px] px-[12px]">
            <Bar w={v} h={7} deep />
            <Bar w={38} h={7} />
          </Block>
        ))}
      </div>
      {/* A plot, not a grey slab. The varying heights are the only thing that
          says "chart" rather than "image", so they carry the whole read. */}
      <Block w="100%" grow className="flex items-end gap-[8px] p-[14px]">
        {PLOT.map((f, i) => (
          <div
            key={i}
            className="flex-1 rounded-[3px]"
            style={{ height: `${f * 100}%`, background: GHOST_DEEP }}
          />
        ))}
      </Block>
    </Pad>
  )
}

/* ---- grid: Explorer, Playground ------------------------------------------ */

const CARDS = [96, 72, 108, 84, 100, 66]

function GridBody() {
  return (
    <Pad gap={12}>
      <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-[12px]">
        {CARDS.map((w, i) => (
          <div key={i} className="flex min-h-0 flex-col gap-[8px]">
            <Block w="100%" grow deep />
            <Bar w={w} h={7} />
            <Bar w={48} h={7} />
          </div>
        ))}
      </div>
    </Pad>
  )
}

/* ---- list: Events, Chat Rooms, Updates ----------------------------------- */

const ENTRIES = [
  { title: 176, body: 324 },
  { title: 118, body: 286 },
  { title: 198, body: 365 },
  { title: 142, body: 309 },
]

function ListBody() {
  return (
    <Rows>
      {ENTRIES.map((row, i) => (
        <div key={i} className="contents">
          <Rule />
          <Row className="gap-[16px] pr-[32px] pl-[20px]">
            <Disc deep />
            <div className="flex min-w-px flex-1 flex-col gap-[8px]">
              <Bar w={row.title} deep />
              <Bar w={row.body} />
            </div>
            <Bar w={34} h={7} />
          </Row>
        </div>
      ))}
    </Rows>
  )
}

/* ---- table: Doc Vault, Referrals ----------------------------------------- */

/** Column widths across the 475px inner width, gutters included. */
const COLS = [196, 92, 84, 56]
const CELLS = [
  [164, 74, 62, 44],
  [132, 68, 71, 38],
  [188, 81, 54, 46],
  [148, 62, 66, 41],
  [172, 77, 59, 36],
  [156, 70, 68, 42],
]

function TableBody() {
  return (
    <Rows>
      <Rule />
      {/* The header strip, a touch lighter than the cells under it — the one
          place `GHOST` sits above `GHOST_DEEP` rather than below. */}
      <div className="flex w-full shrink-0 gap-[15px] px-[20px] pt-[2px] pb-[6px]">
        {COLS.map((w, i) => (
          <Bar key={i} w={Math.round(w * 0.42)} h={7} />
        ))}
      </div>
      {CELLS.map((row, i) => (
        <div key={i} className="contents">
          <Rule />
          <Row className="gap-[15px] px-[20px]">
            {row.map((w, j) => (
              <div key={j} style={{ width: COLS[j] }} className="shrink-0">
                <Bar w={w} deep={j === 0} />
              </div>
            ))}
          </Row>
        </div>
      ))}
    </Rows>
  )
}

/* ---- media: Media Player ------------------------------------------------- */

function MediaBody() {
  return (
    <Pad gap={14}>
      {/* The stage, with a transport button centred in it. It takes the
          leftover height rather than a locked 16:9 — at this body height a fixed
          ratio would consume the scrubber and the queue with it, and a wide
          stage still reads as a video surface where a cropped one would not. */}
      <Block w="100%" grow r={10} deep className="relative">
        <div
          className="absolute top-1/2 left-1/2 size-[52px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: GHOST }}
        />
      </Block>
      <div className="flex w-full shrink-0 flex-col gap-[9px]">
        {/* The scrubber: one filled run against the rest of the track. */}
        <div className="flex w-full items-center gap-[2px]">
          <Bar w="38%" h={5} deep />
          <Bar w="62%" h={5} />
        </div>
        <div className="flex w-full justify-between">
          <Bar w={30} h={7} />
          <Bar w={30} h={7} />
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-[12px] pt-[2px]">
        {[212, 168].map((w, i) => (
          <div key={i} className="flex w-full items-center gap-[12px]">
            <Block w={34} h={34} r={6} deep />
            <div className="flex min-w-px flex-1 flex-col gap-[7px]">
              <Bar w={w} h={7} deep />
              <Bar w={Math.round(w * 0.52)} h={7} />
            </div>
            <Bar w={26} h={7} />
          </div>
        ))}
      </div>
    </Pad>
  )
}

/* ---- meter: Cloud Storage ------------------------------------------------ */

/** The breakdown, as shares of the bar. They sum to the 62% that reads as used. */
const SHARES = [0.27, 0.16, 0.11, 0.08]

/** One row per segment, plus the two categories too small to earn a segment. */
const BREAKDOWN = [142, 118, 166, 96, 134, 108]

function MeterBody() {
  return (
    <div className="flex h-full w-full flex-col items-start">
      <div className="flex w-full shrink-0 flex-col gap-[10px] px-[20px] pb-[16px]">
        {/* One track, segmented — the segments are the rows below, in the same
            order, which is what makes the two halves read as one fact. */}
        <div
          className="flex h-[12px] w-full overflow-hidden rounded-full"
          style={{ background: GHOST }}
        >
          {SHARES.map((f, i) => (
            <div
              key={i}
              style={{
                width: `${f * 100}%`,
                background: GHOST_DEEP,
                marginRight: i < SHARES.length - 1 ? 2 : 0,
              }}
            />
          ))}
        </div>
        <div className="flex w-full justify-between">
          <Bar w={104} h={7} />
          <Bar w={62} h={7} />
        </div>
      </div>

      {/* The breakdown is the slack absorber, and it is ruled rows rather than a
          spread legend. Letting six 10px entries share 273px of `justify-between`
          puts 41px of nothing between each — the card fills, but it reads as a
          layout that lost its content. Rows that stretch against a hairline read
          as a breakdown at any height, which is what this has to survive. */}
      <div className="flex w-full min-h-0 flex-1 flex-col">
        {BREAKDOWN.map((w, i) => (
          <div key={i} className="contents">
            <Rule />
            <Row className="gap-[10px] px-[20px]">
              <Block w={10} h={10} r={3} deep />
              <Bar w={w} h={7} deep />
              <div className="flex-1" />
              <Bar w={44} h={7} />
            </Row>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- settings: Appearance, Settings -------------------------------------- */

const PREFS = [
  { label: 148, body: 288 },
  { label: 112, body: 246 },
  { label: 176, body: 322 },
  { label: 96, body: 204 },
]

function SettingsBody() {
  return (
    <Rows>
      {PREFS.map((row, i) => (
        <div key={i} className="contents">
          <Rule />
          <Row className="gap-[16px] pr-[20px] pl-[20px]">
            <div className="flex min-w-px flex-1 flex-col gap-[8px]">
              <Bar w={row.label} deep />
              <Bar w={row.body} />
            </div>
            {/* A switch: the track, and the knob sitting at one end of it. */}
            <div
              aria-hidden
              className="flex h-[20px] w-[34px] shrink-0 items-center rounded-full px-[2px]"
              style={{ background: GHOST_DEEP, justifyContent: i % 2 ? 'flex-start' : 'flex-end' }}
            >
              <div className="size-[16px] rounded-full bg-white" />
            </div>
          </Row>
        </div>
      ))}
    </Rows>
  )
}

/* ---- form: Feedback ------------------------------------------------------ */

function FormBody() {
  return (
    <Pad gap={14}>
      {[96, 124].map((w, i) => (
        <div key={i} className="flex w-full shrink-0 flex-col gap-[8px]">
          <Bar w={w} h={7} deep />
          <Block w="100%" h={38} r={7} />
        </div>
      ))}
      <div className="flex min-h-0 w-full flex-1 flex-col gap-[8px]">
        <Bar w={108} h={7} deep />
        <Block w="100%" grow r={7} />
      </div>
      <div className="flex w-full shrink-0 justify-end pt-[2px]">
        <Block w={104} h={32} r={7} deep />
      </div>
    </Pad>
  )
}

const BODIES: Record<GhostLayout, () => ReactNode> = {
  stats: StatsBody,
  grid: GridBody,
  list: ListBody,
  table: TableBody,
  media: MediaBody,
  meter: MeterBody,
  settings: SettingsBody,
  form: FormBody,
}

/** The header's wrapped paragraph, as the lines it breaks into. */
const LEAD = [368, 368, 212]

export function GetStartedGhost({ title, layout }: { title: string; layout: GhostLayout }) {
  const Body = BODIES[layout]

  return (
    /* No card chrome here. The white surface, the radius and the elevation
       belong to the persistent card in GetStarted, which is the element whose
       height animates — drawing a second one inside it would put two edges on
       screen for the length of every crossfade. */
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-start py-[20px]"
    >
      <div className="flex w-full shrink-0 flex-col items-start gap-[8px]">
        {/* The header is the one constant across all eight. It is not laziness:
            a page title and a line about the page is the same object whatever
            the body below it turns out to be, and holding it steady is what lets
            the body underneath change completely without the frame feeling like
            a different application. */}
        <motion.div
          variants={fadeBlurIn}
          className="flex w-full shrink-0 flex-col items-start gap-[8px] px-[20px] pt-[4px] pb-[20px]"
        >
          {/* The one real thing in the frame. A placeholder can imply a list or
              a toolbar; it cannot say which page you are on. */}
          <p
            className="text-[16px] leading-[normal] font-medium tracking-[-0.32px]"
            style={{ color: INK }}
          >
            {title}
          </p>
          <div className="flex flex-col gap-[11px] pt-[4px] pb-[2px]">
            {LEAD.map((w, i) => (
              <Bar key={i} w={w} />
            ))}
          </div>
        </motion.div>

        {/* One height for all eight, so moving between placeholder
            destinations morphs the contents without resizing the frame. */}
        <motion.div variants={fadeBlurIn} className="w-full" style={{ height: GHOST_BODY }}>
          <Body />
        </motion.div>
      </div>
    </motion.div>
  )
}
