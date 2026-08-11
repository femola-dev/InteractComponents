import { motion } from 'framer-motion'
import hatchBand from '../assets/icons/hatch-band.svg'

export function HatchBand({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative h-[45px] w-full overflow-hidden border-y border-hairline">
      <img
        src={hatchBand}
        alt=""
        aria-hidden="true"
        width={612}
        height={45}
        className="h-[45px] w-[612px] max-w-none select-none"
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-40"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,0,0,0.07) 45%, transparent)',
        }}
        animate={isPlaying ? { x: ['-10rem', '640px'] } : { x: '-10rem' }}
        transition={
          isPlaying
            ? { duration: 2.6, repeat: Infinity, ease: 'linear' }
            : { duration: 0.3 }
        }
      />
    </div>
  )
}
