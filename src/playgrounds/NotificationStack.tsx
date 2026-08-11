import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DeviceFrame } from '../components/DeviceFrame'
import { useRise } from '../components/rise'
import {
  dragPhysics,
  pressable,
  springOvershoot,
  springResponsive,
  transitionFast,
} from '../lib/motion'

type Notification = {
  id: number
  app: string
  title: string
  body: string
}

/** Fixed card height keeps the stack geometry exact, so collapsed offsets and
 *  expanded positions can both be computed from one step value. */
const CARD_H = 76
const GAP = 10
const STEP = CARD_H + GAP
const MAX_VISIBLE = 3

const SAMPLES: Omit<Notification, 'id'>[] = [
  { app: 'Messages', title: 'Ada Lovelace', body: 'The analytical engine weaves algebraic patterns.' },
  { app: 'Calendar', title: 'Design review', body: 'In 15 minutes · Studio B' },
  { app: 'Mail', title: 'Figma', body: 'Three new comments on Line Template (Web).' },
  { app: 'Reminders', title: 'Ship the sweep', body: 'Due today' },
  { app: 'Photos', title: 'On this day', body: 'A memory from four years ago is ready.' },
]

let nextId = 0
let nextSample = 0

function makeNotification(): Notification {
  const sample = SAMPLES[nextSample % SAMPLES.length]
  nextSample += 1
  nextId += 1
  return { id: nextId, ...sample }
}

export function NotificationStack() {
  const [items, setItems] = useState<Notification[]>(() => [
    makeNotification(),
    makeNotification(),
    makeNotification(),
  ])
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()
  const rise = useRise()

  const visible = items.slice(0, MAX_VISIBLE)

  const dismiss = (id: number) =>
    setItems((list) => list.filter((item) => item.id !== id))

  const push = () => setItems((list) => [makeNotification(), ...list])

  return (
    <DeviceFrame>
      {/* The stack's fan-out geometry is fixed, so the column scrolls rather
          than clipping when the frame is at its floor. `m-auto` centres it in
          the spare room without making the top unreachable the way
          `justify-center` would once the content overflows. */}
      <div className="scroll-hidden flex min-w-0 flex-1 flex-col overflow-y-auto px-6">
        <div className="m-auto flex w-full flex-col items-center gap-[clamp(20px,5vh,56px)] pt-[clamp(24px,8vh,64px)] pb-[clamp(72px,16vh,128px)]">
          <motion.header {...rise(0.05)} className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-display text-[34px] leading-[1.1] text-ink">
              Notification Stack
            </h1>
            <p className="max-w-[38ch] text-[13px] leading-5 text-muted">
              Hover or tap the stack to fan it out. Drag a card sideways to
              dismiss it.
            </p>
          </motion.header>

          <motion.div
            {...rise(0.12)}
            className="relative w-full max-w-[380px]"
            style={{ height: CARD_H + (MAX_VISIBLE - 1) * STEP }}
            onHoverStart={() => setExpanded(true)}
            onHoverEnd={() => setExpanded(false)}
            // Touch has no hover, so a tap toggles the fan-out. Framer suppresses
            // this after a pan, so swiping a card away doesn't also collapse it.
            onTap={() => setExpanded((open) => !open)}
            onFocusCapture={() => setExpanded(true)}
            onBlurCapture={() => setExpanded(false)}
          >
            <AnimatePresence initial={false}>
              {visible.map((item, i) => (
                <motion.article
                  key={item.id}
                  className="shadow-card absolute inset-x-0 bottom-0 flex cursor-grab flex-col justify-center gap-1 rounded-[18px] border border-hairline bg-white px-4 active:cursor-grabbing"
                  style={{ height: CARD_H, zIndex: MAX_VISIBLE - i }}
                  initial={{ opacity: 0, y: 24, scale: 0.9 }}
                  animate={
                    expanded && !reducedMotion
                      ? { opacity: 1, y: -i * STEP, scale: 1 }
                      : { opacity: 1 - i * 0.15, y: -i * 12, scale: 1 - i * 0.05 }
                  }
                  exit={{ opacity: 0, scale: 0.92, transition: transitionFast }}
                  transition={i === 0 ? springOvershoot : springResponsive}
                  drag={reducedMotion ? false : 'x'}
                  dragConstraints={{ left: 0, right: 0 }}
                  {...dragPhysics}
                  // Constraints are pinned to 0 so the card springs back when the
                  // swipe falls short — which makes elasticity the whole travel,
                  // so it has to be near-free rather than the house 0.15.
                  dragElastic={0.9}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) {
                      dismiss(item.id)
                    }
                  }}
                >
                  <span className="text-[10px] tracking-[0.08em] text-muted uppercase">
                    {item.app}
                  </span>
                  <span className="text-[13px] leading-4 font-medium text-ink">
                    {item.title}
                  </span>
                  <span className="truncate text-[12px] leading-4 text-outline">
                    {item.body}
                  </span>
                </motion.article>
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <motion.p
                initial={{ opacity: 0, filter: 'blur(2px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={transitionFast}
                className="absolute inset-x-0 bottom-0 flex h-[76px] items-center justify-center rounded-[18px] border border-dashed border-hairline text-[12px] text-muted"
              >
                All caught up
              </motion.p>
            )}
          </motion.div>

          <motion.div {...rise(0.18)} className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={push}
              className="flex h-9 cursor-pointer items-center rounded-[20px] bg-ink px-4 text-[12px] tracking-[-0.108px] text-white"
              whileHover={{ scale: 1.04 }}
              whileTap={pressable.whileTap}
              transition={springResponsive}
            >
              Send notification
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setItems([])}
              disabled={items.length === 0}
              className="flex h-9 cursor-pointer items-center rounded-[20px] border border-outline px-4 text-[12px] tracking-[-0.108px] text-outline disabled:cursor-default disabled:opacity-40"
              whileHover={items.length === 0 ? undefined : { scale: 1.04 }}
              whileTap={items.length === 0 ? undefined : pressable.whileTap}
              transition={springResponsive}
            >
              Clear all
            </motion.button>
          </motion.div>

          {items.length > MAX_VISIBLE && (
            <span className="text-[11px] text-muted">
              +{items.length - MAX_VISIBLE} more waiting
            </span>
          )}
        </div>
      </div>
    </DeviceFrame>
  )
}
