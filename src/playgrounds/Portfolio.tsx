import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DeviceFrame } from '../components/DeviceFrame'
import { ProgressiveBlur } from '../components/ProgressiveBlur'
import { RollingNumber } from '../components/RollingNumber'
import { CurrencySelect } from '../components/CurrencySelect'
import { PortfolioInsights } from '../components/PortfolioInsights'
import { PortfolioSheet } from '../components/PortfolioSheet'
import { CURRENCIES, type CurrencyId } from '../lib/currencies'
import { useRise } from '../components/rise'
import { springResponsive, transitionFast } from '../lib/motion'
import { useSweep } from '../components/sweep-context'
import { AreaChart } from '../components/dither-kit/area-chart'
import { Area } from '../components/dither-kit/area'
import type { ChartConfig } from '../components/dither-kit/chart-context'
import iconScriptAi from '../assets/icons/icon-script-ai.svg'

/**
 * Figma "Line Template (Web)" node 147:14 — a portfolio performance sheet inside
 * the same MacBook mockup the article reader uses.
 *
 * The Figma frame is horizontally flipped (every layer carries a counter-flip),
 * so the exported `left` values are mirrored: the title block reads as x=522 in
 * the export but sits at 748 − 522 − 185 = 41 on screen. Positions below follow
 * the rendered design, not the raw export.
 *
 * Fixed 748×882 in Figma; here the card is fluid and the plot yields on height,
 * since the device frame is sized by the viewport.
 *
 * Every text node in the frame is Open Runde Semibold, so the weight is set once
 * on the sheet rather than per element.
 */

/** Weekly points shown per range, counted back from the most recent. */
const RANGES = {
  '1M': 5,
  '3M': 14,
  '6M': 27,
  '1Y': 53,
} as const
type Range = keyof typeof RANGES

type Point = { date: string; value: number }

const CHART_MARGINS = { top: 8, right: 4, bottom: 4, left: 4 }

/**
 * The "Portfolio Insight" key, as a physical key: a cap sitting on a 3px lip.
 *
 * The cap's offset and the lip's height always sum to 3, so the key's *bottom
 * edge never moves* — only the cap travels down onto the lip. Animating `y`
 * alone would slide the whole key, shadow included, which reads as the button
 * sliding rather than being pressed.
 *
 * Hovering takes up a third of the throw, which is the affordance: the key
 * visibly has somewhere to go before you commit to clicking it. Pressing takes
 * the rest.
 */
const KEY = {
  rest: { y: 0, filter: 'drop-shadow(0 3px 0 #5e0c61)' },
  hover: { y: 1, filter: 'drop-shadow(0 2px 0 #5e0c61)' },
  press: { y: 3, filter: 'drop-shadow(0 0px 0 #5e0c61)' },
} as const

/**
 * The 3M window is drawn to the silhouette in the Figma plot — steep rise, a
 * plateau that dips, a trough, a tall peak, then the fall to today's figure.
 * Everything older is a deterministic walk trending into it, so the longer
 * ranges have something to show without the curve changing between renders.
 * Values are in thousands.
 */
const RECENT = [
  36.2, 45.0, 54.8, 60.9, 62.1, 60.0, 58.4, 60.8, 61.9, 55.0, 50.4, 57.6, 62.8,
  52.487,
]

const HISTORY_WEEKS = RANGES['1Y'] - RECENT.length

/** Sum of sines rather than Math.random: stable across renders and reloads. */
const history = Array.from({ length: HISTORY_WEEKS }, (_, i) => {
  const drift = 14 + (i / HISTORY_WEEKS) * 18
  const wave =
    Math.sin(i * 0.38) * 4.2 + Math.sin(i * 0.17 + 1.1) * 6.4 + Math.sin(i * 0.9) * 1.6
  return +(drift + wave).toFixed(2)
})

/** The design's plot ends on Oct 7; every label counts back from there. */
const LAST_DATE = new Date(Date.UTC(2026, 9, 7))
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

const SERIES: Point[] = [...history, ...RECENT].map((value, i, all) => ({
  date: new Date(
    LAST_DATE.getTime() - (all.length - 1 - i) * MS_PER_WEEK,
  ).toISOString(),
  value,
}))

const tickLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

/** The scrubbed date, spelled out — it replaces a sentence, not a tick. */
const fullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

/** Crossfade for the change line — the house entrance, minus the travel. */
const swap = {
  initial: { opacity: 0, y: 4, filter: 'blur(2px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -4, filter: 'blur(2px)' },
  transition: transitionFast,
}

const formatWholeCurrency = (value: number, symbol: string) =>
  `${symbol}${Math.round(value).toLocaleString('en-US')}`

export function Portfolio() {
  const [range, setRange] = useState<Range>('3M')
  const [currency, setCurrency] = useState<CurrencyId>('USD')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [view, setView] = useState<'performance' | 'insights'>('performance')
  const rise = useRise()
  const sweep = useSweep()
  const reducedMotion = useReducedMotion()

  // Memoised on `range`, and that matters: the chart derives its "replay the
  // draw-on animation" signal from the identity of `data`, so a fresh slice on
  // every render would restart the entrance on every mousemove. Scrubbing has to
  // leave the array alone and only move the crosshair.
  const data = useMemo(() => SERIES.slice(-RANGES[range]), [range])

  // The design labels three points; take them from the window's ends and middle
  // so the axis actually follows the selected range.
  const ticks = useMemo(
    () => [data[0], data[Math.floor((data.length - 1) / 2)], data.at(-1)!],
    [data],
  )

  // Scrubbing the plot drives the headline: the amount rolls to the hovered
  // point and the change line becomes that point's date. Falls back to the
  // latest point — the resting sheet is the design's, untouched.
  const hovered = hoverIndex == null ? null : (data[hoverIndex] ?? null)
  const selectedCurrency =
    CURRENCIES.find(({ id }) => id === currency) ?? CURRENCIES[0]
  const baseAmount = (hovered ?? data.at(-1)!).value * 1000
  const amount = baseAmount * selectedCurrency.rate

  // Only forward hover when the pointer is below the trend line, not above it.
  const chartRef = useRef<HTMLDivElement>(null)
  const mouseY = useRef(0)

  const handleChartHover = useCallback(
    (index: number | null) => {
      if (index == null || !chartRef.current) {
        setHoverIndex(null)
        return
      }
      const rect = chartRef.current.getBoundingClientRect()
      const { top: mt, bottom: mb } = CHART_MARGINS
      const h = rect.height - mt - mb
      const vals = data.map((p) => p.value)
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const pointY =
        mt + ((max - data[index].value) / Math.max(max - min, 1)) * h
      setHoverIndex(mouseY.current > pointY ? index : null)
    },
    [data],
  )

  // 3M and 1Y go neon green; 1M and 6M stay pink.
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      value: {
        label: 'Portfolio',
        color: range === '3M' || range === '1Y' ? 'green' : 'pink',
      },
    }),
    [range],
  )

  const insight =
    `Your portfolio is currently valued at ${formatWholeCurrency(52487 * selectedCurrency.rate, selectedCurrency.symbol)}, down 15% from last month. ` +
    `This represents a decrease of approximately ${formatWholeCurrency(9262 * selectedCurrency.rate, selectedCurrency.symbol)}, so reviewing the ` +
    'holdings that contributed most to the decline may help explain the change.'

  return (
    <DeviceFrame>
      {/* No overflow here — the sheet itself is the fixed, `h-full` box (see
          PortfolioSheet); this pane just gives it a definite height to fill.
          The extra bottom padding keeps the sheet clear of the switcher. */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center px-4 pt-[clamp(16px,3vh,32px)] pb-[clamp(72px,10vh,96px)]">
        {view === 'insights' ? (
          <PortfolioInsights
            currency={currency}
            onCurrencyChange={setCurrency}
            onBack={() => sweep(() => setView('performance'), { direction: 'ttb' })}
          />
        ) : (
        <PortfolioSheet {...rise(0.05)}>
          {/* Header — title left, controls right. z-20 keeps the open
              currency menu above the chart that follows in the document. */}
          <div className="relative z-20 flex items-start justify-between gap-6">
              <motion.div {...rise(0.12)} className="flex flex-col gap-3">
                <h1 className="text-stat text-[18px] leading-[22px] tracking-[-0.36px]">
                  Portfolio Performance
                </h1>

                <div className="flex flex-col gap-1">
                  {/* Fixed height: the badge is taller than a bare date, and the
                      two states swap in place — without it the amount below shifts
                      as the pointer enters the plot. */}
                  <div className="flex h-[30px] items-center gap-1">
                    <AnimatePresence mode="wait" initial={false}>
                      {hovered ? (
                        <motion.span
                          key="hovered-date"
                          {...swap}
                          className="text-stat-dim text-[14px] leading-[18px] tracking-[-0.28px]"
                        >
                          {fullDate(hovered.date)}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="resting-change"
                          {...swap}
                          className="flex items-center gap-1"
                        >
                          <span className="bg-loss-tint text-loss trim-cap rounded-[10px] p-1 text-[14px] leading-[22px] tracking-[-0.28px]">
                            15%
                          </span>
                          <span className="text-stat-dim text-[14px] leading-[18px] tracking-[-0.28px]">
                            down from last month.
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <p
                    className="text-ink text-[32px] leading-[48px]"
                    // Figma sets the `zero` feature — a slashed zero, so 52,487.00
                    // can't be misread at a glance.
                    style={{ fontFeatureSettings: '"zero" 1' }}
                  >
                    {/* One text node in the design, mark included — so the currency
                         rides in the same flow rather than as a sibling span. */}
                    <RollingNumber
                      value={amount}
                      prefix={selectedCurrency.symbol}
                      tracking="-0.64px"
                    />
                  </p>
                </div>
              </motion.div>

              {/* The chip starts 3px above the title and the ranges finish 11px
                  above the amount's baseline box — the two columns don't share
                  their top and bottom edges in the design. */}
              <motion.div
                {...rise(0.18)}
                className="-mt-[3px] flex shrink-0 flex-col items-end justify-between gap-6 self-stretch pb-[11px]"
              >
                <CurrencySelect value={currency} onChange={setCurrency} />

                <div
                  role="tablist"
                  aria-label="Time range"
                  className="flex items-center gap-3"
                >
                  {(Object.keys(RANGES) as Range[]).map((r) => (
                    <motion.button
                      key={r}
                      type="button"
                      role="tab"
                      aria-selected={r === range}
                      onClick={() => setRange(r)}
                      className={`trim-cap cursor-pointer text-[12px] leading-[22px] tracking-[-0.24px] outline-none focus-visible:underline ${
                        r === range ? 'text-ink' : 'text-stat-dim'
                      }`}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      transition={springResponsive}
                    >
                      {r}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

          {/* Plot — dither-kit's canvas renderer, replacing the flat Figma
              export, so the range tabs actually redraw the curve. This is the
              sheet's elastic block: everything else is type at a fixed size, so
              the plot is what yields when the frame is short.

              The draw-on animation replays off the identity of `data`, which
              only changes when the range does — no `replayToken` needed, and
              scrubbing leaves the curve alone. */}
          <motion.div
            {...rise(0.24)}
            ref={chartRef}
            onPointerMove={(e) => {
              if (chartRef.current) {
                mouseY.current =
                  e.clientY - chartRef.current.getBoundingClientRect().top
              }
            }}
            onPointerLeave={() => {
              setHoverIndex(null)
              mouseY.current = 0
            }}
            className="relative z-0 mt-1 h-[clamp(180px,30vh,348px)] w-full overflow-hidden rounded-t-[32px]"
          >
            <AreaChart
              data={data}
              config={chartConfig}
              bloom="low"
              // Past the scrub point the fill drops to #BEBEBE — the sheet's
              // own muted grey — while the trend line stays whole.
              trailColor="mute"
              margins={CHART_MARGINS}
              className="size-full"
              onHoverChange={handleChartHover}
            >
              {/* `hatched` rather than `gradient`: the Figma plot fills its
                  region with diagonal hatching, and a solid dither fill swamps
                  a sheet that is otherwise white. */}
              <Area dataKey="value" variant="hatched" />
              {/* No <Tooltip>: the sheet's own headline is the readout now, and
                  a floating card on top of it would say the same thing twice. */}
            </AreaChart>
          </motion.div>

          {/* Kept from the design rather than dither-kit's <XAxis />, whose ticks
              are mono 10px — these are the sheet's Open Runde 12px. Inset to the
              plot's width (588 of 668), as in Figma. */}
          <motion.div
            {...rise(0.3)}
            className="text-stat-dim mx-auto mt-4 flex w-[88%] items-center justify-between text-[12px] leading-[22px] tracking-[-0.24px]"
          >
            {ticks.map((point, i) => (
              <span key={`${point.date}-${i}`}>{tickLabel(point.date)}</span>
            ))}
          </motion.div>

          <motion.div
            {...rise(0.36)}
            className="relative mx-auto mt-7 w-full max-w-[526px]"
          >
            {/* 106px with the copy starting at 19.5: the panel is shorter than
                the text it holds, and the blur is what resolves that — the last
                lines fade rather than being clipped. 19.5px side padding leaves
                the copy the design's 487px measure inside 526. */}
            <div className="bg-panel border-panel-edge relative h-[106px] overflow-hidden rounded-[16px] border-[0.5px] px-[19.5px] pt-5">
              <p className="text-stat text-[14px] leading-[22px] tracking-[-0.28px]">
                {insight}
              </p>

              {/* Figma's "Progressive Blur" layer — 526×70, flush to both sides
                  and pinned to the bottom edge of the 106px panel. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70px] overflow-hidden rounded-t-[20px]">
                <ProgressiveBlur />
              </div>
            </div>

            {/* Overlaps the panel's bottom edge by 15px, as in the design. */}
            <motion.button
              type="button"
              // Shimmer bottom-to-top into the insights view — the sheet swaps
              // underneath the band at its midpoint, same as ArticleReader's
              // article/summary toggle.
              onClick={() => sweep(() => setView('insights'), { direction: 'btt' })}
              // Node 153:2612 — 156×42, content row 16px at 16/13 inset.
              // `z-20` puts the key above the blur where the two overlap, as the
              // design layers them. Padding is 14/11 rather than the node's
              // 16/13 because Figma draws the 2px stroke *inside* the 42px box
              // and CSS adds it on top: 2+14+16+14+2 = 48 wide of chrome, and
              // 2+11+16+11+2 = 42 tall.
              className="bg-insight text-insight-ink border-insight-ink absolute -bottom-[27px] left-1/2 z-20 flex -translate-x-1/2 cursor-pointer items-center gap-1 rounded-[12px] border-2 px-[14px] py-[11px] text-[14px] leading-[22px] tracking-[-0.28px] outline-none focus-visible:ring-2 focus-visible:ring-insight-edge/40"
              // `initial={false}`: the sheet's own entrance already brings the
              // key in — this would otherwise animate the lip from nothing.
              initial={false}
              animate={KEY.rest}
              whileHover={KEY.hover}
              whileFocus={KEY.hover}
              whileTap={KEY.press}
              transition={reducedMotion ? { duration: 0 } : transitionFast}
            >
              {/* 16px tall — the icon sets the row's height, since the trimmed
                  label is only its 10px cap height. No line box of its own. */}
              <span className="flex items-center gap-1">
                <img src={iconScriptAi} alt="" aria-hidden="true" className="size-4" />
                <span className="trim-cap">Portfolio Insight</span>
              </span>
            </motion.button>
          </motion.div>
        </PortfolioSheet>
        )}
      </div>
    </DeviceFrame>
  )
}
