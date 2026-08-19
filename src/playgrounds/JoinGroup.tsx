import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { transitionFast, transitionSmooth, fadeBlurIn } from '../lib/motion'
import { SweepCanvas } from '../components/sweep'
import { useSweep } from '../components/sweep-context'
import { cn } from '../lib/utils'
import { GlowField } from '../components/GlowField'
import { CheckIcon, CopyIcon, LinkIcon } from '../components/icons'
import { LinkedInMark, WhatsAppMark, XMark } from '../components/social-marks'
import { celebrate } from '../lib/confetti'
import { X } from 'lucide-react'
import {
  ACCENTS,
  ACCESS,
  ACTION,
  CARD,
  COMMUNITY_ICONS,
  COPY,
  GLYPH,
  DEFAULT_ACCENT,
  DIM,
  EDGE,
  FEATURES,
  FIELD,
  LABEL,
  PILL,
  FORM_BACKDROP,
  LANDING_BACKDROP,
  SHARE_TARGETS,
  SWEEP_PALETTE,
  bannerTint,
  communityLink,
  communityUrl,
  grain,
  iconAddImage,
  iconColorPalette,
  iconDiscoverSearch,
  iconMedal,
  iconPencilNib,
  iconRocket,
  iconTickOff,
  iconTickOn,
  iconVideoGenerate,
  type AccessId,
  type BackdropSpec,
  type CommunityIcon,
  type Feature,
} from '../lib/joinGroup'

/**
 * Figma node 309:977, "Slide 16:9 - 20" — creating a community.
 *
 * The file is a 1920×1428 presentation slide, and almost none of that is the
 * design. One 558px column sits at x=680 with 682px of empty board to its
 * right: it is centred, and the artboard is a stage for it rather than a layout
 * it belongs to. So this does not reproduce the board the way `ChatView` does —
 * there is no fixed stage and no cover-scale, just a centred column on a black
 * page with the slide's two glows behind it.
 *
 * Two deliberate departures from the file, both consequences of that:
 *
 * - **The 60px lift is gone.** The column sits at y=124 in a 1428px board where
 *   centring would put it at 184 — a slide-composition nudge that leaves room
 *   under the content for a presentation frame. A page has no such frame.
 * - **The glows scale with the viewport,** since they are measured against the
 *   board's width and nothing else. They are pinned to a floor of 1200px so
 *   they do not evaporate on a phone.
 *
 * Everything inside the column is the file's own geometry, unscaled.
 *
 * The design is drawn in Retni Sans; per the brief this is set in Test Söhne
 * throughout, using the Breit cut for the one bold element (the title) rather
 * than synthesising a weight the family has no file for.
 *
 * Body copy runs at 14px rather than the file's 12px. Tracking moves with it:
 * the design holds a flat -0.02em at every size (-0.24px at 12, -0.32px at 16),
 * so 14px takes -0.28px. Leading that was authored as a Figma text-box height
 * became a ratio for the same reason — a 15px box is 1.25 line-heights at 12px
 * and a crush at 14px. The two that stayed in px, both `leading-4`, are set
 * against the 16px icon beside them rather than against the type.
 */

/* The design's stylistic set on the title — Söhne's single-storey `a` and
   straight-tailed `l`. Same alternates the Chat View's labels use. */
const SALT: CSSProperties = { fontFeatureSettings: '"salt" 1' }

/**
 * The backdrop's unit of measure: the slide's 1920px width, followed to the
 * viewport but never below 1200.
 *
 * Every glow dimension below is a fraction of this rather than a `vw` value, so
 * the two shapes keep their relationship to each other at any width — and the
 * floor stops them collapsing into a pair of smudges on a narrow screen, where
 * they are the only thing separating the page from flat black.
 */
const BOARD = 'max(1200px, 100vw)'
const board = (fraction: number) => `calc(${BOARD} * ${fraction})`

const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.09 } },
}

/**
 * A screen's atmosphere: two blurred washes and a grain plate over black. The
 * two screens differ only in the numbers, which live in `BackdropSpec`.
 *
 * The washes are drawn live by `GlowField` rather than placed as the file's two
 * exports, so they drift and fold instead of sitting still. The exports remain
 * as its fallback, and are still the reference for everything the field is
 * configured with — where the band sits, how strong it is, and the two colours,
 * which are one shape in two hues: magenta on the left, violet on the right.
 * They are not interchangeable, and a flipped copy of the left costs the
 * composition its violet half.
 *
 * The field renders *under* the blurred plate, which is what makes it cheap
 * enough to leave running — see `GlowField` for what that buys.
 *
 * The grain is composited normally, not with the `saturation` blend the file
 * asks for. That blend was tried and it is wrong here, for a reason worth
 * recording: the plate looks like white paper with dark specks in any image
 * viewer, but that is the viewer compositing it onto white. Measured, its RGB
 * never exceeds 28 and its alpha averages 7/255 — it is black grain on
 * transparency. A saturation blend takes the source's chroma, and black has
 * none, so every speck bleaches the wash under it. Composited normally the
 * same pixels simply darken, which is what grain is and what the Figma render
 * shows: full-strength magenta and violet with texture over them.
 *
 * Order matters and follows the file: Rectangle 232 sits above both washes, so
 * its blur, its lift and its grain all fall on the glows rather than under
 * them. The blur goes on the lift layer and not the grain, because a backdrop
 * filter only touches what is behind the element — the plate's own fills stay
 * sharp in Figma too, and blurring the grain would defeat the point of having
 * it.
 *
 * The 200px is doing real work on the landing, which is easy to talk yourself
 * out of: the form's washes are baked with a 200px gaussian and barely move
 * under a second pass, but the landing's are baked at 25, so this is what turns
 * two hard-edged blobs into the soft field the render shows. Same plate, same
 * number, opposite significance.
 */
function Backdrop({ spec }: { spec: BackdropSpec }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <GlowField
        {...spec.field}
        className="absolute inset-0 size-full"
        fallback={(['left', 'right'] as const).map(side => {
          const layer = spec[side]
          const box: CSSProperties = {
            [side]: board(spec.x),
            [spec.anchor]: board(spec.offset),
            width: board(spec.width),
            height: board(spec.height),
          }
          return (
            <div key={side} className="absolute" style={box}>
              <img
                src={layer.asset}
                alt=""
                className="absolute max-w-none"
                style={{
                  left: board(spec.bleed),
                  top: board(spec.bleed),
                  width: board(spec.imageWidth),
                  height: board(spec.imageHeight),
                  /* The bleed keeps the image concentric with its node, so a
                     transform about the image's centre is a transform about the
                     shape's. */
                  transform: layer.transform,
                }}
              />
            </div>
          )
        })}
      />
      <div
        className="absolute inset-0 backdrop-blur-[200px]"
        style={{ backgroundColor: spec.lift }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${grain})`, backgroundSize: '1024px 1024px' }}
      />
    </div>
  )
}

/**
 * The landing — node 314:3401. One button on a black page, over a glow band
 * that is the same pair of shapes flipped onto the bottom edge.
 *
 * The button sits at y=1076 of 1428, which is 22.8% of the board's height up
 * from the bottom measured to its centre. That is held as a fraction of the
 * viewport rather than of the board, unlike everything in the backdrop: the
 * glow is a wash whose proportions have to survive, but the button is a control
 * and wants to stay a thumb's reach off the bottom of whatever window it is in.
 *
 * The file's `drop-shadow` is a `box-shadow` here. On an opaque rounded rect
 * the two are indistinguishable, and `filter` is already spoken for by the
 * entrance — animating it would blow the shadow away mid-transition.
 */
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitionFast}
      className="font-sohne relative flex min-h-svh w-full items-end justify-center overflow-hidden bg-black px-6 pb-[120px]"
    >
      <Backdrop spec={LANDING_BACKDROP} />

      <motion.button
        type="button"
        onClick={onStart}
        variants={fadeBlurIn}
        initial="hidden"
        animate="visible"
        whileTap={{ scale: 0.98 }}
        className="relative flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] py-4 pr-7 pl-6"
        style={{ backgroundColor: ACTION, boxShadow: '0 0 16px rgba(0,0,0,0.32)' }}
      >
        <img src={iconRocket} alt="" className="size-5 shrink-0" />
        {/* The file sets this in Test Söhne Kräftig — normal width. The only
            bold Söhne cut in the project is Breit, which is the *extended*
            family and renders this label visibly wider than the design. So
            this asks the regular cut for weight 600 and takes the browser's
            synthetic bold: wrong weight rendering, right letterforms and
            widths, which is the closer of the two misses. Drop
            TestSohne-Kräftig into src/assets/fonts and this becomes real. */}
        <span
          className="font-sohne text-[16px] leading-[1.3] font-semibold tracking-[-0.32px] whitespace-nowrap text-white"
          style={SALT}
        >
          {COPY.getStarted}
        </span>
      </motion.button>
    </motion.div>
  )
}

type FieldProps = {
  label: string
  children: ReactNode
  /**
   * Air between the label and its control. The design sets 16px on all three
   * sections; the access rows and the feature grid have since been pulled in to
   * 8px, leaving the name field the only one still at the file's value. If it
   * follows them, this prop stops earning its keep — collapse it and set the
   * gap once on the wrapper.
   */
  gap?: string
}

/** A labelled section of the form: label, air, then the control. */
function Field({ label, children, gap = 'gap-4' }: FieldProps) {
  return (
    <div className={cn('flex flex-col', gap)}>
      <span
        className="text-[14px] leading-[1.25] tracking-[-0.28px]"
        style={{ color: LABEL }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

/**
 * The community's colour: a 32px chip with a pencil badge on its corner
 * (node 309:1007) that opens a twelve-swatch panel (node 313:3178).
 *
 * The badge was always the file asking for this — a chip that cycled on click
 * was the placeholder standing in until the panel existed.
 *
 * Every number here is absolute rather than a percentage, because the file
 * nests this four frames deep and the percentages only mean anything against
 * the frame they were authored in. Reading outwards: the palette glyph sits at
 * (2.406, 2.706) inside a 20×20 box that is itself at (6, 6), so it lands at
 * (8.406, 8.706) in the chip.
 *
 * The badge is the one that bites. Its node is 12×12 at (24, 24), but the
 * export is 27.16px square — Figma bakes the drop shadow into the artboard, so
 * more than half the file is transparent spread. Sizing the image to the node
 * would shrink the glyph to 44% and pull it up and left; instead the image gets
 * its own 27.16px box, offset back by the shadow's bleed. It overhangs the chip
 * on two sides and the field's bottom edge by 6px, all of it transparent, and
 * it is `pointer-events-none` so that overhang does not widen the hit target
 * into the text beside it.
 *
 * The badge's surround is exported filled with #1a1a1a, the field colour, so it
 * punches a hole in the chip rather than sitting on it. That only works while
 * this lives inside the name field.
 */
function AccentPicker({ accent, onSelect }: { accent: string; onSelect: (color: string) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  /* Same close contract as `MonthSelect` and `CurrencySelect`: pointer down
     anywhere outside the root, or Escape. Bound only while open. */
  useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative z-30 shrink-0">
      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        whileTap={{ scale: 0.9 }}
        transition={transitionFast}
        aria-label="Change community colour"
        className="relative block size-8 cursor-pointer"
      >
        <motion.span
          className="absolute inset-0 overflow-hidden rounded-[4px]"
          animate={{ backgroundColor: accent }}
          transition={transitionSmooth}
        >
          <img
            src={iconColorPalette}
            alt=""
            className="absolute max-w-none"
            style={{ left: 8.406, top: 8.706, width: 16.228, height: 14.588 }}
          />
        </motion.span>
        <img
          src={iconPencilNib}
          alt=""
          className="pointer-events-none absolute max-w-none"
          style={{ left: 16.421, top: 18.947, width: 27.158, height: 27.158 }}
        />
      </motion.button>

      {/* The panel — node 313:3178, 156×64 exactly: 8px of padding around two
          rows of six 20px cells, 4px between cells and 8px between rows. Drawn
          as one 6-column grid rather than the file's two row frames, since the
          asymmetric gaps say the same thing and there is nothing to hang off a
          row. Anchored under the swatch's left edge, 8px down — enough to clear
          the pencil badge, which hangs 4px below the swatch. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="listbox"
            aria-label="Community colour"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={transitionSmooth}
            /* Both the width and the track size are stated, and both have to
               be. The panel is absolutely positioned, so it shrink-to-fits
               against its containing block — the 32px swatch — and Tailwind's
               `grid-cols-6` is `repeat(6, minmax(0, 1fr))`, whose min-content
               is zero. Fractional tracks with nothing to divide collapse to
               32px and the 20px cells pile up on each other. Fixed 20px tracks
               give the grid a real min-content of 156, and the explicit width
               says the same number out loud. */
            className="absolute top-[calc(100%+8px)] left-0 grid w-[156px] origin-top-left grid-cols-[repeat(6,20px)] gap-x-1 gap-y-2 overflow-clip rounded-[5px] border p-2"
            style={{ backgroundColor: FIELD, borderColor: EDGE }}
          >
            {ACCENTS.map(color => {
              const isSelected = color === accent
              return (
                <button
                  key={color}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={color}
                  onClick={() => {
                    onSelect(color)
                    setOpen(false)
                  }}
                  /* The cell is 20px and the dot is 15, so the design leaves a
                     2.5px moat around every swatch and no selected state to put
                     in it. A 1px ring on the cell in the swatch's own colour is
                     what fits: it reads as a halo on the chosen dot without
                     introducing a colour the panel does not already contain. */
                  className="flex size-5 cursor-pointer items-center justify-center rounded-full outline-none"
                  style={{ boxShadow: isSelected ? `inset 0 0 0 1px ${color}` : undefined }}
                >
                  <motion.span
                    className="block size-[15px] rounded-full"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.12 }}
                    transition={transitionFast}
                  />
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type AccessRowProps = {
  option: (typeof ACCESS)[number]
  selected: boolean
  onSelect: () => void
}

/**
 * One access mode. The tick is two stacked exports cross-faded rather than one
 * recoloured glyph — the on state is a filled blue square with a white check
 * and the off state is an empty grey outline, so they are different drawings,
 * not two tints of the same one.
 */
function AccessRow({ option, selected, onSelect }: AccessRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      className="flex w-full cursor-pointer items-start gap-4 text-left"
    >
      {/* `items-start`, not centred: at 14px the public row's string is close
          enough to the 422px it has that a narrow viewport wraps it, and a
          centred icon would then float against a two-line block. With one line
          the two are identical — the text's 16px line box matches the icon. */}
      <span className="flex min-w-0 flex-1 items-start gap-2">
        <img src={option.icon} alt="" className="size-4 shrink-0" />
        <span
          className="min-w-0 flex-1 text-[14px] leading-4 tracking-[-0.28px]"
          style={{ color: DIM }}
        >
          <span className="text-white">{option.title}</span>
          {option.detail}
        </span>
      </span>
      <span className="relative size-4 shrink-0">
        <img src={iconTickOff} alt="" className="absolute inset-0 size-full" />
        <motion.img
          src={iconTickOn}
          alt=""
          initial={false}
          animate={{ opacity: selected ? 1 : 0 }}
          transition={transitionFast}
          className="absolute inset-0 size-full"
        />
      </span>
    </button>
  )
}

type FeatureTileProps = {
  feature: Feature
  accent: string
  on: boolean
  onToggle: () => void
}

/**
 * A feature tile. The design draws all six in one resting state, so that is
 * what an untouched screen shows; picking one lights its edge in the community's
 * colour and brings the label up to white, which is the only pair of properties
 * in the tile that can carry a selection without redrawing it.
 */
function FeatureTile({ feature, accent, on, onToggle }: FeatureTileProps) {
  const box = feature.box ?? { width: 24, height: 24 }

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      whileTap={{ scale: 0.98 }}
      animate={{ borderColor: on ? accent : EDGE, color: on ? '#ffffff' : LABEL }}
      transition={transitionFast}
      className="relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-5 rounded-[5px] border p-4"
      style={{ backgroundColor: FIELD }}
    >
      {/* Fixed 24px cell with the glyph centred inside it, rather than the glyph
          sizing the row: three of the six exports are not 24×24, and letting
          them set their own height puts the labels on three different lines. */}
      <span className="flex size-6 shrink-0 items-center justify-center">
        <img src={feature.icon} alt="" className="max-w-none" style={box} />
      </span>
      {/* 14px, like every other string on the page — the file sets these at 10,
          which is the one place it drops below body size. Leading stays the
          file's 1.3 ratio and tracking follows the size to -0.28px, and the two
          longest labels now take a second line, which is what `min-h` and the
          grid's equal-height rows were already there to absorb. */}
      <span className="text-center text-[14px] leading-[1.3] tracking-[-0.28px]">
        {feature.label}
      </span>
      {feature.premium && (
        <span className="absolute top-[10px] right-[10px] h-4 w-3">
          <img
            src={iconMedal}
            alt=""
            className="absolute max-w-none"
            style={{ left: 1.6, top: 1.28, width: 8.787, height: 13.441 }}
          />
        </span>
      )}
    </motion.button>
  )
}

/**
 * The form — node 309:977, everything after "Get Started".
 *
 * Holds its own state rather than taking it from the parent, which is what
 * makes "Restart onboarding" a single line: `AnimatePresence` unmounts this on
 * the way back to the landing, so coming forward again mounts a fresh form.
 * There is nothing to clear by hand, and no way for a field to survive a
 * restart because someone forgot to add it to a reset function.
 */
/**
 * A community glyph, at whatever size and ink it is asked for.
 *
 * One renderer for the avatar and the tray, because the two have to agree: the
 * tile is a preview of what the avatar will become, and a preview drawn by
 * different code is a preview that can lie.
 *
 * Both branches produce a *solid* shape. The lucide icons are filled rather
 * than stroked — `fill` and `stroke` on the same colour, with the stroke kept
 * thin so it firms the silhouette's edge instead of thickening it — because the
 * file's own reel is a filled glyph and an outline sitting where it used to be
 * reads as a different class of thing.
 */
function CommunityGlyph({
  icon,
  size,
  ink,
}: {
  icon: CommunityIcon
  size: number
  ink: string
}) {
  const { src, Glyph } = icon
  if (src) {
    /* Masked, not `<img>`. The export bakes its fill in, so an `<img>` can only
       ever be `GLYPH` — right on the accent square it was drawn for, and all but
       invisible on a `FIELD` tray tile. A mask keeps the shape and takes the
       colour from underneath it. */
    return (
      <span
        aria-hidden
        style={{
          display: 'block',
          width: size,
          height: size,
          backgroundColor: ink,
          maskImage: `url(${src})`,
          WebkitMaskImage: `url(${src})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    )
  }
  /* Unreachable — the union has no third case — but `src` is a `string`, not a
     unit type, so it cannot discriminate and TypeScript will not narrow past
     the branch above on its own. */
  if (!Glyph) return null
  return <Glyph size={size} fill={ink} color={ink} strokeWidth={1.25} />
}

/** Wired to the trigger's `aria-controls`, so the two have to agree on it. */
const TRAY_ID = 'join-group-icon-tray'

/** Eight across, three down — see `COMMUNITY_ICONS` for why twenty-four. */
const TRAY_COLUMNS = 8

/**
 * The icon picker — a tray that rises from the bottom of the screen.
 *
 * Built out of the form's own parts rather than a new surface: `CARD` over the
 * page, `FIELD` tiles with `EDGE` borders, the 10px radius the form card uses
 * and the 5px the fields use, `LABEL` for the heading. The one thing it adds is
 * the accent, and only on the chosen tile — which makes the selection read as
 * the same colour decision the swatch picker above it makes, rather than as a
 * second highlight colour the screen has to learn.
 *
 * A radiogroup, because that is what it is: twenty-four options, exactly one
 * chosen, and the choice takes effect immediately. Roving tabindex so the grid
 * is one tab stop, with the arrows walking it in two dimensions — left and
 * right by one, up and down by a row — because a 3×8 grid navigated as a flat
 * list of 24 is a grid in name only.
 */
function IconTray({
  ref,
  chosen,
  accent,
  onChoose,
  onClose,
  labelledBy,
}: {
  /** React 19 passes `ref` as an ordinary prop, so no `forwardRef` wrapper. */
  ref: Ref<HTMLDivElement>
  chosen: CommunityIcon
  accent: string
  onChoose: (icon: CommunityIcon) => void
  onClose: () => void
  labelledBy: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = COMMUNITY_ICONS.findIndex(i => i.id === chosen.id)

  /* Focus opens on the current choice, not on the first tile: the tray exists
     to change a value that already has one, and landing on Film every time
     would make the arrows measure from somewhere the user did not leave off. */
  useEffect(() => {
    refs.current[Math.max(0, index)]?.focus()
    // Mount only — refocusing on every change would fight the click that caused
    // it, and the arrow keys already move focus themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const move = (from: number, delta: number) => {
    const next = Math.min(COMMUNITY_ICONS.length - 1, Math.max(0, from + delta))
    if (next === from) return
    onChoose(COMMUNITY_ICONS[next])
    refs.current[next]?.focus()
  }

  return (
    <motion.div
      ref={ref}
      id={TRAY_ID}
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
      /* Fixed, not absolute. The form screen is `min-h-svh` and grows with its
         content, so a tray anchored to the bottom of *that* would sit below the
         fold on a short window. The viewport is the thing it is a tray of. */
      /* Hung under the trigger rather than floated at the bottom of the
         window: the button is at the top-right of the banner, and a tray that
         opens two hundred pixels away from the thing that opened it makes the
         eye go looking. Right edges aligned, 8px below — so it reads as the
         button unfolding.
         Narrower than the 558px form it serves, which the accent picker already
         establishes as this screen's idea of a chooser: a small object over the
         thing it edits, not a second panel the width of it. 420 also lands the
         tiles at 41.5px, the scale of the form's own 48px fields and 32px
         swatch. */
      className="absolute top-[106px] right-4 z-30 w-[420px] max-w-full origin-top-right rounded-[10px] border p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
      style={{ backgroundColor: CARD, borderColor: EDGE }}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={transitionSmooth}
    >
      <div className="mb-3 flex items-center justify-between">
        <p
          id={labelledBy}
          className="text-[14px] leading-[1.0008] tracking-[-0.28px]"
          style={{ color: LABEL }}
        >
          {COPY.iconTrayTitle}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={COPY.iconTrayClose}
          className="flex size-6 cursor-pointer items-center justify-center rounded-[5px] border transition-colors"
          style={{ backgroundColor: FIELD, borderColor: EDGE }}
        >
          <X size={14} color={LABEL} />
        </button>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${TRAY_COLUMNS}, minmax(0, 1fr))` }}
      >
        {COMMUNITY_ICONS.map((item, i) => {
          const selected = item.id === chosen.id
          return (
            <button
              key={item.id}
              ref={node => {
                refs.current[i] = node
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={item.label}
              // One tab stop for the whole grid; the arrows do the rest.
              tabIndex={selected ? 0 : -1}
              onClick={() => onChoose(item)}
              onKeyDown={event => {
                const delta =
                  event.key === 'ArrowRight'
                    ? 1
                    : event.key === 'ArrowLeft'
                      ? -1
                      : event.key === 'ArrowDown'
                        ? TRAY_COLUMNS
                        : event.key === 'ArrowUp'
                          ? -TRAY_COLUMNS
                          : 0
                if (!delta) return
                event.preventDefault()
                move(i, delta)
              }}
              className="flex aspect-square cursor-pointer items-center justify-center rounded-[5px] border transition-colors"
              style={{
                // The chosen tile wears the community's own accent, so picking
                // an icon and picking a colour read as one decision.
                backgroundColor: selected ? accent : FIELD,
                borderColor: selected ? accent : EDGE,
              }}
            >
              <CommunityGlyph icon={item} size={18} ink={selected ? GLYPH : LABEL} />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function CommunityForm({
  onRestart,
  onCreate,
}: {
  onRestart: () => void
  onCreate: (community: Community) => void
}) {
  const [name, setName] = useState('')
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT)
  const [access, setAccess] = useState<AccessId>('private')
  const [picked, setPicked] = useState<string[]>([])
  const [created, setCreated] = useState(false)
  /** The avatar's glyph, and whether the picker is open. The icon is held as
   *  the entry rather than an index, so nothing downstream has to know the
   *  list's order to render it. */
  const [chosen, setChosen] = useState<CommunityIcon>(COMMUNITY_ICONS[0])
  const [trayOpen, setTrayOpen] = useState(false)
  const trayRef = useRef<HTMLDivElement>(null)
  const trayTriggerRef = useRef<HTMLButtonElement>(null)
  const trayLabelId = useId()

  /**
   * Escape and outside-press close the tray.
   *
   * `pointerdown` in the capture phase rather than `click`, so a press that
   * lands on the form behind dismisses the tray *and* still reaches whatever it
   * was aimed at — one gesture, both outcomes. The trigger is excluded because
   * it toggles, and would otherwise be closed here and reopened by its own
   * handler in the same press.
   */
  useEffect(() => {
    if (!trayOpen) return

    const close = () => {
      setTrayOpen(false)
      trayTriggerRef.current?.focus()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (trayRef.current?.contains(target)) return
      if (trayTriggerRef.current?.contains(target)) return
      // No focus return here: the pointer has already chosen where to go, and
      // yanking focus back to the trigger would fight it.
      setTrayOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [trayOpen])

  const toggle = (id: string) =>
    setPicked(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))

  /* The label flips and stays flipped: the screen is already leaving under the
     sweep, and a button that says "Create community" again on its way out reads
     as the click having been undone. `created` is also the guard against a
     second submit landing mid-transition. */
  const submit = () => {
    if (created) return
    setCreated(true)
    onCreate({ name, accent })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitionFast}
      className="font-sohne relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black px-6 py-16 pt-[16px]"
    >
      <Backdrop spec={FORM_BACKDROP} />

      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="relative flex w-[558px] max-w-full flex-col items-center gap-10"
      >
        {/* ---- Header ---- */}
        {/* Full column width, not the file's 430px. The blurb below is set to
            499px, which a 430px parent silently clamps back to 430 via its own
            `max-w-full` — so the header has to open up or the width is inert.
            Nothing else in here is affected: the icon is a fixed 48px and the
            title is a centred single line. */}
        <motion.header
          variants={fadeBlurIn}
          className="flex w-full flex-col items-center gap-3"
        >
          <div
            className="size-12 shrink-0 overflow-hidden rounded-full"
            style={{ backgroundColor: ACTION }}
          >
            <img src={iconVideoGenerate} alt="" className="m-3 size-6" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1
              className="font-sohne-breit text-[16px] leading-[1.2] tracking-[-0.32px] text-white"
              style={SALT}
            >
              {COPY.title}
            </h1>
            <p
              className="w-[499px] max-w-full text-[14px] leading-[1.7] tracking-[-0.28px]"
              style={{ color: LABEL }}
            >
              {COPY.blurb}
            </p>
          </div>
        </motion.header>

        {/* ---- The form ---- */}
        <motion.div
          variants={fadeBlurIn}
          className="flex w-full flex-col gap-10 rounded-[10px] p-6"
          style={{ backgroundColor: CARD }}
        >
          {/* Banner. 85px tall with a 50px avatar dropped at y=55, so 20px of it
              hangs into the 40px gap below — that overhang is the composition,
              and clipping it would sit the avatar in a box. */}
          <div className="relative h-[85px] shrink-0">
            <motion.div
              className="absolute inset-0 rounded-[5px]"
              animate={{ backgroundColor: bannerTint(accent) }}
              transition={transitionSmooth}
            />
            <motion.div
              className="absolute top-[55px] left-4 size-[50px] rounded-[6.25px]"
              animate={{ backgroundColor: accent }}
              transition={transitionSmooth}
              /* An outside ring rather than a border: the design's 2.5px stroke
                 is centred on a 50px box whose contents are already placed
                 against 50, so a real border would shrink the glyph's frame. */
              style={{ boxShadow: `0 0 0 2.5px ${CARD}` }}
            >
              {/* The two glyphs have to overlap rather than take turns — a
                  `wait` would empty the avatar for a beat and leave a bare
                  accent square. The box is the file's own 21.875px at its own
                  offset; only what is drawn inside it has changed. */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={chosen.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={transitionFast}
                  className="absolute"
                  style={{ left: 14.0625, top: 14.0625, width: 21.875, height: 21.875 }}
                >
                  <CommunityGlyph icon={chosen} size={21.875} ink={GLYPH} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Node 328:23366 — "Change Icon".
                16px in from the banner's right edge, which is the avatar's own
                inset on the left, so the two are hung on the same margin. And
                72px down, which puts it inside the band the avatar occupies
                rather than on the banner proper — the avatar overhangs the
                bottom edge by 20px and this overhangs by 13, so they read as one
                row. That pairing is the point: this is the control for that
                glyph, and sitting level with it says so without a label. */}
            <button
              ref={trayTriggerRef}
              type="button"
              onClick={() => setTrayOpen(open => !open)}
              aria-expanded={trayOpen}
              aria-controls={TRAY_ID}
              className="absolute top-[72px] right-4 flex cursor-pointer items-center gap-1 rounded-[5px] border px-1.5 py-1 transition-colors"
              style={{
                backgroundColor: trayOpen ? EDGE : FIELD,
                borderColor: EDGE,
              }}
            >
              <img src={iconAddImage} alt="" className="size-4 shrink-0" />
              <span
                className="text-[14px] leading-[1.0008] tracking-[-0.28px] whitespace-nowrap"
                style={{ color: LABEL }}
              >
                {COPY.changeIcon}
              </span>
            </button>

            {/* Inside the banner, because that is what it is positioned
                against: the banner is the nearest `relative` ancestor, so the
                tray's `top`/`right` are measured from the same box the trigger's
                are. Mounted here rather than at the screen level for that reason
                alone — nothing about the tray belongs to the banner otherwise. */}
            <AnimatePresence>
              {trayOpen && (
                <IconTray
                  ref={trayRef}
                  chosen={chosen}
                  accent={accent}
                  labelledBy={trayLabelId}
                  onChoose={setChosen}
                  onClose={() => {
                    setTrayOpen(false)
                    trayTriggerRef.current?.focus()
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-8">
            <Field label={COPY.nameLabel}>
              {/* Still 48px tall, but the padding halved to 8 and the gap
                  widened to 12 when the swatch grew to 32 — 8 + 32 + 8 is the
                  same field with a bigger control in it. */}
              <div
                className="flex h-12 w-full items-center gap-3 rounded-[5px] border p-2"
                style={{ backgroundColor: FIELD, borderColor: EDGE }}
              >
                <AccentPicker accent={accent} onSelect={setAccent} />
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder={COPY.namePlaceholder}
                  aria-label={COPY.nameLabel}
                  className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.25] tracking-[-0.28px] text-white outline-none placeholder:text-[#898989]"
                />
              </div>
            </Field>

            <Field label={COPY.accessLabel} gap="gap-2">
              <div
                role="radiogroup"
                aria-label={COPY.accessLabel}
                className="flex w-full flex-col rounded-[5px] border p-4"
                style={{ backgroundColor: FIELD, borderColor: EDGE }}
              >
                {ACCESS.map((option, index) => (
                  <Fragment key={option.id}>
                    {index > 0 && (
                      <div className="my-6 h-px shrink-0" style={{ backgroundColor: EDGE }} />
                    )}
                    <AccessRow
                      option={option}
                      selected={access === option.id}
                      onSelect={() => setAccess(option.id)}
                    />
                  </Fragment>
                ))}
              </div>
            </Field>

            <Field label={COPY.featuresLabel} gap="gap-2">
              <div className="grid w-full grid-cols-3 gap-2">
                {FEATURES.map(feature => (
                  <FeatureTile
                    key={feature.id}
                    feature={feature}
                    accent={accent}
                    on={picked.includes(feature.id)}
                    onToggle={() => toggle(feature.id)}
                  />
                ))}
              </div>
            </Field>
          </div>

          <motion.button
            type="button"
            onClick={submit}
            whileTap={{ scale: 0.98 }}
            transition={transitionFast}
            className="flex h-[47px] w-full shrink-0 cursor-pointer items-center justify-center rounded-[5px] px-6 text-[14px] leading-[1.25] tracking-[-0.28px] text-white"
            style={{ backgroundColor: ACTION }}
          >
            {/* `mode="wait"` so the two labels never overlap in a box that is
                exactly one line tall. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={created ? 'done' : 'idle'}
                variants={fadeBlurIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={transitionFast}
              >
                {created ? COPY.submitted : COPY.submit}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* ---- Restart ---- */}
        <motion.button
          variants={fadeBlurIn}
          type="button"
          onClick={onRestart}
          whileTap={{ scale: 0.98 }}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-[5px] p-2"
          style={{ backgroundColor: PILL }}
        >
          <img src={iconDiscoverSearch} alt="" className="size-4 shrink-0" />
          {/* Hugs, rather than sitting in Figma's 100px text box. That width is
              measured in Retni Sans and the string is wider than it in Söhne, so
              carrying it over wrapped the label onto a second line. The trailing
              8px is the design's own — 8px before the icon and 16px after the
              text, which is the balance a leading glyph wants. */}
          <span
            className="pr-2 whitespace-nowrap text-[14px] leading-4 tracking-[-0.28px]"
            style={{ color: LABEL }}
          >
            {COPY.restart}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/** What the form hands forward: everything the third screen needs to say. */
type Community = { name: string; accent: string }

type Stage = 'landing' | 'form' | 'created'

/** The three marks, by the id their share target carries. */
const MARKS = { x: XMark, linkedin: LinkedInMark, whatsapp: WhatsAppMark } as const

/**
 * The third screen — the community exists, here is its address.
 *
 * Not in the file, which draws the landing and the form and stops at the button.
 * It is built out of what the form already established so it reads as the same
 * product rather than a success page bolted on: the same 558px column, the same
 * header shape (48px badge, Breit title, dimmed line), the same card, and the
 * community's own accent on the badge and the copy button — the colour the
 * creator picked two screens ago is what confirms this one is theirs.
 *
 * The link is shown without its scheme and copied with it. What is on screen is
 * for reading; what lands on the clipboard has to be pasteable.
 */
function CommunityCreated({
  community,
  onRestart,
}: {
  community: Community
  onRestart: () => void
}) {
  const { name, accent } = community
  const url = communityUrl(name)
  const label = name.trim() || COPY.created.fallbackName
  const [copied, setCopied] = useState(false)

  /* The screen mounts *under* the sweep band — that is the whole point of the
     midpoint swap — so firing immediately would spend the opening burst behind
     it. 260ms is the band clearing the frame. */
  useEffect(() => {
    let stop = () => { }
    const timer = window.setTimeout(() => {
      stop = celebrate([accent, LANDING_BACKDROP.field.colorA, LANDING_BACKDROP.field.colorB, '#ffffff'])
    }, 260)

    return () => {
      window.clearTimeout(timer)
      stop()
    }
  }, [accent])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    /* The clipboard is permissioned and can simply refuse — an insecure origin,
       a denied prompt. Failing quietly leaves the label alone, which is honest:
       nothing was copied, so nothing should say it was. */
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitionFast}
      className="font-sohne relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black px-6 py-16"
    >
      <Backdrop spec={FORM_BACKDROP} />

      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="relative flex w-[558px] max-w-full flex-col items-center gap-10"
      >
        {/* ---- Header ---- */}
        <motion.header variants={fadeBlurIn} className="flex w-full flex-col items-center gap-3">
          {/* `ACTION`, not the community's accent — the same blue the form's
              own header badge and its submit button wear.
              The accent is the thing being created; this badge is the platform
              telling you it worked. Dressing the confirmation in the user's own
              colour made the two indistinguishable, and it also meant the one
              element on the page whose job is to read as *system* changed hue
              depending on a choice made two screens earlier.
              A plain `div` now: the colour is a constant, so there is nothing
              left for `animate` to animate. */}
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: ACTION }}
          >
            <span className="[&>svg]:size-6">
              <CheckIcon />
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1
              className="font-sohne-breit text-[16px] leading-[1.2] tracking-[-0.32px] text-white"
              style={SALT}
            >
              {COPY.created.title}
            </h1>
            <p
              className="w-[499px] max-w-full text-[14px] leading-[1.7] tracking-[-0.28px]"
              style={{ color: LABEL }}
            >
              {COPY.created.blurb}
            </p>
          </div>
        </motion.header>

        {/* ---- The link, and where to send it ---- */}
        <motion.div
          variants={fadeBlurIn}
          className="flex w-full flex-col gap-8 rounded-[10px] p-6"
          style={{ backgroundColor: CARD }}
        >
          <Field label={COPY.created.linkLabel} gap="gap-2">
            <div className="flex w-full items-center gap-2">
              {/* Same 48px field the name input uses, so the link sits in the
                  box the creator typed the name into a screen ago. */}
              <div
                className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-[5px] border px-3"
                style={{ backgroundColor: FIELD, borderColor: EDGE }}
              >
                <span className="shrink-0" style={{ color: LABEL }}>
                  <LinkIcon />
                </span>
                {/* `truncate` from the tail end: a long slug should lose its
                    middle-of-the-name characters, never the host. */}
                <span className="min-w-0 flex-1 truncate text-[14px] leading-[1.25] tracking-[-0.28px] text-white">
                  {communityLink(name)}
                </span>
              </div>

              <motion.button
                type="button"
                onClick={copy}
                whileTap={{ scale: 0.98 }}
                transition={transitionFast}
                aria-label={copied ? COPY.created.copied : COPY.created.copy}
                className="relative flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-[5px] px-5 text-[14px] leading-[1.25] tracking-[-0.28px] whitespace-nowrap text-white"
                style={{ backgroundColor: ACTION }}
              >
                {/* The button holds its own width, because otherwise pressing it
                    moves it. "Link copied" is wider than "Copy link", and the
                    button is sized by its content, so the swap resized it — and
                    the link field beside it is `flex-1`, so the whole row
                    re-truncated on a click that was only ever meant to change a
                    label. `mode="wait"` made it worse again: with the outgoing
                    label unmounted before the incoming one arrives, the box
                    collapsed to its bare padding in between.

                    So: both states stacked in one grid cell, invisible, holding
                    the box open at the wider of the two. Nothing here is
                    measured or hard-coded — the sizer *is* the labels, so it
                    cannot fall out of step with them. */}
                <span aria-hidden className="invisible grid">
                  <span className="col-start-1 row-start-1 flex items-center gap-2">
                    <CopyIcon />
                    {COPY.created.copy}
                  </span>
                  <span className="col-start-1 row-start-1 flex items-center gap-2">
                    <CheckIcon />
                    {COPY.created.copied}
                  </span>
                </span>

                {/* Overlapping rather than waiting, now that the box is fixed
                    and they can share it: the two labels cross-fade in place,
                    which is the same morph the rest of the playground uses and
                    leaves no frame with an empty button in it. */}
                <AnimatePresence initial={false}>
                  <motion.span
                    key={copied ? 'copied' : 'idle'}
                    variants={fadeBlurIn}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={transitionFast}
                    className="absolute inset-0 flex items-center justify-center gap-2"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? COPY.created.copied : COPY.created.copy}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </Field>

          {/* The three, as one control rather than three buttons in a row: a
              single bordered box with hairlines between the cells, which is how
              the access rows are grouped upstairs. */}
          <div className="flex w-full flex-col items-center gap-3">
            <span
              className="text-[14px] leading-[1.25] tracking-[-0.28px]"
              style={{ color: LABEL }}
            >
              {COPY.created.shareLabel}
            </span>
            <div
              className="flex overflow-hidden rounded-[5px] border"
              style={{ backgroundColor: FIELD, borderColor: EDGE }}
            >
              {SHARE_TARGETS.map((target, index) => {
                const Mark = MARKS[target.id]
                return (
                  <Fragment key={target.id}>
                    {index > 0 && (
                      <div className="w-px shrink-0" style={{ backgroundColor: EDGE }} />
                    )}
                    <motion.a
                      href={target.href(url, label)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={target.label}
                      title={target.label}
                      whileHover={{ color: '#ffffff' }}
                      whileTap={{ scale: 0.94 }}
                      transition={transitionFast}
                      className="flex size-12 cursor-pointer items-center justify-center"
                      style={{ color: LABEL }}
                    >
                      <Mark className="size-[18px]" />
                    </motion.a>
                  </Fragment>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* ---- Restart ---- */}
        <motion.button
          variants={fadeBlurIn}
          type="button"
          onClick={onRestart}
          whileTap={{ scale: 0.98 }}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-[5px] p-2"
          style={{ backgroundColor: PILL }}
        >
          <img src={iconDiscoverSearch} alt="" className="size-4 shrink-0" />
          <span
            className="pr-2 whitespace-nowrap text-[14px] leading-4 tracking-[-0.28px]"
            style={{ color: LABEL }}
          >
            {COPY.restart}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/**
 * The onboarding, in three screens: the landing, the form, then the community.
 *
 * `mode="wait"` rather than a crossfade. The two screens are the same black
 * page with the glow band at opposite ends, so overlapping them slides one
 * band past the other through the middle of the frame — which reads as a
 * mistake rather than a transition. Letting the first leave before the second
 * arrives keeps the glow where each screen puts it.
 */
export function JoinGroup() {
  const [stage, setStage] = useState<Stage>('landing')
  /* Lives here rather than in the form, because the form is the thing being
     unmounted when this is needed. */
  const [community, setCommunity] = useState<Community>({ name: '', accent: DEFAULT_ACCENT })
  const sweep = useSweep()

  /**
   * The screen change rides a glimm band rather than happening on its own.
   *
   * Direction follows the glow. The landing hangs its light off the bottom
   * edge and the form hangs the same two shapes off the top, so going forward
   * is the band carrying that light up the page ('btt') and restarting is it
   * setting back down ('ttb'). A left-to-right sweep would cross both bands
   * sideways and read as unrelated to either screen. The created screen keeps
   * the form's backdrop, so form → created is more of the same climb.
   *
   * `setStage` runs at the band's midpoint, under the brightest part of it —
   * which is also what makes `mode="wait"` survive here. The two screens cross
   * fade through black for 280ms each way, and that swap now happens behind
   * the band instead of in the open.
   */
  const go = (next: Stage) =>
    sweep(() => setStage(next), {
      palette: SWEEP_PALETTE,
      direction: next === 'landing' ? 'ttb' : 'btt',
      // The band is a cut, not a scene. `easeInOutQuint` spends the middle
      // of that budget fast and softens only the entry and exit, so the
      // crossing itself is the quick part — an ease-out curve would whip
      // the band in and then leave it crawling through the last tenth of
      // its travel, which reads as slower than a longer linear sweep.
      sweepMs: 420,
      outroMs: 220,
      easing: 'easeInOutQuint',
      // glimm tests this against *eased* progress, not elapsed time. 0.5 is
      // the band over the middle of the frame, and quint is symmetric, so
      // that is also the halfway point in wall-clock — the swap lands under
      // the brightest part of the band with the outro as its tail.
      midpoint: 0.5,
      // Pure black under two saturated hues: full brightness blows the
      // crest out to white. `bandTight` is the gaussian's falloff, so lower
      // is wider — 18 against the house 24 keeps the band broad enough to
      // still be covering the frame while the two screens cross-fade.
      brightness: 0.85,
      bandTight: 18,
    })

  return (
    /* Stable parent for the sweep canvas: `SweepCanvas` mounts absolutely
       inside it, so it has to outlive the screen being swapped out. */
    <div className="relative flex min-h-svh w-full flex-col">
      <AnimatePresence mode="wait">
        {stage === 'landing' ? (
          <Landing key="landing" onStart={() => go('form')} />
        ) : stage === 'form' ? (
          <CommunityForm
            key="form"
            onRestart={() => go('landing')}
            onCreate={next => {
              /* Set before the sweep, not at its midpoint: the form is still on
                 screen and nothing reads this until the next one mounts. */
              setCommunity(next)
              go('created')
            }}
          />
        ) : (
          <CommunityCreated key="created" community={community} onRestart={() => go('landing')} />
        )}
      </AnimatePresence>

      <SweepCanvas />
    </div>
  )
}
