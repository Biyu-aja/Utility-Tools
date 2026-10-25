/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: XlsxToCsv.tsx (Excel XLSX to CSV Converter page).
 */

import { ExcelConverterPage } from './ExcelConverter'

export function XlsxToCsvPage() {
  return <ExcelConverterPage defaultMode="xlsx-to-csv" />
}

export default XlsxToCsvPage
