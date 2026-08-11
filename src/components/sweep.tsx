import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { createShader, playSweep, type ShaderController } from 'glimm'
import { SweepContext, useSweepContext, type SweepFn } from './sweep-context'

/**
 * glimm's own <GlimmProvider> mounts its canvas host as `position: fixed; inset: 0`,
 * which would sweep the whole browser window. The sweep has to stay inside the
 * MacBook screen, so this drives glimm's framework-agnostic core and mounts the
 * canvas into a host that lives inside the mockup's clipping container.
 */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function SweepProvider({ children }: { children: ReactNode }) {
  const hostElRef = useRef<HTMLDivElement | null>(null)
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const ctrlRef = useRef<ShaderController | null>(null)
  const runningRef = useRef<{ cancel: () => void } | null>(null)

  const hostRef = useCallback((node: HTMLDivElement | null) => {
    hostElRef.current = node
  }, [])

  useEffect(() => {
    return () => {
      runningRef.current?.cancel()
      ctrlRef.current?.destroy()
      ctrlRef.current = null
      canvasElRef.current = null
    }
  }, [])

  const sweep = useCallback<SweepFn>((navigate, options) => {
    const host = hostElRef.current

    if (!host || prefersReducedMotion()) {
      navigate()
      return
    }

    // Switching playgrounds remounts the device frame, so a canvas built for a
    // previous host is now detached — it would sweep nothing. Drop it and
    // rebuild against the host that is actually on screen.
    if (canvasElRef.current && canvasElRef.current.parentNode !== host) {
      runningRef.current?.cancel()
      runningRef.current = null
      ctrlRef.current?.destroy()
      ctrlRef.current = null
      canvasElRef.current.remove()
      canvasElRef.current = null
    }

    if (!ctrlRef.current) {
      const canvas = document.createElement('canvas')
      canvas.setAttribute('aria-hidden', 'true')
      Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      })
      host.appendChild(canvas)

      const ctrl = createShader({ canvas })
      if (!ctrl) {
        // No WebGL — swap without the sweep.
        canvas.remove()
        navigate()
        return
      }
      ctrlRef.current = ctrl
      canvasElRef.current = canvas
    }

    runningRef.current?.cancel()
    runningRef.current = playSweep(ctrlRef.current, {
      sweepMs: 900,
      outroMs: 600,
      palette: {
        a: [0.44, 0.94, 0.54],
        b: [0.63, 0.65, 0.56],
        c: [0.5, 0.5, 0.5],
        d: [0.83, 0.22, 0.49],
      },
      bandTight: 24,
      direction: 'ltr',
      easing: 'easeInOutCubic',
      ...options,
      onMidpoint: () => navigate(),
    })
  }, [])

  const value = useMemo(() => ({ sweep, hostRef }), [sweep, hostRef])

  return <SweepContext.Provider value={value}>{children}</SweepContext.Provider>
}

/** Mount inside the device screen so the sweep is clipped to the mockup. */
export function SweepCanvas() {
  const { hostRef } = useSweepContext()

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-40"
    />
  )
}
