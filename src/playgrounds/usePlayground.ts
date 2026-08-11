import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { defaultPlaygroundId, playgrounds } from './registry'

/**
 * The active playground lives in the URL hash (`#/notification-stack`) so a page
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

  return { active, setActiveId }
}
