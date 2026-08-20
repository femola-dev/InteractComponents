import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRise } from '../components/rise'
import { blurMorph, springRail, springSnap, transitionFast, transitionSmooth } from '../lib/motion'
import { lighten } from '../lib/color'
import { MEMBERS, TIERS, COMPANY_LOGOS, COMPANY_NAMES } from '../lib/members'
import type { TierId, CompanyId, Member } from '../lib/members'

import sailboatGlyph from '../assets/icons/sailboat-glyph.svg'
import iconHover from '../assets/icons/Hover.svg'
import iconHomeRoofActive from '../assets/icons/active_home-roof.svg'
import iconHomeRoofInactive from '../assets/icons/inactive_home-roof.svg'
import iconMagicWandActive from '../assets/icons/active_magic-wand-2.svg'
import iconMagicWandInactive from '../assets/icons/inactive_magic-wand-2.svg'
import iconGroup3Active from '../assets/icons/active_group-3.svg'
import iconGroup3Inactive from '../assets/icons/inactive_group-3.svg'
import iconGroup3Muted from '../assets/icons/group-3-muted.svg'
import iconWorldActive from '../assets/icons/active_world.svg'
import iconWorldInactive from '../assets/icons/inactive_world.svg'
import iconChart6Active from '../assets/icons/active_chart-6.svg'
import iconChart6Inactive from '../assets/icons/inactive_chart-6.svg'
import iconCodeAssistantActive from '../assets/icons/active_code-assistant.svg'
import iconCodeAssistantInactive from '../assets/icons/inactive_code-assistant.svg'
import iconSettingsGearActive from '../assets/icons/active_settings-gear-2.svg'
import iconSettingsGearInactive from '../assets/icons/inactive_settings-gear-2.svg'
import iconChevronGrabber from '../assets/icons/icon-chevron-grabber-vertical.svg'
import iconCollapseArrow from '../assets/icons/IconSidebarWideLeftArrow.svg'
import iconSquareCheck from '../assets/icons/square-check.svg'
import iconSquareUncheck from '../assets/icons/square-uncheck.svg'
import iconCheckmarkSmall from '../assets/icons/icon-checkmark-1-small.svg'
import iconSortDefault from '../assets/icons/IconFilter2.svg'
import iconSortAscending from '../assets/icons/IconFilterAscending.svg'
import iconSortDescending from '../assets/icons/IconFilterDescending.svg'

const INTER_FEATURES = { fontFeatureSettings: '"salt" 1, "dlig" 1' } as const
const INTER_FEATURES_DATE = { fontFeatureSettings: '"salt" 1, "zero" 1, "cv02" 1, "cv03" 1, "cv04" 1, "cv09" 1, "dlig" 1, "lnum" 1, "pnum" 1' } as const

const NAV_ITEMS = [
  { iconActive: iconHomeRoofActive, iconInactive: iconHomeRoofInactive, label: 'Dashboard' },
  { iconActive: iconMagicWandActive, iconInactive: iconMagicWandInactive, label: 'Explore' },
  { iconActive: iconGroup3Active, iconInactive: iconGroup3Inactive, label: 'Membership', badge: 'New' },
  { iconActive: iconWorldActive, iconInactive: iconWorldInactive, label: 'Domain Expert' },
  { iconActive: iconChart6Active, iconInactive: iconChart6Inactive, label: 'Analytics' },
  { iconActive: iconCodeAssistantActive, iconInactive: iconCodeAssistantInactive, label: 'Automations' },
  { iconActive: iconSettingsGearActive, iconInactive: iconSettingsGearInactive, label: 'Settings' },
] as const

/* Each workspace pairs an accent (used for its initials badge) with a deep,
   low-lightness tone in the same hue family for the sidebar background —
   switching workspace re-themes the sidebar to match. */
const WORKSPACES = [
  { name: 'Acmenola Inc.', color: '#fff822', text: '#000000', sidebar: '#02320f' },
  { name: 'Venture Labs', color: '#7c5cff', text: '#ffffff', sidebar: '#180f36' },
  { name: 'Atlas Group', color: '#22c55e', text: '#ffffff', sidebar: '#06231b' },
  { name: 'Northwind Co.', color: '#f97316', text: '#ffffff', sidebar: '#2e1505' },
  { name: 'Solstice Labs', color: '#ec4899', text: '#ffffff', sidebar: '#2e0a1c' },
] as const

const SIDEBAR_LINK_SHADOW = '0px 0.254px 0.507px rgba(0,0,0,0.2), 0px 0px 1.521px rgba(30,62,126,0.2)'
/* A small underdamped spring gives the bar a short physical follow-through
   when the pointer crosses rows: ζ ≈ 0.83, roughly 1% overshoot. */
const NAV_PILL_SPRING = { type: 'spring', stiffness: 480, damping: 28, mass: 0.6 } as const

/* ---- The rail ----

   Minimise/maximise is one spring and nothing else. `railWidth` is the only
   thing in the sidebar that is animated: every other value that changes on
   collapse — the nav rows' hit width, the toggle's position and rotation, the
   workspace pill's width, and every fade — is a `useTransform` read off it, so
   there is exactly one mass moving and everything else is rigidly attached to
   it.

   That is a different thing from a dozen springs sharing a config, which is
   what this was. Springs given the same numbers still integrate separately, so
   an interrupted collapse left each one mid-flight with its own velocity and
   they arrived at slightly different times — a rail that shears rather than
   moves. Reading one value cannot drift: reverse the rail halfway and the
   labels, badges, and chevron reverse on exactly the frame it does, because
   they are not animating at all.

   It is also most of the per-frame cost gone. One `JSAnimation` drives one
   layout-affecting width; the transforms are arithmetic on the value's change
   notification and none of them re-render React. */
const RAIL_MIN = 56
const RAIL_MAX = 223

/* Fades below are expressed as the two rail *widths* they run between, not as
   durations or as fractions of the travel. The rail's edge is a shutter passing
   over fixed content, so what matters is where the edge is when a thing goes:
   each window is chosen to finish just wider than the element's own right edge,
   so nothing is ever caught sitting half-clipped by the boundary. Rewrite the
   sidebar's geometry and these are the numbers to move; change the spring and
   they need no attention at all. */
const FADE = {
  /* Logo + wordmark end at x ≈ 128. */
  logo: [140, 190],
  /* Workspace name needs ~123px of pill to sit in. */
  workspaceLabel: [155, 205],
  /* Longest nav label ("Domain Expert") ends at x ≈ 138. */
  navLabel: [145, 195],
  /* The hover plate is 217px wide and clipped for most of the travel. */
  navPill: [165, 210],
  /* The "New" tag ends at x ≈ 209 — it can only ever ride out behind the
     edge, so this one fades on the way rather than ahead of it. */
  navBadge: [185, 215],
}

type SortKey = 'name' | 'email' | 'tier' | 'company' | 'dateJoined'
type SortDir = 'asc' | 'desc'

/** Name/Email cycle default → ascending → descending → default (back to
 * insertion order) on repeated clicks; the other columns just toggle
 * between ascending/descending since "unsorted" isn't a meaningful state
 * for a tier, company, or date filter. */
const THREE_STATE_SORT_COLUMNS: ReadonlySet<SortKey> = new Set(['name', 'email'])

const TIER_OPTIONS = Object.values(TIERS).map(t => ({ value: t.id, label: t.label }))
const COMPANY_OPTIONS = (Object.entries(COMPANY_NAMES) as [CompanyId, string][]).map(([value, label]) => ({ value, label }))

/* Column widths matching Figma proportions (62/259/294/206/225px at full scale) */
const COL = {
  check: 'w-[clamp(40px,5cqw,62px)]',
  name: 'w-[clamp(150px,17cqw,259px)]',
  email: 'w-[clamp(170px,19.5cqw,294px)]',
  tier: 'w-[clamp(90px,11.5cqw,206px)]',
  company: 'w-[clamp(121px,13.9cqw,225px)]',
} as const

function WorkspaceInitial({ workspace, className }: { workspace: (typeof WORKSPACES)[number]; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[4px] ${className ?? ''}`}
      style={{ backgroundColor: workspace.color }}
    >
      <span
        className="text-[clamp(7px,0.9cqw,9.333px)] font-bold"
        style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1', color: workspace.text, textShadow: '0px 0.169px 0.338px rgba(0,0,0,0.2), 0px 0px 1.014px rgba(30,62,126,0.2)' }}
      >
        {workspace.name.charAt(0)}
      </span>
    </div>
  )
}

function AvatarCircle({ src, name }: { src: string; name: string }) {
  return (
    <img
      src={src}
      alt={name}
      className="size-[clamp(16px,2.5cqw,20px)] shrink-0 rounded-full object-cover"
    />
  )
}

function TierBadge({ tier }: { tier: TierId }) {
  const t = TIERS[tier]
  return (
    <span
      className="inline-flex cursor-default items-center justify-center rounded-full border-[0.6px] border-black/15 px-[clamp(4px,0.6cqw,6px)] py-[clamp(3px,0.4cqw,4.5px)] text-[clamp(8px,1.1cqw,10px)] font-medium text-white whitespace-nowrap leading-[12px]"
      style={{ backgroundColor: t.color, fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1, "dlig" 1', textShadow: '0px 1px 0px rgba(0,0,0,0.25)' }}
    >
      {t.label}
    </span>
  )
}

const HOVER_CARD_WIDTH = 264
const HOVER_CARD_EST_HEIGHT = 200
const HOVER_CARD_SPACING = 16

/** Smart profile card shown on hover of a member's avatar/name — richer than
 * the Figma reference (which only had avatar + name + email): pulls in tier,
 * company, and join date so the card is actually useful at a glance. Rendered
 * via portal + fixed positioning so it always escapes the table's scroll
 * clipping and floats above everything. Anchored to the cursor position
 * (captured when the hover delay fires) rather than the row's bounding box,
 * so it opens right next to wherever the mouse actually is. */
function HoverProfileCard({ member, point }: { member: Member; point: { x: number; y: number } }) {
  const t = TIERS[member.tier]
  const logoAssets = COMPANY_LOGOS[member.company]
  const logoSrc = logoAssets?.[member.companyLogoIndex % logoAssets.length] ?? logoAssets?.[0]

  const overflowsRight = point.x + HOVER_CARD_SPACING + HOVER_CARD_WIDTH > window.innerWidth - 8
  const left = overflowsRight ? point.x - HOVER_CARD_WIDTH - HOVER_CARD_SPACING : point.x + HOVER_CARD_SPACING
  const top = Math.min(Math.max(point.y - 24, 8), window.innerHeight - HOVER_CARD_EST_HEIGHT - 8)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 4 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="fixed z-[100] overflow-hidden rounded-[12px] bg-white"
      style={{ left, top, width: HOVER_CARD_WIDTH, boxShadow: '0px 12px 32px rgba(0,0,0,0.16), 0px 2px 2px rgba(0,0,0,0.08), 0px 0px 0px 0.5px rgba(0,0,0,0.12)' }}
    >
      {/* Cover, tinted with the member's tier color */}
      <div className="relative h-[56px] w-full" style={{ background: `linear-gradient(135deg, ${t.color}40, ${t.color}0d)` }}>
        <div className="absolute left-[16px] top-[24px]">
          <img src={member.avatar} alt="" className="size-[56px] rounded-full border-[3px] border-white object-cover" />
          <div className="absolute -right-[1px] -bottom-[1px] flex size-[18px] items-center justify-center rounded-full border-2 border-white" style={{ backgroundColor: t.color }}>
            <img src={iconCheckmarkSmall} alt="" className="size-[9px] brightness-0 invert" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[10px] px-[16px] pt-[36px] pb-[16px]">
        <div className="flex items-center gap-[8px]">
          <span className="truncate text-[14px] font-semibold text-[#1c221d]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
            {member.name}
          </span>
          <TierBadge tier={member.tier} />
        </div>

        <span className="truncate text-[12px] text-[#878f88]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
          {member.email}
        </span>

        <div className="h-px w-full bg-[#f1f1f1]" />

        <div className="flex items-center justify-between gap-[8px]">
          <div className="flex min-w-0 items-center gap-[6px]">
            <img src={logoSrc} alt="" className="size-[14px] shrink-0" />
            <span className="truncate text-[12px] text-[#5e645f]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
              {COMPANY_NAMES[member.company]}
            </span>
          </div>
          <span className="shrink-0 text-[11px] text-[#b0b0b0]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES_DATE }}>
            Joined {member.dateJoined}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/** Column sort indicator — mirrors the Figma header exactly: a neutral icon
 * when the column isn't the active sort, swapping to a dedicated ascending
 * or descending glyph (rather than rotating one arrow) once it is. */
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  const src = !active ? iconSortDefault : dir === 'asc' ? iconSortAscending : iconSortDescending
  return <img src={src} alt="" className="size-[14px] shrink-0" />
}

interface FilterOption<T extends string> {
  value: T
  label: string
}

function ColumnFilterMenu<T extends string>({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: FilterOption<T>[]
  selected: Set<T>
  onToggle: (value: T) => void
  onClear: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 top-full z-30 mt-[6px] w-[170px] overflow-hidden rounded-lg border border-[#ededed] bg-white py-1"
      style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
    >
      {options.map(opt => {
        const isSelected = selected.has(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className="flex w-full cursor-pointer items-center gap-[8px] px-[10px] py-[6px] text-left transition-colors hover:bg-[#f8faf8]"
          >
            <img src={isSelected ? iconSquareCheck : iconSquareUncheck} alt="" className="size-[13px] shrink-0" />
            <span className="truncate text-[12px] text-[#5e645f]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
              {opt.label}
            </span>
          </button>
        )
      })}
      {selected.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="mt-1 flex w-full cursor-pointer items-center border-t border-[#f1f1f1] px-[10px] py-[6px] text-left text-[12px] text-[#878f88] transition-colors hover:bg-[#f8faf8] hover:text-[#5e645f]"
          style={{ fontFamily: "'Inter Display', sans-serif" }}
        >
          Clear filter
        </button>
      )}
    </motion.div>
  )
}

function FilterableColLabel<T extends string>({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
  options,
  selected,
  onToggleOption,
  onClear,
  open,
  onOpenChange,
}: {
  column: SortKey
  label: string
  sortKey: SortKey | null
  sortDir: SortDir
  onSort: (key: SortKey) => void
  options: FilterOption<T>[]
  selected: Set<T>
  onToggleOption: (value: T) => void
  onClear: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const active = selected.size > 0
  return (
    <div className="relative flex items-center gap-[2px]">
      <button type="button" onClick={() => onSort(column)} className="flex cursor-pointer items-center hover:text-[#5e645f] transition-colors">
        <span
          className="text-[clamp(11px,1.3cqw,13px)] font-medium whitespace-nowrap leading-[18px]"
          style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1', color: active ? '#1c221d' : '#878f88' }}
        >
          {label}
        </span>
      </button>
      {/* The sort/filter icon doubles as the filter-menu trigger for columns
          that have one — there's no separate chevron in the Figma header. */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={`Filter by ${label}`}
        className="relative flex cursor-pointer items-center rounded p-[2px] transition-colors hover:bg-[#f1f1f1]"
      >
        <SortIcon active={sortKey === column} dir={sortDir} />
        {active && <span className="absolute -right-[1px] -top-[1px] size-[5px] shrink-0 rounded-full bg-[#02320f]" />}
      </button>
      {open && (
        <>
          <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => onOpenChange(false)} className="fixed inset-0 z-20 cursor-default" />
          <ColumnFilterMenu options={options} selected={selected} onToggle={onToggleOption} onClear={onClear} />
        </>
      )}
    </div>
  )
}

/** Nav-row highlight — the "Hover" asset from Figma: a soft blurred glow bar
 * that bleeds past both edges of whichever row is active or moused over.
 * One persistent layer follows the hovered row so it trails rather than
 * disappearing and remounting between pointer events. */
/* `y` is its own spring — it tracks the pointer, which the rail knows nothing
   about. `opacity` is not: the plate is 217px wide inside a rail that spends
   most of the collapse narrower than that, so it has to leave as a function of
   where the edge is rather than on a clock of its own. */
function NavHoverPill({ index, opacity }: { index: number; opacity: MotionValue<number> }) {
  return (
    <motion.div
      initial={false}
      animate={{ y: index * 34 + 2 }}
      transition={{ y: NAV_PILL_SPRING }}
      style={{ opacity }}
      className="pointer-events-none absolute left-[-29px] top-0 z-0 h-[12px] w-[217px]"
    >
      <div className="absolute -inset-x-[4.61%] -inset-y-[83.33%]">
        <img src={iconHover} alt="" className="block size-full" />
      </div>
    </motion.div>
  )
}

interface MemberRowProps {
  member: Member
  checked: boolean
  onToggle: (id: number) => void
  onNameHoverStart: (member: Member, x: number, y: number) => void
  onNameHoverMove: (x: number, y: number) => void
  onNameHoverEnd: () => void
}

function MemberRow({ member, checked, onToggle, onNameHoverStart, onNameHoverMove, onNameHoverEnd }: MemberRowProps) {
  const logoAssets = COMPANY_LOGOS[member.company]
  const logoSrc = logoAssets?.[member.companyLogoIndex % logoAssets.length] ?? logoAssets?.[0]

  return (
    <div
      onClick={() => onToggle(member.id)}
      className={`group relative flex h-[clamp(34px,5.5cqw,40px)] shrink-0 cursor-pointer items-center border-b border-[#f1f1f1] transition-colors duration-150 ${checked ? 'bg-[#f8faf8]' : 'bg-white hover:bg-[#f8faf8]'}`}
    >
      {/* Checkbox column */}
      <div className={`flex shrink-0 items-center ${COL.check} pl-[clamp(12px,1.5cqw,16px)]`}>
        <img src={checked ? iconSquareCheck : iconSquareUncheck} alt="" className="size-[clamp(14px,1.8cqw,16px)]" />
      </div>

      {/* Name */}
      <div
        className={`flex shrink-0 items-center gap-[clamp(4px,0.8cqw,8px)] ${COL.name}`}
        onMouseEnter={e => onNameHoverStart(member, e.clientX, e.clientY)}
        onMouseMove={e => onNameHoverMove(e.clientX, e.clientY)}
        onMouseLeave={onNameHoverEnd}
      >
        <AvatarCircle src={member.avatar} name={member.name} />
        <span className="truncate text-[clamp(11px,1.3cqw,13px)] text-[#5e645f] leading-[16px]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
          {member.name}
        </span>
      </div>

      {/* Email */}
      <div className={`flex shrink-0 items-center ${COL.email}`}>
        <span className="truncate text-[clamp(11px,1.3cqw,13px)] text-[#5e645f] leading-[16px]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
          {member.email}
        </span>
      </div>

      {/* Tier */}
      <div className={`flex shrink-0 items-center ${COL.tier}`}>
        <TierBadge tier={member.tier} />
      </div>

      {/* Company */}
      <div className={`flex shrink-0 items-center gap-[clamp(4px,0.6cqw,6px)] ${COL.company}`}>
        <img src={logoSrc} alt="" className="size-[clamp(14px,1.8cqw,16px)] shrink-0 transition-transform duration-150 group-hover:scale-110" />
        <span className="truncate text-[clamp(11px,1.3cqw,13px)] text-[#5e645f] leading-[16px] transition-colors duration-150 group-hover:text-[#02320f] cursor-default" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
          {COMPANY_NAMES[member.company]}
        </span>
      </div>

      {/* Date */}
      <div className="flex flex-1 items-center">
        <span className="truncate text-[clamp(11px,1.3cqw,13px)] text-[#5e645f] leading-[16px]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES_DATE }}>
          {member.dateJoined}
        </span>
      </div>
    </div>
  )
}

type Verdict = 'accepted' | 'rejected'

/** A verdict that has been sent but is still inside its revert window — holds
 *  everything needed to put the table back exactly as it was. */
type PendingVerdict = { id: number; verdict: Verdict; count: number; message: string; ids: Set<number> }

/* Raised-button treatment shared by the bulk-action buttons: an outer lift
   plus an inner bevel, same recipe as the sidebar's "New" badge. */
const ACTION_BUTTON_SHADOW = '0px 0px 1.521px 0px rgba(30,62,126,0.2), 0px 0.254px 0.507px 0px rgba(0,0,0,0.2)'
const ACTION_BUTTON_BEVEL = 'inset 0px -0.22px 0.394px 0px rgba(0,0,0,0.2), inset 0px 0.254px 0.254px 0px rgba(255,255,255,0.35), inset 0px 0px 1.013px 0px rgba(255,255,255,0.25)'

/** `drainSeconds` renders a fill that empties left-to-right over that many
 *  seconds — a spatial read of a countdown to pair with the numeric one.
 *  `width` omitted means the button sizes to its label instead of the
 *  design's fixed 90px. */
function ActionButton({ label, color, onClick, width = 90, trailing, drainSeconds }: { label: string; color: string; onClick: () => void; width?: number | null; trailing?: ReactNode; drainSeconds?: number }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={transitionFast}
      className={`relative flex h-[32px] shrink-0 cursor-pointer items-center justify-center gap-[6px] overflow-hidden rounded-[8px] ${width == null ? 'px-[16px]' : ''}`}
      style={{ backgroundColor: color, boxShadow: ACTION_BUTTON_SHADOW, width: width ?? undefined }}
    >
      {drainSeconds != null && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-full origin-left bg-white/20"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: drainSeconds, ease: 'linear' }}
        />
      )}
      <span
        className="relative text-[13px] font-medium text-white whitespace-nowrap tracking-[-0.13px] leading-[18px]"
        style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1' }}
      >
        {label}
      </span>
      {trailing}
      <span aria-hidden className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: ACTION_BUTTON_BEVEL }} />
    </motion.button>
  )
}

/** How long a verdict stays reversible before it commits. */
const REVERT_WINDOW_SECONDS = 10

const VERDICT_COLOR: Record<Verdict, string> = { accepted: '#02320f', rejected: '#da0000' }

/** The white field's receipt state — what was sent, and to how many. The
 *  verdict isn't final while this is up; see `RevertButton`. */
function ReceiptBody({ pending }: { pending: PendingVerdict }) {
  const memberLabel = pending.count === 1 ? 'member' : 'members'

  return (
    <div className="flex h-full w-full flex-col gap-[4px] rounded-[6px] bg-white px-[8px] py-[8px]" role="status" aria-live="polite">
      <div className="flex items-center gap-[6px]">
        <span aria-hidden className="size-[8px] shrink-0 rounded-full" style={{ backgroundColor: VERDICT_COLOR[pending.verdict] }} />
        <span
          className="text-[13px] font-semibold text-[#1c221d] tracking-[-0.13px] leading-[18px]"
          style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}
        >
          {pending.count} {memberLabel} {pending.verdict}
        </span>
      </div>
      <span
        className="truncate text-[13px] text-[#878f88] tracking-[-0.13px] leading-[18px]"
        style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1' }}
      >
        {pending.message ? `“${pending.message}”` : 'No message sent'}
      </span>
    </div>
  )
}

/** Green revert affordance plus the window it lives in: the fill drains and the
 *  seconds count down together, and expiry commits the verdict. */
function RevertButton({ onRevert, onExpire }: { onRevert: () => void; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(REVERT_WINDOW_SECONDS)

  useEffect(() => {
    const tick = window.setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000)
    const commit = window.setTimeout(onExpire, REVERT_WINDOW_SECONDS * 1000)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(commit)
    }
  }, [onExpire])

  return (
    <ActionButton
      label="Revert changes"
      color="#0a9c4b"
      width={null}
      onClick={onRevert}
      drainSeconds={REVERT_WINDOW_SECONDS}
      trailing={
        <span
          className="relative text-[13px] font-semibold text-white/75 tabular-nums leading-[18px]"
          style={{ fontFamily: "'Inter Display', sans-serif" }}
        >
          {remaining}s
        </span>
      }
    />
  )
}

/** Left-hand chip in the panel footer — icon plus however many rows are in play. */
function SelectionCount({ count }: { count: number }) {
  return (
    <div className="flex h-[32px] shrink-0 items-center gap-[4px] overflow-hidden rounded-[8px] p-[4px]">
      <img src={iconGroup3Muted} alt="" className="size-[16px] shrink-0" />
      <span
        className="text-[13px] font-semibold text-[#878f88] whitespace-nowrap tracking-[-0.13px] leading-[18px] tabular-nums"
        style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1' }}
      >
        {count}
      </span>
    </div>
  )
}

/** Width of the verdict pair (90 + 4 + 90). The action slot is pinned to it so
 *  the narrower revert button swaps in without the footer reflowing. */
const ACTION_SLOT_WIDTH = 184

/* State changes inside the composer are quick but not abrupt. With k=520,
   c=38 and m=0.6, ζ ≈ 1.08: critically/softly overdamped, so the morph
   settles in roughly 130ms without the shell overshooting its bounds. */
const COMPOSER_MORPH_SPRING = { type: 'spring', stiffness: 520, damping: 38, mass: 0.6 } as const

/** Bulk-action composer (Figma 332:4525). Springs up over the table area the
 *  moment the first member is checked and stays for as long as anything is
 *  selected, so a verdict on the selection is always within reach — no toolbar
 *  hunting. Accepted/Rejected apply to the whole selection and clear it;
 *  ⌘/Ctrl+Enter accepts, Escape drops the selection. The message is optional,
 *  so the buttons are never blocked on typing.
 *
 *  Geometry is 1:1 with the frame: 433px shell, 2px inset around a fixed
 *  104px morph stage, then a 32px footer row inset a further 2px — selection
 *  count on the left, verdict buttons on the right.
 *
 *  The same shell carries the post-send receipt, and only the two parts that
 *  actually differ morph: the fixed white field stage, and the action slot.
 *  The shell, footer row, and count chip keep their geometry across both
 *  states — nothing that stays the same is allowed to stretch. */
function BulkComposePanel({ count, pending, onDecision, onRevert, onCommit, onDismiss }: { count: number; pending: PendingVerdict | null; onDecision: (verdict: Verdict, message: string) => void; onRevert: () => void; onCommit: () => void; onDismiss: () => void }) {
  const [message, setMessage] = useState('')

  const decide = (verdict: Verdict) => {
    onDecision(verdict, message.trim())
  }

  return (
    /* Alignment layer spans the whole table region but stays click-through, so
       rows behind the panel remain selectable while it's open. Horizontally
       centered, bottom-aligned with 72px of clearance. */
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-[16px] pb-[72px]">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={springSnap}
        className="pointer-events-auto flex w-[433px] max-w-full flex-col gap-[4px] overflow-hidden rounded-[8px] bg-[#f1f1f1] p-[2px]"
        style={{ boxShadow: `${ACTION_BUTTON_SHADOW}, ${ACTION_BUTTON_BEVEL}` }}
      >
        {/* Fixed stage: the textarea and receipt occupy the same 104px field,
            so the shell never resizes when the verdict is submitted or reverted. */}
        <div className="relative h-[104px] w-full">
          <AnimatePresence mode="sync" initial={false}>
            {pending ? (
              <motion.div key="receipt" {...blurMorph} transition={COMPOSER_MORPH_SPRING} className="absolute inset-0">
                <ReceiptBody pending={pending} />
              </motion.div>
            ) : (
              <motion.textarea
                key="compose"
                {...blurMorph}
                transition={COMPOSER_MORPH_SPRING}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    onDismiss()
                  } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    decide('accepted')
                  }
                }}
                placeholder={count === 1 ? 'Compose message to selected member...' : 'Compose message to selected members...'}
                aria-label="Message to selected members"
                className="absolute inset-0 h-full w-full resize-none rounded-[6px] bg-white px-[8px] py-[8px] text-[13px] text-[#1c221d] outline-none placeholder:text-[#878f88]"
                style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1', letterSpacing: '-0.13px', lineHeight: '18px' }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer row is shared, so it never animates. The count chip holds the
            pending total while a receipt is up, which keeps the one number
            that's true in both states from flickering. */}
        <div className="flex items-center justify-between px-[2px] pb-[2px]">
          <SelectionCount count={pending ? pending.count : count} />
          <div className="relative h-[32px] shrink-0" style={{ width: ACTION_SLOT_WIDTH }}>
            <AnimatePresence initial={false}>
              {pending ? (
                <motion.div key="revert" {...blurMorph} transition={COMPOSER_MORPH_SPRING} className="absolute right-0 top-0">
                  <RevertButton onRevert={onRevert} onExpire={onCommit} />
                </motion.div>
              ) : (
                <motion.div key="verdict" {...blurMorph} transition={COMPOSER_MORPH_SPRING} className="absolute right-0 top-0 flex items-center gap-[4px]">
                  <ActionButton label="Rejected" color="#da0000" onClick={() => decide('rejected')} />
                  <ActionButton label="Accepted" color="#02320f" onClick={() => decide('accepted')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


/* ---- Lazy views ----------------------------------------------------------
   Every nav item except Membership lands on a ghost of the view it would open.
   Three rules keep these in the page's language rather than looking like a
   generic skeleton kit dropped in:

   1. Only greys already on the page. `#f1f1f1` is its row rule, composer shell
      and hover tint; `#dfdfdf` is the rule under the page header and above the
      pagination footer. Fills take the first, card edges the second — nothing
      here introduces a grey the table doesn't already use.
   2. Borders, never shadows. The only elevation on this page is the table's
      column-header rule and the action buttons; a placeholder has no business
      floating above either.
   3. The same fluid scale (`clamp(min, cqw, max)`) and the same 12–16px gutter
      as the table, so switching nav doesn't change the page's rhythm.

   Every layout fills the content area rather than stacking at the top: the
   view a ghost stands in for would use the whole pane, so the ghost has to as
   well, or the nav reads as broken instead of unbuilt. */

const GHOST_FILL = 'bg-[#f1f1f1]'
const GHOST_EDGE = 'border-[#dfdfdf]'

/** Placeholder fill. */
function Ghost({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`shrink-0 rounded-[4px] ${GHOST_FILL} ${className}`} style={style} />
}

/** One line of ghost text. */
function GhostLine({ width, className = '' }: { width: string; className?: string }) {
  return <Ghost className={`h-[clamp(8px,1cqw,10px)] ${className}`} style={{ width }} />
}

function GhostCard({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-0 flex-col gap-[clamp(8px,1cqw,12px)] rounded-[8px] border ${GHOST_EDGE} p-[clamp(10px,1.3cqw,14px)] ${className}`}>
      {children}
    </div>
  )
}

/* Fixed, not random: a re-render must not reshuffle the chart. */
const GHOST_BARS = [42, 68, 55, 83, 61, 74, 48, 90, 66, 52, 78, 59]

function DashboardGhost() {
  return (
    <>
      <div className="flex shrink-0 gap-[clamp(10px,1.3cqw,16px)]">
        {[0, 1, 2, 3].map(i => (
          <GhostCard key={i} className="flex-1">
            <GhostLine width="45%" />
            <Ghost className="h-[clamp(16px,2.2cqw,22px)] w-[65%]" />
          </GhostCard>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 gap-[clamp(10px,1.3cqw,16px)]">
        <GhostCard className="flex-[2]">
          <GhostLine width="30%" />
          <div className="flex min-h-0 flex-1 items-end gap-[clamp(4px,0.7cqw,8px)]">
            {GHOST_BARS.map((h, i) => (
              <Ghost key={i} className="flex-1" style={{ height: `${h}%` }} />
            ))}
          </div>
        </GhostCard>
        <GhostCard className="flex-1 justify-between">
          <GhostLine width="50%" />
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-[clamp(6px,0.9cqw,10px)]">
              <Ghost className="size-[clamp(20px,2.6cqw,28px)] rounded-full" />
              <GhostLine width={`${70 - i * 7}%`} />
            </div>
          ))}
        </GhostCard>
      </div>
    </>
  )
}

function ExploreGhost() {
  return (
    <>
      <Ghost className="h-[clamp(28px,3.6cqw,36px)] w-full rounded-[8px]" />
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-3 gap-[clamp(10px,1.3cqw,16px)]">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <GhostCard key={i}>
            <Ghost className="min-h-0 w-full flex-1 rounded-[6px]" />
            <GhostLine width="80%" />
            <GhostLine width="55%" />
          </GhostCard>
        ))}
      </div>
    </>
  )
}

function DomainExpertGhost() {
  return (
    <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-3 gap-[clamp(10px,1.3cqw,16px)]">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <GhostCard key={i} className="justify-center">
          <div className="flex items-center gap-[clamp(6px,0.9cqw,10px)]">
            <Ghost className="size-[clamp(32px,4.2cqw,44px)] rounded-full" />
            <div className="flex flex-1 flex-col gap-[clamp(5px,0.7cqw,8px)]">
              <GhostLine width="70%" />
              <GhostLine width="45%" />
            </div>
          </div>
          <GhostLine width="100%" />
          <GhostLine width="85%" />
          <div className="flex gap-[clamp(4px,0.6cqw,6px)]">
            {[0, 1, 2].map(j => (
              <Ghost key={j} className="h-[clamp(14px,1.8cqw,18px)] w-[clamp(34px,5cqw,54px)] rounded-full" />
            ))}
          </div>
        </GhostCard>
      ))}
    </div>
  )
}

function AnalyticsGhost() {
  return (
    <>
      <GhostCard className="flex-1">
        <div className="flex items-center justify-between">
          <GhostLine width="22%" />
          <Ghost className="h-[clamp(18px,2.4cqw,24px)] w-[clamp(60px,8cqw,90px)] rounded-[6px]" />
        </div>
        <div className="flex min-h-0 flex-1 items-end gap-[clamp(6px,0.9cqw,12px)]">
          {GHOST_BARS.map((h, i) => (
            <Ghost key={i} className="flex-1 rounded-b-none rounded-t-[4px]" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="h-px w-full shrink-0 bg-[#dfdfdf]" />
      </GhostCard>
      <div className="flex shrink-0 gap-[clamp(10px,1.3cqw,16px)]">
        {[0, 1, 2].map(i => (
          <GhostCard key={i} className="flex-1">
            <GhostLine width="40%" />
            <Ghost className="h-[clamp(16px,2.2cqw,22px)] w-[55%]" />
            <GhostLine width="70%" />
          </GhostCard>
        ))}
      </div>
    </>
  )
}

function AutomationsGhost() {
  return (
    <div className={`flex min-h-0 flex-1 flex-col rounded-[8px] border ${GHOST_EDGE}`}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`flex flex-1 items-center gap-[clamp(8px,1.1cqw,12px)] px-[clamp(10px,1.3cqw,14px)] ${i === 5 ? '' : `border-b ${GHOST_EDGE}`}`}
        >
          <Ghost className="size-[clamp(24px,3cqw,32px)] rounded-[6px]" />
          <div className="flex flex-1 flex-col gap-[clamp(5px,0.7cqw,8px)]">
            <GhostLine width={`${52 - i * 4}%`} />
            <GhostLine width={`${34 - i * 2}%`} />
          </div>
          {/* Toggle-shaped, so the row reads as a rule you can switch. */}
          <Ghost className="h-[clamp(16px,2cqw,20px)] w-[clamp(28px,3.6cqw,36px)] rounded-full" />
        </div>
      ))}
    </div>
  )
}

function SettingsGhost() {
  return (
    <>
      {[0, 1, 2].map(section => (
        <div key={section} className="flex flex-1 flex-col justify-center gap-[clamp(10px,1.3cqw,16px)]">
          <GhostLine width="18%" className="h-[clamp(10px,1.3cqw,13px)]" />
          {[0, 1].map(row => (
            <div key={row} className="flex items-center justify-between gap-12">
              <GhostLine width="16%" />
              <Ghost className="h-[clamp(26px,3.4cqw,34px)] w-[800px] min-w-[960px] max-w-[960px] flex-1 rounded-[6px]" />
            </div>
          ))}
          {/* A real rule, not a ghost: the page separates its own sections with
              this exact hairline. */}
          {section < 2 && <div className="mt-auto h-px w-full bg-[#dfdfdf]" />}
        </div>
      ))}
    </>
  )
}

const GHOST_VIEWS: Record<string, () => ReactNode> = {
  Dashboard: DashboardGhost,
  Explore: ExploreGhost,
  'Domain Expert': DomainExpertGhost,
  Analytics: AnalyticsGhost,
  Automations: AutomationsGhost,
  Settings: SettingsGhost,
}

/**
 * The stand-in for a view that isn't built. Each nav item gets a layout shaped
 * like the thing it would open — tiles and a chart for Dashboard, a card grid
 * for Explore, switch rows for Automations — so the sidebar still teaches what
 * lives where instead of showing one generic grey page six times.
 *
 * Two nested elements rather than one, because the entrance fade and the idle
 * pulse both drive `opacity`: on a single node the later `animate` silently
 * replaces the earlier one, which is exactly how the blur got stuck on before.
 *
 * The pulse runs on one slow cycle for the whole surface rather than per block
 * — one pulse says "placeholder", forty say "loading", and nothing here is
 * actually loading. Reduced motion holds it still.
 */
function LazyView({ nav }: { nav: string }) {
  const reducedMotion = useReducedMotion()
  const View = GHOST_VIEWS[nav]
  if (!View) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transitionSmooth}
      aria-hidden
      className="flex min-h-0 flex-1 flex-col overflow-hidden p-[clamp(12px,1.5cqw,16px)]"
    >
      <motion.div
        animate={reducedMotion ? undefined : { opacity: [1, 0.6, 1] }}
        transition={reducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex min-h-0 flex-1 flex-col gap-[clamp(10px,1.3cqw,16px)]"
      >
        <View />
      </motion.div>
    </motion.div>
  )
}


const PAGE_SIZES = [10, 15, 25, 50] as const

export function MembershipDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [pending, setPending] = useState<PendingVerdict | null>(null)
  const verdictSeq = useRef(0)
  const [activeNav, setActiveNav] = useState('Membership')
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [navTooltip, setNavTooltip] = useState<{ label: string; x: number; y: number } | null>(null)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [workspace, setWorkspace] = useState<(typeof WORKSPACES)[number]>(WORKSPACES[0])
  const sidebarElevated = useMemo(() => lighten(workspace.sidebar, 6), [workspace])
  const logoMarkColor = useMemo(() => lighten(workspace.sidebar, 30), [workspace])
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const sortKeyRef = useRef(sortKey)
  sortKeyRef.current = sortKey
  const sortDirRef = useRef(sortDir)
  sortDirRef.current = sortDir
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50)
  const [tierFilter, setTierFilter] = useState<Set<TierId>>(new Set())
  const [companyFilter, setCompanyFilter] = useState<Set<CompanyId>>(new Set())
  const [openFilter, setOpenFilter] = useState<'tier' | 'company' | null>(null)
  const rise = useRise()
  const reducedMotion = useReducedMotion()

  /* The rail's one degree of freedom. `collapsed` stays React state because
     things other than geometry read it — the tooltips only exist minimized —
     but the width itself never round-trips through a render: `set` hands the
     spring a new target and it integrates on the frame loop from there. */
  const railWidth = useSpring(RAIL_MAX, springRail)
  useEffect(() => {
    const target = collapsed ? RAIL_MIN : RAIL_MAX
    /* `jump`, not `set`: it writes the value and clears the velocity with it,
       so reduced motion gets the state change with no travel at all rather
       than a very fast spring. */
    if (reducedMotion) railWidth.jump(target)
    else railWidth.set(target)
  }, [collapsed, reducedMotion, railWidth])

  /* Geometry rigidly attached to the edge. `clamp: false` on the toggle so the
     spring's 4% overshoot carries into it — the control is *on* the rail, and
     an arrow that lands dead while the boundary behind it is still settling is
     the one thing that would give the trick away. The two widths stay clamped:
     past their ends they would only squash content inside a clip. */
  const navRowWidth = useTransform(railWidth, [RAIL_MIN, RAIL_MAX], [16, 184])
  const workspaceWidth = useTransform(railWidth, [RAIL_MIN, RAIL_MAX], [28, 189])
  const togglerLeft = useTransform(railWidth, [RAIL_MIN, RAIL_MAX], [20, 183], { clamp: false })
  const togglerRotate = useTransform(railWidth, [RAIL_MIN, RAIL_MAX], [180, 0], { clamp: false })

  /* Opacity is clamped, always: these read as a shutter uncovering content, and
     a spring that overshoots into opacity 1.04 has nowhere to put it. */
  const logoOpacity = useTransform(railWidth, FADE.logo, [0, 1])
  const workspaceLabelOpacity = useTransform(railWidth, FADE.workspaceLabel, [0, 1])
  const navLabelOpacity = useTransform(railWidth, FADE.navLabel, [0, 1])
  const navPillOpacity = useTransform(railWidth, FADE.navPill, [0, 1])
  const navBadgeOpacity = useTransform(railWidth, FADE.navBadge, [0, 1])
  const navBadgeScale = useTransform(railWidth, FADE.navBadge, [0.86, 1])

  const toggleChecked = useCallback((id: number) => {
    setPending(null)
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const [hoverCard, setHoverCard] = useState<{ member: Member; point: { x: number; y: number } } | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)
  const hoverPointRef = useRef({ x: 0, y: 0 })

  const handleNameHoverStart = useCallback((member: Member, x: number, y: number) => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current)
    hoverPointRef.current = { x, y }
    hoverTimeoutRef.current = window.setTimeout(() => setHoverCard({ member, point: hoverPointRef.current }), 350)
  }, [])

  const handleNameHoverMove = useCallback((x: number, y: number) => {
    hoverPointRef.current = { x, y }
  }, [])

  const handleNameHoverEnd = useCallback(() => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = null
    setHoverCard(null)
  }, [])

  const handleSort = useCallback((key: SortKey) => {
    // Sibling dispatches (not setSortDir nested inside setSortKey's
    // updater) — nesting them made the toggle a no-op under StrictMode,
    // which double-invokes updater functions in dev and turned every click
    // into two flips that canceled out.
    const isSameColumn = sortKeyRef.current === key

    if (isSameColumn && THREE_STATE_SORT_COLUMNS.has(key) && sortDirRef.current === 'desc') {
      setSortKey(null)
      setSortDir('asc')
      setPage(1)
      return
    }

    setSortKey(key)
    setSortDir(prev => (isSameColumn ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'))
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((size: (typeof PAGE_SIZES)[number]) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const toggleTierFilter = useCallback((tier: TierId) => {
    setTierFilter(prev => {
      const next = new Set(prev)
      if (next.has(tier)) next.delete(tier)
      else next.add(tier)
      return next
    })
    setPage(1)
  }, [])

  const toggleCompanyFilter = useCallback((company: CompanyId) => {
    setCompanyFilter(prev => {
      const next = new Set(prev)
      if (next.has(company)) next.delete(company)
      else next.add(company)
      return next
    })
    setPage(1)
  }, [])

  const clearTierFilter = useCallback(() => { setTierFilter(new Set()); setPage(1) }, [])
  const clearCompanyFilter = useCallback(() => { setCompanyFilter(new Set()); setPage(1) }, [])

  const filteredMembers = useMemo(() => {
    return MEMBERS.filter(m =>
      (tierFilter.size === 0 || tierFilter.has(m.tier)) &&
      (companyFilter.size === 0 || companyFilter.has(m.company))
    )
  }, [tierFilter, companyFilter])

  const sortedMembers = useMemo(() => {
    if (!sortKey) return filteredMembers
    const sorted = [...filteredMembers].sort((a, b) => {
      const va = sortKey === 'tier' ? TIERS[a.tier].label : a[sortKey]
      const vb = sortKey === 'tier' ? TIERS[b.tier].label : b[sortKey]
      return va < vb ? -1 : va > vb ? 1 : 0
    })
    return sortDir === 'desc' ? sorted.reverse() : sorted
  }, [filteredMembers, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const pageMembers = sortedMembers.slice(pageStart, pageStart + pageSize)

  const allOnPageChecked = pageMembers.length > 0 && pageMembers.every(m => checked.has(m.id))

  const toggleSelectAll = useCallback(() => {
    setChecked(prev => {
      const next = new Set(prev)
      if (allOnPageChecked) {
        pageMembers.forEach(m => next.delete(m.id))
      } else {
        pageMembers.forEach(m => next.add(m.id))
      }
      return next
    })
  }, [allOnPageChecked, pageMembers])

  const selectedCount = checked.size
  const activeNavItem = NAV_ITEMS.find(item => item.label === activeNav) ?? NAV_ITEMS[2]
  const onMembership = activeNav === 'Membership'
  const navHighlightIndex = Math.max(0, NAV_ITEMS.findIndex(item => item.label === (hoveredNav ?? activeNav)))

  const clearChecked = useCallback(() => setChecked(new Set()), [])

  /* A verdict clears the selection immediately but stays reversible for
     REVERT_WINDOW_SECONDS — `pending` holds the ids so revert can put the
     table back exactly as it was. No status field exists on a member yet, so
     committing is just letting the receipt go. */
  const handleBulkDecision = useCallback((verdict: Verdict, message: string) => {
    verdictSeq.current += 1
    setPending({ id: verdictSeq.current, verdict, count: checked.size, message, ids: checked })
    setChecked(new Set())
  }, [checked])

  const revertVerdict = useCallback(() => {
    setPending(prev => {
      if (prev) setChecked(prev.ids)
      return null
    })
  }, [])

  const commitVerdict = useCallback(() => setPending(null), [])

  // `staticIcon` columns (Date joined) sort chronologically, not
  // alphabetically — the A/Z ascending/descending glyphs don't apply, so the
  // icon always stays the plain filter mark while the click-to-sort/toggle
  // behavior underneath is unchanged.
  const ColLabel = ({ column, label, staticIcon }: { column: SortKey; label: string; staticIcon?: boolean }) => (
    <button type="button" onClick={() => handleSort(column)} className="flex cursor-pointer items-center gap-[4px] hover:text-[#5e645f] transition-colors">
      <span className="text-[clamp(11px,1.3cqw,13px)] font-medium text-[#878f88] whitespace-nowrap leading-[18px]" style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"dlig" 1' }}>
        {label}
      </span>
      <SortIcon active={!staticIcon && sortKey === column} dir={sortDir} />
    </button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="@container relative flex h-svh w-full overflow-hidden bg-white"
    >
      {/* ---- Sidebar ----
           `width` comes off the spring as a motion value and never through a
           render; only the workspace re-theme is an `animate` target, and that
           one genuinely is a discrete state change on a clock. */}
      <motion.div
        style={{ width: railWidth }}
        animate={{ backgroundColor: workspace.sidebar }}
        transition={{ backgroundColor: { duration: 0.4, ease: 'easeOut' } }}
        className="relative h-full shrink-0 overflow-hidden"
      >
        {/* One physical control travels with the rail: right-aligned in the
            expanded state, then into the centered icon column when minimized.
            Both its position and its rotation are the rail's own position read
            twice, so it arrives — and overshoots — with the edge it rides. */}
        <motion.button
          type="button"
          onClick={() => { setCollapsed(value => !value); setNavTooltip(null) }}
          style={{ left: togglerLeft, rotate: togglerRotate }}
          className="absolute top-[16px] z-20 flex h-6 w-4 cursor-pointer items-start justify-center opacity-60 transition-opacity duration-150 hover:opacity-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <img src={iconCollapseArrow} alt="" className="mt-1 size-4" />
        </motion.button>

        {/* Logo + wordmark. Nothing replaces it minimized — the top of the rail
            is just the toggle — so this is the one piece of chrome that only
            has to leave, and it leaves as the edge reaches it. */}
        <motion.div
          style={{ opacity: logoOpacity }}
          className="pointer-events-none absolute left-[16px] top-[16px] flex items-center gap-[6px]"
        >
          <motion.div
            animate={{ backgroundColor: logoMarkColor }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex size-6 shrink-0 items-center justify-center rounded-[25%]"
          >
            <img src={sailboatGlyph} alt="" className="w-[72%]" />
          </motion.div>
          <span
            className="text-[18px] font-semibold text-white whitespace-nowrap tracking-[-0.27px]"
            style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1', textShadow: '0px 0.254px 0.507px rgba(0,0,0,0.2), 0px 0px 1.521px rgba(30,62,126,0.2)' }}
          >
            Sailor Pro<span className="text-[0.65em] align-top">®</span>
          </span>
        </motion.div>

        {/* ---- Workspace selector ----

            One button, not two cross-fading. The expanded pill and the
            minimized initial were always the same object drawn twice — same
            origin, same height, same 6px inset, same 16px initial sitting in
            it — so the only honest thing for them to be is one element whose
            width rides the rail. What used to be a dissolve between two
            surfaces is now a surface changing width, and the swap that could
            be caught mid-fade cannot happen because there is nothing to swap.

            The label block is absolutely placed at its expanded geometry
            rather than laid out in flow: as the pill narrows it should be
            clipped by the closing edge, not reflowed into it. Flow layout
            would drag the name and the chevron toward each other on every
            frame — text moving under its own fade, and 7 layout passes a
            frame for nothing. */}
        <motion.button
          type="button"
          onClick={() => {
            if (collapsed) { setCollapsed(false); setNavTooltip(null) }
            else setWorkspaceOpen(o => !o)
          }}
          style={{ width: workspaceWidth, boxShadow: '0px 0.5px 4px 0px rgba(0,0,0,0.2)' }}
          className="absolute left-[14px] top-[56px] z-10 h-[28px] cursor-pointer overflow-hidden rounded-lg"
          aria-label={collapsed ? 'Expand sidebar' : 'Switch workspace'}
        >
          <div className="absolute inset-0 rounded-lg bg-white/7" style={{ backdropFilter: 'blur(21.2px)' }} />
          <WorkspaceInitial workspace={workspace} className="absolute left-[6px] top-[6px] size-4" />
          <motion.div
            style={{ opacity: workspaceLabelOpacity }}
            className="absolute left-[28px] top-0 flex h-full w-[155px] items-center justify-between pr-[6px]"
          >
            <span className="text-[14px] font-medium text-white whitespace-nowrap leading-[16px]" style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1, "dlig" 1' }}>
              {workspace.name}
            </span>
            <motion.img
              src={iconChevronGrabber}
              alt=""
              className="size-3 shrink-0"
              animate={{ rotate: workspaceOpen ? 180 : 0 }}
              transition={transitionFast}
            />
          </motion.div>
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ boxShadow: 'inset 0px 1px 2px 0px rgba(149,149,149,0.1)' }} />
        </motion.button>

        {workspaceOpen && (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setWorkspaceOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
        )}

        <AnimatePresence>
          {workspaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-[14px] top-[90px] z-30 w-[189px] overflow-hidden rounded-lg py-1"
              style={{ backgroundColor: sidebarElevated, boxShadow: '0px 4px 12px rgba(0,0,0,0.3)' }}
            >
              {WORKSPACES.map(w => (
                <button
                  key={w.name}
                  type="button"
                  onClick={() => { setWorkspace(w); setWorkspaceOpen(false) }}
                  className={`flex w-full cursor-pointer items-center gap-[6px] px-[10px] py-[6px] text-[clamp(11px,1.2cqw,13px)] text-left transition-colors duration-100 ${w.name === workspace.name ? 'text-white bg-white/10' : 'text-[#939e95] hover:bg-white/5 hover:text-white'
                    }`}
                  style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1' }}
                >
                  <WorkspaceInitial workspace={w} className="size-[clamp(11px,1.3cqw,14px)]" />
                  {w.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shared nav — one tree so icons never remount or shift on collapse.
            Rows keep the Figma geometry while labels and badges stay anchored
            overlays; the collapsed row contracts to the icon hit target. */}
        <div
          className="absolute left-[20px] top-[97px] z-10 flex flex-col gap-[18px]"
          onMouseLeave={() => { setHoveredNav(null); setNavTooltip(null) }}
        >
          <NavHoverPill index={navHighlightIndex} opacity={navPillOpacity} />
          {NAV_ITEMS.map(item => {
            const active = item.label === activeNav
            return (
              <motion.button
                key={item.label}
                type="button"
                onClick={() => setActiveNav(item.label)}
                onMouseEnter={e => {
                  setHoveredNav(item.label)
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setNavTooltip({
                      label: item.label,
                      x: rect.right + 10,
                      y: rect.top + rect.height / 2,
                    })
                  }
                }}
                onMouseLeave={() => {
                  setNavTooltip(null)
                }}
                className="relative z-[1] h-4 cursor-pointer text-left"
                style={{ width: navRowWidth }}
                aria-label={item.label}
              >
                <img
                  src={active ? item.iconActive : item.iconInactive}
                  alt=""
                  className="absolute left-0 top-0 z-10 size-4 shrink-0"
                />
                <motion.span
                  className="pointer-events-none absolute left-[22px] top-1/2 z-10 -translate-y-1/2 text-[14px] font-medium whitespace-nowrap leading-[16px]"
                  style={{
                    opacity: navLabelOpacity,
                    fontFamily: "'Inter Display', sans-serif",
                    fontFeatureSettings: '"salt" 1',
                    color: active ? '#ffffff' : '#939e95',
                    textShadow: SIDEBAR_LINK_SHADOW,
                  }}
                >
                  {item.label}
                </motion.span>
                {/* Keep the tag at its Figma x-position while the row width
                    contracts. Its old `right: 0` anchor made it fly left
                    through the icon rail during collapse.

                    It sits at x ≈ 175–209 in a rail that is only 223 wide, so
                    unlike everything else here it cannot get out of the way
                    before the edge arrives — it goes *with* the edge, shrinking
                    toward its right as the last 30px close over it. */}
                {'badge' in item && (
                  <span className="pointer-events-none absolute left-[155px] top-1/2 z-10 -translate-y-1/2">
                    <motion.span
                      className="flex items-center justify-center rounded-full pl-[5px] pr-[4px] py-[4px]"
                      style={{
                        opacity: navBadgeOpacity,
                        scale: navBadgeScale,
                        transformOrigin: 'right center',
                        boxShadow: '0px 0px 1.521px 0px rgba(30,62,126,0.2), 0px 0.254px 0.507px 0px rgba(0,0,0,0.2)',
                      }}
                    >
                      <span aria-hidden className="absolute inset-0 rounded-full bg-[#da0000]" />
                      <span className="relative text-[10px] font-medium text-white tracking-[-0.2px] leading-[14px]" style={{ fontFamily: "'Inter Display', sans-serif" }}>
                        {item.badge}
                      </span>
                      <span aria-hidden className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0px -0.22px 0.394px 0px rgba(0,0,0,0.2), inset 0px 0.254px 0.254px 0px rgba(255,255,255,0.35), inset 0px 0px 1.013px 0px rgba(255,255,255,0.25)' }} />
                    </motion.span>
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ---- Main Content ---- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <div className="flex h-[clamp(40px,5.5cqw,49px)] shrink-0 items-center justify-between border-b border-[#dfdfdf] bg-white">
          <div className="flex items-center gap-[6px] pl-[clamp(12px,1.5cqw,16px)]">
            <div className="flex size-[clamp(14px,1.8cqw,16px)] shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-white">
              {/* The sidebar's active icon, filtered to the label's own ink
                  (#1C221D) so every heading reads identically. */}
              <img
                src={activeNavItem.iconActive}
                alt=""
                className="size-full"
                style={{ filter: 'brightness(0) saturate(100%) invert(10%) sepia(10%) saturate(500%) hue-rotate(90deg) brightness(95%)' }}
              />
            </div>
            <span className="text-[clamp(14px,1.6cqw,16px)] font-semibold text-[#1c221d] whitespace-nowrap leading-[20px]" style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1, "dlig" 1' }}>
              {activeNav}
            </span>
          </div>
          <AnimatePresence>
            {onMembership && selectedCount > 0 && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mr-4 text-[clamp(11px,1.3cqw,13px)] text-[#878f88]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
                {selectedCount} selected
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {onMembership ? (
          <>
            {/* Table */}
            <div className="relative flex min-h-0 flex-1 flex-col">
              {/* Column headers */}
              <div className="relative flex h-[clamp(30px,4cqw,36px)] shrink-0 items-center bg-white" style={{ boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.08), 0px 0px 0px 0.5px rgba(0,0,0,0.12)' }}>
                <div className={`flex shrink-0 items-center ${COL.check} pl-[clamp(12px,1.5cqw,16px)]`}>
                  <button type="button" onClick={toggleSelectAll} className="flex cursor-pointer items-center" aria-label={allOnPageChecked ? 'Deselect all' : 'Select all'}>
                    <img src={allOnPageChecked ? iconSquareCheck : iconSquareUncheck} alt="" className="size-[clamp(14px,1.8cqw,16px)]" />
                  </button>
                </div>
                <div className={`flex shrink-0 items-center gap-[clamp(4px,0.8cqw,8px)] ${COL.name}`}>
                  <ColLabel column="name" label="Name" />
                </div>
                <div className={`flex shrink-0 items-center ${COL.email}`}>
                  <ColLabel column="email" label="Email address" />
                </div>
                <div className={`flex shrink-0 items-center ${COL.tier}`}>
                  <FilterableColLabel
                    column="tier"
                    label="Tier"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    options={TIER_OPTIONS}
                    selected={tierFilter}
                    onToggleOption={toggleTierFilter}
                    onClear={clearTierFilter}
                    open={openFilter === 'tier'}
                    onOpenChange={open => setOpenFilter(open ? 'tier' : null)}
                  />
                </div>
                <div className={`flex shrink-0 items-center ${COL.company}`}>
                  <FilterableColLabel
                    column="company"
                    label="Company"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    options={COMPANY_OPTIONS}
                    selected={companyFilter}
                    onToggleOption={toggleCompanyFilter}
                    onClear={clearCompanyFilter}
                    open={openFilter === 'company'}
                    onOpenChange={open => setOpenFilter(open ? 'company' : null)}
                  />
                </div>
                <div className="flex flex-1 items-center">
                  <ColLabel column="dateJoined" label="Date joined" staticIcon />
                </div>
              </div>

              {/* Data rows */}
              <div className="min-h-0 flex-1 overflow-auto" onScroll={handleNameHoverEnd}>
                <div className="flex flex-col">
                  {pageMembers.map((member, i) => (
                    <motion.div key={member.id} {...rise(0.05 + i * 0.02)}>
                      <MemberRow
                        member={member}
                        checked={checked.has(member.id)}
                        onToggle={toggleChecked}
                        onNameHoverStart={handleNameHoverStart}
                        onNameHoverMove={handleNameHoverMove}
                        onNameHoverEnd={handleNameHoverEnd}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {(selectedCount > 0 || pending) && (
                  <BulkComposePanel
                    count={selectedCount}
                    pending={pending}
                    onDecision={handleBulkDecision}
                    onRevert={revertVerdict}
                    onCommit={commitVerdict}
                    onDismiss={clearChecked}
                  />
                )}
              </AnimatePresence>

              {/* Footer / pagination */}
              <div className="flex h-[clamp(40px,5cqw,44px)] shrink-0 items-center justify-between border-t border-[#dfdfdf] bg-white px-[clamp(12px,1.5cqw,16px)]">
                <span className="text-[clamp(11px,1.2cqw,12px)] text-[#878f88] whitespace-nowrap" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
                  Showing {sortedMembers.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, sortedMembers.length)} of {sortedMembers.length} members
                </span>
                <div className="flex items-center gap-[clamp(12px,1.5cqw,20px)]">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[clamp(11px,1.2cqw,12px)] text-[#878f88] whitespace-nowrap" style={{ fontFamily: "'Inter Display', sans-serif" }}>
                      Rows per page
                    </span>
                    <select
                      value={pageSize}
                      onChange={e => handlePageSizeChange(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
                      className="cursor-pointer rounded-md border border-[#ededed] bg-white py-1 pl-2 pr-1 text-[clamp(11px,1.2cqw,12px)] text-[#5e645f] outline-none transition-colors hover:border-[#c4c9c5]"
                      style={{ fontFamily: "'Inter Display', sans-serif" }}
                    >
                      {PAGE_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[clamp(11px,1.2cqw,12px)] text-[#5e645f] whitespace-nowrap" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES_DATE }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-[4px]">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        aria-label="Previous page"
                        className="flex size-6 cursor-pointer items-center justify-center rounded-md text-[13px] text-[#5e645f] transition-colors hover:bg-[#f1f1f1] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        aria-label="Next page"
                        className="flex size-6 cursor-pointer items-center justify-center rounded-md text-[13px] text-[#5e645f] transition-colors hover:bg-[#f1f1f1] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Remount per nav so each ghost replays its entrance, the same
             way the playground switcher remounts a whole playground. */
          <LazyView key={activeNav} nav={activeNav} />
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {hoverCard && <HoverProfileCard key={hoverCard.member.id} member={hoverCard.member} point={hoverCard.point} />}
          {navTooltip && collapsed && (
            <motion.span
              key={navTooltip.label}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-[6px] px-2 py-1 text-[12px] font-medium text-white leading-[16px]"
              style={{
                left: navTooltip.x,
                top: navTooltip.y,
                backgroundColor: sidebarElevated,
                boxShadow: '0px 4px 12px rgba(0,0,0,0.3), 0px 0px 0px 0.5px rgba(255,255,255,0.08)',
                fontFamily: "'Inter Display', sans-serif",
                fontFeatureSettings: '"salt" 1',
              }}
            >
              {navTooltip.label}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
