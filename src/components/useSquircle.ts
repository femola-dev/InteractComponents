import { useCallback, useState } from 'react'
import { squirclePath } from '../lib/squircle'

type Options = {
  /** Corner radius in px, as set in Figma. */
  radius: number
  /** Figma's corner smoothing, 0–1. */
  smoothing: number
  /**
   * Half the stroke width, when the shape is to carry a stroke.
   *
   * SVG straddles a stroke across the path, so a path on the element's edge
   * would lose its outer half to the clip. Insetting the path by half the
   * stroke puts the stroke's *outer* edge on the element bounds — which is
   * where Figma puts it, since Figma strokes shapes on the inside.
   */
  inset?: number
}

/**
 * Measures an element and returns the Figma-smoothed path for its own box.
 *
 * The path has to be regenerated on resize because it is absolute px, not a
 * scalable viewBox: stretching one path across a changing width would stretch
 * the corners with it, which is the exact thing corner smoothing is for. The
 * observer is the cost of the corners staying circular at both ends of the box.
 *
 * `borderBoxSize` rather than `contentRect` — the shape is the element's outer
 * edge, and it is also immune to the transforms the caller may be animating.
 */
export function useSquircle({ radius, smoothing, inset = 0 }: Options) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null)

  // A ref callback with a cleanup return (React 19), so the observer's life is
  // the element's life — no effect, and no stale node if the button remounts.
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const size = entry.borderBoxSize?.[0]
      setBox(
        size
          ? { width: size.inlineSize, height: size.blockSize }
          : { width: entry.contentRect.width, height: entry.contentRect.height },
      )
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Null until the first measurement — one frame at most, since a
  // ResizeObserver delivers after layout and before paint.
  const d =
    box && box.width > inset * 2 && box.height > inset * 2
      ? squirclePath({
          width: box.width - inset * 2,
          height: box.height - inset * 2,
          // The caller's radius is the *outer* edge's. Stepping in by the
          // inset steps the radius down with it, or the outer edge would come
          // out rounder than asked.
          radius: radius - inset,
          smoothing,
        })
      : null

  return { ref, d, inset, box }
}
