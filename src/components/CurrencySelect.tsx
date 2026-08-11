import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { transitionFast, transitionSmooth } from '../lib/motion'
import {
  CURRENCIES,
  type CurrencyId,
} from '../lib/currencies'
import iconChevronDown from '../assets/icons/icon-chevron-down-small.svg'
import iconCheckmark from '../assets/icons/icon-checkmark-1-small.svg'

function Flag({ src }: { src: string }) {
  return (
    <div className="relative size-5 shrink-0">
      {/* 16px round flag inside a 20px hit box — Figma's flag frame. */}
      <div className="absolute top-0.5 left-0.5 size-4 overflow-hidden rounded-lg bg-white">
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      </div>
    </div>
  )
}

export function CurrencySelect({
  value,
  onChange,
}: {
  value: CurrencyId
  onChange: (id: CurrencyId) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = CURRENCIES.find((c) => c.id === value) ?? CURRENCIES[0]

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
      {/* Closed pill — Figma 153:2523: #f3f3f3, 4×2 padding, 100px radius, 12px label. */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1 overflow-clip rounded-[100px] bg-[#f3f3f3] px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-stat/30"
      >
        <Flag src={selected.flag} />
        <span className="flex items-center gap-1">
          <span className="text-stat text-[12px] leading-6 tracking-[-0.24px] whitespace-nowrap capitalize">
            {selected.chip}
          </span>
          <motion.img
            src={iconChevronDown}
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
            aria-label="Currency"
            // Figma 166:294 — 194×176, 12 radius, #f3f3f3, 20px blur.
            // Rows: 186×32, 4px panel inset, 2px gap, content inset 6×4.
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={transitionSmooth}
            className="absolute top-[calc(100%+8px)] right-0 flex h-[176px] w-[194px] origin-top-right flex-col gap-0.5 overflow-hidden rounded-[12px] bg-[#f3f3f3] p-1 backdrop-blur-[20px]"
          >
            {CURRENCIES.map((option) => {
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
                    className="flex h-8 w-full cursor-pointer items-center justify-between rounded-[8px] px-1.5 outline-none transition-colors duration-150 hover:bg-[rgba(201,201,201,0.5)] focus-visible:bg-[rgba(201,201,201,0.5)]"
                  >
                    <span className="flex items-center gap-1">
                      <Flag src={option.flag} />
                      <span className="text-stat text-[12px] leading-6 tracking-[-0.24px] whitespace-nowrap capitalize">
                        {option.menu}
                      </span>
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
