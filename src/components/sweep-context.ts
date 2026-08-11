import { createContext, useContext } from 'react'
import type { SweepOptions } from 'glimm'

export type SweepFn = (navigate: () => void, options?: SweepOptions) => void

export type SweepCtx = {
  sweep: SweepFn
  hostRef: (node: HTMLDivElement | null) => void
}

export const SweepContext = createContext<SweepCtx | null>(null)

export function useSweepContext(): SweepCtx {
  const ctx = useContext(SweepContext)
  if (!ctx) throw new Error('useSweep must be used inside <SweepProvider>')
  return ctx
}

export function useSweep(): SweepFn {
  return useSweepContext().sweep
}
