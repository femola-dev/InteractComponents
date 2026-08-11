import { useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { playgrounds } from '../playgrounds/registry'
import { ChevronIcon } from './icons'
import { pressable, springResponsive, transitionSmooth } from '../lib/motion'

type Props = {
  activeId: string
  onSelect: (id: string) => void
}

/**
 * Pagination through the playground registry — prev/next at the ends, the
 * current page's name between them. Floats over the bottom of the device bezel:
 * the mockup deliberately bleeds off the bottom edge, so the switcher overlays
 * it rather than reserving a row and cutting the screen short.
 */
export function PlaygroundSwitcher({ activeId, onSelect }: Props) {
  const reducedMotion = useReducedMotion()
  const index = Math.max(
    0,
    playgrounds.findIndex((p) => p.id === activeId),
  )
  // Which way the label should slide — set by the control that caused the change.
  const directionRef = useRef(1)

  const go = (delta: number) => {
    directionRef.current = delta
    const next = (index + delta + playgrounds.length) % playgrounds.length
    onSelect(playgrounds[next].id)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    go(delta)
  }

  const slide = reducedMotion ? 0 : 10 * directionRef.current

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ ...transitionSmooth, delay: 0.35 }}
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <div
        role="group"
        aria-label="Playground component"
        onKeyDown={onKeyDown}
        // Near-opaque: at 100% zoom the pill sits over the reading pane's blur
        // strip, but once the page scrolls it floats over live body text.
        className="shadow-elevated pointer-events-auto flex items-center gap-1 rounded-[22px] border border-hairline bg-white/95 p-1 backdrop-blur-md"
      >
        <PagerButton
          direction="left"
          label="Previous playground"
          onActivate={() => go(-1)}
        />

        {/* Fixed width so the pill doesn't resize as names change length, and
            so the label stays centred between the two arrows. */}
        <div
          aria-live="polite"
          className="relative flex h-8 w-[168px] items-center justify-center overflow-hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={activeId}
              initial={{ opacity: 0, x: slide, filter: 'blur(2px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -slide, filter: 'blur(2px)' }}
              transition={transitionSmooth}
              className="absolute text-[12px] tracking-[-0.108px] whitespace-nowrap text-ink"
            >
              {playgrounds[index].label}
            </motion.span>
          </AnimatePresence>
        </div>

        <PagerButton
          direction="right"
          label="Next playground"
          onActivate={() => go(1)}
        />
      </div>
    </motion.div>
  )
}

function PagerButton({
  direction,
  label,
  onActivate,
}: {
  direction: 'left' | 'right'
  label: string
  onActivate: () => void
}) {
  const single = playgrounds.length < 2

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={single}
      onClick={onActivate}
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-outline outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:cursor-default disabled:opacity-30"
      whileHover={single ? undefined : { scale: 1.08, backgroundColor: '#f2f2f2' }}
      whileTap={single ? undefined : pressable.whileTap}
      transition={springResponsive}
    >
      <ChevronIcon direction={direction} />
    </motion.button>
  )
}
