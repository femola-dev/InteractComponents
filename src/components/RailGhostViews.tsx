import { useState, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeBlurIn } from '../lib/motion'
import type { RailItem } from '../lib/conversations'
import {
  CHIP,
  GHOST_OUT,
  GHOST_SOFT,
  GHOST_SOFT_DEEP,
  GHOST_SOFT_RING,
  GROOVE,
  HAIRLINE,
  INK,
  MUTED,
  RING,
  SALT,
} from '../lib/chatShell'
import { Card, ChipButton, Ghost as GhostBox, SectionHeading } from './ChatShell'

import iconPreferences from '../assets/icons/preferences.svg'
import iconSearch from '../assets/icons/Search.svg'
import iconInfoMenu from '../assets/icons/Info menu.svg'

/**
 * The app rail's other four destinations, drawn as ghost frames.
 *
 * The Figma file only specifies the Messages screen, so the rest of the rail had
 * nowhere to go — clicking Video or Settings swapped a glyph and left the
 * conversation on screen, which reads as a broken tab rather than a fifth
 * screen. These fill that in the same voice `GhostConversation` uses: real text
 * for the one thing a placeholder cannot say — the destination's title and the
 * shape of its lists — and ghost boxes for everything the design never wrote.
 *
 * Two rules hold the set together:
 *
 *   Geometry. Every frame keeps the shell's furniture where the file puts it —
 *   the 223px column at (44, 12), the rule at x=267, the 44px header band — and
 *   every body fills the pane inside the header's own 24px gutter, so a frame
 *   starts exactly under the title that names it and switching rails never
 *   shifts anything sideways or up. (The conversation is the exception it should
 *   be: a chat thread is a narrow centred column, not a page.)
 *
 *   Strength. Real controls are drawn at the app's full strength; placeholders
 *   are drawn in the muted pair. The line between "this is a real button" and
 *   "this is where content goes" is the only thing tone is doing here.
 */

/**
 * These frames' placeholder box: `ChatShell`'s, on the muted pair. `deep` is the
 * filled tone — the part with value in it — and `fill` is the escape hatch for
 * the one place neither tone works.
 */
function Ghost({
  className,
  style,
  deep = false,
  fill,
}: {
  className?: string
  style?: CSSProperties
  deep?: boolean
  fill?: string
}) {
  return <GhostBox className={className} style={style} fill={fill ?? (deep ? GHOST_SOFT_DEEP : GHOST_SOFT)} />
}

/** A sidebar group: its real heading, and how many ghost rows sit under it. */
type GhostSection = { heading: string; rows: number; icon: 'avatar' | 'square' }

/**
 * Row label widths, authored rather than generated. A random width re-rolls on
 * every render and the whole column shimmers; these make each row a different
 * length and keep it that length for good.
 */
const ROW_WIDTHS = [84, 62, 98, 71, 88, 57, 104, 76]

const rowWidth = (i: number) => ROW_WIDTHS[i % ROW_WIDTHS.length]

/**
 * One ghost row, on `SidebarRow`'s geometry: 24px tall, 4px of padding on the
 * icon side and 16px on the text side, so the two kinds of column line up
 * glyph-for-glyph when you switch rails.
 *
 * The selected row is the exception to the muted rule: its chip is the app's own
 * `#eef0f7`, and the muted tones vanish against it, so the ghosts inside it step
 * up to the conversation's deep tone. Selection has to stay visible.
 */
function GhostRow({
  chipId,
  isSelected,
  onSelect,
  icon,
  labelWidth,
}: {
  chipId: string
  isSelected: boolean
  onSelect: () => void
  icon: GhostSection['icon']
  labelWidth: number
}) {
  const fill = isSelected ? GHOST_OUT : undefined

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? 'page' : undefined}
      aria-label="Placeholder item"
      className="relative flex h-6 w-full shrink-0 cursor-pointer items-center gap-1 rounded-[6px] py-1 pr-4 pl-1 text-left"
    >
      {isSelected && (
        <motion.span
          layoutId={chipId}
          transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
          aria-hidden
          className="absolute inset-0 rounded-[6px]"
          style={{ backgroundColor: CHIP, boxShadow: RING }}
        />
      )}
      <Ghost
        className={`relative size-4 shrink-0 ${icon === 'avatar' ? 'rounded-full' : 'rounded-[4px]'}`}
        fill={fill}
      />
      <Ghost className="relative h-2 rounded-full" style={{ width: labelWidth }} fill={fill} />
    </button>
  )
}

/**
 * The 223px column, with the destination's real title at the top.
 *
 * The search field is deliberately a ghost rather than a live input: there is
 * nothing here to filter, and a text box that swallows typing and never
 * responds is worse than one that plainly isn't wired.
 */
function GhostSidebar({
  title,
  sections,
  selected,
  onSelect,
  chipId,
}: {
  title: string
  sections: GhostSection[]
  selected: number
  onSelect: (index: number) => void
  chipId: string
}) {
  let row = -1

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.06, delayChildren: 0.05 }}
      className="absolute top-3 left-[44px] flex w-[223px] flex-col gap-1"
    >
      <motion.div variants={fadeBlurIn} className="flex w-full flex-col gap-2">
        <div className="flex h-6 items-center justify-between px-3 py-0.5">
          <p
            className="text-[12px] leading-4 font-semibold tracking-[-0.36px]"
            style={{ color: MUTED, fontFamily: 'var(--font-sohne-breit)' }}
          >
            {title}
          </p>
          {/* A real control with a real glyph in it, so it stays at the strength
              the Messages column draws it — only the placeholders are muted. */}
          <ChipButton label={`${title} preferences`} className="bg-[#eef0f7]">
            <span aria-hidden className="absolute inset-0 rounded-[4px]" style={{ boxShadow: RING }} />
            <img src={iconPreferences} alt="" aria-hidden className="relative size-3" />
          </ChipButton>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: HAIRLINE, boxShadow: GROOVE }} />

        <div className="flex items-center gap-1 px-3 py-1">
          <div
            className="flex h-5 min-w-0 flex-1 items-center gap-0.5 rounded-[5px] px-1"
            style={{ backgroundColor: GHOST_SOFT, boxShadow: GHOST_SOFT_RING }}
          >
            <img src={iconSearch} alt="" aria-hidden className="size-4 shrink-0" />
            <Ghost className="h-[6px] w-14 rounded-full" deep />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Ghost className="size-5 rounded-[4px]" />
            <Ghost className="size-5 rounded-[4px]" />
          </div>
        </div>
      </motion.div>

      <div className="flex w-full flex-col gap-4">
        {sections.map((section, s) => (
          <motion.div
            key={section.heading}
            variants={fadeBlurIn}
            className="flex w-full flex-col gap-1.5 px-3 py-2"
          >
            <SectionHeading
              label={section.heading}
              /* Only the first group carries the overflow button, the way
                 PINNED CHATS does and GROUPS doesn't. */
              action={
                s === 0 ? (
                  <ChipButton label={`${section.heading} options`}>
                    <img src={iconInfoMenu} alt="" aria-hidden className="h-[2px] w-[9px] max-w-none" />
                  </ChipButton>
                ) : undefined
              }
            />
            {Array.from({ length: section.rows }, () => {
              row += 1
              const index = row
              return (
                <GhostRow
                  key={index}
                  chipId={chipId}
                  isSelected={selected === index}
                  onSelect={() => onSelect(index)}
                  icon={section.icon}
                  labelWidth={rowWidth(index)}
                />
              )
            })}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * The pane: the destination's real title in the 44px header band, and its ghost
 * body underneath. Sized to the *visible* 1080×912 pane rather than the app's
 * 1470×1080 — anchoring to the app would push the bottom of every frame 168px
 * behind the bezel.
 */
function GhostPane({ item, children }: { item: RailItem; children: ReactNode }) {
  return (
    <motion.section
      aria-label={item.title}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.05 }}
      className="absolute top-0 left-[268px] flex h-[912px] w-[1080px] flex-col"
    >
      <motion.header
        variants={fadeBlurIn}
        className="flex h-11 shrink-0 items-center justify-between px-6"
      >
        <div className="flex items-center gap-2.5">
          {/* The rail's own selected glyph, chip and hairline already baked in. */}
          <img src={item.active} alt="" aria-hidden className="size-6" />
          {/* No ghost line under the title. The conversation header carries one
              because a contact has a status to not-say; a destination's title is
              the whole of what the header knows, so a placeholder under it is
              just a smudge. */}
          <p className="text-[13px] leading-4 tracking-[-0.26px]" style={{ ...SALT, color: INK }}>
            {item.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Ghost className="size-5 rounded-[4px]" />
          <Ghost className="size-5 rounded-[4px]" />
          <Ghost className="size-5 rounded-[4px]" />
        </div>
      </motion.header>

      {/* `px-6` is the header's gutter, so every body's left edge lands under the
          title's icon rather than in a centred column of its own. */}
      <div className="flex min-h-0 flex-1 overflow-hidden px-6">{children}</div>
    </motion.section>
  )
}

/**
 * Every ghost body drives its own entrance rather than inheriting the pane's.
 * Selecting a sidebar row remounts the body, and a body that owns its stagger
 * replays it on that remount — inherited variants would fade the whole thing in
 * at once, and re-keying the pane instead would pointlessly re-fade a title that
 * never changed.
 */
const BODY_STAGGER = {
  initial: 'hidden',
  animate: 'visible',
  transition: { staggerChildren: 0.05, delayChildren: 0.04 },
} as const

/* ---- Video Call ---- */

/**
 * The stage, a strip of participants, and the controls. Ghost or not, a call
 * screen is one big tile and a bar you hang up from, and dropping either makes
 * it read as a media player instead.
 *
 * The stage takes the slack (`flex-1`) rather than being a fixed height, so the
 * frame sits on the same 24px top and bottom gutters as the others instead of
 * floating in the middle of the pane.
 */
function VideoBody() {
  return (
    <motion.div {...BODY_STAGGER} className="flex h-full w-full flex-col gap-4 py-6">
      <motion.div
        variants={fadeBlurIn}
        className="relative min-h-0 flex-1 overflow-hidden rounded-[20px]"
        style={{ backgroundColor: GHOST_SOFT_DEEP, boxShadow: GHOST_SOFT_RING }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Ghost className="size-24 rounded-full" />
          <Ghost className="h-[10px] w-[104px] rounded-full" />
        </div>
        {/* Self-view, tucked into the corner the way every call app puts it. */}
        <div
          className="absolute right-4 bottom-4 h-[96px] w-[152px] rounded-[12px]"
          style={{ backgroundColor: GHOST_SOFT, boxShadow: GHOST_SOFT_RING }}
        >
          <Ghost
            className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
            deep
          />
        </div>
        {/* Elapsed time, top-left. */}
        <Ghost className="absolute top-4 left-4 h-5 w-[68px] rounded-full" />
      </motion.div>

      <motion.div variants={fadeBlurIn} className="flex shrink-0 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="relative h-[104px] flex-1 rounded-[12px]"
            style={{ backgroundColor: GHOST_SOFT, boxShadow: GHOST_SOFT_RING }}
          >
            <Ghost
              className="absolute top-1/2 left-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
              deep
            />
            <Ghost className="absolute bottom-2.5 left-2.5 h-[7px] w-12 rounded-full" deep />
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeBlurIn} className="flex shrink-0 justify-center">
        <Card className="flex h-14 items-center gap-3 rounded-full px-4">
          {[0, 1, 2, 3].map(i => (
            <Ghost key={i} className="size-9 rounded-full" />
          ))}
          {/* Leave the call: the one filled control, same way the composer's
              send button is the one step deeper than the rest of the row. */}
          <Ghost className="h-9 w-[68px] rounded-full" deep />
        </Card>
      </motion.div>
    </motion.div>
  )
}

/* ---- Open Jobs ---- */

/**
 * The table's fixed right-hand columns. Head and body share them, which is the
 * only way a column heading actually sits over its column — laid out with
 * `flex-1` on both, the two rows' trailing cells land at different x and the
 * table reads as two unrelated rows of boxes.
 */
const COL_PEOPLE = 'w-[120px]'
const COL_STATUS = 'w-[96px]'
const COL_MENU = 'w-6'

/** Authored so the status column reads as a mix rather than a stripe. */
const JOB_ROWS = [
  { title: 148, meta: 96, filled: true },
  { title: 116, meta: 132, filled: false },
  { title: 172, meta: 88, filled: true },
  { title: 132, meta: 104, filled: false },
  { title: 156, meta: 116, filled: false },
  { title: 108, meta: 92, filled: true },
  { title: 164, meta: 124, filled: false },
] as const

function JobsBody() {
  return (
    <motion.div {...BODY_STAGGER} className="flex w-full flex-col gap-4 py-6">
      <motion.div variants={fadeBlurIn} className="flex items-center gap-2">
        <Ghost className="h-6 w-[92px] rounded-full" deep />
        <Ghost className="h-6 w-[76px] rounded-full" />
        <Ghost className="h-6 w-[84px] rounded-full" />
        <div className="flex-1" />
        <Ghost className="h-6 w-[64px] rounded-full" />
        <Ghost className="h-6 w-[104px] rounded-[8px]" deep />
      </motion.div>

      <motion.div variants={fadeBlurIn}>
        <Card className="overflow-hidden rounded-[16px]">
          <div className="flex h-9 items-center gap-3 px-4">
            <Ghost className="h-2 w-[88px] rounded-full" />
            <div className="flex-1" />
            <div className={COL_PEOPLE}>
              <Ghost className="h-2 w-[72px] rounded-full" />
            </div>
            <div className={COL_STATUS}>
              <Ghost className="h-2 w-[64px] rounded-full" />
            </div>
            <div className={COL_MENU} />
          </div>

          {JOB_ROWS.map((job, i) => (
            <div
              key={i}
              className="flex h-14 items-center gap-3 px-4"
              style={{ borderTop: `1px solid ${HAIRLINE}` }}
            >
              <Ghost className="size-8 shrink-0 rounded-[8px]" />
              <div className="flex flex-col gap-1.5">
                <Ghost className="h-2 rounded-full" style={{ width: job.title }} />
                <Ghost className="h-[6px] rounded-full" style={{ width: job.meta }} />
              </div>
              <div className="flex-1" />
              {/* Applicant stack — the one place the table gets a face. */}
              <div className={`flex items-center ${COL_PEOPLE}`}>
                {[0, 1, 2].map(a => (
                  <Ghost
                    key={a}
                    className={`size-6 rounded-full ${a ? '-ml-2' : ''} ring-2 ring-white`}
                    deep={a === 0}
                  />
                ))}
              </div>
              <div className={COL_STATUS}>
                <Ghost className="h-5 w-[72px] rounded-full" deep={job.filled} />
              </div>
              <div className={`flex justify-center ${COL_MENU}`}>
                <Ghost className="size-5 rounded-[4px]" />
              </div>
            </div>
          ))}
        </Card>
      </motion.div>
    </motion.div>
  )
}

/* ---- Business Chart ---- */

/**
 * The bars, as [base, cap] percentages of the plot height. Authored for the same
 * reason the ghost thread is: a chart that redraws itself every render stops
 * reading as a screenshot of one.
 */
const BARS = [
  [38, 14],
  [52, 18],
  [44, 10],
  [66, 22],
  [58, 12],
  [72, 20],
  [49, 16],
  [80, 14],
  [63, 24],
  [88, 12],
  [70, 18],
  [95, 16],
] as const

/** Share rows, longest first — a breakdown is always sorted. */
const SHARES = [82, 64, 51, 37, 22]

function ChartBody() {
  return (
    <motion.div {...BODY_STAGGER} className="flex h-full w-full flex-col gap-4 py-6">
      <motion.div variants={fadeBlurIn} className="flex shrink-0 gap-4">
        {[0, 1, 2].map(i => (
          <Card key={i} className="flex flex-1 flex-col gap-3 rounded-[14px] p-4">
            <Ghost className="h-2 w-[72px] rounded-full" />
            <Ghost className="h-5 w-[112px] rounded-[6px]" deep />
            <Ghost className="h-4 w-[52px] rounded-full" />
          </Card>
        ))}
      </motion.div>

      {/* Takes the slack, so the frame ends on the same 24px bottom gutter it
          started on rather than leaving a band of empty canvas. */}
      <motion.div variants={fadeBlurIn} className="min-h-0 flex-1">
        <Card className="flex h-full flex-col gap-5 rounded-[16px] p-5">
          <div className="flex shrink-0 items-center gap-4">
            <Ghost className="h-[10px] w-[128px] rounded-full" />
            <div className="flex-1" />
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-1.5">
                <Ghost className="size-2 rounded-full" deep={i === 0} />
                <Ghost className="h-2 w-[44px] rounded-full" />
              </div>
            ))}
          </div>

          {/* Plot. The gridlines are the design's carved rule, so they get the
              same white highlight under them. */}
          <div className="relative min-h-0 flex-1">
            {[0, 25, 50, 75, 100].map(y => (
              <div
                key={y}
                aria-hidden
                className="absolute right-0 left-0 h-px"
                style={{ top: `${y}%`, backgroundColor: HAIRLINE, boxShadow: GROOVE }}
              />
            ))}
            <div className="relative flex h-full items-end gap-3">
              {BARS.map(([base, cap], i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col justify-end"
                  style={{ height: `${base + cap}%` }}
                >
                  <Ghost
                    className="w-full rounded-t-[6px]"
                    style={{ height: `${(cap / (base + cap)) * 100}%` }}
                    deep
                  />
                  <Ghost className="w-full flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Same `flex-1` columns and same gap as the bars, so every tick sits
              centred under the bar it belongs to. */}
          <div className="flex shrink-0 gap-3">
            {BARS.map((_, i) => (
              <div key={i} className="flex flex-1 justify-center">
                <Ghost className="h-[6px] w-6 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeBlurIn} className="flex h-[164px] shrink-0 gap-4">
        <Card className="flex w-[340px] shrink-0 items-center gap-5 rounded-[16px] p-5">
          {/* A donut: a filled disc with the card's own white punched out of it. */}
          <div className="relative size-24 shrink-0">
            <Ghost className="absolute inset-0 rounded-full" deep />
            <div className="absolute inset-[18px] rounded-full bg-white" />
          </div>
          <div className="flex flex-1 flex-col gap-2.5">
            {[96, 72, 84].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <Ghost className="size-2 shrink-0 rounded-full" deep={i === 0} />
                <Ghost className="h-2 rounded-full" style={{ width: w }} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-1 flex-col justify-center gap-3.5 rounded-[16px] p-5">
          {SHARES.map((share, i) => (
            <div key={i} className="flex items-center gap-3">
              <Ghost className="h-2 w-[72px] shrink-0 rounded-full" />
              <div
                className="h-2 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: GHOST_SOFT }}
              >
                <Ghost className="h-full rounded-full" style={{ width: `${share}%` }} deep />
              </div>
              <Ghost className="h-2 w-8 shrink-0 rounded-full" />
            </div>
          ))}
        </Card>
      </motion.div>
    </motion.div>
  )
}

/* ---- Settings ---- */

/**
 * Each row's control, in order. A settings page is legible from its right edge
 * alone — toggles, a picker, a checkbox — so the mix is what makes this frame
 * read as settings rather than a list.
 */
type Control = 'toggle-on' | 'toggle-off' | 'select' | 'check'

const SETTINGS_GROUPS = [
  { heading: 'WORKSPACE', rows: ['select', 'toggle-on', 'toggle-off', 'select'] },
  { heading: 'NOTIFICATIONS', rows: ['toggle-on', 'toggle-on', 'check'] },
] as const satisfies readonly { heading: string; rows: readonly Control[] }[]

const LABEL_WIDTHS = [132, 108, 156, 124, 116, 148, 100]

function SettingsControl({ kind }: { kind: Control }) {
  if (kind === 'select') return <Ghost className="h-6 w-[112px] rounded-[8px]" />
  if (kind === 'check') return <Ghost className="size-5 rounded-[6px]" deep />

  const on = kind === 'toggle-on'
  return (
    <div
      className={`flex h-5 w-9 items-center rounded-full px-[3px] ${on ? 'justify-end' : 'justify-start'}`}
      style={{ backgroundColor: on ? GHOST_SOFT_DEEP : GHOST_SOFT, boxShadow: GHOST_SOFT_RING }}
    >
      {/* At this tone the knob's position is doing most of the work, so it keeps
          a hairline to hold its edge against the track. */}
      <div className="size-3.5 rounded-full bg-white" style={{ boxShadow: GHOST_SOFT_RING }} />
    </div>
  )
}

function SettingsBody() {
  let row = -1

  return (
    <motion.div {...BODY_STAGGER} className="flex w-full flex-col gap-4 py-6">
      <motion.div variants={fadeBlurIn}>
        <Card className="flex items-center gap-4 rounded-[16px] p-4">
          <Ghost className="size-14 shrink-0 rounded-full" deep />
          <div className="flex flex-col gap-2">
            <Ghost className="h-[10px] w-[148px] rounded-full" />
            <Ghost className="h-2 w-[104px] rounded-full" />
          </div>
          <div className="flex-1" />
          <Ghost className="h-8 w-[96px] rounded-[10px]" deep />
        </Card>
      </motion.div>

      {SETTINGS_GROUPS.map(group => (
        <motion.div key={group.heading} variants={fadeBlurIn} className="flex flex-col gap-2">
          <SectionHeading label={group.heading} />
          <Card className="overflow-hidden rounded-[16px]">
            {group.rows.map((control, i) => {
              row += 1
              return (
                <div
                  key={i}
                  className="flex h-14 items-center gap-4 px-4"
                  style={i ? { borderTop: `1px solid ${HAIRLINE}` } : undefined}
                >
                  <div className="flex flex-col gap-1.5">
                    <Ghost
                      className="h-2 rounded-full"
                      style={{ width: LABEL_WIDTHS[row % LABEL_WIDTHS.length] }}
                    />
                    <Ghost
                      className="h-[6px] rounded-full"
                      style={{ width: LABEL_WIDTHS[(row + 3) % LABEL_WIDTHS.length] }}
                    />
                  </div>
                  <div className="flex-1" />
                  <SettingsControl kind={control} />
                </div>
              )
            })}
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * What each destination lists, and what fills its pane. Keyed by the rail's
 * label; Messages is absent because the design draws that one for real.
 */
const VIEWS: Record<string, { sections: GhostSection[]; Body: () => ReactNode }> = {
  Video: {
    sections: [
      { heading: 'UPCOMING', rows: 3, icon: 'avatar' },
      { heading: 'RECENT CALLS', rows: 5, icon: 'avatar' },
    ],
    Body: VideoBody,
  },
  Jobs: {
    sections: [
      { heading: 'PIPELINE', rows: 4, icon: 'square' },
      { heading: 'DEPARTMENTS', rows: 5, icon: 'square' },
    ],
    Body: JobsBody,
  },
  Charts: {
    sections: [
      { heading: 'DASHBOARDS', rows: 3, icon: 'square' },
      { heading: 'SAVED REPORTS', rows: 4, icon: 'square' },
    ],
    Body: ChartBody,
  },
  Settings: {
    sections: [
      { heading: 'WORKSPACE', rows: 4, icon: 'square' },
      { heading: 'ACCOUNT', rows: 4, icon: 'square' },
    ],
    Body: SettingsBody,
  },
}

/**
 * A whole destination — column and pane — for any rail item that isn't Messages.
 *
 * The selected row keys the body, so picking one replays its stagger. The rows
 * have no names to put in the header the way a conversation does, so the reload
 * *is* the feedback: the frame answers the click.
 */
export function RailGhostView({ item }: { item: RailItem }) {
  const view = VIEWS[item.label]
  const [selected, setSelected] = useState(0)

  if (!view) return null

  return (
    <>
      <GhostSidebar
        title={item.title}
        sections={view.sections}
        selected={selected}
        onSelect={setSelected}
        chipId={`rail-${item.label}-chip`}
      />
      <GhostPane item={item}>
        <view.Body key={selected} />
      </GhostPane>
    </>
  )
}
