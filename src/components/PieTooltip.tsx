import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { type Holding, holdingInsight, marketValue } from '../lib/holdings'
import { useCommonChart } from './dither-kit/common-context'
import { rgb, seedOfColor } from './dither-kit/palette'

type Props = {
  holdings: Holding[]
  symbol: string
  rate: number
}

/**
 * Figma node 185:2626's card content — ticker + market value up top, a
 * written "insight" line underneath. Split out from `PieTooltip` so the
 * allocation bar (its own hover mechanism, not dither-kit's chart context)
 * can show the identical card without duplicating the markup.
 *
 * The card frame itself (mount/unmount, position-follow) belongs to the
 * caller — this only owns the *content* swap, morphing from one holding to
 * the next with a spring crossfade instead of snapping, so scrubbing across
 * slices/segments reads as one card updating rather than the card blinking
 * out and back for every stock. `popLayout` lets the outgoing and incoming
 * text overlap mid-crossfade without the differing insight-line lengths
 * jumping the card's height.
 */
export function HoldingInsightCard({
  holding,
  holdings,
  symbol,
  rate,
}: {
  holding: Holding
  holdings: Holding[]
  symbol: string
  rate: number
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={holding.ticker}
        initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-0.5 shrink-0 rounded-[0.5px]"
              style={{ backgroundColor: rgb(seedOfColor(holding.color).fill) }}
              aria-hidden="true"
            />
            <span className="text-ink text-[12px] font-semibold whitespace-nowrap">
              {holding.ticker}
            </span>
          </div>
          <span className="text-ink text-[12px] font-semibold tabular-nums whitespace-nowrap">
            {symbol}
            {(marketValue(holding) * rate).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <p className="text-stat text-[12px] leading-[18px] font-medium tracking-[-0.06px]">
          {holdingInsight(holding, holdings, symbol, rate)}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Figma node 185:2626 — a frosted card that follows the cursor over the pie:
 * ticker + market value up top, a written "insight" line about that holding
 * underneath. Modelled on dither-kit's own `<Tooltip>` (same hover state via
 * `useCommonChart()`, same spring-follow positioning off `tooltipTop/Left`),
 * but with this design's bespoke two-row layout instead of the generic
 * dot-label-value list, so it's its own component rather than a variant.
 */
export function PieTooltip({ holdings, symbol, rate }: Props) {
  const chart = useCommonChart()
  const show = chart.ready && chart.hoverIndex != null

  // Retain the last hovered index so the card keeps its content while fading
  // out — adjust-state-during-render, matching <Tooltip>'s own approach.
  const [lastIndex, setLastIndex] = useState(0)
  if (chart.hoverIndex != null && chart.hoverIndex !== lastIndex) {
    setLastIndex(chart.hoverIndex)
  }
  const index = chart.hoverIndex ?? lastIndex
  const item = chart.itemsAt(index)[0]
  const holding = holdings.find((h) => h.ticker === item?.name)

  return (
    <AnimatePresence>
      {show && item && holding ? (
        <motion.div
          key="pie-tooltip"
          initial={{
            opacity: 0,
            x: '-50%',
            y: '-115%',
            top: chart.tooltipTop,
            left: chart.tooltipLeft,
          }}
          animate={{
            opacity: 1,
            x: '-50%',
            y: '-115%',
            top: chart.tooltipTop,
            left: chart.tooltipLeft,
          }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
          className="font-figure border-panel-edge pointer-events-none absolute z-10 w-[204px] overflow-hidden rounded-[8px] border-[0.5px] bg-[rgba(254,254,254,0.8)] p-2.5 backdrop-blur-[30px]"
        >
          <HoldingInsightCard holding={holding} holdings={holdings} symbol={symbol} rate={rate} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

PieTooltip.chartLayer = 'dom' as const
