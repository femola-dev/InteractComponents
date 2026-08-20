import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { defaultPlaygroundId, playgrounds } from './registry'

/**
 * The active playground lives in the URL hash (`#/article-reader`) so a page
 * can be linked to and survives a reload. Unknown or missing hashes fall back to
 * the first entry in the registry.
 */

const readHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return playgrounds.some((p) => p.id === id) ? id : defaultPlaygroundId
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function usePlayground() {
  const activeId = useSyncExternalStore(subscribe, readHash, () => defaultPlaygroundId)

  const setActiveId = useCallback((id: string) => {
    window.location.hash = `/${id}`
  }, [])

  const active =
    playgrounds.find((p) => p.id === activeId) ?? playgrounds[0]

  useEffect(() => {
    document.title = `${active.label} · Playground`
  }, [active.label])

  // Every playground owns the viewport from its own top edge, so a switch has
  // to land at the top of the document. Only `JoinGroup` runs taller than the
  // viewport, and leaving it part-scrolled hands the next board a non-zero
  // `scrollTop` that the browser only clamps once the shorter document has been
  // laid out — a frame of the new board sitting high before it snaps down.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [active.id])

  return { active, setActiveId }
}
