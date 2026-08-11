import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { transitionFast, transitionSmooth } from '../lib/motion'
import { MONTHS, type MonthId } from '../lib/months'
import iconCalendar from '../assets/icons/icon-calendar-2.svg'
import iconChevronGrabber from '../assets/icons/icon-chevron-grabber-vertical.svg'
import iconCheckmark from '../assets/icons/icon-checkmark-1-small.svg'

/**
 * Same dropdown-chip model as `CurrencySelect` (Figma 153:2523 / 166:294) —
 * closed pill, click-outside + Escape to close, animated menu — just with a
 * calendar leading icon and a grabber trailing icon instead of a flag and a
 * plain chevron (Figma node 186:3642).
 */
export function MonthSelect({
  value,
  onChange,
}: {
  value: MonthId
  onChange: (id: MonthId) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = MONTHS.find((m) => m.id === value) ?? MONTHS[0]

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
      {/* Closed pill — Figma 186:3642: #f3f3f3, 4×2 padding, 100px radius, 12px label. */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1 overflow-clip rounded-[100px] bg-[#f3f3f3] px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-stat/30"
      >
        <img src={iconCalendar} alt="" aria-hidden="true" className="size-5 shrink-0" />
        <span className="flex items-center gap-1">
          <span className="text-stat text-[12px] leading-6 tracking-[-0.24px] whitespace-nowrap capitalize">
            {selected.label}
          </span>
          <motion.img
            src={iconChevronGrabber}
            alt=""
            aria-hidden="true"
            className="size-5 shrink-0"
            animate={{ rotate: open ? 180 : 0 }}
            transition={transitionFast}
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Month"
            // Same 194×176, 12-radius, #f3f3f3, 20px-blur panel as CurrencySelect's
            // menu — MONTHS has the same 5 rows, so the proportions match exactly.
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={transitionSmooth}
            className="absolute top-[calc(100%+8px)] right-0 flex h-[176px] w-[194px] origin-top-right flex-col gap-0.5 overflow-hidden rounded-[12px] bg-[#f3f3f3] p-1 backdrop-blur-[20px]"
          >
            {MONTHS.map((option) => {
              const isSelected = option.id === selected.id
              return (
                <li key={option.id} className="w-full shrink-0">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.id)
                      setOpen(false)
                    }}
                    // Hover fill matches Figma's rgba(201,201,201,0.5) 32×186 pill.
                    className="flex h-8 w-full cursor-pointer items-center justify-between rounded-lg px-1.5 outline-none transition-colors duration-150 hover:bg-[rgba(201,201,201,0.5)] focus-visible:bg-[rgba(201,201,201,0.5)]"
                  >
                    <span className="text-stat text-[12px] leading-6 tracking-[-0.24px] whitespace-nowrap capitalize">
                      {option.label}
                    </span>
                    {isSelected ? (
                      <img
                        src={iconCheckmark}
                        alt=""
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                    ) : (
                      <span className="size-5 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
