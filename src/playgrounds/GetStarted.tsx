import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion'
import { blurMorph, ease, transitionFast, springSnap } from '../lib/motion'
import { BloomLogo } from '../components/BloomLogo'
import { GetStartedGhost } from '../components/GetStartedGhost'
import {
  CANVAS,
  CARD_SHADOW,
  CLUSTER,
  GEAR_PERIOD,
  HAIRLINE,
  INK,
  MUTED,
  NAV_FOOTER,
  NAV_SECTIONS,
  TILES,
  TILE_BLEED,
  destination,
  SELECTED,
  STAGE,
  STEPS,
  iconCheckCircle,
  iconLoading,
  iconSidebarToggle,
  type Glyph,
  type NavItem,
  type Step,
  type Tile,
} from '../lib/getStarted'

/**
 * Get Started — Figma node 344:4987, reproduced at its own scale.
 *
 * The board is a 1470×1080 artboard: a 125px strip of #fbfafa, then the 1345px
 * app window. The window's rail is #fbfafa too, so the two read as one 348px
 * light column with the content starting 141px in — which is why the strip has
 * to stay rather than being trimmed as slide furniture.
 *
 * Every offset below is the file's own number. Nothing here is responsive on
 * purpose: `useFitScale` puts the whole artboard on screen at one uniform scale,
 * so the proportions the design measured survive any window instead of being
 * re-flowed into a layout the design never drew.
 */

/**
 * Contain, not cover.
 *
 * `ChatView` scales its board by `max()` because that design is a laptop
 * bleeding off two edges — cropping is what it wants. This one is a full
 * application window whose rail runs to y=1045, so any crop takes Settings,
 * Updates and Feedback off the bottom. `min()` keeps the artboard whole and
 * pillarboxes instead, and the bars are painted #fbfafa to match the strip the
 * board already has down its left side.
 */
function useFitScale(width: number, height: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      setScale(Math.min(box.width / width, box.height / height))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [width, height])

  return { ref, scale }
}

/**
 * An element's height, tracked live.
 *
 * Needed because a CSS height cannot animate to `auto` — something has to resolve
 * the target to a number first, and the content's own box is the only thing that
 * knows it.
 */
function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState<number>()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, height }
}

/**
 * The card's edge travelling to a new height.
 *
 * A tween rather than a spring, and deliberately: a spring is the right tool
 * when the distance is unknown or the gesture has momentum, and this has
 * neither — it is a known travel between two measured heights, triggered by a
 * click. `ease.smooth` puts most of the distance in the first third and lands
 * without a settle, which is the "arrives and stops" the house springs only
 * approximate.
 *
 * 0.28s against the crossfade's 0.24s. The content resolves first and the edge
 * comes to rest just after it, so the last thing that moves is the boundary —
 * the surface arriving rather than the surface changing size.
 */
const HEIGHT_MORPH: Transition = { duration: 0.28, ease: ease.smooth }

/**
 * A 16px glyph box.
 *
 * Most of the file's icons are exported at exactly 16×16 and fill it. Three are
 * trimmed to their vector's bounds and carry the inset that puts them back where
 * they were drawn — see `Glyph` in the data module.
 */
function Icon({ glyph, className }: { glyph: Glyph; className?: string }) {
  return (
    <div className={`relative size-[16px] shrink-0 overflow-hidden ${className ?? ''}`}>
      {/* The inset is carried by a box, and the image fills the box.
          Putting both on the image does not work: `size-full` resolves against
          the 16px container, so the image keeps its full 16×16 and the inset
          only shifts it — it draws oversized, off-position, and clipped. That is
          invisible on the icons exported at exactly 16×16, where the inset is 0
          and the two forms agree, and wrong on the three that are trimmed to
          their vector's bounds. Same reason the logo's flower and the tile discs
          each hang off a stretched div rather than off the image. */}
      <div className="absolute" style={{ inset: glyph.inset ?? 0 }}>
        <img src={glyph.src} alt="" aria-hidden className="block size-full max-w-none" />
      </div>
    </div>
  )
}

/**
 * A rail glyph, in both of the cuts Figma ships for it.
 *
 * The file exports each icon twice — #919191 at rest (node 344:4987) and
 * #171717 when selected (node 351:7267) — so the state change is an asset swap,
 * not a repaint. Worth keeping that way: the resting glyph is a different grey
 * from the resting *label* (#737373), so icons and text run on separate ramps,
 * which no single tint could express.
 *
 * Both cuts stay mounted and cross-fade rather than one `src` being swapped.
 * Swapping the source unloads the outgoing glyph a frame before the incoming one
 * has decoded, which shows as a blink on every click — the same reason ChatView's
 * rail keeps both of its cuts alive.
 *
 * The two exports share an artboard, so both sit under the same inset and the
 * glyph cannot shift by a sub-pixel as it changes state.
 */
function NavGlyph({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <div className="relative z-1 size-[16px] shrink-0 overflow-hidden">
      {[
        { glyph: item.icon, shown: !active },
        { glyph: item.activeIcon, shown: active },
      ].map(({ glyph, shown }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ inset: glyph.inset ?? 0 }}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={transitionFast}
        >
          <img src={glyph.src} alt="" aria-hidden className="block size-full max-w-none" />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * The bead on the Updates row: a 4px disc at (6, 6) of a 16px box, with the
 * file's two-layer specular shadow. It reads as a lit LED rather than a dot,
 * and at 4px the inset highlights are most of why.
 */
function UpdateBead() {
  return (
    <div className="relative size-[16px] shrink-0 overflow-hidden">
      <div
        className="absolute top-[6px] left-[6px] size-[4px] rounded-full bg-[red]"
        style={{
          boxShadow: [
            '0px 0px 1.521px 0px rgba(30, 62, 126, 0.2)',
            '0px 0.254px 0.507px 0px rgba(0, 0, 0, 0.2)',
            'inset 0px -0.22px 0.394px 0px rgba(0, 0, 0, 0.2)',
            'inset 0px 0.254px 0.254px 0px rgba(255, 255, 255, 0.35)',
            'inset 0px 0px 1.013px 0px rgba(255, 255, 255, 0.25)',
          ].join(', '),
        }}
      />
    </div>
  )
}

/**
 * One rail row: 191×32, an 8px inset, a 16px glyph and a 6px gap.
 *
 * The lit state is a single `layoutId` box shared by every row in the rail, so
 * selecting a different destination slides the fill there rather than
 * cross-fading two of them. The rows are spread across four separate stacks and
 * that still holds — Framer matches the id across the whole tree, not within a
 * parent.
 */
function NavRow({
  item,
  active,
  onSelect,
}: {
  item: NavItem
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      className="group relative flex w-full cursor-pointer items-center gap-[6px] rounded-[6px] p-[8px] text-left outline-none focus-visible:ring-2 focus-visible:ring-black/20"
    >
      {active && (
        <motion.div
          layoutId="nav-selected"
          transition={springSnap}
          className="absolute inset-0 rounded-[6px]"
          style={{ background: SELECTED }}
        />
      )}
      {/* Above the fill, and only on the rows that don't have it — a hover tint
          under the travelling box would read as a second selection. */}
      {!active && (
        <div className="absolute inset-0 rounded-[6px] bg-black/[0.035] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      )}
      <NavGlyph item={item} active={active} />
      <p
        className={`z-1 text-[14px] leading-[16px] font-medium tracking-[-0.28px] whitespace-nowrap transition-colors duration-150 ${
          item.badge ? 'min-w-px flex-1' : ''
        }`}
        style={{ color: active ? INK : MUTED }}
      >
        {item.label}
      </p>
      {item.badge && <UpdateBead />}
    </button>
  )
}

function Divider({ width }: { width: number | string }) {
  return <div className="h-px shrink-0" style={{ width, background: HAIRLINE }} />
}

/**
 * One onboarding row: a 24px accent disc, the copy, and the state on the right.
 *
 * Rows are 48px tall with one line of copy and 60px with two, and neither is
 * declared — both fall out of `py-[12px]` against the taller of the disc (24)
 * and the text block (36). The single-line row is the disc's height plus its
 * padding, exactly as the file measures it.
 */
function StepRow({ step, done, onComplete }: { step: Step; done: boolean; onComplete: () => void }) {
  const reduced = useReducedMotion()

  return (
    <button
      type="button"
      onClick={onComplete}
      disabled={done}
      className="group relative flex w-full items-center gap-[16px] py-[12px] pr-[32px] pl-[20px] text-left outline-none focus-visible:ring-2 focus-visible:ring-black/20 enabled:cursor-pointer"
    >
      {!done && (
        <div className="absolute inset-0 bg-black/[0.015] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      )}

      {/* The disc's 12%-black edge is an inset ring for the same reason the
          card's is: Figma strokes it inside, and a real border would push the
          16px glyph off centre by a pixel. */}
      <div
        className="relative z-1 size-[24px] shrink-0 rounded-full"
        style={{ background: step.accent, boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)' }}
      >
        <Icon glyph={step.icon} className="absolute top-[4px] left-[4px]" />
      </div>

      <div className="z-1 flex min-w-px flex-1 flex-col justify-center gap-[4px]">
        {/* 14px against the description's 12px. Leading deliberately stays at
            16px, which is the design's own spec for 14px single-line labels
            (the rail rows are 14/16/-0.28) — and it is what keeps every row's
            height unchanged: the two-line block stays 16+4+16=36, and the
            single-line row stays governed by the 24px disc beside it. Tracking
            follows the file's constant -0.02em, so 12px's -0.24 becomes -0.28. */}
        <p
          className="text-[14px] leading-[16px] font-medium tracking-[-0.28px] whitespace-nowrap"
          style={{ color: INK }}
        >
          {step.title}
        </p>
        {step.description && (
          <p
            className="text-[12px] leading-[16px] font-normal tracking-[-0.24px] whitespace-nowrap"
            style={{ color: MUTED }}
          >
            {step.description}
          </p>
        )}
      </div>

      {/* The two states swap in place. The spinner is the file's own `Loading`
          glyph — a broken ring, which is a drawing of something turning, so it
          turns. */}
      <div className="relative z-1 size-[24px] shrink-0 rounded-full">
        <AnimatePresence initial={false}>
          {done ? (
            <motion.img
              key="done"
              src={iconCheckCircle}
              alt=""
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={transitionFast}
              className="absolute top-[4px] left-[4px] size-[16px]"
            />
          ) : (
            <motion.img
              key="pending"
              src={iconLoading}
              alt=""
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: reduced ? 0 : 360 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: transitionFast,
                rotate: { duration: 1.4, repeat: Infinity, ease: 'linear' },
              }}
              className="absolute top-[4px] left-[4px] size-[16px]"
            />
          )}
        </AnimatePresence>
      </div>
      <span className="sr-only">{done ? 'Completed' : 'Mark as complete'}</span>
    </button>
  )
}

/**
 * One help tile: a 122px column with the disc pinned 20px from its top and the
 * label under it.
 *
 * The disc and the label offset both come from the file per tile — Guide is
 * drawn larger and lower than the other two.
 *
 * Nothing scales on hover. The discs are close enough together that growing one
 * reads as the row shifting rather than as the tile responding, and each disc's
 * drop shadow is baked into its own artboard — so a scaled tile also scales a
 * shadow that the two beside it are still drawing at rest.
 */
function HelpTile({ tile, width }: { tile: Tile; width: number }) {
  return (
    <button
      type="button"
      className="relative h-[122px] shrink-0 cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      style={{ width }}
    >
      <div
        className="absolute top-[20px] left-1/2 -translate-x-1/2"
        style={{ width: tile.disc, height: tile.disc }}
      >
        <div
          className="absolute"
          style={{
            top: `${TILE_BLEED.top * 100}%`,
            right: `${TILE_BLEED.right * 100}%`,
            bottom: `${TILE_BLEED.bottom * 100}%`,
            left: `${TILE_BLEED.left * 100}%`,
          }}
        >
          <img src={tile.art} alt="" aria-hidden className="block size-full max-w-none" />
        </div>
      </div>
      <p
        className="absolute left-1/2 -translate-x-1/2 text-[12px] leading-[16px] font-normal tracking-[-0.24px] whitespace-nowrap"
        style={{ top: tile.labelTop, color: MUTED }}
      >
        {tile.label}
      </p>
    </button>
  )
}

export function GetStarted() {
  const { ref, scale } = useFitScale(STAGE.width, STAGE.height)
  const [active, setActive] = useState(NAV_SECTIONS[0][0].label)
  const [completed, setCompleted] = useState<string[]>(
    STEPS.filter(s => s.done).map(s => s.id)
  )

  /* Get Started is the only destination the board specifies. Every other rail
     row carries the archetype its own content implies, and gets that frame
     rather than being left on this card. */
  const { ref: cardRef, height: cardHeight } = useMeasuredHeight<HTMLDivElement>()
  const ghost = destination(active).ghost
  const isGetStarted = !ghost

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: ease.smooth }}
      className="font-gabarito flex h-svh w-full items-center justify-center overflow-hidden"
      style={{ background: CANVAS }}
    >
      {/* ---- The artboard, 1470×1080 ---- */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ ...STAGE, background: CANVAS, transform: `scale(${scale})` }}
      >
        {/* ---- The app window, 1345×1080, 125px in from the artboard's left ---- */}
        <div className="absolute top-0 left-[125px] h-[1080px] w-[1345px] overflow-hidden bg-white">
          {/* ---- Rail, 223px ---- */}
          <div
            className="absolute top-0 left-0 h-[1080px] w-[223px] overflow-hidden"
            style={{ background: CANVAS }}
          >
            {/* Wordmark. `pl-[6px] pr-[4px]` inside a 191px box is what puts the
                mark at x=22 of the window and the toggle's right edge at 203. */}
            <div className="absolute top-[16px] left-[16px] flex w-[191px] items-center justify-between pr-[4px] pl-[6px]">
              <div className="flex shrink-0 items-center gap-[3px]">
                <BloomLogo size={20} />
                <p
                  className="text-[14px] font-medium tracking-[-0.21px] whitespace-nowrap text-black [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
                  style={{ fontFeatureSettings: '"salt" 1' }}
                >
                  Bloom<span className="text-[9.03px]">™</span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Collapse sidebar"
                className="shrink-0 cursor-pointer rounded-[4px] opacity-100 transition-opacity duration-150 hover:opacity-60 focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none"
              >
                <img src={iconSidebarToggle} alt="" aria-hidden className="block size-[16px]" />
              </button>
            </div>

            {/* The nav column is 977px tall and space-between, which is the only
                reason the bottom stack sits at y=924 — nothing pins it there. */}
            <nav
              aria-label="Workspace"
              className="absolute top-[68px] left-[16px] flex h-[977px] w-[191px] flex-col justify-between"
            >
              <div className="flex w-full shrink-0 flex-col items-start gap-[8px]">
                {NAV_SECTIONS.map((section, i) => (
                  <div key={i} className="contents">
                    {i > 0 && <Divider width={191} />}
                    <div className="flex w-full shrink-0 flex-col items-start gap-[4px]">
                      {section.map(item => (
                        <NavRow
                          key={item.label}
                          item={item}
                          active={active === item.label}
                          onSelect={() => setActive(item.label)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex w-full shrink-0 flex-col items-start gap-[16px]">
                <Divider width={191} />
                <div className="flex w-full shrink-0 flex-col items-start gap-[4px]">
                  {NAV_FOOTER.map(item => (
                    <NavRow
                      key={item.label}
                      item={item}
                      active={active === item.label}
                      onSelect={() => setActive(item.label)}
                    />
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* ---- Main column, 515 wide at x=464, y=192 ---- */}
          <div className="absolute top-[192px] left-[464px] w-[515px]">
            {/* One persistent card surface, and the height is a real animated
                property on it rather than a `layout` projection.

                That distinction is the whole reason this used to squirm.
                Framer's `layout` does not resize a box — it draws it at its new
                size and applies a *scale transform* to get there, so every child
                is squashed and stretched for the duration. Text, the hairlines
                and the 10px corners all distort together, which reads as a
                squishy box even though `springSnap` is critically damped and
                never overshoots by a single pixel. Nothing here was bouncing;
                the geometry was being deformed.

                Animating `height` instead costs a layout pass per frame and
                gives it back honestly: children sit at their natural size the
                whole way and only the card's bottom edge moves. The tiles below
                are in normal flow, so they ride that edge without needing any
                animation of their own.

                `overflow-hidden` clips the contents mid-travel, which is what a
                card should do — and it does not touch this element's own
                box-shadow, since a shadow paints outside the border box. */}
            <motion.div
              initial={false}
              animate={cardHeight == null ? undefined : { height: cardHeight }}
              transition={HEIGHT_MORPH}
              className="relative w-full overflow-hidden rounded-[10px] bg-white"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div ref={cardRef}>
                {/* `popLayout` still runs the two crossfades concurrently, so
                    the content change stays at 0.24s. It also pulls the outgoing
                    copy out of flow, which is what lets the measured height
                    below track the *incoming* frame from frame one. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  {isGetStarted ? (
                    <motion.div
                      key="get-started"
                      {...blurMorph}
                      className="relative flex w-full flex-col items-start py-[20px]"
                    >
                      <div className="flex w-full shrink-0 flex-col items-start gap-[8px]">
                        <div className="flex w-full shrink-0 flex-col items-start gap-[8px] px-[20px] pt-[4px] pb-[20px]">
                          <p
                            className="text-[16px] leading-[normal] font-medium tracking-[-0.32px]"
                            style={{ color: INK }}
                          >
                            Welcome to Bloom<span className="text-[10.32px]">™</span>
                          </p>
                          {/* 14px rather than the file's 12px. The two metrics that
                              travel with it are kept proportional rather than copied
                              from the design's other 14px style (the rail labels):
                              tracking stays at -0.02em, which is -0.28px here, and the
                              leading holds the paragraph's own 4:3 ratio at 19px. The
                              rail's 16px leading is a single-line label spec and would
                              read as cramped across three wrapped lines. */}
                          <p
                            className="w-[368px] text-[14px] leading-[19px] font-normal tracking-[-0.28px]"
                            style={{ color: MUTED }}
                          >
                            Start managing your workspace with ease. Set up your team, customize your
                            workflow, and unlock powerful collaboration tools in just a few steps.
                          </p>
                        </div>

                        <div className="flex w-full shrink-0 flex-col items-start gap-[8px]">
                          {STEPS.map(step => (
                            <div key={step.id} className="contents">
                              <Divider width="100%" />
                              <StepRow
                                step={step}
                                done={completed.includes(step.id)}
                                onComplete={() =>
                                  setCompleted(prev =>
                                    prev.includes(step.id) ? prev : [...prev, step.id]
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* The badge cluster, breaking out over the card's top-right
                          corner. Three copies of the mark at 32.74 / 17.33 / 22px, each
                          with its flower at a different angle. */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute top-[22px] left-[429px] h-[57px] w-[69px]"
                      >
                        {CLUSTER.map(gear => (
                          <BloomLogo
                            key={gear.size}
                            size={gear.size}
                            angle={gear.angle}
                            spin={{
                              // Period scales with diameter, so the small plates turn
                              // faster than the one driving them by exactly their size
                              // ratio — see CLUSTER.
                              seconds: GEAR_PERIOD * (gear.size / CLUSTER[0].size),
                              direction: gear.direction,
                            }}
                            className="absolute"
                            style={{ top: gear.top, left: gear.left }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key={active} {...blurMorph} className="w-full">
                      <GetStartedGhost title={active} layout={ghost} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ---- Help tiles ----
                Get Started's footer, not shell furniture, so they come and go
                with it. In flow under the card rather than inside it: the card
                clips its own contents, and these have to sit outside that clip
                while still following the edge as it travels. */}
            <AnimatePresence initial={false}>
              {isGetStarted && (
                <motion.div key="tiles" {...blurMorph} className="w-full pt-[40px]">
                  <div className="relative h-[122px] w-full shrink-0">
                    <div className="absolute top-0 left-1/2 flex -translate-x-1/2 items-center gap-[2px]">
                      {TILES.map((tile, i) => (
                        <HelpTile key={tile.label} tile={tile} width={i === 1 ? 159 : 158} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
