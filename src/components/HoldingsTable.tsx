import type { CSSProperties } from 'react'
import {
  allocationFraction,
  changeFraction,
  type Holding,
  marketValue,
} from '../lib/holdings'
import { rgb, seedOfColor } from './dither-kit/palette'

type Props = {
  holdings: Holding[]
  symbol: string
  rate: number
  /** Ticker hovered on the pie chart — shades that row the same as a direct hover. */
  hoveredTicker?: string | null
}

const money = (value: number, symbol: string, rate: number) =>
  `${symbol}${(value * rate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const pct = (fraction: number) =>
  `${fraction >= 0 ? '+' : ''}${(fraction * 100).toFixed(2)}%`

// Figma node 185:2483 — Holding, Price, Shares, Allocation, Change, Market
// Value, in that order; every figure right-aligned against the header.
const HEAD_CELLS = ['Holding', 'Price', 'Shares', 'Allocation', 'Change', 'Market Value']

export function HoldingsTable({ holdings, symbol, rate, hoveredTicker }: Props) {
  return (
    <div className="border-hairline overflow-hidden rounded-[16px] border">
      {/* `border-separate` (not `collapse`): under collapse, Chrome resets a
          `<tr>` background at every `<td>` boundary instead of painting it as
          one continuous surface, which cut the moving stripe off mid-row. */}
      <table className="font-figure w-full border-separate border-spacing-0 text-[14px]">
        <thead>
          <tr className="bg-[#fafafa]">
            {HEAD_CELLS.map((label, i) => (
              <th
                key={label}
                scope="col"
                className={`border-hairline border-b px-3 py-2.5 text-[12px] font-semibold tracking-[-0.11px] text-stat-dim uppercase ${
                  i === 0 ? 'text-left' : 'text-right'
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const seed = seedOfColor(holding.color)
            const value = marketValue(holding)
            const change = changeFraction(holding)
            const gain = change >= 0
            return (
              <tr
                key={holding.ticker}
                className="row-hatch transition-colors duration-150"
                data-active={hoveredTicker === holding.ticker || undefined}
                style={{ '--row-hatch-color': rgb(seed.fill, 1, 0.07) } as CSSProperties}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-7 w-0.5 shrink-0 rounded-[1px]"
                      style={{ backgroundColor: rgb(seed.fill) }}
                      aria-hidden="true"
                    />
                    <span className="flex flex-col leading-tight">
                      <span className="text-ink font-semibold">{holding.ticker}</span>
                      <span className="text-stat-dim text-[12px] whitespace-nowrap">
                        {holding.name}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="text-stat px-3 py-2.5 text-right tabular-nums">
                  {money(holding.price, symbol, rate)}
                </td>
                <td className="text-stat px-3 py-2.5 text-right tabular-nums">
                  {holding.shares.toLocaleString('en-US')}
                </td>
                <td className="text-stat px-3 py-2.5 text-right tabular-nums">
                  {(allocationFraction(holding, holdings) * 100).toFixed(1)}%
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums"
                  style={{ color: gain ? 'var(--color-gain)' : 'var(--color-loss)' }}
                >
                  {pct(change)}
                </td>
                <td className="text-ink px-3 py-2.5 text-right font-semibold tabular-nums">
                  {money(value, symbol, rate)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
