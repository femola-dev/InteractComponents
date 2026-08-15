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

/**
 * `idle` is the state the page loads in — nothing has been read yet, so there
 * is no place to hold. Once narration has started it only ever moves between
 * `playing` and `paused`, and a pause keeps its place.
 */
export type NarrationStatus = 'idle' | 'playing' | 'paused'

/** @returns the word to highlight, or `null` when nothing has been read yet. */
export function useReadingCursor(status: NarrationStatus, total: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (status !== 'playing') {
      // A pause is a bookmark: the index stays put so the next play picks the
      // sentence back up. Only a full stop rewinds — and the only stop is a
      // reload, which takes the whole state with it.
      if (status === 'idle') setIndex(0)
      return
    }

    const id = window.setInterval(
      () => setIndex((i) => Math.min(i + 1, total - 1)),
      60_000 / WORDS_PER_MINUTE,
    )
    return () => window.clearInterval(id)
  }, [status, total])

  // Paused still reports a word: the mark stays visible, parked where the
  // reader left it.
  return status === 'idle' ? null : index
}
