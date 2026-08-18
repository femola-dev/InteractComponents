import type { CSSProperties, ReactNode } from 'react'
import { GHOST_IN, MUTED, RAIL_SHADOW, RING } from '../lib/chatShell'

/**
 * The pieces every Chat View destination draws with — Figma node 308:454,
 * "Conversation Web". The rail switches between five screens that share this
 * chrome, so a chip, a heading or a placeholder box belongs here rather than
 * being copied next to whichever screen needed it second. Its tokens live in
 * `lib/chatShell.ts`.
 */

/**
 * A placeholder block. Rounded, filled, and deliberately without content.
 *
 * `style` is for the sizes that have to be numbers — authored label widths, bar
 * heights, a percentage fill — which Tailwind's scale cannot express without a
 * class per value.
 */
export function Ghost({
  className = '',
  fill = GHOST_IN,
  style,
}: {
  className?: string
  fill?: string
  style?: CSSProperties
}) {
  return <div aria-hidden className={className} style={{ backgroundColor: fill, ...style }} />
}

/** A 20px chip button — the header's preferences, new-message and call controls. */
export function ChipButton({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[4px] transition-opacity duration-150 hover:opacity-70 ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * `PINNED CHATS` / `GROUPS` — Söhne Mono, and the only monospaced text here.
 * A heading with a button beside it is 20px tall to clear it; one without is 16.
 */
export function SectionHeading({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <div className={`flex w-full shrink-0 items-center ${action ? 'h-5 gap-2' : 'h-4'}`}>
      <p
        className="min-w-0 flex-1 text-[12px] leading-4 tracking-[-0.24px]"
        style={{ color: MUTED, fontFamily: 'var(--font-sohne-mono)' }}
      >
        {label}
      </p>
      {action}
    </div>
  )
}

/** A white card — the composer's material, reused for every panel a ghost view draws. */
export function Card({
  className = '',
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div
      className={`bg-white ${className}`}
      style={{ boxShadow: `${RING}, ${RAIL_SHADOW}`, ...style }}
    >
      {children}
    </div>
  )
}
