import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { PencilAiIcon } from './icons'

type Props = {
  label: string
  onActivate: () => void
}

export function AskAiFab({ label, onActivate }: Props) {
  const [hovered, setHovered] = useState(false)
  const [pulsed, setPulsed] = useState(false)

  return (
    <div className="relative">
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="pointer-events-none absolute top-1/2 right-[calc(100%+10px)] -translate-y-1/2 rounded-md bg-ink px-2 py-1 text-[12px] leading-4 whitespace-nowrap text-white"
            initial={{ opacity: 0, x: 6, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.94 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={label}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => {
          setPulsed(true)
          window.setTimeout(() => setPulsed(false), 700)
          onActivate()
        }}
        className="shadow-fab relative grid size-12 cursor-pointer place-items-center overflow-hidden rounded-full text-white"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      >
        <motion.span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #69bff9 0%, #b96af3 34%, #e9685e 67%, #f2ac3e 100%)',
            backgroundSize: '260% 260%',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative">
          <PencilAiIcon sparkleActive={pulsed} />
        </span>
      </motion.button>
    </div>
  )
}
