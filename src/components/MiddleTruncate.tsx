import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type Props = {
  text: string
  /** Line budget. Past this, the middle is dropped rather than the tail. */
  lines: number
  className?: string
  style?: CSSProperties
}

/** `head… tail`, snapped outward to whole words so the cut never lands mid-word. */
function middleTruncate(text: string, keep: number) {
  if (keep >= text.length) return text

  const headLen = Math.ceil(keep / 2)
  let head = text.slice(0, headLen)
  let tail = text.slice(text.length - (keep - headLen))

  // Snapping only ever shortens, so a candidate that fit still fits after it.
  const headCut = head.lastIndexOf(' ')
  if (headCut > 0) head = head.slice(0, headCut)
  const tailCut = tail.indexOf(' ')
  if (tailCut >= 0) tail = tail.slice(tailCut + 1)

  return `${head.trimEnd()}… ${tail.trimStart()}`
}

/**
 * Truncates from the middle instead of the end.
 *
 * CSS can clamp a block to N lines, but its ellipsis is always terminal — so
 * the closing sentence is exactly what gets thrown away. There is no
 * declarative way to keep both ends, and where the text has to be cut depends
 * on the rendered width and the real line breaks, so this measures.
 *
 * A hidden prober, sized to the visible paragraph and carrying its typography,
 * is filled with candidate strings and binary-searched for the longest that
 * still fits the budget. React never renders children into the prober, so
 * writing to it imperatively is safe.
 */
export function MiddleTruncate({ text, lines, className, style }: Props) {
  const hostRef = useRef<HTMLParagraphElement>(null)
  const proberRef = useRef<HTMLSpanElement>(null)
  const widthRef = useRef(-1)
  const [display, setDisplay] = useState(text)

  useLayoutEffect(() => {
    const host = hostRef.current
    const prober = proberRef.current
    if (!host || !prober) return

    const fit = (force = false) => {
      const width = host.clientWidth
      if (!width) return
      // Height changes as the text is refitted, which would retrigger the
      // observer; only a real width change can alter the answer.
      if (!force && width === widthRef.current) return
      widthRef.current = width

      const cs = getComputedStyle(host)
      const parsed = parseFloat(cs.lineHeight)
      const lineHeight = Number.isFinite(parsed)
        ? parsed
        : parseFloat(cs.fontSize) * 1.2
      const maxHeight = lineHeight * lines + 1

      prober.style.width = `${width}px`
      prober.textContent = text
      if (prober.scrollHeight <= maxHeight) {
        setDisplay(text)
        return
      }

      let lo = 0
      let hi = text.length
      let best = 0
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        prober.textContent = middleTruncate(text, mid)
        if (prober.scrollHeight <= maxHeight) {
          best = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      setDisplay(middleTruncate(text, best))
    }

    fit(true)

    // The body face loads async; measuring against the fallback would fit the
    // wrong metrics and leave the paragraph a line short or a line over.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) fit(true)
    })

    const observer = new ResizeObserver(() => fit())
    observer.observe(host)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [text, lines])

  return (
    <>
      <p
        ref={hostRef}
        className={className}
        style={{
          // A safety net for the frame before the first measurement, and for
          // any drift after it. The fitted text never reaches this.
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: lines,
          overflow: 'hidden',
          ...style,
        }}
      >
        {display}
      </p>

      {/* Measured off-flow at the paragraph's own width. */}
      <span
        ref={proberRef}
        aria-hidden="true"
        className={className}
        style={{
          ...style,
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'normal',
        }}
      />
    </>
  )
}
