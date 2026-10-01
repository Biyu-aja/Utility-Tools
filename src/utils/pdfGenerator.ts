/**
 * Folder: src/utils/
 * Description: Stores independent utility functions.
 * This file: pdfGenerator.ts (Pure client-side Image to PDF generator without external dependencies).
 */

export interface ImageItem {
  id: string
  file: File
  name: string
  previewUrl: string
  size: number
  width: number
  height: number
  rotation: number // 0, 90, 180, 270 degrees
}
export const ImageItem = {}

export type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'fit'
export type Orientation = 'auto' | 'portrait' | 'landscape'
export type MarginSize = 'none' | 'small' | 'standard' | 'large'
export type ImageFit = 'contain' | 'fill'
export type Quality = 'high' | 'medium' | 'low'

export interface PdfOptions {
  pageSize: PageSize
  orientation: Orientation
  margin: MarginSize
  imageFit: ImageFit
  quality: Quality
  filename: string
}
export const PdfOptions = {}

// 1 mm = 72 / 25.4 points ≈ 2.83464567 points
const MM_TO_PT = 72 / 25.4

// Page dimensions in mm: [width, height] (portrait)
const PAGE_DIMENSIONS_MM: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  a3: [297, 420],
  a5: [148, 210],
}

// Margins in mm
const MARGINS_MM: Record<MarginSize, number> = {
  none: 0,
  small: 6,
  standard: 15,
  large: 25,
}

// Quality configuration
const QUALITY_SETTINGS: Record<Quality, { maxDimension: number; jpegQuality: number }> = {
  high: { maxDimension: 2560, jpegQuality: 0.92 },
  medium: { maxDimension: 1920, jpegQuality: 0.8 },
  low: { maxDimension: 1280, jpegQuality: 0.6 },
}

/**
 * Loads an HTMLImageElement from a URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`))
    img.src = url
  })
}

/**
 * Renders an image to an offscreen canvas with applied rotation and quality,
 * returning the canvas and its JPEG binary data.
 */
async function processImageCanvas(
  item: ImageItem,
  quality: Quality
): Promise<{ width: number; height: number; jpegBytes: Uint8Array }> {
  const img = await loadImage(item.previewUrl)
  const { maxDimension, jpegQuality } = QUALITY_SETTINGS[quality]

  const rotation = ((item.rotation % 360) + 360) % 360
  const isRotated90or270 = rotation === 90 || rotation === 270

  // Calculate scaled dimensions if larger than maxDimension
  let drawW = img.naturalWidth || item.width || 800
  let drawH = img.naturalHeight || item.height || 600

  const maxSide = Math.max(drawW, drawH)
  if (maxSide > maxDimension) {
    const ratio = maxDimension / maxSide
    drawW = Math.round(drawW * ratio)
    drawH = Math.round(drawH * ratio)
  }

  const canvas = document.createElement('canvas')
  const canvasW = isRotated90or270 ? drawH : drawW
  const canvasH = isRotated90or270 ? drawW : drawH
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not obtain canvas 2D rendering context')
  }

  // Paint clean white background (prevents black background for transparent PNG/WebP in JPEG)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Apply rotation
  ctx.save()
  ctx.translate(canvasW / 2, canvasH / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  // Convert to JPEG data
  const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality)
  const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1)
  const binaryString = atob(base64)
  const jpegBytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i)
  }

  return { width: canvasW, height: canvasH, jpegBytes }
}

/**
 * Encodes string to ASCII/UTF-8 Uint8Array
 */
function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Generates a valid PDF-1.4 document from an array of ImageItems
 */
export async function generatePdfFromImages(
  images: ImageItem[],
  options: PdfOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('No images provided for PDF conversion')
  }

  // Step 1: Process each image into JPEG bytes and dimensions
  const processedImages: Array<{
    width: number
    height: number
    jpegBytes: Uint8Array
  }> = []

  for (let i = 0; i < images.length; i++) {
    if (onProgress) {
      onProgress(i + 1, images.length)
    }
    const processed = await processImageCanvas(images[i], options.quality)
    processedImages.push(processed)
  }

  const numPages = processedImages.length
  // Objects layout:
  // 1: Catalog
  // 2: Pages container
  // For each page i (0 <= i < numPages):
  //   pageObjId = 3 + i * 3
  //   contentObjId = 4 + i * 3
  //   imageObjId = 5 + i * 3
  const totalObjects = 2 + numPages * 3

  const chunks: Uint8Array[] = []
  let currentOffset = 0
  const offsets: number[] = new Array(totalObjects + 1).fill(0)

  function write(bytes: Uint8Array) {
    chunks.push(bytes)
    currentOffset += bytes.length
  }

  function writeStr(str: string) {
    write(strToBytes(str))
  }

  // PDF Header
  writeStr('%PDF-1.4\r\n%\xFF\xFF\xFF\xFF\r\n')

  // Object 1: Catalog
  offsets[1] = currentOffset
  writeStr('1 0 obj\r\n<<\r\n  /Type /Catalog\r\n  /Pages 2 0 R\r\n>>\r\nendobj\r\n')

  // Object 2: Pages
  offsets[2] = currentOffset
  const pageKidsRefs = Array.from({ length: numPages }, (_, i) => `${3 + i * 3} 0 R`).join(' ')
  writeStr(`2 0 obj\r\n<<\r\n  /Type /Pages\r\n  /Kids [${pageKidsRefs}]\r\n  /Count ${numPages}\r\n>>\r\nendobj\r\n`)

  // Pages, Content Streams, and Images
  for (let i = 0; i < numPages; i++) {
    const pageObjId = 3 + i * 3
    const contentObjId = 4 + i * 3
    const imageObjId = 5 + i * 3

    const imgData = processedImages[i]
    const imgW = imgData.width
    const imgH = imgData.height

    // Determine page dimensions in points
    let pageW: number
    let pageH: number
    let marginPt: number

    if (options.pageSize === 'fit') {
      // 72 pt = 1 inch, scale so image fills page at 150 DPI
      const scaleToPt = 72 / 150
      pageW = imgW * scaleToPt
      pageH = imgH * scaleToPt
      marginPt = 0
    } else {
      const [baseWmm, baseHmm] = PAGE_DIMENSIONS_MM[options.pageSize]
      let pW = baseWmm * MM_TO_PT
      let pH = baseHmm * MM_TO_PT

      // Orientation adjustment
      const isImageLandscape = imgW > imgH
      const shouldBeLandscape =
        options.orientation === 'landscape' ||
        (options.orientation === 'auto' && isImageLandscape)

      if (shouldBeLandscape) {
        pageW = Math.max(pW, pH)
        pageH = Math.min(pW, pH)
      } else {
        pageW = Math.min(pW, pH)
        pageH = Math.max(pW, pH)
      }

      marginPt = MARGINS_MM[options.margin] * MM_TO_PT
    }

    // Usable printable area
    const usableW = Math.max(10, pageW - marginPt * 2)
    const usableH = Math.max(10, pageH - marginPt * 2)

    // Calculate image placement within page (bottom-left coordinate origin in PDF)
    let targetW: number
    let targetH: number

    if (options.imageFit === 'fill' || options.pageSize === 'fit') {
      targetW = usableW
      targetH = usableH
    } else {
      // 'contain'
      const scale = Math.min(usableW / imgW, usableH / imgH)
      targetW = imgW * scale
      targetH = imgH * scale
    }

    const posX = marginPt + (usableW - targetW) / 2
    const posY = marginPt + (usableH - targetH) / 2

    // Content stream data
    const contentStream = `q\r\n${targetW.toFixed(3)} 0 0 ${targetH.toFixed(3)} ${posX.toFixed(3)} ${posY.toFixed(3)} cm\r\n/Im${i + 1} Do\r\nQ\r\n`
    const contentBytes = strToBytes(contentStream)

    // Write Page Object
    offsets[pageObjId] = currentOffset
    writeStr(
      `${pageObjId} 0 obj\r\n<<\r\n  /Type /Page\r\n  /Parent 2 0 R\r\n  /MediaBox [0 0 ${pageW.toFixed(3)} ${pageH.toFixed(3)}]\r\n  /Contents ${contentObjId} 0 R\r\n  /Resources <<\r\n    /ProcSet [/PDF /ImageC]\r\n    /XObject <<\r\n      /Im${i + 1} ${imageObjId} 0 R\r\n    >>\r\n  >>\r\n>>\r\nendobj\r\n`
    )

    // Write Content Stream Object
    offsets[contentObjId] = currentOffset
    writeStr(
      `${contentObjId} 0 obj\r\n<<\r\n  /Length ${contentBytes.length}\r\n>>\r\nstream\r\n`
    )
    write(contentBytes)
    writeStr('\r\nendstream\r\nendobj\r\n')

    // Write Image XObject
    offsets[imageObjId] = currentOffset
    writeStr(
      `${imageObjId} 0 obj\r\n<<\r\n  /Type /XObject\r\n  /Subtype /Image\r\n  /Width ${imgW}\r\n  /Height ${imgH}\r\n  /ColorSpace /DeviceRGB\r\n  /BitsPerComponent 8\r\n  /Filter /DCTDecode\r\n  /Length ${imgData.jpegBytes.length}\r\n>>\r\nstream\r\n`
    )
    write(imgData.jpegBytes)
    writeStr('\r\nendstream\r\nendobj\r\n')
  }

  // Cross Reference Table (xref)
  const xrefOffset = currentOffset
  writeStr(`xref\r\n0 ${totalObjects + 1}\r\n`)
  // Object 0 (head of free list) - exactly 20 bytes: 10 + 1 + 5 + 1 + 1 + 2 = 20
  writeStr('0000000000 65535 f\r\n')

  for (let obj = 1; obj <= totalObjects; obj++) {
    const padded = offsets[obj].toString().padStart(10, '0')
    writeStr(`${padded} 00000 n\r\n`)
  }

  // Trailer
  writeStr(
    `trailer\r\n<<\r\n  /Size ${totalObjects + 1}\r\n  /Root 1 0 R\r\n>>\r\nstartxref\r\n${xrefOffset}\r\n%%EOF\r\n`
  )

  // Merge chunks into single Blob
  return new Blob(chunks as BlobPart[], { type: 'application/pdf' })
}

/**
 * Triggers a browser download of a given Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Delay revocation to ensure browser download completes safely
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }, 60000)
}
