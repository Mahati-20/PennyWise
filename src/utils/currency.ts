import { CurrencyCode, CurrencyInfo } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
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

