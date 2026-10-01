/**
 * Folder: src/utils/
 * Description: Stores independent utility functions.
 * This file: pdfSplitter.ts (Client-side PDF splitting, naming resolution, and ZIP bundling).
 */

import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

export interface PdfFileInfo {
  name: string
  size: number
  totalPages: number
  file: File
}

export interface SplitChunkInfo {
  index: number // 0-based
  chunkNumber: number // 1-based
  startPage: number // 1-based
  endPage: number // 1-based
  pageCount: number
  pageIndices: number[] // 0-based for pdf-lib
  fileName: string
}

export interface SplitResultItem {
  chunkNumber: number
  fileName: string
  pageRangeText: string
  pageCount: number
  blob: Blob
  size: number
  downloadUrl: string
}

export interface SplitProgress {
  stage: 'reading' | 'splitting' | 'zipping' | 'done' | 'error'
  current: number
  total: number
  message: string
}

/**
 * Loads a PDF file and extracts total page count
 */
export async function loadPdfFileInfo(file: File): Promise<{ info: PdfFileInfo; arrayBuffer: ArrayBuffer }> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
  const totalPages = pdfDoc.getPageCount()

  return {
    info: {
      name: file.name,
      size: file.size,
      totalPages,
      file,
    },
    arrayBuffer,
  }
}

/**
 * Calculates chunks and resolves file names with automatic round-robin looping
 */
export function calculateSplitChunks(
  totalPages: number,
  pagesPerFile: number,
  customNames: string[],
  originalFileName: string
): SplitChunkInfo[] {
  if (totalPages <= 0 || pagesPerFile <= 0) return []

  const validPagesPerFile = Math.max(1, Math.min(pagesPerFile, totalPages))
  const cleanOriginalName = originalFileName.replace(/\.[^/.]+$/, '') || 'document'

  // Filter out empty lines from custom names
  const cleanNames = customNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => name.replace(/\.pdf$/i, ''))

  const chunks: SplitChunkInfo[] = []
  const nameOccurrences: Record<string, number> = {}

  let currentPage = 1
  let chunkIdx = 0

  while (currentPage <= totalPages) {
    const startPage = currentPage
    const endPage = Math.min(currentPage + validPagesPerFile - 1, totalPages)
    const pageCount = endPage - startPage + 1

    const pageIndices: number[] = []
    for (let p = startPage - 1; p < endPage; p++) {
      pageIndices.push(p)
    }

    let finalFileName = ''

    if (cleanNames.length > 0) {
      // Loop through custom names (round-robin)
      const baseName = cleanNames[chunkIdx % cleanNames.length]
      const occurrence = (nameOccurrences[baseName] || 0) + 1
      nameOccurrences[baseName] = occurrence

      if (occurrence === 1) {
        finalFileName = `${baseName}.pdf`
      } else {
        // Append index for subsequent loops to prevent duplicate names in ZIP
        finalFileName = `${baseName} (${occurrence}).pdf`
      }
    } else {
      // Default naming
      finalFileName = `${cleanOriginalName}_part_${chunkIdx + 1}.pdf`
    }

    chunks.push({
      index: chunkIdx,
      chunkNumber: chunkIdx + 1,
      startPage,
      endPage,
      pageCount,
      pageIndices,
      fileName: finalFileName,
    })

    currentPage = endPage + 1
    chunkIdx++
  }

  return chunks
}

/**
 * Splits the PDF according to calculated chunks and packages into a ZIP file
 */
export async function splitPdfAndZip(
  fileBuffer: ArrayBuffer,
  chunks: SplitChunkInfo[],
  _zipFileName: string,
  onProgress?: (progress: SplitProgress) => void
): Promise<{ zipBlob: Blob; zipUrl: string; items: SplitResultItem[] }> {
  onProgress?.({
    stage: 'reading',
    current: 0,
    total: chunks.length,
    message: 'Memuat struktur dokumen PDF...',
  })

  // Load source document
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
  const zip = new JSZip()
  const items: SplitResultItem[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    onProgress?.({
      stage: 'splitting',
      current: i + 1,
      total: chunks.length,
      message: `Memisahkan ${chunk.fileName} (Hal ${chunk.startPage}–${chunk.endPage})...`,
    })

    // Create a new PDF document for this chunk
    const subDoc = await PDFDocument.create()
    const copiedPages = await subDoc.copyPages(srcDoc, chunk.pageIndices)

    for (const page of copiedPages) {
      subDoc.addPage(page)
    }

    // Save as binary
    const pdfBytes = await subDoc.save()
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
    const downloadUrl = URL.createObjectURL(blob)

    items.push({
      chunkNumber: chunk.chunkNumber,
      fileName: chunk.fileName,
      pageRangeText: `Hal ${chunk.startPage} - ${chunk.endPage}`,
      pageCount: chunk.pageCount,
      blob,
      size: blob.size,
      downloadUrl,
    })

    // Add to ZIP
    zip.file(chunk.fileName, pdfBytes)
  }

  onProgress?.({
    stage: 'zipping',
    current: chunks.length,
    total: chunks.length,
    message: 'Mengompresi semua file PDF ke dalam arsip ZIP...',
  })

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.({
        stage: 'zipping',
        current: Math.round(metadata.percent),
        total: 100,
        message: `Mengompresi ZIP: ${Math.round(metadata.percent)}%`,
      })
    }
  )

  const zipUrl = URL.createObjectURL(zipBlob)

  onProgress?.({
    stage: 'done',
    current: chunks.length,
    total: chunks.length,
    message: `Berhasil memisahkan ${chunks.length} file PDF!`,
  })

  return { zipBlob, zipUrl, items }
}

/**
 * Downloads a Blob directly to the user's device
 */
export function downloadFileBlob(blob: Blob, fileName: string): void {
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
 * Creates a demo PDF with given number of pages for instant testing
 */
export async function createDemoPdf(pageCount: number = 30): Promise<{ file: File; arrayBuffer: ArrayBuffer; info: PdfFileInfo }> {
  const doc = await PDFDocument.create()

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]) // A4 (points)
    const { width, height } = page.getSize()

    // Draw some decorative background elements
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: { type: 'RGB', red: 0.8, green: 0.85, blue: 0.95 } as any,
      borderWidth: 2,
    })

    // Header label
    page.drawRectangle({
      x: 50,
      y: height - 100,
      width: width - 100,
      height: 45,
      color: { type: 'RGB', red: 0.93, green: 0.95, blue: 1.0 } as any,
    })
  }

  const pdfBytes = await doc.save()
  const fileName = `Demo_Dokumen_${pageCount}_Halaman.pdf`
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
  const file = new File([blob], fileName, { type: 'application/pdf' })

  return {
    file,
    arrayBuffer: pdfBytes.buffer as ArrayBuffer,
    info: {
      name: fileName,
      size: blob.size,
      totalPages: pageCount,
      file,
    },
  }
}

