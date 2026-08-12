import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { BackToArticleIcon, PencilAiIcon } from './icons'

type Props = {
  label: string
  /** Figma gives the two states different faces: the AI gradient on the
      article, a flat black circle with a back arrow on the summary. */
  mode: 'summarize' | 'back'
  onActivate: () => void
}

/**
 * The two glyphs defocus into each other rather than spinning out and in: the
 * button is 48px, so a scale-and-rotate at that size reads as the whole control
 * lurching. Blur keeps the change to the icon itself.
 */
const glyph = {
  enter: { opacity: 0, filter: 'blur(5px)' },
  shown: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(5px)' },
}

/** Matches the gradient's fade, so the face changes as one gesture. */
const morph = { duration: 0.28, ease: 'easeInOut' } as const

export function AskAiFab({ label, mode, onActivate }: Props) {
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
        // Black base: the gradient sits on top of it and fades out for the
        // back state, so the two faces cross-fade instead of hard-cutting.
        className="shadow-fab relative grid size-12 cursor-pointer place-items-center overflow-hidden rounded-full bg-ink text-white"
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
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            opacity: mode === 'back' ? 0 : 1,
          }}
          transition={{
            backgroundPosition: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.28, ease: 'easeOut' },
          }}
        />

        <span className="relative grid place-items-center *:[grid-area:1/1]">
          {/* Default (sync) mode, not popLayout: both glyphs stay in the same
              grid cell for the whole swap, so they genuinely overlap and blur
              through one another instead of one leaving before the other lands. */}
          <AnimatePresence initial={false}>
            {mode === 'back' ? (
              <motion.span
                key="back"
                initial={glyph.enter}
                animate={glyph.shown}
                exit={glyph.exit}
                transition={morph}
              >
                <BackToArticleIcon />
              </motion.span>
            ) : (
              <motion.span
                key="ai"
                initial={glyph.enter}
                animate={glyph.shown}
                exit={glyph.exit}
                transition={morph}
              >
                <PencilAiIcon sparkleActive={pulsed} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
  )
}
