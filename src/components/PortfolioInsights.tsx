import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CURRENCIES, type CurrencyId } from '../lib/currencies'
import { springResponsive } from '../lib/motion'
import { MONTHS } from '../lib/months'
import { generateHoldings, holdingsChartConfig, holdingsTotal, pieData } from '../lib/holdings'
import { AllocationBar, AllocationBarCaption } from './AllocationBar'
import { CurrencySelect } from './CurrencySelect'
import { Pie } from './dither-kit/pie'
import { PieChart } from './dither-kit/polar-chart'
import { HoldingsTable } from './HoldingsTable'
import { ChevronIcon } from './icons'
import { MonthSelect } from './MonthSelect'
import { PieTooltip } from './PieTooltip'
import { PortfolioSheet } from './PortfolioSheet'
import { useRise } from './rise'
import { RollingNumber } from './RollingNumber'

type Props = {
  currency: CurrencyId
  onCurrencyChange: (id: CurrencyId) => void
  onBack: () => void
}

const CHART_VIEWS = ['pie', 'bar'] as const
type ChartView = (typeof CHART_VIEWS)[number]

/** Tailwind's `sm` breakpoint (640px) — same threshold the sheet's own `sm:`
 *  classes switch on, so the pie's dither style flips at the same width the
 *  rest of the layout does. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches,
  )
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)')
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

/**
 * The "Portfolio Insight" drill-down — value up top, the same five holdings
 * as a pie in the middle, their full detail as a table underneath. Swept in
 * from `Portfolio.tsx` via `useSweep()`, into the same `PortfolioSheet` shell
 * as the performance view — same fixed footprint, so the swap underneath the
 * sweep never moves or resizes the card. Unlike the performance view, this
 * one's content outgrows the sheet, so it scrolls internally (`scrollable`)
 * rather than fitting like the performance view does.
 */
export function PortfolioInsights({ currency, onCurrencyChange, onBack }: Props) {
  const rise = useRise()
  const isDesktop = useIsDesktop()
  const selectedCurrency = CURRENCIES.find(({ id }) => id === currency) ?? CURRENCIES[0]

  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null)
  const [chartView, setChartView] = useState<ChartView>('pie')
  const [month, setMonth] = useState(MONTHS[0].id)

  // A fresh seed per mount — a hard page reload or a revisit to this view
  // both remount `PortfolioInsights`, which is exactly when the portfolio
  // should look different. Re-picking a month already seen this session
  // reproduces the same numbers (generateHoldings is pure in seed+month),
  // it's only the seed itself that's random.
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const holdings = useMemo(() => generateHoldings(seed, month), [seed, month])
  const chartData = useMemo(() => pieData(holdings), [holdings])
  const chartConfig = useMemo(() => holdingsChartConfig(holdings), [holdings])
  const amount = holdingsTotal(holdings) * selectedCurrency.rate
  const hoveredHolding = holdings.find((h) => h.ticker === hoveredTicker) ?? null

  // One dither treatment for both chart views, so switching tabs changes the
  // shape, not the whole visual language.
  const chartVariant = isDesktop ? 'dotted' : 'hatched'
  const chartBloom = { blur: 24, brightness: 2.9, opacity: 0.1, saturate: 3 }

  return (
    <PortfolioSheet {...rise(0.05)} scrollable>
      {/* Figma node 185:2445 — back + title left, the two dropdown chips
          right, 8px apart (Frame 81's own gap). z-20 for the same reason as
          the performance sheet's own header: keeps the open dropdown above
          the value block that follows in the document. */}
      <motion.div {...rise(0.1)} className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Portfolio Performance"
            className="text-outline flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[100px] bg-[#F3F3F3] outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
          >
            <ChevronIcon direction="left" />
          </button>
          <h1 className="text-stat text-[18px] leading-[22px] tracking-[-0.36px]">
            Portfolio Insights
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <CurrencySelect value={currency} onChange={onCurrencyChange} />
          <MonthSelect value={month} onChange={setMonth} />
        </div>
      </motion.div>

      <motion.div {...rise(0.16)} className="mt-5 flex flex-col items-center">
        <p
          className="text-ink text-[32px] leading-[48px]"
          style={{ fontFeatureSettings: '"zero" 1' }}
        >
          <RollingNumber value={amount} prefix={selectedCurrency.symbol} tracking="-0.64px" />
        </p>
      </motion.div>

      {/* Figma node 186:2928 — #f8f8f8 pill, 22px tall, a black rounded thumb
          (also 22px, so it fills the pill top-to-bottom with no vertical
          inset) sliding behind whichever label is active. */}
      <motion.div
        {...rise(0.2)}
        role="tablist"
        aria-label="Chart type"
        className="mx-auto mt-6 flex h-[22px] w-fit items-center rounded-full bg-[#f8f8f8]"
      >
        {CHART_VIEWS.map((view) => {
          const active = view === chartView
          return (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setChartView(view)}
              className="relative z-0 flex h-full cursor-pointer items-center justify-center rounded-full px-3 outline-none"
            >
              {active && (
                <motion.span
                  layoutId="chart-toggle-thumb"
                  className="absolute inset-0 -z-10 rounded-full bg-black"
                  transition={springResponsive}
                />
              )}
              <span
                className={`trim-cap text-[12px] leading-[22px] tracking-[-0.24px] capitalize ${
                  active ? 'text-white' : 'text-stat'
                }`}
              >
                {view}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Chart region — fixed HEIGHT only (the pie's own clamp size), shared
          by both tabs. A pie is a ~200-280px square; the bar on its own is
          only 36px tall. Reserving the pie's height here regardless of which
          is showing means this region never resizes on tab switch — only
          the graphic inside it (a square vs. a thin strip, each centered in
          the same box) actually changes. Width stays flexible per chart:
          the pie needs a square, the bar reads better spanning wider. */}
      <motion.div {...rise(0.24)} className="mt-3 flex h-[clamp(200px,28vh,280px)] w-full items-center justify-center">
        {chartView === 'pie' ? (
          <div className="flex size-[clamp(200px,28vh,280px)] items-center justify-center">
            <PieChart
              data={chartData}
              config={chartConfig}
              dataKey="value"
              nameKey="ticker"
              innerRadius={0.4}
              animationDuration={1700}
              bloom={chartBloom}
              onHoverChange={(index) => setHoveredTicker(index != null ? (chartData[index]?.ticker ?? null) : null)}
              className="size-full"
            >
              <Pie variant={chartVariant} />
              <PieTooltip holdings={holdings} symbol={selectedCurrency.symbol} rate={selectedCurrency.rate} />
            </PieChart>
          </div>
        ) : (
          <div className="w-full max-w-[420px] px-2">
            <AllocationBar
              holdings={holdings}
              hoveredTicker={hoveredTicker}
              onHoverChange={setHoveredTicker}
              variant={chartVariant}
              bloom={chartBloom}
            />
          </div>
        )}
      </motion.div>

      {/* Caption region — same fixed height for both tabs too (see
          `AllocationBarCaption`'s own note on why this had to become a
          shared, explicitly-sized region rather than each view sizing
          itself). The pie's line is static; the bar's swaps between a hint
          and a holding's card, but the reserved box is identical either
          way. */}
      <motion.div {...rise(0.27)} className="mx-auto mt-3 w-full max-w-[420px] px-2">
        {chartView === 'pie' ? (
          <div className="flex h-40 items-center sm:h-28">
            <p className="text-stat-dim w-full px-1 text-center text-[12px] leading-[18px]">
              Hover a slice for details.
            </p>
          </div>
        ) : (
          <AllocationBarCaption
            hovered={hoveredHolding}
            holdings={holdings}
            symbol={selectedCurrency.symbol}
            rate={selectedCurrency.rate}
          />
        )}
      </motion.div>

      <motion.div {...rise(0.3)} className="mt-7">
        <HoldingsTable
          holdings={holdings}
          symbol={selectedCurrency.symbol}
          rate={selectedCurrency.rate}
          hoveredTicker={hoveredTicker}
        />
      </motion.div>
    </PortfolioSheet>
  )
}
