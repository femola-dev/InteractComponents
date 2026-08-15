import { motion } from 'framer-motion'
import { article } from '../content/article'
import { ListenButton } from './ListenButton'
import { PillButton } from './PillButton'
import { useRise } from './rise'
import { TagPill } from './TagPill'
import type { NarrationStatus } from './useReadingCursor'

type Props = {
  status: NarrationStatus
  onToggleListen: () => void
}

export function ActionsBar({ status, onToggleListen }: Props) {
  const rise = useRise()

  return (
    <motion.div
      {...rise(0.33)}
      className="flex flex-wrap items-center justify-between gap-y-3"
    >
      <div className="flex items-center gap-2">
        <ListenButton status={status} onToggle={onToggleListen} />
        <PillButton label="Share" />
        <PillButton label="Options" />
      </div>

      <div className="flex items-center gap-1">
        {article.tags.map((tag) => (
          <TagPill key={tag} name={tag} />
        ))}
      </div>
    </motion.div>
  )
}
