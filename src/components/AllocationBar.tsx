import { AnimatePresence, motion } from 'framer-motion'
import { allocationFraction, type Holding } from '../lib/holdings'
import type { AreaVariant } from './dither-kit/chart-context'
import type { BloomInput } from './dither-kit/dither-paint'
import { StackStrip } from './dither-kit/stack-strip'
import { HoldingInsightCard } from './PieTooltip'

type Props = {
  holdings: Holding[]
  hoveredTicker: string | null
  onHoverChange: (ticker: string | null) => void
  /** Same values the pie is drawn with, so switching tabs changes the shape,
   *  not the whole visual language. */
  variant: AreaVariant
  bloom: BloomInput
}

/**
 * The "easier to read" alternative to the pie: one bar, five segments sized
 * to each holding's share of the total. Same interactions as the pie (hover
 * dims the rest, drives the table's cross-highlight) and the same dither-kit
 * fill (`<StackStrip>`) the pie is painted with, so toggling between the two
 * is a fair comparison, not just a different shape wearing a different
 * material.
 *
 * Deliberately just the strip — no caption/tooltip here. `PortfolioInsights`
 * places this inside the same fixed-size chart region the pie uses and
 * `<AllocationBarCaption>` inside the same fixed-size caption region the
 * pie's own caption uses, so the two tabs occupy pixel-identical space and
 * only the chart graphic itself changes when you switch between them — see
 * `AllocationBarCaption`'s own comment for why the caption had to split out.
 */
export function AllocationBar({ holdings, hoveredTicker, onHoverChange, variant, bloom }: Props) {
  const segments = holdings.map((holding) => ({
    holding,
    pct: allocationFraction(holding, holdings) * 100,
  }))
  const stripSegments = segments.map(({ holding, pct }) => ({
    key: holding.ticker,
    fraction: pct,
    color: holding.color,
  }))

  return (
    <div className="relative h-9 w-full overflow-hidden rounded-full">
      <StackStrip
        segments={stripSegments}
        variant={variant}
        bloom={bloom}
        hoveredKey={hoveredTicker}
        className="absolute inset-0"
      />
      <div className="relative flex h-full w-full">
        {segments.map(({ holding, pct }) => (
          <button
            key={holding.ticker}
            type="button"
            onPointerEnter={() => onHoverChange(holding.ticker)}
            onPointerLeave={() => onHoverChange(null)}
            onFocus={() => onHoverChange(holding.ticker)}
            onBlur={() => onHoverChange(null)}
            aria-label={`${holding.ticker} — ${pct.toFixed(1)}% of portfolio`}
            style={{ width: `${pct}%` }}
            className="h-full shrink-0 cursor-pointer outline-none"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * The bar's hover-details slot — split out from `AllocationBar` itself so
 * `PortfolioInsights` can give it the *same* fixed-height caption region the
 * pie's static caption sits in (`h-40 sm:h-28` — sized to this component's
 * own worst case, an NVDA card on a narrow phone; see the sizing note
 * below). Sharing one region size between the two tabs is what makes
 * switching Pie/Bar not jump the table: the chart region and the caption
 * region are each a fixed size regardless of which tab is active, so only
 * the graphic inside the chart region actually changes shape.
 */
export function AllocationBarCaption({
  hovered,
  holdings,
  symbol,
  rate,
}: {
  hovered: Holding | null
  holdings: Holding[]
  symbol: string
  rate: number
}) {
  return (
    // A true fixed height, not min-height — this used to be `min-h-[92px]`,
    // which let NVDA's longer insight line (it wraps to more lines than the
    // others, more so on narrow screens where it can run to 5+ lines) grow
    // the slot taller than its neighbours, which in turn moved the bar
    // itself since the two were centered together as one block. Sized to
    // the worst case per breakpoint (measured empirically: ~156px at a
    // 320px viewport, ~120px at 390px, ~102px at ≥sm).
    //
    // `items-start`, not `items-center`: the box has to stay this tall to
    // match the pie's shared caption region (so switching tabs doesn't
    // jump), but the card itself should still sit right under the bar
    // instead of floating at the box's vertical center.
    <div className="relative flex h-40 w-full items-start sm:h-28">
      {/* Keyed on a fixed string, not the ticker — the card frame mounts
          once for the whole hover session and stays put while switching
          segments; only `<HoldingInsightCard>`'s own AnimatePresence
          morphs the content underneath it. */}
      <AnimatePresence mode="wait" initial={false}>
        {hovered ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
            className="font-figure border-panel-edge w-full overflow-hidden rounded-[8px] border-[0.5px] bg-[rgba(254,254,254,0.8)] p-2.5 backdrop-blur-[30px]"
          >
            <HoldingInsightCard holding={hovered} holdings={holdings} symbol={symbol} rate={rate} />
          </motion.div>
        ) : (
          // Fades to 0% opacity (not just unmounts) via `exit` before the
          // card takes its place, so it's never visible while hovering.
          <motion.p
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-stat-dim w-full px-1 text-center text-[12px] leading-[18px]"
          >
            Hover a segment for details.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
