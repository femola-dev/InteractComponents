import { motion } from 'framer-motion'
import type { TagName } from '../content/article'
import { pressable, springResponsive } from '../lib/motion'

const tagStyles: Record<TagName, { bg: string; ink: string }> = {
  AI: { bg: '#c4ffe9', ink: '#011b11' },
  Tech: { bg: '#ffcdf2', ink: '#300124' },
  Design: { bg: '#fe997d', ink: '#320c01' },
}

export function TagPill({ name }: { name: TagName }) {
  const { bg, ink } = tagStyles[name]

  return (
    <motion.button
      type="button"
      className="flex h-6 shrink-0 cursor-pointer items-center rounded-[4px] px-2 text-[12px] leading-none tracking-[-0.108px]"
      style={{ backgroundColor: bg, color: ink }}
      whileTap={pressable.whileTap}
      transition={springResponsive}
    >
      {name}
    </motion.button>
  )
}
