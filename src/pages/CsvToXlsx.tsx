/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: CsvToXlsx.tsx (CSV to Excel XLSX Converter page).
 */

import { ExcelConverterPage } from './ExcelConverter'

export function CsvToXlsxPage() {
  return <ExcelConverterPage defaultMode="csv-to-xlsx" />
}

export default CsvToXlsxPage
