"use client"

import { useEffect } from "react"
import type { AreaVariant } from "./chart-context"
import { usePolarPart } from "./polar-context"

export type PieProps = {
  variant?: AreaVariant
}

/**
 * The pie's dither style. Unlike `<Area>`/`<Line>`, a pie has one series (the
 * slice set), not several — so this registers a single chart-wide skin under
 * the shared `"*"` key (see the note on it in polar-context.tsx) rather than
 * one keyed to a `dataKey`. Renders nothing itself; `PieCanvas` reads the
 * registered variant and the slice geometry off the shared polar context.
 */
export function Pie({ variant = "gradient" }: PieProps) {
  const { registerVariant, unregisterVariant } = usePolarPart("Pie", "pie")

  useEffect(() => {
    registerVariant("*", variant)
    return () => unregisterVariant("*")
  }, [variant, registerVariant, unregisterVariant])

  return null
}
