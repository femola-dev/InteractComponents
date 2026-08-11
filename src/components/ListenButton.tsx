import { motion } from 'framer-motion'
import { PauseIcon, PlayIcon } from './icons'

type Props = {
  isPlaying: boolean
  onToggle: () => void
}

const icon = {
  shown: { opacity: 1, scale: 1, rotate: 0 },
  hiddenUp: { opacity: 0, scale: 0.6, rotate: 30 },
  hiddenDown: { opacity: 0, scale: 0.6, rotate: -30 },
}

const label = {
  shown: { opacity: 1, y: 0 },
  hiddenUp: { opacity: 0, y: -12 },
  hiddenDown: { opacity: 0, y: 12 },
}

const timing = { duration: 0.22, ease: 'easeOut' } as const

export function ListenButton({ isPlaying, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Pause narration' : 'Listen to article'}
      className="shadow-raised flex h-7 shrink-0 cursor-pointer items-center gap-[5px] rounded-[20px] bg-ink py-1 pr-2 pl-1 text-white"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
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

      <span className="grid overflow-hidden text-[12px] leading-4 tracking-[-0.108px] *:[grid-area:1/1]">
        <motion.span animate={isPlaying ? label.hiddenUp : label.shown} transition={timing}>
          Listen
        </motion.span>
        <motion.span
          aria-hidden={!isPlaying}
          animate={isPlaying ? label.shown : label.hiddenDown}
          transition={timing}
        >
          Playing
        </motion.span>
      </span>
    </motion.button>
  )
}
