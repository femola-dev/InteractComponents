import { motion } from 'framer-motion'

export function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8.33337 12.3367V7.66348C8.33337 7.32872 8.70821 7.13063 8.98479 7.31921L12.4118 9.65584C12.6544 9.82125 12.6544 10.1789 12.4118 10.3443L8.98479 12.6809C8.70821 12.8695 8.33337 12.6714 8.33337 12.3367Z"
        fill="currentColor"
      />
      <path
        d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
        stroke="currentColor"
        strokeWidth="1.875"
      />
    </svg>
  )
}

export function EditSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M7.33335 2.66675H4.80002C4.05329 2.66675 3.67991 2.66675 3.3947 2.81207C3.14381 2.9399 2.93984 3.14387 2.81201 3.39476C2.66669 3.67997 2.66669 4.05335 2.66669 4.80008V11.2001C2.66669 11.9468 2.66669 12.3202 2.81201 12.6054C2.93984 12.8563 3.14381 13.0603 3.3947 13.1881C3.67991 13.3334 4.05329 13.3334 4.80002 13.3334H11.2C11.9468 13.3334 12.3202 13.3334 12.6054 13.1881C12.8562 13.0603 13.0602 12.8563 13.188 12.6054C13.3334 12.3202 13.3334 11.9468 13.3334 11.2001V8.66675"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.66669 7.33318V5.33321L11.7239 2.27602C12.2446 1.75532 13.0888 1.75532 13.6095 2.27602L13.7239 2.3904C14.2446 2.9111 14.2446 3.75532 13.7239 4.27602L10.6667 7.33318H8.66669Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7.6" y="6.9" width="1.9" height="6.2" rx="0.95" fill="currentColor" />
      <rect x="10.9" y="6.9" width="1.9" height="6.2" rx="0.95" fill="currentColor" />
      <path
        d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
        stroke="currentColor"
        strokeWidth="1.875"
      />
    </svg>
  )
}

export function PencilAiIcon({ sparkleActive }: { sparkleActive: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19.2499 12.664L11.1484 20.7666C10.7171 21.1976 10.1642 21.4875 9.5644 21.5967L4.67866 22.4844C4.35614 22.5429 4.02486 22.4396 3.79292 22.208C3.56106 21.9761 3.45813 21.6449 3.51655 21.3223L4.40424 16.4365C4.51338 15.8365 4.80325 15.2839 5.23432 14.8525L13.3359 6.75L19.2499 12.664Z"
        fill="currentColor"
      />
      <path
        d="M15.543 4.54305C17.1762 2.91025 19.824 2.91001 21.4571 4.54305C23.0898 6.17613 23.0898 8.82403 21.4571 10.4571L20.6641 11.2501L14.75 5.33602L15.543 4.54305Z"
        fill="currentColor"
      />
      <motion.path
        d="M7.24045 4.18518L6.54359 2.37334C6.45708 2.14842 6.24099 2 6 2C5.75901 2 5.54292 2.14842 5.45641 2.37334L4.75955 4.18518C4.65797 4.44927 4.44927 4.65797 4.18518 4.75955L2.37334 5.45641C2.14842 5.54292 2 5.75901 2 6C2 6.24099 2.14842 6.45708 2.37334 6.54359L4.18518 7.24045C4.44927 7.34203 4.65797 7.55073 4.75955 7.81482L5.45641 9.62666C5.54292 9.85158 5.75901 10 6 10C6.24099 10 6.45708 9.85158 6.54359 9.62666L7.24045 7.81482C7.34203 7.55073 7.55073 7.34203 7.81482 7.24045L9.62666 6.54359C9.85158 6.45708 10 6.24099 10 6C10 5.75901 9.85158 5.54292 9.62666 5.45641L7.81482 4.75955C7.55073 4.65797 7.34203 4.44927 7.24045 4.18518Z"
        fill="currentColor"
        style={{ transformOrigin: '6px 6px' }}
        animate={
          sparkleActive
            ? { scale: [1, 1.35, 0.9, 1.15, 1], rotate: [0, 18, -10, 6, 0] }
            : { scale: [1, 1.12, 1], rotate: 0 }
        }
        transition={
          sparkleActive
            ? { duration: 0.7, ease: 'easeInOut' }
            : { duration: 2.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }
        }
      />
    </svg>
  )
}

export function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
