import { motion } from 'framer-motion'
import { PauseIcon, PlayIcon } from './icons'
import type { NarrationStatus } from './useReadingCursor'

type Props = {
  status: NarrationStatus
  onToggle: () => void
}

const icon = {
  shown: { opacity: 1, scale: 1, rotate: 0 },
  hiddenUp: { opacity: 0, scale: 0.6, rotate: 30 },
  hiddenDown: { opacity: 0, scale: 0.6, rotate: -30 },
}

const timing = { duration: 0.22, ease: 'easeOut' } as const

/** The label is one strip that slides, so it always travels the short way
    between two neighbouring words — no bookkeeping about which state came
    before. `Listen` is only ever left behind, never returned to. */
const LABELS: NarrationStatus[] = ['idle', 'playing', 'paused']
const LABEL = { idle: 'Listen', playing: 'Playing', paused: 'Paused' }
/** One line box of `leading-4`, the height the strip is clipped to. */
const LINE = 16

const ARIA = {
  idle: 'Listen to article',
  playing: 'Pause narration',
  paused: 'Resume narration',
}

export function ListenButton({ status, onToggle }: Props) {
  const isPlaying = status === 'playing'

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={isPlaying}
      aria-label={ARIA[status]}
      className="shadow-raised flex h-7 shrink-0 cursor-pointer items-center gap-[5px] rounded-[20px] bg-ink py-1 pr-2 pl-1 text-white"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
      {/* The icon shows the action, not the state: pause while it runs, play
          both before it starts and while it is held. */}
      <span className="grid size-5 place-items-center *:[grid-area:1/1]">
        <motion.span
          className="grid place-items-center"
          animate={isPlaying ? icon.hiddenUp : icon.shown}
          transition={timing}
        >
          <PlayIcon />
        </motion.span>
        <motion.span
          className="grid place-items-center"
          animate={isPlaying ? icon.shown : icon.hiddenDown}
          transition={timing}
        >
          <PauseIcon />
        </motion.span>
      </span>

      {/* Stacked rather than swapped: the button keeps the width of its widest
          word, so it never resizes under the pointer mid-toggle. */}
      <span
        aria-hidden="true"
        className="h-4 overflow-hidden text-[12px] leading-4 tracking-[-0.108px]"
      >
        <motion.span
          className="flex flex-col"
          animate={{ y: -LABELS.indexOf(status) * LINE }}
          transition={timing}
        >
          {LABELS.map((state) => (
            <span key={state} className="whitespace-nowrap">
              {LABEL[state]}
            </span>
          ))}
        </motion.span>
      </span>
    </motion.button>
  )
}
