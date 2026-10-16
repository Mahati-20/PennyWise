import { CurrencyCode, CurrencyInfo } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateToUSD: 0.012,
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToUSD: 1.0,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToUSD: 1.08,
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToUSD: 1.28,
    locale: 'en-GB',
  },
};

/**
 * Format currency amount with locale and currency symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'INR',
  options?: { compact?: boolean; hideDecimals?: boolean }
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const isCompact = options?.compact;
  const hideDecimals = options?.hideDecimals ?? (Math.abs(amount) >= 1000 || currencyCode === 'INR');

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: hideDecimals ? 0 : 2,
      notation: isCompact ? 'compact' : 'standard',
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Convert an amount from one currency to another using the reference exchange rates.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const fromRate = CURRENCIES[from]?.rateToUSD || 1;
  const toRate = CURRENCIES[to]?.rateToUSD || 1;
  
  // Convert from -> USD -> to
  const inUSD = amount * fromRate;
  const result = inUSD / toRate;
  return Math.round(result * 100) / 100;
}
