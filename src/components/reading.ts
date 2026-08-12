import { article, type Block } from '../content/article'

/**
 * Word bookkeeping for the read-along highlight.
 *
 * Counting and rendering share one tokenizer on purpose: the highlight indexes
 * words by position, so if the two ever disagreed the cursor would drift out of
 * step with the text it is meant to be tracking.
 */

/** Splits on whitespace but *keeps* it, so `whitespace-pre-line` still sees the
    newlines that separate the paragraphs inside a single block. */
export const tokenize = (text: string) => text.split(/(\s+)/)

export const isWord = (token: string) => token.length > 0 && !/^\s+$/.test(token)

export const countWords = (text: string) => tokenize(text).filter(isWord).length

export const blockWords = (block: Block) =>
  block.kind === 'list'
    ? block.items.reduce((n, item) => n + countWords(item), 0)
    : countWords(block.text)

export const TOTAL_WORDS = article.sections.reduce(
  (total, section) =>
    total + section.blocks.reduce((n, block) => n + blockWords(block), 0),
  0,
)
