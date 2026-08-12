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

      {/* Figma node 70:1505 — byline hugs the left, reading time the right. */}
      <motion.div
        {...rise(0.24)}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <AuthorAvatars />
          <p className="text-[12px] leading-5 tracking-[-0.108px] text-subtle">
            {article.byline}
          </p>
        </div>

        <p className="shrink-0 text-right text-[12px] leading-5 tracking-[-0.108px] text-subtle">
          {article.readingTime}
        </p>
      </motion.div>
    </header>
  )
}
