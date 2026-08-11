import flagUs from 'svg-country-flags/svg/us.svg'
import flagCanada from 'svg-country-flags/svg/ca.svg'
import flagNigeria from 'svg-country-flags/svg/ng.svg'
import flagPound from 'svg-country-flags/svg/gb.svg'
import flagIndia from 'svg-country-flags/svg/in.svg'

/**
 * Figma currency options from the open menu (node 166:294). Chip labels come
 * from the closed pill (node 153:2523); menu labels are the longer "CODE - Place"
 * strings. Rates are local reference multipliers off a USD base, not live FX.
 */
export const CURRENCIES = [
  {
    id: 'USD',
    chip: 'US Dollar',
    menu: 'USD - United States',
    flag: flagUs,
    symbol: '$',
    rate: 1,
  },
  {
    id: 'CAD',
    chip: 'Canadian Dollar',
    menu: 'CAD - Canada',
    flag: flagCanada,
    symbol: 'CA$',
    rate: 1.37,
  },
  {
    id: 'NGN',
    chip: 'Naira',
    menu: 'NGN - Nigeria',
    flag: flagNigeria,
    symbol: '₦',
    rate: 1500,
  },
  {
    id: 'GBP',
    chip: 'Pounds',
    menu: 'GBP - United Kingdom',
    flag: flagPound,
    symbol: '£',
    rate: 0.79,
  },
  {
    id: 'INR',
    chip: 'Indian Rupee',
    menu: 'INR - Indian',
    flag: flagIndia,
    symbol: '₹',
    rate: 83.2,
  },
] as const

export type CurrencyId = (typeof CURRENCIES)[number]['id']
export type CurrencyOption = (typeof CURRENCIES)[number]
