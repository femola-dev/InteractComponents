import { motion } from 'framer-motion'
import { article } from '../content/article'
import { EditSmallIcon } from './icons'

/** Left-rail footnote — Figma "Frame 29". */
export function PublishedMeta() {
  return (
    <motion.div
      className="text-muted flex items-center gap-1"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <EditSmallIcon />
      <span className="text-[12px] leading-4 tracking-[-0.108px]">
        {article.published}
      </span>
    </motion.div>
  )
}
