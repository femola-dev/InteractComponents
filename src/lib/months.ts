export type MonthId = string

/**
 * Portfolio Insights' month picker (Figma node 186:3642). No real
 * month-scoped data behind it yet — same "static options, real selection
 * state" shape as `CURRENCIES` until the page has something to filter by.
 */
export const MONTHS: { id: MonthId; label: string }[] = [
  { id: '2026-08', label: 'August 2026' },
  { id: '2026-07', label: 'July 2026' },
  { id: '2026-06', label: 'June 2026' },
  { id: '2026-05', label: 'May 2026' },
  { id: '2026-04', label: 'April 2026' },
]
