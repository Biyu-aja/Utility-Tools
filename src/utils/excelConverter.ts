/**
 * Folder: src/utils/
 * Description: Stores independent utility functions.
 * This file: excelConverter.ts (Client-side CSV <-> XLSX parser, generator, and delimiter detector).
 */

import JSZip from 'jszip'

export interface SheetInfo {
  name: string
  path: string
  sheetId: string
}

export interface ParsedWorkbook {
  fileName: string
  sheets: SheetInfo[]
  activeSheetName: string
  data: string[][]
  allSheetsData?: Record<string, string[][]>
}

export interface CsvParseOptions {
  delimiter?: string // 'auto' or specific delimiter
  skipEmptyLines?: boolean
}

export interface XlsxExportOptions {
  sheetName?: string
  styleHeader?: boolean
  autoFitWidth?: boolean
  smartDataTypes?: boolean
}

export interface CsvExportOptions {
  delimiter?: string // ',', ';', '\t', '|'
  withBom?: boolean // true for Windows Excel UTF-8 compatibility
  quoteAll?: boolean
}

export interface BatchConvertItem {
  id: string
  fileName: string
  originalSize: number
  status: 'pending' | 'processing' | 'done' | 'error'
  resultBlob?: Blob
  resultSize?: number
  resultFileName?: string
  errorMessage?: string
  previewData?: string[][]
  sheetNames?: string[]
}

/**
 * Escapes special XML characters for OpenXML.
 */
export function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

/**
 * Converts 0-based column index to Excel column letters (0 -> 'A', 25 -> 'Z', 26 -> 'AA', etc.).
 */
export function colIndexToLetter(colIndex: number): string {
  let temp = colIndex + 1
  let letter = ''
  while (temp > 0) {
    const mod = (temp - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    temp = Math.floor((temp - mod) / 26)
  }
  return letter
}

/**
 * Converts Excel column letter to 0-based column index ('A' -> 0, 'Z' -> 25, 'AA' -> 26).
 */
export function colLetterToIndex(colStr: string): number {
  let index = 0
  for (let i = 0; i < colStr.length; i++) {
    index = index * 26 + (colStr.charCodeAt(i) - 64)
  }
  return index - 1
}

/**
 * Automatically detects the most likely delimiter for CSV text.
 */
export function detectDelimiter(text: string): string {
  const delimiters = [',', ';', '\t', '|']
  const lines = text
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 15) // check first 15 lines

  if (lines.length === 0) return ','

  let bestDelimiter = ','
  let bestScore = -1

  for (const delim of delimiters) {
    let lineCounts: number[] = []
    for (const line of lines) {
      let count = 0
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delim && !inQuotes) {
          count++
        }
      }
      lineCounts.push(count)
    }

    // Delimiter must appear at least once per line
    const nonZeroCounts = lineCounts.filter((c) => c > 0)
    if (nonZeroCounts.length === 0) continue

    // Check consistency of column counts
    const firstCount = nonZeroCounts[0]
    const isConsistent = nonZeroCounts.every((c) => c === firstCount)
    const avgCount = nonZeroCounts.reduce((a, b) => a + b, 0) / nonZeroCounts.length

    // Score based on consistency and occurrence rate
    const consistencyScore = isConsistent ? 100 : (nonZeroCounts.length / lineCounts.length) * 50
    const score = consistencyScore + avgCount

    if (score > bestScore) {
      bestScore = score
      bestDelimiter = delim
    }
  }

  return bestDelimiter
}

/**
 * Parses RFC-4180 compliant CSV string into a 2D array.
 */
export function parseCsv(text: string, options?: CsvParseOptions): { data: string[][]; delimiter: string } {
  // Strip BOM if present
  let cleanText = text
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1)
  }

  const delimiter =
    options?.delimiter && options.delimiter !== 'auto' ? options.delimiter : detectDelimiter(cleanText)

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false
  let i = 0
  const len = cleanText.length

  while (i < len) {
    const char = cleanText[i]

    if (char === '"') {
      if (inQuotes && cleanText[i + 1] === '"') {
        // Escaped quote
        currentCell += '"'
        i += 2
        continue
      } else {
        // Toggle quote
        inQuotes = !inQuotes
        i++
        continue
      }
    }

    if (!inQuotes) {
      // Check delimiter
      if (cleanText.substring(i, i + delimiter.length) === delimiter) {
        currentRow.push(currentCell)
        currentCell = ''
        i += delimiter.length
        continue
      }

      // Check line break
      if (char === '\r' || char === '\n') {
        currentRow.push(currentCell)
        currentCell = ''

        // Skip potential \n after \r
        if (char === '\r' && cleanText[i + 1] === '\n') {
          i++
        }

        // Only add non-empty rows or if skipEmptyLines is false
        const hasContent = currentRow.some((c) => c.trim().length > 0)
        if (hasContent || options?.skipEmptyLines === false) {
          rows.push(currentRow)
        }
        currentRow = []
        i++
        continue
      }
    }

    currentCell += char
    i++
  }

  // Final cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell)
    const hasContent = currentRow.some((c) => c.trim().length > 0)
    if (hasContent || options?.skipEmptyLines === false) {
      rows.push(currentRow)
    }
  }

  return { data: rows, delimiter }
}

/**
 * Checks if a string value should be treated as numeric in Excel.
 * Preserves phone numbers (e.g., 081234567), NIK / long IDs (>15 digits) as text.
 */
export function isNumericCell(val: string): boolean {
  if (!val || typeof val !== 'string') return false
  const trimmed = val.trim()
  if (trimmed === '') return false

  // Preserve leading zero strings like "081234..." or "0123" as text
  if (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.')) {
    return false
  }

  // Numbers with 16 or more digits lose precision in Excel float representation (IEEE 754), keep as string!
  if (/^\d{16,}$/.test(trimmed)) {
    return false
  }

  // Standard integer, decimal, or scientific notation
  return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)
}

/**
 * Checks if a value is boolean (TRUE / FALSE).
 */
export function isBooleanCell(val: string): boolean {
  if (!val) return false
  const upper = val.trim().toUpperCase()
  return upper === 'TRUE' || upper === 'FALSE'
}

/**
 * Generates an OpenXML (.xlsx) Blob from 2D data using JSZip.
 */
export async function generateXlsxBlob(
  data: string[][],
  options: XlsxExportOptions = {}
): Promise<Blob> {
  const {
    sheetName = 'Sheet1',
    styleHeader = true,
    autoFitWidth = true,
    smartDataTypes = true,
  } = options

  const cleanSheetName = escapeXml(sheetName.replace(/[\\/*?[\]:]/g, '_').slice(0, 31) || 'Sheet1')
  const zip = new JSZip()

  // 1. Collect shared strings & compute column widths
  const sharedStringsMap = new Map<string, number>()
  const sharedStrings: string[] = []
  let totalStringCount = 0

  function addSharedString(str: string): number {
    totalStringCount++
    let idx = sharedStringsMap.get(str)
    if (idx === undefined) {
      idx = sharedStrings.length
      sharedStringsMap.set(str, idx)
      sharedStrings.push(str)
    }
    return idx
  }

  const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0)
  const colWidths: number[] = new Array(maxCols).fill(10)

  // 2. Build Sheet XML
  let sheetDataXml = ''

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex]
    const rowNumber = rowIndex + 1
    const isHeader = rowIndex === 0 && styleHeader

    let rowXml = `<row r="${rowNumber}" spans="1:${maxCols}">`

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const rawVal = row[colIndex] ?? ''
      const cellRef = `${colIndexToLetter(colIndex)}${rowNumber}`
      const styleIdx = isHeader ? '1' : '0'

      // Track column width
      if (rawVal.length > 0) {
        colWidths[colIndex] = Math.max(colWidths[colIndex], Math.min(rawVal.length + 3, 50))
      }

      if (rawVal === '') {
        // Empty cell
        rowXml += `<c r="${cellRef}" s="${styleIdx}"/>`
      } else if (smartDataTypes && !isHeader && isNumericCell(rawVal)) {
        // Numeric cell (Excel type 'n')
        rowXml += `<c r="${cellRef}" s="${styleIdx}"><v>${rawVal.trim()}</v></c>`
      } else if (smartDataTypes && !isHeader && isBooleanCell(rawVal)) {
        // Boolean cell (Excel type 'b')
        const boolVal = rawVal.trim().toUpperCase() === 'TRUE' ? '1' : '0'
        rowXml += `<c r="${cellRef}" t="b" s="${styleIdx}"><v>${boolVal}</v></c>`
      } else {
        // String cell via shared strings
        const strIdx = addSharedString(rawVal)
        rowXml += `<c r="${cellRef}" t="s" s="${styleIdx}"><v>${strIdx}</v></c>`
      }
    }

    rowXml += '</row>'
    sheetDataXml += rowXml
  }

  // Column width XML
  let colsXml = ''
  if (autoFitWidth && maxCols > 0) {
    colsXml = '<cols>'
    for (let i = 0; i < maxCols; i++) {
      const w = Math.max(colWidths[i] || 10, 10)
      colsXml += `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`
    }
    colsXml += '</cols>'
  }

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${colsXml}
  <sheetData>
    ${sheetDataXml}
  </sheetData>
</worksheet>`

  // 3. Shared Strings XML
  let sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${totalStringCount}" uniqueCount="${sharedStrings.length}">`
  for (const s of sharedStrings) {
    sharedStringsXml += `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`
  }
  sharedStringsXml += '</sst>'

  // 4. Styles XML (Default font + clean styled header)
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font>
      <sz val="11"/>
      <color rgb="FF0F172A"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <color rgb="FF0F172A"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="medium"><color rgb="FF94A3B8"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`

  // 5. Workbook XML
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="20480" windowHeight="10240"/>
  </bookViews>
  <sheets>
    <sheet name="${cleanSheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  // 6. Workbook Relationships
  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`

  // 7. Root Relationships
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  // 8. Content Types
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`

  // Add files to ZIP
  zip.file('[Content_Types].xml', contentTypesXml)
  zip.file('_rels/.rels', rootRelsXml)
  zip.file('xl/_rels/workbook.xml.rels', workbookRelsXml)
  zip.file('xl/workbook.xml', workbookXml)
  zip.file('xl/styles.xml', stylesXml)
  zip.file('xl/sharedStrings.xml', sharedStringsXml)
  zip.file('xl/worksheets/sheet1.xml', sheetXml)

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * Parses an XLSX file from File or ArrayBuffer.
 */
export async function parseXlsxFile(
  fileOrBuffer: File | Blob | ArrayBuffer,
  fileName: string = 'workbook.xlsx'
): Promise<ParsedWorkbook> {
  const arrayBuffer =
    fileOrBuffer instanceof Blob ? await fileOrBuffer.arrayBuffer() : fileOrBuffer
  const zip = await JSZip.loadAsync(arrayBuffer)
  const domParser = new DOMParser()

  // 1. Read shared strings
  const sharedStrings: string[] = []
  const sharedStringsFile = zip.file('xl/sharedStrings.xml')
  if (sharedStringsFile) {
    const sstXml = await sharedStringsFile.async('string')
    const sstDoc = domParser.parseFromString(sstXml, 'application/xml')
    const siElements = sstDoc.querySelectorAll('si')
    siElements.forEach((si) => {
      const tElements = si.querySelectorAll('t')
      if (tElements.length > 0) {
        let text = ''
        tElements.forEach((t) => {
          text += t.textContent || ''
        })
        sharedStrings.push(text)
      } else {
        sharedStrings.push(si.textContent || '')
      }
    })
  }

  // 2. Read workbook relationships to map r:id to file paths
  const relsMap = new Map<string, string>()
  const workbookRelsFile = zip.file('xl/_rels/workbook.xml.rels')
  if (workbookRelsFile) {
    const relsXml = await workbookRelsFile.async('string')
    const relsDoc = domParser.parseFromString(relsXml, 'application/xml')
    const relationships = relsDoc.querySelectorAll('Relationship')
    relationships.forEach((rel) => {
      const id = rel.getAttribute('Id')
      const target = rel.getAttribute('Target')
      if (id && target) {
        // Normalize path: if target is "worksheets/sheet1.xml", full path is "xl/worksheets/sheet1.xml"
        const cleanTarget = target.startsWith('xl/')
          ? target
          : target.startsWith('/')
            ? target.slice(1)
            : `xl/${target}`
        relsMap.set(id, cleanTarget)
      }
    })
  }

  // 3. Read sheets from workbook.xml
  const sheets: SheetInfo[] = []
  const workbookFile = zip.file('xl/workbook.xml')
  if (workbookFile) {
    const wbXml = await workbookFile.async('string')
    const wbDoc = domParser.parseFromString(wbXml, 'application/xml')
    const sheetNodes = wbDoc.querySelectorAll('sheet')
    sheetNodes.forEach((s) => {
      const name = s.getAttribute('name') || 'Sheet'
      const sheetId = s.getAttribute('sheetId') || '1'
      const rId = s.getAttribute('r:id') || s.getAttribute('id') || ''
      const targetPath = relsMap.get(rId) || `xl/worksheets/sheet${sheetId}.xml`
      sheets.push({
        name,
        sheetId,
        path: targetPath,
      })
    })
  }

  // Fallback: If no sheets found in workbook.xml, search zip for any worksheet
  if (sheets.length === 0) {
    const worksheetFiles = zip.file(/^xl\/worksheets\/sheet\d+\.xml$/i)
    if (worksheetFiles.length > 0) {
      worksheetFiles.forEach((f, idx) => {
        sheets.push({
          name: `Sheet${idx + 1}`,
          sheetId: `${idx + 1}`,
          path: f.name,
        })
      })
    } else {
      throw new Error('Tidak ditemukan lembar kerja (worksheet) dalam file Excel ini.')
    }
  }

  // Helper function to parse a single worksheet file
  const parseSheetXmlContent = async (sheetPath: string): Promise<string[][]> => {
    let file = zip.file(sheetPath)
    if (!file) {
      // Try alternate casing or prefix
      const alt = sheetPath.replace(/^xl\//, '')
      file = zip.file(alt) || zip.file(`xl/${alt}`)
    }
    if (!file) return []

    const xml = await file.async('string')
    const doc = domParser.parseFromString(xml, 'application/xml')
    const rowElements = doc.querySelectorAll('row')

    const grid: string[][] = []

    rowElements.forEach((rowElem) => {
      const rowIndexAttr = rowElem.getAttribute('r')
      const rowIndex = rowIndexAttr ? parseInt(rowIndexAttr, 10) - 1 : grid.length

      while (grid.length <= rowIndex) {
        grid.push([])
      }
      const currentRow = grid[rowIndex]

      const cellElements = rowElem.querySelectorAll('c')
      let currentColIndex = 0

      cellElements.forEach((c) => {
        const rAttr = c.getAttribute('r')
        if (rAttr) {
          const match = rAttr.match(/^([A-Z]+)(\d+)$/i)
          if (match) {
            currentColIndex = colLetterToIndex(match[1].toUpperCase())
          }
        }

        while (currentRow.length < currentColIndex) {
          currentRow.push('')
        }

        const t = c.getAttribute('t')
        const vElem = c.querySelector('v')
        const isElem = c.querySelector('is')
        let val = ''

        if (t === 's' && vElem) {
          // Shared string index
          const idx = parseInt(vElem.textContent || '', 10)
          val = !isNaN(idx) && sharedStrings[idx] !== undefined ? sharedStrings[idx] : ''
        } else if (t === 'inlineStr' && isElem) {
          // Inline string
          const tChild = isElem.querySelector('t')
          val = tChild?.textContent || isElem.textContent || ''
        } else if (t === 'b' && vElem) {
          // Boolean
          val = vElem.textContent === '1' ? 'TRUE' : 'FALSE'
        } else if (vElem) {
          // Number or formula string result
          val = vElem.textContent || ''
        }

        currentRow[currentColIndex] = val
        currentColIndex++
      })
    })

    // Normalize rows so all rows have equal column count
    const maxCols = grid.reduce((m, r) => Math.max(m, r.length), 0)
    for (const r of grid) {
      while (r.length < maxCols) {
        r.push('')
      }
    }

    // Filter out trailing completely empty rows
    while (grid.length > 0 && grid[grid.length - 1].every((cell) => cell === '')) {
      grid.pop()
    }

    return grid
  }

  // Parse first sheet by default
  const activeSheet = sheets[0]
  const activeData = await parseSheetXmlContent(activeSheet.path)

  // Parse all sheets into a lookup map
  const allSheetsData: Record<string, string[][]> = {}
  allSheetsData[activeSheet.name] = activeData

  for (let i = 1; i < sheets.length; i++) {
    const s = sheets[i]
    allSheetsData[s.name] = await parseSheetXmlContent(s.path)
  }

  return {
    fileName,
    sheets,
    activeSheetName: activeSheet.name,
    data: activeData,
    allSheetsData,
  }
}

/**
 * Generates CSV string from 2D array.
 */
export function generateCsv(
  rows: string[][],
  options: CsvExportOptions = {}
): string {
  const { delimiter = ',', withBom = true, quoteAll = false } = options

  const formattedLines = rows.map((row) =>
    row
      .map((cell) => {
        const str = cell ?? ''
        const needsQuotes =
          quoteAll ||
          str.includes(delimiter) ||
          str.includes('"') ||
          str.includes('\n') ||
          str.includes('\r')

        if (needsQuotes) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(delimiter)
  )

  const csvBody = formattedLines.join('\r\n')
  return withBom ? `\uFEFF${csvBody}` : csvBody
}

/**
 * Creates sample CSV text for quick testing and demonstration.
 */
export function createSampleCsvData(): string {
  return `Nama,Kategori,Jumlah Terjual,Harga Satuan,Total Pendapatan,Nomor Kontak,Status
Kopi Kenangan Mantan,Minuman,145,22000,3190000,081234567890,Selesai
Croissant Butter Artisan,Makanan,80,28500,2280000,082198765432,Selesai
Matcha Oat Latte,Minuman,92,34000,3128000,085712344321,Pending
Earl Grey Milk Tea,Minuman,110,25000,2750000,081399887766,Selesai
Pain Au Chocolat,Makanan,64,31000,1984000,087811223344,Selesai
Red Velvet Frappe,Minuman,53,36000,1908000,089600112233,Dibatalkan`
}

/**
 * Downloads a Blob to the user's computer.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Bundles multiple files into a single ZIP archive.
 */
export async function createZipBundle(
  files: { name: string; blob: Blob }[]
): Promise<Blob> {
  const zip = new JSZip()
  files.forEach((f) => {
    zip.file(f.name, f.blob)
  })
  return await zip.generateAsync({ type: 'blob' })
}
