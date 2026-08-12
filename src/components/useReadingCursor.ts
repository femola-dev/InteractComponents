import { useEffect, useState } from 'react'

/**
 * Advances a word index at a followable reading pace while narration is on.
 *
 * There is no audio behind this — the highlight is the whole feature, standing
 * in for a reader's eye moving through the text. The pace is the only thing
 * that sells it, so it is expressed in words per minute rather than a raw
 * interval.
 */
/** Deliberately below a natural reading pace (~210): the mark is here to be
    followed, and at speed it stops being trackable and just flickers. 150 gives
    each word 400ms, which the eye can comfortably ride. */
const WORDS_PER_MINUTE = 150

/** @returns the word to highlight, or `null` when nothing is being read. */
export function useReadingCursor(isPlaying: boolean, total: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // Rewind on stop, so the next play starts from the top rather than
    // resuming somewhere the reader has long since scrolled past.
    if (!isPlaying) {
      setIndex(0)
      return
    }

    const id = window.setInterval(
      () => setIndex((i) => Math.min(i + 1, total - 1)),
      60_000 / WORDS_PER_MINUTE,
    )
    return () => window.clearInterval(id)
  }, [isPlaying, total])

  return isPlaying ? index : null
}
