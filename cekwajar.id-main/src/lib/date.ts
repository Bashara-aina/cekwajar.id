/**
 * Indonesian date formatting utilities.
 * Uses Intl.DateTimeFormat for proper ID locale formatting.
 */

const idLocale = 'id-ID';

/**
 * Formats a date as short format.
 * Output: "07/05/2026"
 */
export function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a date in long Indonesian format.
 * Output: "7 Mei 2026"
 */
export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat(idLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
