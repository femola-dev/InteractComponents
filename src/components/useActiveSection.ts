import { useEffect, useState, type RefObject } from 'react'

/**
 * Tracks which `[data-section]` block the reader is currently in, so the
 * left-rail minimap can highlight that section's lines and name it.
 */
export function useActiveSection(
  containerRef: RefObject<HTMLElement | null>,
  fallback: string,
) {
  const [active, setActive] = useState(fallback)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const update = () => {
      const sections =
        container.querySelectorAll<HTMLElement>('[data-section]')
      if (!sections.length) return

      // The last section whose top has passed the reading line.
      const line =
        container.getBoundingClientRect().top + container.clientHeight * 0.35
      let current = sections[0].dataset.section ?? fallback

      sections.forEach((el) => {
        if (el.getBoundingClientRect().top <= line) {
          current = el.dataset.section ?? current
        }
      })

      setActive(current)
    }

    update()
    container.addEventListener('scroll', update, { passive: true })
    return () => container.removeEventListener('scroll', update)
  }, [containerRef, fallback])

  return active
}
