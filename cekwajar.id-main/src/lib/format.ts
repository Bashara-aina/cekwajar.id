/**
 * Indonesian number and currency formatting utilities.
 * Uses Intl APIs for proper ID locale formatting.
 */

/**
 * Formats a number as Indonesian Rupiah currency.
 * Output: "Rp 8.550.000"
 */
export function formatCurrency(idr: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(idr);
}

/**
 * Formats a number with thousands separator (dot).
 * Output: "8.550.000"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Formats a decimal as Indonesian percentage.
 * Output: "2,5%"
 */
export function formatPercent(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Parses a currency input string back to a number.
 * Strips "Rp", dots, and spaces.
 * Input: "Rp 8.550.000" or "8.550.000" → 8550000
 */
export function parseCurrencyInput(str: string): number {
  const cleaned = str
    .replace(/Rp\s?/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
