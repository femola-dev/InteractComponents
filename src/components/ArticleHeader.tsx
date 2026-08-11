import { motion } from 'framer-motion'
import { article } from '../content/article'
import { AuthorAvatars } from './AuthorAvatars'
import { useRise } from './rise'

export function ArticleHeader() {
  const rise = useRise()

  return (
    <header className="flex flex-col gap-4">
      <motion.h1
        {...rise(0.15)}
        className="font-display text-[32px] leading-[1.2] text-ink sm:text-[40px]"
      >
        {article.title}
      </motion.h1>

      <motion.div {...rise(0.24)} className="flex items-center gap-2">
        <AuthorAvatars />
        <p className="text-[12px] leading-5 tracking-[-0.108px] text-muted">
          {article.byline}
        </p>
      </motion.div>
    </header>
  )
}
