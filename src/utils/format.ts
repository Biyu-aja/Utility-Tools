/**
 * Folder: src/utils/
 * Description: Stores independent helper/utility functions performing
 *              common repetitive tasks (like text formatting, date parsing, object manipulation, etc.).
 * 
 * This file: format.ts (Provides helpers for currency and date formatting).
 */

/**
 * Formats a number into USD currency format ($)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

/**
 * Formats a Date object or date string into a local US date format (Month Day, Year)
 */
export function formatDate(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  return parsedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formats a file size in bytes to a human-readable string (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

