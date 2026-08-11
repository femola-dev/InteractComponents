import type { ChartConfig } from '../components/dither-kit/chart-context'
import type { DitherColor } from '../components/dither-kit/palette'

export type Holding = {
  ticker: string
  name: string
  shares: number
  avgCost: number
  price: number
  color: DitherColor
}

type BaseHolding = {
  ticker: string
  name: string
  shares: number
  baseAvgCost: number
  basePrice: number
  color: DitherColor
}

/** Cost basis and share count don't depend on which month you're looking
 *  at — only `price` does, so those live here and `generateHoldings` varies
 *  price around `basePrice` per (seed, month, ticker). */
const BASE_HOLDINGS: BaseHolding[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 124, baseAvgCost: 158.0, basePrice: 135.2, color: 'green' },
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 55, baseAvgCost: 195.0, basePrice: 228.5, color: 'blue' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 24, baseAvgCost: 410.0, basePrice: 430.1, color: 'purple' },
  { ticker: 'AMZN', name: 'Amazon, Inc.', shares: 36, baseAvgCost: 230.0, basePrice: 205.3, color: 'pink' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', shares: 20, baseAvgCost: 310.0, basePrice: 272.08, color: 'orange' },
]

/** Small, fast string hash (FNV-ish) — just needs to spread ticker+month
 *  pairs across the seed space, not to be cryptographically sound. */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h
}

/** mulberry32 — a tiny deterministic PRNG. Same seed in, same sequence out,
 *  which is the whole point: a session's random pick has to reproduce the
 *  identical numbers every time the same (seed, ticker, month) is asked for
 *  again, not just once. */
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A multiplier in [1 - variance, 1 + variance], deterministic per `seed` +
 *  `key`. */
function variedMultiplier(seed: number, key: string, variance = 0.16): number {
  const rand = mulberry32(seed ^ hashString(key))
  return 1 + (rand() * 2 - 1) * variance
}

/**
 * Portfolio Insights' holdings — regenerated from `seed` (random per page
 * load/session, see `PortfolioInsights`'s `useState(() => Math.random()...)`
 * and `monthId` (the month picker), so the portfolio value is different on
 * every reload and every month you pick, while re-selecting a month you've
 * already viewed this session shows the same numbers you saw before (pure
 * function of seed+month, not re-rolled on every render).
 */
export function generateHoldings(seed: number, monthId: string): Holding[] {
  return BASE_HOLDINGS.map((b) => ({
    ticker: b.ticker,
    name: b.name,
    shares: b.shares,
    avgCost: b.baseAvgCost,
    price: Math.max(1, +(b.basePrice * variedMultiplier(seed, `${b.ticker}:${monthId}`)).toFixed(2)),
    color: b.color,
  }))
}

export const marketValue = (h: Holding) => h.shares * h.price
export const changeFraction = (h: Holding) => (h.price - h.avgCost) / h.avgCost

export const holdingsTotal = (all: Holding[]) => all.reduce((sum, h) => sum + marketValue(h), 0)

export const allocationFraction = (h: Holding, all: Holding[]) => marketValue(h) / holdingsTotal(all)

/** One numeric row per holding — feeds `<PieChart data={pieData(holdings)} dataKey="value" nameKey="ticker">`. */
export const pieData = (all: Holding[]) => all.map((h) => ({ ticker: h.ticker, value: marketValue(h) }))

export const holdingsChartConfig = (all: Holding[]): ChartConfig =>
  Object.fromEntries(all.map((h) => [h.ticker, { label: h.ticker, color: h.color }]))

/**
 * A brief, hand-written "AI insight" line for one holding. The claims it
 * makes ("your largest holding", "the portfolio's strongest performer") are
 * computed against the *current* `all` set rather than hardcoded per ticker
 * — now that price varies per seed/month, whichever stock actually is
 * largest/best/worst this time around is what gets that framing, so the
 * copy can never say something the numbers next to it don't back up.
 */
export function holdingInsight(h: Holding, all: Holding[], symbol: string, rate: number): string {
  const amount = `${symbol}${(marketValue(h) * rate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  const change = changeFraction(h)
  const pct = `${(Math.abs(change) * 100).toFixed(2)}%`
  const alloc = (allocationFraction(h, all) * 100).toFixed(1)
  const direction = change >= 0 ? 'up' : 'down'

  const isLargest = all.every((x) => marketValue(x) <= marketValue(h))
  const isSmallest = all.every((x) => marketValue(x) >= marketValue(h))
  const isBestPerformer = all.every((x) => changeFraction(x) <= change)
  const isWorstPerformer = all.every((x) => changeFraction(x) >= change)

  if (isLargest && change < 0) {
    return `${h.ticker} is your largest holding at ${amount} — ${alloc}% of the portfolio — and its ${pct} slide this month is the single biggest drag on performance.`
  }
  if (isBestPerformer && change > 0) {
    return `${h.ticker} is up ${pct} to ${amount}, easily the portfolio's strongest performer and a bright spot in an otherwise rough month.`
  }
  if (isWorstPerformer && change < 0) {
    return `${h.ticker} is down ${pct} to ${amount}, now ${alloc}% of the portfolio and the month's weakest position.`
  }
  if (isLargest) {
    return `${h.ticker} is your largest holding at ${amount} — ${alloc}% of the portfolio — ${direction} ${pct} this month.`
  }
  if (isSmallest) {
    return `${h.ticker} ${change >= 0 ? 'climbed' : 'fell'} ${pct} to ${amount}. It's the smallest position at ${alloc}%, so the move has a limited effect on the total.`
  }
  return `${h.ticker} is worth ${amount} (${alloc}% of the portfolio), ${direction} ${pct} this month.`
}
