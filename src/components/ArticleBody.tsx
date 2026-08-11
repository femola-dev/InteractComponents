import { motion } from 'framer-motion'
import { article, type Block } from '../content/article'
import { useRise } from './rise'

const BODY = 'text-[14px] leading-6 tracking-[-0.126px] text-ink'

function BodyBlock({ block, delay }: { block: Block; delay: number }) {
  const rise = useRise()

  switch (block.kind) {
    case 'h2':
      return (
        <motion.h2
          {...rise(delay)}
          className="font-display text-[20px] leading-6 text-ink"
        >
          {block.text}
        </motion.h2>
      )

    case 'quote':
      return (
        <motion.blockquote
          {...rise(delay)}
          className="border-quote-edge bg-quote text-quote-ink font-display rounded-lg border px-5 py-3 text-[20px] leading-6 tracking-[0.4px]"
        >
          {block.text}
        </motion.blockquote>
      )

    case 'list':
      return (
        <motion.div {...rise(delay)} className="relative">
          {/* Rounded rule in the left margin — Figma "Frame 32" (4×264, r20). */}
          <span
            aria-hidden="true"
            className="bg-rule absolute inset-y-0 -left-[30px] w-1 rounded-full"
          />
          <p className={`${BODY} font-bold`}>{block.intro}</p>
          {/* Figma sets `hangingList`: markers sit in the margin so the item
              text stays flush with the body column. */}
          <ul className={BODY}>
            {block.items.map((item) => (
              <li
                key={item}
                className="relative before:absolute before:-left-[11px] before:content-['•']"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )

    case 'p':
      return (
        <motion.p {...rise(delay)} className={`${BODY} whitespace-pre-line`}>
          {block.text}
        </motion.p>
      )
  }
}

export function ArticleBody() {
  let delay = 0.33

  return (
    <div className="flex flex-col gap-6">
      {article.sections.map((section) => (
        <section
          key={section.id}
          data-section={section.id}
          className="flex flex-col gap-6"
        >
          {section.blocks.map((block, i) => {
            delay += 0.09
            return <BodyBlock key={i} block={block} delay={delay} />
          })}
        </section>
      ))}
    </div>
  )
}
