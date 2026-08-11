import { motion } from 'framer-motion'
import { article } from '../content/article'
import { ListenButton } from './ListenButton'
import { PillButton } from './PillButton'
import { useRise } from './rise'
import { TagPill } from './TagPill'

type Props = {
  isPlaying: boolean
  onToggleListen: () => void
}

export function ActionsBar({ isPlaying, onToggleListen }: Props) {
  const rise = useRise()

  return (
    <motion.div
      {...rise(0.33)}
      className="flex flex-wrap items-center justify-between gap-y-3"
    >
      <div className="flex items-center gap-2">
        <ListenButton isPlaying={isPlaying} onToggle={onToggleListen} />
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
