import { motion, useReducedMotion } from 'framer-motion'
import { Fragment, memo } from 'react'
import { article, type Block } from '../content/article'
import { blockWords, countWords, isWord, tokenize } from './reading'
import { useRise } from './rise'

const BODY = 'text-[14px] leading-6 tracking-[-0.126px] text-ink'

/** Figma's default step between body blocks; `spaceAbove` overrides it. */
const GAP = 24

/**
 * The words of one text run, with the read-along mark under whichever word the
 * cursor is on.
 *
 * The mark is a single shared `layoutId` element rather than a background on
 * each word: Framer then animates the one element from word to word, so the
 * highlight *travels* through the text instead of blinking from place to place.
 */
function ReadAlong({
  text,
  offset,
  cursor,
}: {
  text: string
  offset: number
  cursor: number | null
}) {
  const reduced = useReducedMotion()
  let word = offset

  return (
    <>
      {tokenize(text).map((token, i) => {
        if (!isWord(token)) return <Fragment key={i}>{token}</Fragment>

        const index = word++
        const active = cursor === index

        return (
          <span
            key={i}
            className="relative"
            data-reading-active={active || undefined}
          >
            {active && (
              <motion.span
                layoutId="reading-mark"
                aria-hidden="true"
                className="bg-read-mark absolute -inset-x-[3px] -inset-y-[2px] rounded-[4px]"
                // Soft and slightly slower than the 400ms word step, so the
                // mark is still gliding into place when the next word arrives.
                // It therefore never comes to rest mid-paragraph and reads as
                // one continuous travel rather than a series of hops.
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 260, damping: 30, mass: 0.7 }
                }
              />
            )}
            {/* Above the mark, which is painted behind it. */}
            <span className="relative">{token}</span>
          </span>
        )
      })}
    </>
  )
}

type BlockProps = {
  block: Block
  delay: number
  marginTop: number
  wordOffset: number
  /** Null unless the cursor is inside *this* block — see the memo below. */
  cursor: number | null
}

const BodyBlock = memo(function BodyBlock({
  block,
  delay,
  marginTop,
  wordOffset,
  cursor,
}: BlockProps) {
  const rise = useRise()
  const spacing = { marginTop }

  switch (block.kind) {
    case 'h2':
      return (
        <motion.h2
          {...rise(delay)}
          style={spacing}
          className="font-display text-[20px] leading-6 text-ink"
        >
          <ReadAlong text={block.text} offset={wordOffset} cursor={cursor} />
        </motion.h2>
      )

    case 'quote':
      return (
        <motion.blockquote
          {...rise(delay)}
          style={spacing}
          // `indent-5` is Figma's 20px first-line indent on the quote text.
          // `text-balance` evens out the ragged right edge across all four
          // lines — the quote is short enough to stay inside Chrome's line cap.
          className="border-quote-edge bg-quote text-quote-ink font-display rounded-lg border px-5 py-3 indent-5 text-[20px] leading-6 tracking-[0.4px] text-balance"
        >
          <ReadAlong text={block.text} offset={wordOffset} cursor={cursor} />
        </motion.blockquote>
      )

    case 'list': {
      let word = wordOffset

      return (
        <motion.div {...rise(delay)} style={spacing} className="relative">
          {/* Rounded rule in the left margin — Figma node 90:3024 (4×240, r20),
              bottom-aligned to the end of the article. */}
          <span
            aria-hidden="true"
            className="bg-rule absolute bottom-0 -left-[30px] h-[240px] w-1 rounded-full"
          />
          {/* Figma sets `hangingList`: markers sit in the margin so the item
              text stays flush with the body column. */}
          <ul className={BODY}>
            {block.items.map((item) => {
              const itemOffset = word
              word += countWords(item)

              return (
                <li
                  key={item}
                  className="relative before:absolute before:-left-[11px] before:content-['•']"
                >
                  <ReadAlong
                    text={item}
                    offset={itemOffset}
                    cursor={cursor}
                  />
                </li>
              )
            })}
          </ul>
        </motion.div>
      )
    }

    case 'p':
      return (
        <motion.p
          {...rise(delay)}
          style={spacing}
          className={`${BODY} whitespace-pre-line`}
        >
          <ReadAlong text={block.text} offset={wordOffset} cursor={cursor} />
        </motion.p>
      )
  }
})

export function ArticleBody({ cursor }: { cursor: number | null }) {
  let delay = 0.33
  let word = 0

  return (
    // No `gap` here: the spacing between blocks is per-block, and the sections
    // are only scroll anchors for the outline — they must not add a step of
    // their own.
    <div className="flex flex-col">
      {article.sections.map((section, s) => (
        <section
          key={section.id}
          data-section={section.id}
          className="flex flex-col"
        >
          {section.blocks.map((block, i) => {
            delay += 0.09

            const wordOffset = word
            word += blockWords(block)
            // Handing every block the raw cursor would re-render the whole
            // article on each tick. Only the block the cursor is inside gets a
            // changed prop, so `memo` keeps the rest untouched.
            const inBlock = cursor !== null && cursor >= wordOffset && cursor < word

            return (
              <BodyBlock
                key={i}
                block={block}
                delay={delay}
                marginTop={s === 0 && i === 0 ? 0 : (block.spaceAbove ?? GAP)}
                wordOffset={wordOffset}
                cursor={inBlock ? cursor : null}
              />
            )
          })}
        </section>
      ))}
    </div>
  )
}
