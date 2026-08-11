import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { article } from '../content/article'

/**
 * Figma "Frame 28" (node 78:2195): 19 strokes, 2px thick, 6px pitch, round caps.
 * The node stores path lengths; a round cap adds half the stroke width at each
 * end, so the visual width is path + 2 — that's what these are.
 */
const lineWidths = [
  38.8, 46.4, 53.8, 46.4, 38.8, 34.1, 34.1, 34.1, 34.1, 34.1, 34.1, 34.1, 34.1,
  34.1, 34.1, 34.1, 34.1, 34.1, 34.1,
]

const LINE_H = 2
const GAP = 4
const PITCH = LINE_H + GAP

/** How far the stroke under the cursor reaches, and how fast that falls off. */
const MAX_EXTEND = 18
const SIGMA = 12

/** Each section owns a run of the minimap's strokes. */
const groups = (() => {
  let cursor = 0
  return article.sections.map((section) => {
    const offset = cursor
    const widths = lineWidths.slice(cursor, cursor + section.minimapLines)
    cursor += section.minimapLines
    return { id: section.id, label: section.label, widths, offset }
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
            className="flex w-[124px] cursor-pointer items-center gap-[6px] text-left"
          >
            <span
              aria-hidden="true"
              className="flex w-[57px] shrink-0 flex-col"
              style={{ gap: GAP }}
            >
              {group.widths.map((baseWidth, i) => {
                const index = group.offset + i
                return (
                  <motion.span
                    key={index}
                    className="block origin-left rounded-full"
                    // `width` is owned by Framer Motion alone — putting it in
                    // `style` too would let React overwrite the animated value
                    // on every pointer-driven re-render.
                    style={{ height: LINE_H }}
                    initial={{ opacity: 0, scaleX: 0.2, width: baseWidth }}
                    animate={{
                      opacity: 1,
                      scaleX: 1,
                      width: baseWidth + extensionAt(index, pointer),
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
                  className="text-muted max-w-[84px] text-[8px] leading-4 tracking-[-0.072px] xl:max-w-none xl:whitespace-nowrap"
                  initial={{ opacity: 0, x: -4 }}
                  // Clears the widest reach of the magnified strokes.
                  animate={{ opacity: 1, x: isHovered ? 22 : 0 }}
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
