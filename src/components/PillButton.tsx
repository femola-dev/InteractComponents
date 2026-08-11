import { motion } from 'framer-motion'
import { pressable, springResponsive } from '../lib/motion'

export function PillButton({ label }: { label: string }) {
  return (
    <motion.button
      type="button"
      className="flex h-7 shrink-0 cursor-pointer items-center rounded-[20px] border border-outline px-2 text-[12px] leading-4 tracking-[-0.108px] text-outline"
      whileHover={{
        scale: 1.05,
        backgroundColor: '#000000',
        borderColor: '#000000',
        color: '#ffffff',
      }}
      whileTap={pressable.whileTap}
      transition={springResponsive}
    >
      {label}
    </motion.button>
  )
}
