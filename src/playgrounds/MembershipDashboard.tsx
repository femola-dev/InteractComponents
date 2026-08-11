import { useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useRise } from '../components/rise'
import { transitionFast } from '../lib/motion'
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
import iconGroup3Dark from '../assets/icons/group-3-dark.svg'
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
const NAV_PILL_SPRING = { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 } as const

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
  check:  'w-[clamp(40px,5cqw,62px)]',
  name:   'w-[clamp(150px,17cqw,259px)]',
  email:  'w-[clamp(170px,19.5cqw,294px)]',
  tier:   'w-[clamp(90px,11.5cqw,206px)]',
  company:'w-[clamp(121px,13.9cqw,225px)]',
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
 * Shared across rows via layoutId so it slides between them instead of
 * popping in and out. */
function NavHoverPill() {
  return (
    <motion.div
      layoutId="nav-hover-pill"
      transition={NAV_PILL_SPRING}
      className="pointer-events-none absolute inset-y-[2px] left-[-29px] right-[-4px]"
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

const PAGE_SIZES = [10, 15, 25, 50] as const

export function MembershipDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [activeNav, setActiveNav] = useState('Membership')
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
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

  const toggleChecked = useCallback((id: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
      next.has(tier) ? next.delete(tier) : next.add(tier)
      return next
    })
    setPage(1)
  }, [])

  const toggleCompanyFilter = useCallback((company: CompanyId) => {
    setCompanyFilter(prev => {
      const next = new Set(prev)
      next.has(company) ? next.delete(company) : next.add(company)
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
      {/* ---- Sidebar ---- */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0, backgroundColor: workspace.sidebar }}
            animate={{ width: 'clamp(150px,15.5cqw,223px)', opacity: 1, backgroundColor: workspace.sidebar }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              width: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
              backgroundColor: { duration: 0.4, ease: 'easeOut' },
            }}
            className="relative h-full shrink-0 overflow-hidden"
          >
            <div className="absolute left-[clamp(12px,1.5cqw,16px)] top-[clamp(12px,1.5cqw,16px)] flex items-center gap-[6px]">
              <motion.div
                animate={{ backgroundColor: logoMarkColor }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex size-[clamp(20px,2.5cqw,24px)] shrink-0 items-center justify-center rounded-[25%]"
              >
                <img src={sailboatGlyph} alt="" className="w-[72%]" />
              </motion.div>
              <span
                className="text-[clamp(15px,1.9cqw,18px)] font-semibold text-white whitespace-nowrap tracking-[-0.27px]"
                style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1', textShadow: '0px 0.254px 0.507px rgba(0,0,0,0.2), 0px 0px 1.521px rgba(30,62,126,0.2)' }}
              >
                Sailor Pro<span className="text-[0.65em] align-top">®</span>
              </span>
            </div>

            {/* Workspace selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkspaceOpen(o => !o)}
                className="absolute left-[clamp(10px,1.3cqw,14px)] top-[clamp(44px,6.5cqw,56px)] w-[clamp(150px,15cqw,189px)] cursor-pointer overflow-hidden rounded-lg p-[clamp(4px,0.6cqw,6px)] opacity-60 transition-opacity duration-150 hover:opacity-80"
                style={{ boxShadow: '0px 0.5px 4px 0px rgba(0,0,0,0.2)' }}
              >
                <div className="absolute inset-0 rounded-lg bg-white/7" style={{ backdropFilter: 'blur(21.2px)' }} />
                <div className="relative flex items-center gap-[6px]">
                  <WorkspaceInitial workspace={workspace} className="size-[clamp(12px,1.5cqw,16px)]" />
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-[clamp(12px,1.3cqw,14px)] font-medium text-white whitespace-nowrap leading-[16px]" style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1, "dlig" 1' }}>
                      {workspace.name}
                    </span>
                    <motion.img
                      src={iconChevronGrabber}
                      alt=""
                      className="size-3"
                      animate={{ rotate: workspaceOpen ? 180 : 0 }}
                      transition={transitionFast}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ boxShadow: 'inset 0px 1px 2px 0px rgba(149,149,149,0.1)' }} />
              </button>

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
                    className="absolute left-[clamp(10px,1.3cqw,14px)] top-[clamp(78px,9.5cqw,90px)] z-30 w-[clamp(150px,15cqw,189px)] overflow-hidden rounded-lg py-1"
                    style={{ backgroundColor: sidebarElevated, boxShadow: '0px 4px 12px rgba(0,0,0,0.3)' }}
                  >
                    {WORKSPACES.map(w => (
                      <button
                        key={w.name}
                        type="button"
                        onClick={() => { setWorkspace(w); setWorkspaceOpen(false) }}
                        className={`flex w-full cursor-pointer items-center gap-[6px] px-[10px] py-[6px] text-[clamp(11px,1.2cqw,13px)] text-left transition-colors duration-100 ${
                          w.name === workspace.name ? 'text-white bg-white/10' : 'text-[#939e95] hover:bg-white/5 hover:text-white'
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
            </div>

            {/* Navigation */}
            <div
              className="absolute left-[clamp(14px,1.6cqw,19px)] top-[clamp(84px,10.5cqw,97px)] flex flex-col gap-[clamp(12px,2cqw,18px)]"
              onMouseLeave={() => setHoveredNav(null)}
            >
              {NAV_ITEMS.map(item => {
                const active = item.label === activeNav
                const highlighted = (hoveredNav ?? activeNav) === item.label
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveNav(item.label)}
                    onMouseEnter={() => setHoveredNav(item.label)}
                    className="relative flex w-[clamp(123px,12.8cqw,184px)] cursor-pointer items-center gap-[6px] rounded-md -ml-[6px] px-[6px] py-[2px]"
                  >
                    {highlighted && <NavHoverPill />}
                    <img
                      src={active ? item.iconActive : item.iconInactive}
                      alt=""
                      className="relative z-10 size-[clamp(14px,1.8cqw,16px)] shrink-0"
                    />
                    <span
                      className="relative z-10 text-[clamp(12px,1.3cqw,14px)] font-medium whitespace-nowrap leading-[16px]"
                      style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1', color: active ? '#ffffff' : '#939e95', textShadow: SIDEBAR_LINK_SHADOW }}
                    >
                      {item.label}
                    </span>
                    {'badge' in item && (
                      // Positioned independently of flex flow so its center always lands
                      // on the collapse/minimize icon's center — same right-offset formula,
                      // used as the alignment "crosshair" — regardless of viewport size.
                      <span
                        className="absolute z-10 flex shrink-0 items-center justify-center rounded-full pl-[clamp(3px,0.4cqw,5px)] pr-[clamp(2.5px,0.35cqw,4px)] py-[clamp(2.5px,0.35cqw,4px)]"
                        style={{
                          top: '50%',
                          left: 'calc(clamp(150px,15.5cqw,223px) - clamp(10px,1.7cqw,24px) - clamp(14px,1.6cqw,19px) - 2px)',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: '0px 0px 1.521px 0px rgba(30,62,126,0.2), 0px 0.254px 0.507px 0px rgba(0,0,0,0.2)',
                        }}
                      >
                        <span aria-hidden className="absolute inset-0 rounded-full bg-[#da0000]" />
                        <span className="relative text-[clamp(8px,1cqw,10px)] font-medium text-white tracking-[-0.2px] leading-[14px]" style={{ fontFamily: "'Inter Display', sans-serif" }}>
                          {item.badge}
                        </span>
                        <span aria-hidden className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0px -0.22px 0.394px 0px rgba(0,0,0,0.2), inset 0px 0.254px 0.254px 0px rgba(255,255,255,0.35), inset 0px 0px 1.013px 0px rgba(255,255,255,0.25)' }} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button type="button" onClick={() => setCollapsed(true)} className="absolute right-[clamp(10px,1.7cqw,24px)] top-[clamp(16px,2cqw,20px)] flex size-4 cursor-pointer items-center justify-center opacity-60 transition-opacity duration-150 hover:opacity-100">
              <img src={iconCollapseArrow} alt="" className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {collapsed && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} type="button" onClick={() => setCollapsed(false)} className="absolute left-0 top-5 z-10 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-r-md opacity-60 transition-opacity duration-150 hover:opacity-100" style={{ backgroundColor: workspace.sidebar, boxShadow: '0px 0.5px 4px 0px rgba(0,0,0,0.2)' }}>
          <img src={iconCollapseArrow} alt="" className="size-4 rotate-180" />
        </motion.button>
      )}

      {/* ---- Main Content ---- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <div className="flex h-[clamp(40px,5.5cqw,49px)] shrink-0 items-center justify-between border-b border-[#dfdfdf] bg-white">
          <div className="flex items-center gap-[6px] pl-[clamp(12px,1.5cqw,16px)]">
            <div className="flex size-[clamp(14px,1.8cqw,16px)] shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-white">
              <img src={iconGroup3Dark} alt="" className="size-full" />
            </div>
            <span className="text-[clamp(14px,1.6cqw,16px)] font-semibold text-[#1c221d] whitespace-nowrap leading-[20px]" style={{ fontFamily: "'Inter Display', sans-serif", fontFeatureSettings: '"salt" 1, "dlig" 1' }}>
              Membership
            </span>
          </div>
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mr-4 text-[clamp(11px,1.3cqw,13px)] text-[#878f88]" style={{ fontFamily: "'Inter Display', sans-serif", ...INTER_FEATURES }}>
                {selectedCount} selected
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="flex min-h-0 flex-1 flex-col">
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
      </div>

      {createPortal(
        <AnimatePresence>
          {hoverCard && <HoverProfileCard key={hoverCard.member.id} member={hoverCard.member} point={hoverCard.point} />}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
