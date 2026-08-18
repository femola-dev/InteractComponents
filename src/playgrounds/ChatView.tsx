import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ease, fadeBlurIn, transitionFast } from '../lib/motion'
import {
  GROUPS,
  INBOX_LINKS,
  PINNED_CHATS,
  PRESENCE_DOTS,
  RAIL_ITEMS,
  type Chat,
  type NavLink,
} from '../lib/conversations'
import {
  CHIP,
  GHOST_IN,
  GHOST_OUT,
  GROOVE,
  HAIRLINE,
  INK,
  MUTED,
  RAIL_SHADOW,
  RING,
  SALT,
} from '../lib/chatShell'
import { ChipButton, Ghost, SectionHeading } from '../components/ChatShell'
import { RailGhostView } from '../components/RailGhostViews'

import iconLogo from '../assets/icons/Logo.svg'
import iconBorderSmall from '../assets/icons/Border Small.svg'
import iconPreferences from '../assets/icons/preferences.svg'
import iconSearch from '../assets/icons/Search.svg'
import iconNewMessage from '../assets/icons/New message.svg'
import iconPhoneCall from '../assets/icons/Phone Call.svg'
import iconInfoMenu from '../assets/icons/Info menu.svg'
import iconHelp from '../assets/icons/question mark circle.svg'
import avatarCurrentUser from '../assets/images/avatars/current-user.jpg'

/**
 * Figma node 308:454 "Conversation Web", reproduced at its own scale.
 *
 * The design is a composition of three nested boxes that each crop the next, and
 * the cropping is the point — reflow any one of them and the screen stops
 * matching the file:
 *
 *   1440×1024  the artboard. The MacBook sits at (142, 104) and is 1410×980, so
 *              it runs 112px past the right edge and 60px past the bottom. Both
 *              are cut off.
 *   1348×912   the screen glass, at (152, 112). Only its top-left corner is
 *              rounded, because the other three are outside the artboard.
 *   1470×1080  the app itself, pinned to the glass's top-left. 122px of its
 *              width and 168px of its height are behind the bezel — which is
 *              where the rail's help and account buttons live, at y≈1016.
 *
 * So this renders one fixed 1440×1024 stage with every Figma coordinate intact
 * and scales the whole thing to cover the viewport, rather than making any of it
 * responsive. Nothing inside reflows — a wider window shows the design bigger,
 * never rearranged.
 *
 * The file only draws the Messages destination. The other four rail items get
 * ghost frames of their own (`RailGhostViews`) rather than leaving the
 * conversation on screen under a different lit glyph.
 */
const STAGE = { width: 1440, height: 1024 } as const

const BEZEL = '#ccc'

/* Two lifts and three inner lights — the badge is drawn as a physical bead, and
   dropping the insets flattens it into a red circle. */
const BADGE_SHADOW = [
  '0px 0px 2.534px 0px rgba(30,62,126,0.2)',
  '0px 0.423px 0.846px 0px rgba(0,0,0,0.2)',
  'inset 0px -0.367px 0.657px 0px rgba(0,0,0,0.2)',
  'inset 0px 0.423px 0.423px 0px rgba(255,255,255,0.35)',
  'inset 0px 0px 1.689px 0px rgba(255,255,255,0.25)',
].join(', ')

/**
 * Stiff and heavily damped: the selection chip should arrive under the cursor,
 * not swing past it. Same tuning the Membership sidebar's pill uses.
 */
const PILL_SPRING = { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 } as const

/**
 * The shape of a stand-in conversation: bubble side and box, in order, oldest
 * first. Widths and heights are authored rather than generated — a random
 * thread re-rolls on every render and the pane flickers, and a thread that
 * changes shape while you look at it stops reading as a screenshot of one.
 */
const GHOST_THREAD = [
  { side: 'in', w: 296, h: 56 },
  { side: 'in', w: 208, h: 34 },
  { side: 'out', w: 244, h: 34 },
  { side: 'out', w: 332, h: 56 },
  { side: 'in', w: 180, h: 34 },
  { side: 'out', w: 268, h: 34 },
  { side: 'in', w: 352, h: 78 },
  { side: 'out', w: 196, h: 34 },
] as const

/**
 * Rotate the script by the contact's position in the sidebar, so each thread
 * looks like a different conversation without any of them being random. Same
 * contact, same thread, every time you come back to it.
 */
function threadFor(seed: number) {
  const pivot = seed % GHOST_THREAD.length
  return [...GHOST_THREAD.slice(pivot), ...GHOST_THREAD.slice(0, pivot)]
}

/**
 * Scale factor that makes the fixed stage cover its container.
 *
 * `max` of the two ratios, not `min`, and uncapped. Fitting the whole artboard
 * inside the window is the wrong goal here: the artboard is not the picture, it
 * is a 1440×1024 window onto a laptop that already runs off its right and
 * bottom edges. Letterboxing it just adds a second, outer frame around a design
 * whose whole composition is "this is cropped".
 *
 * So the stage covers instead, anchored top-left — the corner every margin in
 * the design is measured from, and the only one with content against it. The
 * axis that does not drive the scale bleeds further off-screen in the direction
 * it was already bleeding, which is why cropping harder never reveals an edge
 * the design did not intend to hide.
 */
function useCoverScale(width: number, height: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      setScale(Math.max(box.width / width, box.height / height))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [width, height])

  return { ref, scale }
}

/**
 * The presence bead, placed by its core rather than its box.
 *
 * Figma exports these with the drop shadow baked into the artboard, so the file
 * is 8×8 while the dot itself is a 4px circle centred at (3.52, 3.52). The
 * design puts that circle at (13, 11) inside the 16px avatar — so the image's
 * top-left has to sit at 13 + 2 − 3.52 = 11.48. Positioning the 8px box flush to
 * the avatar's corner instead would put the bead ~3px inside where it belongs.
 */
function PresenceDot({ presence }: { presence: Chat['presence'] }) {
  return (
    <img
      src={PRESENCE_DOTS[presence]}
      alt=""
      aria-hidden
      className="pointer-events-none absolute top-[9.48px] left-[11.48px] size-[8px] max-w-none"
    />
  )
}

type RowProps = {
  /**
   * Which chip this row competes for. The sidebar runs two independent
   * selections at once — the view you are in, and the conversation you have
   * open — so they cannot share a `layoutId`: two live elements under one id is
   * what makes a shared-layout chip tear between them.
   */
  chipId: string
  isSelected: boolean
  onSelect: () => void
  icon: ReactNode
  label: string
}

/**
 * One sidebar row: 24px tall, 4px of padding on the icon side and 16px on the
 * text side. Rows competing for the same chip slide it between them rather than
 * cross-fading two.
 */
function SidebarRow({ chipId, isSelected, onSelect, icon, label }: RowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? 'page' : undefined}
      className="relative flex h-6 w-full shrink-0 cursor-pointer items-center gap-1 rounded-[6px] py-1 pr-4 pl-1 text-left"
    >
      {isSelected && (
        <motion.span
          layoutId={chipId}
          transition={PILL_SPRING}
          aria-hidden
          className="absolute inset-0 rounded-[6px]"
          style={{ backgroundColor: CHIP, boxShadow: RING }}
        />
      )}
      {/* Sits above the chip, and gives the presence dot something unclipped to
          overflow into. */}
      <span className="relative size-4 shrink-0">{icon}</span>
      <span
        className="relative truncate text-[12px] leading-4 tracking-[-0.24px] transition-colors duration-150"
        style={{ ...SALT, color: isSelected ? INK : MUTED }}
      >
        {label}
      </span>
    </button>
  )
}

type OpenThread = { name: string; avatar?: string; icon?: string; seed: number }

/**
 * A stand-in for the conversation pane — header, thread, composer — drawn as
 * ghost boxes so the shell reads as a chat client without inventing copy the
 * design never specified.
 *
 * Sized to the *visible* pane rather than the app's: 1080×912 is what survives
 * the glass, and unlike the sidebar this box has no Figma coordinates to be
 * faithful to. Anchoring it to the 1470×1080 app instead would push the
 * composer 168px below the bezel where nobody would ever see it.
 *
 * The header carries the real contact — name and avatar — because that is the
 * one thing the ghosts cannot say. Without it, selecting a pinned chat changes
 * nothing on screen and the highlight means nothing.
 */
function GhostConversation({ thread }: { thread: OpenThread }) {
  const script = threadFor(thread.seed)

  return (
    <motion.section
      aria-label={`Conversation with ${thread.name}`}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.04 }}
      className="absolute top-0 left-[268px] flex h-[912px] w-[1080px] flex-col"
    >
      {/* Header, in the 44px band the design's rule already closes. */}
      <motion.header
        variants={fadeBlurIn}
        className="flex h-11 shrink-0 items-center justify-between px-6"
      >
        <div className="flex items-center gap-2.5">
          <img
            src={thread.avatar ?? thread.icon}
            alt=""
            aria-hidden
            className={`size-6 shrink-0 ${thread.avatar ? 'rounded-full object-cover' : ''}`}
          />
          <div className="flex flex-col gap-[3px]">
            <p
              className="text-[13px] leading-4 tracking-[-0.26px]"
              style={{ ...SALT, color: INK }}
            >
              {thread.name}
            </p>
            <Ghost className="h-[7px] w-16 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Ghost className="size-5 rounded-[4px]" />
          <Ghost className="size-5 rounded-[4px]" />
          <Ghost className="size-5 rounded-[4px]" />
        </div>
      </motion.header>

      {/* Thread. `justify-end` sits it on the composer, the way a conversation
          you have just opened is already scrolled to its newest message. */}
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden">
        <div className="flex w-[760px] flex-col justify-end gap-3 pt-10 pb-6">
          <motion.div variants={fadeBlurIn} className="mx-auto">
            <Ghost className="h-4 w-[72px] rounded-full" />
          </motion.div>

          {script.map((message, i) => {
            const isIncoming = message.side === 'in'
            /* Only the first message of a run wears the avatar; the rest hold
               its place so every bubble in the run stays on one edge. */
            const showAvatar = isIncoming && script[i - 1]?.side !== 'in'

            return (
              <motion.div
                key={i}
                variants={fadeBlurIn}
                className={`flex items-end gap-2 ${isIncoming ? '' : 'justify-end'}`}
              >
                {isIncoming &&
                  (showAvatar ? (
                    <Ghost className="size-7 shrink-0 rounded-full" />
                  ) : (
                    <div aria-hidden className="size-7 shrink-0" />
                  ))}
                <div
                  className="rounded-[14px]"
                  style={{
                    width: message.w,
                    height: message.h,
                    backgroundColor: isIncoming ? GHOST_IN : GHOST_OUT,
                    boxShadow: RING,
                  }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Composer */}
      <motion.div variants={fadeBlurIn} className="flex shrink-0 justify-center pb-6">
        <div
          className="flex h-11 w-[760px] items-center gap-3 rounded-[12px] bg-white px-3"
          style={{ boxShadow: `${RING}, ${RAIL_SHADOW}` }}
        >
          <Ghost className="size-5 shrink-0 rounded-[5px]" />
          <Ghost className="h-2 flex-1 rounded-full" />
          <Ghost className="size-6 shrink-0 rounded-[6px]" fill={GHOST_OUT} />
        </div>
      </motion.div>
    </motion.section>
  )
}

export function ChatView() {
  const { ref, scale } = useCoverScale(STAGE.width, STAGE.height)
  /* The whole rail item, not its label: every destination writes its own title
     at the top of the column and the pane, so the frame needs the record. */
  const [rail, setRail] = useState(RAIL_ITEMS[0])
  /* Two selections, not one. The view is which list you are looking at; the
     thread is which conversation is open inside it. On "My inbox" both are lit
     at once — the filter, and the contact whose thread fills the pane. */
  const [view, setView] = useState(INBOX_LINKS[0].label)
  const [openThread, setOpenThread] = useState(PINNED_CHATS[0].name)
  const [query, setQuery] = useState('')

  const isMessages = rail.label === RAIL_ITEMS[0].label

  const open = useMemo<OpenThread | null>(() => {
    const chatIndex = PINNED_CHATS.findIndex(c => c.name === openThread)
    if (chatIndex >= 0) {
      const chat = PINNED_CHATS[chatIndex]
      return { name: chat.name, avatar: chat.avatar, seed: chatIndex }
    }
    const groupIndex = GROUPS.findIndex(g => g.label === openThread)
    if (groupIndex >= 0) {
      const group = GROUPS[groupIndex]
      return { name: group.label, icon: group.icon, seed: groupIndex + PINNED_CHATS.length }
    }
    return null
  }, [openThread])

  /* Only "My inbox" opens a thread. The other filters keep the empty pane the
     design actually draws. */
  const conversation = view === INBOX_LINKS[0].label ? open : null

  const q = query.trim().toLowerCase()
  const matches = useMemo(
    () => ({
      links: INBOX_LINKS.filter(l => l.label.toLowerCase().includes(q)),
      chats: PINNED_CHATS.filter(c => c.name.toLowerCase().includes(q)),
      groups: GROUPS.filter(g => g.label.toLowerCase().includes(q)),
    }),
    [q]
  )

  const empty = !matches.links.length && !matches.chats.length && !matches.groups.length

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: ease.smooth }}
      className="flex h-svh w-full items-start justify-start overflow-hidden bg-white"
    >
      {/* ---- The artboard, 1440×1024 ----
          Clips the MacBook, which overruns it on the right and the bottom.
          `overflow-hidden` is still load-bearing at scales above 1: the crop is
          the design, so it has to travel with it. */}
      <div
        className="relative shrink-0 overflow-hidden bg-white font-sohne"
        style={{ ...STAGE, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* Bezel, outer then inner. Both are stroke-only rectangles rounded at
            the top alone — the bottom of the laptop is off the artboard. */}
        <div
          className="absolute top-[104px] left-[142px] h-[980px] w-[1410px] rounded-t-[20px]"
          style={{ border: `1.5px solid ${BEZEL}` }}
        />
        <div
          className="absolute top-[111px] left-[151px] h-[973px] w-[1392px] rounded-t-[13px]"
          style={{ border: `1.5px solid ${BEZEL}` }}
        />

        {/* ---- The glass, 1348×912 ---- */}
        <div className="absolute top-[112px] left-[152px] h-[912px] w-[1348px] overflow-hidden rounded-tl-[13px] bg-[#f8f9fd]">
          {/* ---- The app, 1470×1080, pinned to the glass's top-left ----
              Wider and taller than the glass on purpose. */}
          <div className="absolute top-0 left-0 h-[1080px] w-[1470px] overflow-hidden bg-[#f8f9fd]">
            {/* ---- App rail ---- */}
            <nav
              aria-label="Workspace"
              className="absolute top-1 left-1 h-[1072px] w-10 overflow-hidden rounded-[8px] bg-white"
              style={{ border: `0.2px solid ${HAIRLINE}`, boxShadow: RAIL_SHADOW }}
            >
              <div className="absolute top-[7.8px] left-[7.8px] flex w-6 flex-col gap-[9px]">
                <div className="flex flex-col gap-2">
                  <img src={iconLogo} alt="Sailor Pro" className="size-6" />
                  <img src={iconBorderSmall} alt="" aria-hidden className="h-[2px] w-6" />
                </div>

                <div className="flex flex-col gap-1">
                  {RAIL_ITEMS.map(item => {
                    const isActive = rail.label === item.label
                    return (
                      <button
                        key={item.label}
                        type="button"
                        aria-label={item.title}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setRail(item)}
                        className="relative size-6 shrink-0 cursor-pointer rounded-[5px]"
                      >
                        {/* Both cuts stay mounted and cross-fade. Swapping `src`
                            would flash: the inactive glyph unloads a frame
                            before the active one paints. */}
                        <motion.img
                          src={item.inactive}
                          alt=""
                          aria-hidden
                          animate={{ opacity: isActive ? 0 : 1 }}
                          transition={transitionFast}
                          className="absolute inset-0 size-6"
                        />
                        <motion.img
                          src={item.active}
                          alt=""
                          aria-hidden
                          animate={{ opacity: isActive ? 1 : 0 }}
                          transition={transitionFast}
                          className="absolute inset-0 size-6"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Help and account, at the foot of the 1072px rail — which puts
                  them at y≈1016 on a 912px screen. Cropped in the design, and
                  kept here so the rail is the height the file says it is. */}
              <div className="absolute top-[1011.8px] left-[7.8px] flex w-6 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Help"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-[5px] transition-opacity duration-150 hover:opacity-70"
                >
                  <img src={iconHelp} alt="" aria-hidden className="size-4" />
                </button>
                <div className="flex size-6 items-center justify-center">
                  <img
                    src={avatarCurrentUser}
                    alt="Your account"
                    className="size-4 rounded-full border border-[#eff0f3] object-cover"
                  />
                </div>
              </div>
            </nav>

            {/* Everything right of the rail belongs to whichever destination is
                lit. Keyed on the rail item so switching replays its entrance —
                the frame arriving is the feedback for the click, the same way
                the conversation pane answers picking a contact. */}
            {isMessages ? (
              <>
                {/* ---- Conversations column, at (44, 12), 223 wide ---- */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  transition={{ staggerChildren: 0.06, delayChildren: 0.15 }}
                  className="absolute top-3 left-[44px] flex w-[223px] flex-col gap-1"
                >
                  {/* Title, search, and the two actions */}
                  <motion.div variants={fadeBlurIn} className="flex w-full flex-col gap-2">
                    <div className="flex h-6 items-center justify-between px-3 py-0.5">
                      <p
                        className="text-[12px] leading-4 font-semibold tracking-[-0.36px]"
                        style={{ color: MUTED, fontFamily: 'var(--font-sohne-breit)' }}
                      >
                        {rail.title}
                      </p>
                      <ChipButton label="Preferences" className="bg-[#eef0f7]">
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-[4px]"
                          style={{ boxShadow: RING }}
                        />
                        <img src={iconPreferences} alt="" aria-hidden className="relative size-3" />
                        {/* Unread count. Overhangs the chip's top-right corner. */}
                        <span
                          className="absolute -top-1 -right-1 flex size-[10px] items-center justify-center rounded-full bg-[#da0000] text-[6px] leading-none tracking-[-0.12px] text-white"
                          style={{ boxShadow: BADGE_SHADOW }}
                        >
                          2
                        </span>
                      </ChipButton>
                    </div>

                    <div className="h-px w-full" style={{ backgroundColor: HAIRLINE, boxShadow: GROOVE }} />

                    {/* The field grows into whatever the two buttons leave — 151px
                        at this column width. It is `flex-1`, not the 131px fixed
                        box it used to be, so the gap between it and the buttons is a
                        real 4px gap rather than slack from `justify-between`. */}
                    <div className="flex items-center gap-1 px-3 py-1">
                      <label
                        className="flex h-5 min-w-0 flex-1 cursor-text items-center gap-0.5 rounded-[5px] px-1"
                        style={{ backgroundColor: CHIP, boxShadow: RING }}
                      >
                        <img src={iconSearch} alt="" aria-hidden className="size-4 shrink-0" />
                        <input
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          placeholder="Search....."
                          aria-label="Search conversations"
                          className="min-w-0 flex-1 bg-transparent text-[10px] leading-none tracking-[-0.3px] outline-none placeholder:text-[rgba(121,127,146,0.4)]"
                          style={{ color: INK }}
                        />
                      </label>

                      <div className="flex shrink-0 items-center gap-1">
                        {/* Both ship from Figma as the finished 20px control — chip
                            fill and hairline are inside the SVG, so there is nothing
                            for this code to paint around them. */}
                        <ChipButton label="New message">
                          <img src={iconNewMessage} alt="" aria-hidden className="size-[21px] max-w-none" />
                        </ChipButton>
                        <ChipButton label="Start a call">
                          <img src={iconPhoneCall} alt="" aria-hidden className="size-[21px] max-w-none" />
                        </ChipButton>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex w-full flex-col gap-4">
                    {matches.links.length > 0 && (
                      <motion.div variants={fadeBlurIn} className="flex w-full flex-col gap-1.5 px-3 py-2">
                        {matches.links.map(link => (
                          <SidebarRow
                            key={link.label}
                            chipId="chat-view-chip"
                            isSelected={view === link.label}
                            onSelect={() => setView(link.label)}
                            label={link.label}
                            icon={<NavIcon link={link} />}
                          />
                        ))}
                      </motion.div>
                    )}

                    {matches.chats.length > 0 && (
                      <motion.div variants={fadeBlurIn} className="flex w-full flex-col gap-1.5 px-3 py-2">
                        <SectionHeading
                          label="PINNED CHATS"
                          action={
                            <ChipButton label="Pinned chat options">
                              <img src={iconInfoMenu} alt="" aria-hidden className="h-[2px] w-[9px] max-w-none" />
                            </ChipButton>
                          }
                        />
                        {matches.chats.map(chat => (
                          <SidebarRow
                            key={chat.name}
                            chipId="chat-thread-chip"
                            isSelected={openThread === chat.name}
                            onSelect={() => setOpenThread(chat.name)}
                            label={chat.name}
                            icon={
                              <>
                                <img src={chat.avatar} alt="" aria-hidden className="size-4 rounded-full object-cover" />
                                <PresenceDot presence={chat.presence} />
                              </>
                            }
                          />
                        ))}
                      </motion.div>
                    )}

                    {matches.groups.length > 0 && (
                      <motion.div variants={fadeBlurIn} className="flex w-full flex-col gap-1.5 px-3 py-1">
                        <SectionHeading label="GROUPS" />
                        {matches.groups.map(group => (
                          <SidebarRow
                            key={group.label}
                            chipId="chat-thread-chip"
                            isSelected={openThread === group.label}
                            onSelect={() => setOpenThread(group.label)}
                            label={group.label}
                            icon={<NavIcon link={group} />}
                          />
                        ))}
                      </motion.div>
                    )}

                    {empty && (
                      <motion.p
                        variants={fadeBlurIn}
                        className="px-4 pt-2 text-[12px] leading-4 tracking-[-0.24px]"
                        style={{ ...SALT, color: MUTED }}
                      >
                        No matches for “{query.trim()}”
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* The conversation, when one is open. Empty in the design, and
                    still empty on every view but "My inbox". */}
                {/* Keyed on the contact so picking a different one remounts the
                    pane and replays its stagger — the thread arriving is the
                    feedback for the click. */}
                {conversation && <GhostConversation key={conversation.name} thread={conversation} />}
              </>
            ) : (
              <RailGhostView key={rail.label} item={rail} />
            )}

            {/* Column rule, full height and grooveless. */}
            <div className="absolute top-0 left-[267px] h-[1080px] w-px" style={{ backgroundColor: HAIRLINE }} />

            {/* Main pane header rule. 1202px wide, so it runs to the app's right
                edge and disappears behind the bezel. Drawn last so it closes the
                pane's header from on top, whichever destination drew it. */}
            <div
              className="absolute top-[44px] left-[268px] h-px w-[1202px]"
              style={{ backgroundColor: HAIRLINE, boxShadow: GROOVE }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** A plain 16px glyph, sized to fill the row's icon slot. */
function NavIcon({ link }: { link: NavLink }) {
  return <img src={link.icon} alt="" aria-hidden className="size-4" />
}
