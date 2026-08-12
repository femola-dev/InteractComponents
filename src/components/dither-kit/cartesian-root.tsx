import {
  Children,
  type ComponentType,
  isValidElement,
  type ReactNode,
} from "react"
import {
  type ChartConfig,
  ChartContext,
  type ChartType,
  type Margins,
  useChartController,
} from "./chart-context"
import { CommonChartContext } from "./common-context"
import type { BloomInput } from "./dither-paint"
import { cn } from "./lib"
import type { DitherColor } from "./palette"
import type { StackType } from "./scales"
import { useChartDimensions } from "./use-chart-dimensions"

// `object` rather than `Record<string, unknown>`: interfaces don't get an
// implicit index signature, so interface-typed rows failed to satisfy the
// generic. Internal layers still index rows through their own Row type.
type Row = object

const DEFAULT_MARGINS: Margins = {
  top: 10,
  right: 12,
  bottom: 22,
  left: 36,
}

export type CartesianChartProps<TData extends Row> = {
  data: TData[]
  config: ChartConfig
  children: ReactNode
  stackType?: StackType
  margins?: Partial<Margins>
  className?: string
  animate?: boolean
  animationDuration?: number
  replayToken?: number // change to re-play the entrance without remounting
  /** Set false for a decorative sparkline: keeps the hover lift but no scrub
   * crosshair / tooltip. */
  interactive?: boolean
  /** Controlled crosshair position (e.g. a committed point) — overrides the
   * internal hover when set. */
  markerIndex?: number | null
  /** Parent-driven hover (e.g. the whole card/row) — lifts the fill. */
  hovered?: boolean
  /** Glow on the dither fill. */
  bloom?: BloomInput
  /** Only bloom while the chart is hovered. */
  bloomOnHover?: boolean
  /** Recolours the dither body past the scrub point in this colour, leaving the
   *  series line on its own. Omit for a single-colour fill. */
  trailColor?: DitherColor | null
  /**
   * Which part of the plot box answers the pointer.
   *
   * `"plot"` (default) is the whole rectangle. `"under-series"` restricts it to
   * the region *below* the series — above the line the chart behaves as though
   * the pointer were outside it entirely: no crosshair, no scrub, no hover
   * lift. For a chart whose fill is the subject, that empty upper wedge is not
   * really part of the chart, and treating it as live means the curve twitches
   * when the pointer is only passing over the sheet above it.
   */
  hoverArea?: "plot" | "under-series"
  /** Fires with the scrubbed index as the pointer moves (null on leave). */
  onHoverChange?: (index: number | null) => void
  defaultSelectedDataKey?: string | null
  onSelectionChange?: (key: string | null) => void
}

/** Which render layer a composed part targets — defaults to the front SVG. */
function layerOf(node: ReactNode): "back" | "dom" | "svg" {
  if (!isValidElement(node) || typeof node.type === "string") return "svg"
  return (node.type as { chartLayer?: "back" | "dom" }).chartLayer ?? "svg"
}

/**
 * Shared root for the cartesian dither charts (area, line, bar). Owns the
 * measured size, the shared context, and pointer interaction; every visual is
 * composed as children. Back chrome (grid) sits behind the dither canvas; the
 * canvas paints the fill/line/bars + stars; front chrome (axes, dots) and DOM
 * legend/tooltip layer on top. `chartType` drives the scales/interaction and the
 * `Canvas` prop supplies the family's painter (continuous for area/line, bars for
 * bar) — so each chart ships only its own canvas.
 */
export function CartesianRoot<TData extends Row>({
  chartType,
  Canvas,
  data,
  config,
  children,
  stackType = "default",
  margins: marginsProp,
  className,
  animate = true,
  animationDuration = 900,
  replayToken = 0,
  interactive = true,
  markerIndex = null,
  hovered = false,
  bloom = "off",
  bloomOnHover = false,
  trailColor = null,
  hoverArea = "plot",
  onHoverChange,
  defaultSelectedDataKey = null,
  onSelectionChange,
}: CartesianChartProps<TData> & {
  chartType: ChartType
  Canvas: ComponentType
}) {
  const { ref, size } = useChartDimensions<HTMLDivElement>()
  const margins = { ...DEFAULT_MARGINS, ...marginsProp }

  const ctx = useChartController({
    chartType,
    // Safe: the controller only reads row[key] for the configured series keys.
    data: data as Record<string, unknown>[],
    config,
    stackType,
    dimensions: size,
    margins,
    animate,
    animationDuration,
    replayToken,
    markerIndex,
    hovered,
    bloom,
    bloomOnHover,
    trailColor,
    defaultSelectedDataKey,
    onSelectionChange,
  })

  const backChildren: ReactNode[] = []
  const svgChildren: ReactNode[] = []
  const domChildren: ReactNode[] = []
  Children.forEach(children, (child) => {
    const layer = layerOf(child)
    if (layer === "back") backChildren.push(child)
    else if (layer === "dom") domChildren.push(child)
    else svgChildren.push(child)
  })

  const underSeriesOnly = hoverArea === "under-series"

  /**
   * Topmost series pixel at a plot-relative x, interpolated between the two
   * rows the pointer sits between.
   *
   * Interpolated rather than read off the nearest row: the nearest row's value
   * is a step function, so on a steep segment the boundary would sit up to half
   * a category away from the drawn line and the chart would wake up above it.
   *
   * `bands` holds `[y0, y1]` per row in *value* space and the topmost series is
   * the smallest pixel, which is why this maps through `ctx.y` before taking a
   * minimum — the same walk `tooltipTop` does in chart-context.
   */
  const seriesTopAt = (px: number): number | null => {
    const n = ctx.dataLength
    if (n === 0) return null

    const topOf = (i: number) => {
      let top = Number.POSITIVE_INFINITY
      for (const key of ctx.configKeys) {
        const band = ctx.bands[key]?.[i]
        if (band) top = Math.min(top, ctx.y(band[1]))
      }
      return Number.isFinite(top) ? top : null
    }

    if (n === 1) return topOf(0)

    const first = ctx.xCenter(0)
    const step = ctx.xCenter(1) - first
    if (step <= 0) return topOf(0)

    const t = (px - first) / step
    const i = Math.max(0, Math.min(n - 2, Math.floor(t)))
    const a = topOf(i)
    const b = topOf(i + 1)
    if (a == null || b == null) return a ?? b

    const f = Math.max(0, Math.min(1, t - i))
    return a + (b - a) * f
  }

  /** Leave the chart's interaction state as though the pointer were outside. */
  const clearHover = () => {
    ctx.setMouseInChart(false)
    ctx.setHoverIndex(null)
    onHoverChange?.(null)
  }

  const onMove = (clientX: number, clientY: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left - margins.left

    if (underSeriesOnly) {
      const top = seriesTopAt(px)
      // Strictly above the line: the pointer is over the plot box but not over
      // the chart. Bail before touching any interaction state.
      if (top != null && clientY - rect.top - margins.top < top) {
        if (ctx.isMouseInChart || ctx.hoverIndex != null) clearHover()
        return
      }
      ctx.setMouseInChart(true)
    }

    const index = ctx.indexAtX(px)
    ctx.setHoverIndex(index)
    ctx.setCursorX(clientX - rect.left)
    onHoverChange?.(index)
  }

  return (
    <ChartContext value={ctx}>
      <CommonChartContext value={ctx.common}>
        <div
          ref={ref}
          className={cn("relative h-full w-full", className)}
          // Under `under-series` the lift is earned by the first accepted move,
          // not by crossing the box — entering over the empty wedge above the
          // curve must not light the fill up.
          onPointerEnter={
            underSeriesOnly ? undefined : () => ctx.setMouseInChart(true)
          }
          onPointerMove={
            interactive ? (e) => onMove(e.clientX, e.clientY) : undefined
          }
          onPointerLeave={clearHover}
        >
          {ctx.ready && backChildren.length > 0 && (
            <svg
              width={size.width}
              height={size.height}
              className="absolute inset-0 overflow-visible"
              aria-hidden
              role="presentation"
            >
              <g transform={`translate(${margins.left},${margins.top})`}>
                {backChildren}
              </g>
            </svg>
          )}
          <Canvas />
          {ctx.ready && (
            <svg
              width={size.width}
              height={size.height}
              className="absolute inset-0 overflow-visible"
              role="img"
              aria-label="Chart"
            >
              <g transform={`translate(${margins.left},${margins.top})`}>
                {svgChildren}
              </g>
            </svg>
          )}
          {domChildren}
        </div>
      </CommonChartContext>
    </ChartContext>
  )
}

export type AreaChartProps<TData extends Row> = CartesianChartProps<TData>
