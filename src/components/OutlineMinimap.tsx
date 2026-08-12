import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { article } from '../content/article'

/**
 * Figma node 221:1579 draws 19 strokes at 2px thick, 6px pitch, round caps, at
 * five different lengths. Every stroke now rests at one length instead, so the
 * column reads as a single clean edge and *all* the variation comes from the
 * cursor — the outline is flat until you touch it.
 *
 * The value is the Figma stroke's own length: it stores the path's end from
 * x=25, and a round cap adds half the stroke width at each end, so the visual
 * width is (end - 25) + 2.
 */
const BASE_WIDTH = 14.12

/** The column the label is laid out against. */
const COLUMN = Math.ceil(BASE_WIDTH)

const LINE_H = 2
const GAP = 4
const PITCH = LINE_H + GAP

/** How far the stroke under the cursor reaches, and how fast that falls off. */
const MAX_EXTEND = 10
const SIGMA = 12

/** Each section owns a run of the minimap's strokes. */
const groups = (() => {
  let cursor = 0
  return article.sections.map((section) => {
    const offset = cursor
    cursor += section.minimapLines
    return {
      id: section.id,
      label: section.label,
      count: section.minimapLines,
      offset,
    }
  })
})()

/**
 * Strokes reach further right the closer the cursor sits to them, falling off
 * on a gaussian. Height and pitch never change, so the outline never reflows —
 * the magnification runs sideways only.
 */
function extensionAt(index: number, pointer: number | null) {
  if (pointer === null) return 0
  const distance = pointer - (index * PITCH + LINE_H / 2)
  return MAX_EXTEND * Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA))
}

const widthSpring = {
  type: 'spring',
  stiffness: 500,
  damping: 32,
  mass: 0.3,
} as const

type Props = {
  activeSection: string
  onSelect: (id: string) => void
}

export function OutlineMinimap({ activeSection, onSelect }: Props) {
  const navRef = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [pointer, setPointer] = useState<number | null>(null)

  return (
    <nav
      ref={navRef}
      aria-label="Article outline"
      className="flex flex-col"
      style={{ gap: GAP }}
      onPointerMove={(event) => {
        const box = navRef.current?.getBoundingClientRect()
        if (box) setPointer(event.clientY - box.top)
      }}
      onPointerLeave={() => {
        setPointer(null)
        setHovered(null)
      }}
    >
      {groups.map((group) => {
        const isHovered = hovered === group.id
        const isActive = activeSection === group.id
        // The active section names itself at rest; hovering previews any other.
        const showLabel = isHovered || (hovered === null && isActive)
        const color = isActive || isHovered ? '#888888' : '#eaeaea'

        return (
          <button
            key={group.id}
            type="button"
            aria-label={`Scroll to ${group.label}`}
            onClick={() => onSelect(group.id)}
            onPointerEnter={() => setHovered(group.id)}
            onFocus={() => setHovered(group.id)}
            onBlur={() => setHovered(null)}
            // Wide enough to contain the label at its 110px cap (which starts
            // at COLUMN + 6), so the text no longer spills past the button.
            className="relative flex w-[137px] cursor-pointer items-center text-left"
          >
            <span
              aria-hidden="true"
              className="flex shrink-0 flex-col"
              style={{ width: COLUMN, gap: GAP }}
            >
              {Array.from({ length: group.count }, (_, i) => {
                const index = group.offset + i
                return (
                  <motion.span
                    key={index}
                    className="block origin-left rounded-full"
                    // `width` is owned by Framer Motion alone — putting it in
                    // `style` too would let React overwrite the animated value
                    // on every pointer-driven re-render.
                    style={{ height: LINE_H }}
                    initial={{ opacity: 0, scaleX: 0.2, width: BASE_WIDTH }}
                    animate={{
                      opacity: 1,
                      scaleX: 1,
                      width: BASE_WIDTH + extensionAt(index, pointer),
                      backgroundColor: color,
                    }}
                    transition={{
                      opacity: { delay: 0.4 + index * 0.022, duration: 0.3 },
                      scaleX: {
                        delay: 0.4 + index * 0.022,
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                      },
                      width: widthSpring,
                      backgroundColor: { duration: 0.28 },
                    }}
                  />
                )
              })}
            </span>

            <AnimatePresence mode="popLayout">
              {showLabel && (
                <motion.span
                  key={group.id}
                  // Absolute, so a label taller than its own run of strokes
                  // (12px text wraps to 2–3 lines) can't push the groups below
                  // it down — the stroke grid stays rigid and only the cursor
                  // moves anything.
                  // 110px is just wider than "Collaboration in", the longest
                  // label's first half — enough to settle on two lines rather
                  // than three, which `text-balance` then evens out.
                  className="text-subtle absolute inset-y-0 flex max-w-[110px] items-center text-[12px] leading-4 tracking-[-0.108px] text-balance"
                  style={{ left: COLUMN + 6 }}
                  initial={{ opacity: 0, x: -4 }}
                  // Clears the widest reach of the magnified strokes.
                  animate={{ opacity: 1, x: isHovered ? MAX_EXTEND + 4 : 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {group.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )
      })}
    </nav>
  )
}
