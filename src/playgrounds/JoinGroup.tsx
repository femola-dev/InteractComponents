import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { transitionFast, transitionSmooth, fadeBlurIn } from '../lib/motion'
import { cn } from '../lib/utils'
import {
  ACCENTS,
  ACCESS,
  ACTION,
  CARD,
  COPY,
  DEFAULT_ACCENT,
  DIM,
  EDGE,
  FEATURES,
  FIELD,
  LABEL,
  PILL,
  bannerTint,
  glow,
  grain,
  iconColorPalette,
  iconDiscoverSearch,
  iconMedal,
  iconMovieReel,
  iconPencilNib,
  iconTickOff,
  iconTickOn,
  iconVideoGenerate,
  type AccessId,
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

/** Fractions of the board, straight off the file's coordinates. */
const GLOW = {
  x: -56 / 1920,
  y: -64 / 1920,
  width: 1065 / 1920,
  height: 510 / 1920,
  /* The shape carries a 200px gaussian, so the exported SVG is 400px larger
     than its node on every side. Both numbers travel together or the blur
     crops. */
  bleed: -400 / 1920,
  imageWidth: 1865 / 1920,
  imageHeight: 1310 / 1920,
} as const

const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.09 } },
}

/**
 * The slide's atmosphere: two mirrored magenta washes across the top, and a
 * grain plate over the whole page.
 *
 * The grain is composited with `saturation`, which is what the file specifies
 * and reads as the wrong choice until you see what it does here. The plate is
 * near-white with sparse dark specks; a saturation blend takes only the
 * source's chroma, so white pixels strip the wash to grey and the specks let it
 * through. The result is not a lightening — it is a mottled, half-desaturated
 * glow, which is exactly the texture in the Figma render.
 *
 * The file also puts a 200px backdrop blur on this plate. That is dropped: the
 * glows underneath are already a 200px gaussian, so the second pass moves
 * almost nothing while costing a full-viewport backdrop filter on every paint.
 */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {(['left', 'right'] as const).map(side => (
        <div
          key={side}
          className="absolute"
          style={{
            [side]: board(GLOW.x),
            top: board(GLOW.y),
            width: board(GLOW.width),
            height: board(GLOW.height),
          }}
        >
          <img
            src={glow}
            alt=""
            className="absolute max-w-none"
            style={{
              left: board(GLOW.bleed),
              top: board(GLOW.bleed),
              width: board(GLOW.imageWidth),
              height: board(GLOW.imageHeight),
              /* One asset, mirrored — the file draws the right-hand wash as a
                 flipped copy of the left. */
              transform: side === 'right' ? 'scaleX(-1)' : undefined,
            }}
          />
        </div>
      ))}
      <div
        className="absolute inset-0 mix-blend-saturation"
        style={{ backgroundImage: `url(${grain})`, backgroundSize: '1024px 1024px' }}
      />
    </div>
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
      <span className="text-center text-[10px] leading-[13px] tracking-[-0.2px]">
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

export function JoinGroup() {
  const [name, setName] = useState('')
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT)
  const [access, setAccess] = useState<AccessId>('private')
  const [picked, setPicked] = useState<string[]>([])
  const [created, setCreated] = useState(false)

  const toggle = (id: string) =>
    setPicked(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))

  /* The confirmation is the button's own label for a beat and then it is not.
     Anything more permanent would need a screen the file does not draw. */
  const submit = () => {
    if (created) return
    setCreated(true)
    window.setTimeout(() => setCreated(false), 1800)
  }

  /* What the pill on the bottom actually means. Without this it is decoration,
     and it is the one control on the page whose job is unambiguous. */
  const restart = () => {
    setName('')
    setAccent(DEFAULT_ACCENT)
    setAccess('private')
    setPicked([])
    setCreated(false)
  }

  return (
    <div className="font-sohne relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black px-6 py-16">
      <Backdrop />

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
              <img
                src={iconMovieReel}
                alt=""
                className="absolute max-w-none"
                style={{ left: 14.0625, top: 14.0625, width: 21.875, height: 21.875 }}
              />
            </motion.div>
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
          onClick={restart}
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
    </div>
  )
}
