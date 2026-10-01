/**
 * Folder: src/utils/
 * Description: Stores helper and utility functions for image conversions,
 *              resizing, compression quality adjustments, clipboard interactions,
 *              background removal (Fake PNG checkerboard, solid colors, chroma key), and ZIP archiving.
 * This file: imageConverter.ts (Client-side Canvas-based Image Converter & Background Remover).
 */

import JSZip from 'jszip'
import {
  type BgRemovalMode,
  type ColorRGB,
  type RemoveBgOptions,
  isBackgroundPixel,
  samplePixelColor,
  createFakePngDemo,
  createSolidWhiteDemo,
} from './backgroundRemover'

export { createFakePngDemo, createSolidWhiteDemo, samplePixelColor }
export type { BgRemovalMode, ColorRGB, RemoveBgOptions }

export type TargetFormat = 'png' | 'jpg' | 'webp'

export interface ImageConvertItem {
  id: string
  file: File | Blob
  name: string
  originalSize: number
  originalType: string
  originalWidth: number
  originalHeight: number
  previewUrl: string
  rotation: number // 0, 90, 180, 270
  
  // Converted state
  convertedBlob?: Blob
  convertedUrl?: string
  convertedSize?: number
  convertedWidth?: number
  convertedHeight?: number
  isConverting?: boolean
  error?: string
}

export interface ConvertOptions {
  targetFormat: TargetFormat
  quality: number // 0.05 to 1.0 (e.g., 0.85 = 85%)
  scale: number // 0.1 to 1.0 (e.g., 1.0 = 100%)
  maxDimension?: number // 0 for no limit, or 3840, 1920, 1280, 800
  backgroundColor: string // '#ffffff', '#000000', 'transparent'
  filenameSuffix: string // e.g., '-converted', ''

  // Background Removal options (100% Pure Canvas / Client-Side)
  enableRemoveBg: boolean
  removeBgMode: BgRemovalMode
  removeBgColor: ColorRGB
  removeBgTolerance: number // 0 to 100
  removeBgFeather: number // 0 to 20
  removeBgContiguous: boolean // true = only remove from border (flood fill)
  removeBgDefringe: boolean // true = clean edge halos
}

export const DEFAULT_CONVERT_OPTIONS: ConvertOptions = {
  targetFormat: 'webp',
  quality: 0.85,
  scale: 1,
  maxDimension: 0,
  backgroundColor: '#ffffff',
  filenameSuffix: '',
  
  // Background removal defaults
  enableRemoveBg: false,
  removeBgMode: 'fake-png',
  removeBgColor: { r: 255, g: 255, b: 255 },
  removeBgTolerance: 30,
  removeBgFeather: 4,
  removeBgContiguous: true,
  removeBgDefringe: true,
}

/**
 * Maps format string to official MIME type
 */
export function getMimeType(format: TargetFormat): string {
  switch (format) {
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

/**
 * Maps format string to file extension
 */
export function getFileExtension(format: TargetFormat): string {
  switch (format) {
    case 'jpg':
      return '.jpg'
    case 'png':
      return '.png'
    case 'webp':
      return '.webp'
    default:
      return `.${format}`
  }
}

/**
 * Loads image dimensions from a Blob or File
 */
export function getImageDimensions(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal memuat gambar.'))
    }
    img.src = url
  })
}

/**
 * Creates an ImageConvertItem from a File or Blob
 */
export async function createImageItem(
  fileOrBlob: File | Blob,
  customName?: string
): Promise<ImageConvertItem> {
  const isFile = fileOrBlob instanceof File
  const name =
    customName ||
    (isFile ? fileOrBlob.name : `pasted-image-${Date.now().toString().slice(-4)}.png`)
  const originalType = fileOrBlob.type || 'image/png'
  const originalSize = fileOrBlob.size

  const { width, height } = await getImageDimensions(fileOrBlob)
  const previewUrl = URL.createObjectURL(fileOrBlob)

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    file: fileOrBlob,
    name,
    originalSize,
    originalType,
    originalWidth: width,
    originalHeight: height,
    previewUrl,
    rotation: 0,
  }
}

/**
 * Applies pure canvas pixel-manipulation background removal on a 2D canvas context
 */
export function applyCanvasBackgroundRemoval(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ConvertOptions
) {
  const bgOpts: RemoveBgOptions = {
    mode: options.removeBgMode,
    targetColor: options.removeBgColor,
    tolerance: options.removeBgTolerance,
    feather: options.removeBgFeather,
    contiguous: options.removeBgContiguous,
    defringe: options.removeBgDefringe,
  }

  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  const totalPixels = width * height

  if (bgOpts.contiguous) {
    // Mode Contiguous: Flood Fill (BFS) dari 4 sisi tepi luar
    const isBgArray = new Uint8Array(totalPixels)
    const queue = new Int32Array(totalPixels)
    let head = 0
    let tail = 0

    const checkAndEnqueue = (x: number, y: number) => {
      const idx = y * width + x
      if (isBgArray[idx] !== 0) return

      const pixelPos = idx * 4
      const r = data[pixelPos]
      const g = data[pixelPos + 1]
      const b = data[pixelPos + 2]
      const a = data[pixelPos + 3]

      if (a === 0) {
        isBgArray[idx] = 1
        queue[tail++] = idx
        return
      }

      const match = isBackgroundPixel(r, g, b, bgOpts)
      if (match.isBg) {
        isBgArray[idx] = 1
        queue[tail++] = idx
      } else {
        isBgArray[idx] = 2
      }
    }

    // Border pixels
    for (let x = 0; x < width; x++) {
      checkAndEnqueue(x, 0)
      checkAndEnqueue(x, height - 1)
    }
    for (let y = 0; y < height; y++) {
      checkAndEnqueue(0, y)
      checkAndEnqueue(width - 1, y)
    }

    // BFS
    while (head < tail) {
      const currIdx = queue[head++]
      const cx = currIdx % width
      const cy = Math.floor(currIdx / width)

      const neighbors = [
        cx > 0 ? currIdx - 1 : -1,
        cx < width - 1 ? currIdx + 1 : -1,
        cy > 0 ? currIdx - width : -1,
        cy < height - 1 ? currIdx + width : -1,
      ]

      for (let i = 0; i < 4; i++) {
        const nIdx = neighbors[i]
        if (nIdx === -1 || isBgArray[nIdx] !== 0) continue

        const pPos = nIdx * 4
        const r = data[pPos]
        const g = data[pPos + 1]
        const b = data[pPos + 2]
        const a = data[pPos + 3]

        if (a === 0) {
          isBgArray[nIdx] = 1
          queue[tail++] = nIdx
          continue
        }

        const match = isBackgroundPixel(r, g, b, bgOpts)
        if (match.isBg) {
          isBgArray[nIdx] = 1
          queue[tail++] = nIdx
        } else {
          isBgArray[nIdx] = 2
        }
      }
    }

    // Apply transparency
    const featherSpread = Math.max(0, bgOpts.feather)
    for (let i = 0; i < totalPixels; i++) {
      if (isBgArray[i] === 1) {
        const pPos = i * 4
        const r = data[pPos]
        const g = data[pPos + 1]
        const b = data[pPos + 2]
        const match = isBackgroundPixel(r, g, b, bgOpts)

        if (featherSpread > 0 && match.matchFactor > 0.8) {
          const alphaFactor = Math.pow((match.matchFactor - 0.8) / 0.2, 2)
          data[pPos + 3] = Math.round(alphaFactor * data[pPos + 3] * 0.5)
        } else {
          data[pPos + 3] = 0
        }
      }
    }
  } else {
    // Mode Global
    const featherSpread = Math.max(0, bgOpts.feather)
    for (let i = 0; i < totalPixels; i++) {
      const pPos = i * 4
      const r = data[pPos]
      const g = data[pPos + 1]
      const b = data[pPos + 2]
      const a = data[pPos + 3]

      if (a === 0) continue

      const match = isBackgroundPixel(r, g, b, bgOpts)
      if (match.isBg) {
        if (featherSpread > 0 && match.matchFactor > 0.85) {
          const alphaFactor = (match.matchFactor - 0.85) / 0.15
          data[pPos + 3] = Math.round(alphaFactor * a * 0.4)
        } else {
          data[pPos + 3] = 0
        }
      }
    }
  }

  // Defringe halos
  if (bgOpts.defringe) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        const currentAlpha = data[idx + 3]

        if (currentAlpha > 0 && currentAlpha < 240) {
          const leftAlpha = data[idx - 4 + 3]
          const rightAlpha = data[idx + 4 + 3]
          const topAlpha = data[idx - width * 4 + 3]
          const bottomAlpha = data[idx + width * 4 + 3]

          if (leftAlpha > 240) {
            data[idx] = data[idx - 4]
            data[idx + 1] = data[idx - 4 + 1]
            data[idx + 2] = data[idx - 4 + 2]
          } else if (rightAlpha > 240) {
            data[idx] = data[idx + 4]
            data[idx + 1] = data[idx + 4 + 1]
            data[idx + 2] = data[idx + 4 + 2]
          } else if (topAlpha > 240) {
            data[idx] = data[idx - width * 4]
            data[idx + 1] = data[idx - width * 4 + 1]
            data[idx + 2] = data[idx - width * 4 + 2]
          } else if (bottomAlpha > 240) {
            data[idx] = data[idx + width * 4]
            data[idx + 1] = data[idx + width * 4 + 1]
            data[idx + 2] = data[idx + width * 4 + 2]
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
}

/**
 * Converts a single ImageConvertItem using HTML5 Canvas & optional pure BG removal
 */
export function convertSingleImage(
  item: ImageConvertItem,
  options: ConvertOptions
): Promise<{
  blob: Blob
  url: string
  size: number
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        let srcWidth = img.naturalWidth || img.width
        let srcHeight = img.naturalHeight || img.height

        const isRotated90or270 = item.rotation % 180 !== 0
        let targetW = isRotated90or270 ? srcHeight : srcWidth
        let targetH = isRotated90or270 ? srcWidth : srcHeight

        // Apply scale
        if (options.scale && options.scale > 0 && options.scale !== 1) {
          targetW = Math.round(targetW * options.scale)
          targetH = Math.round(targetH * options.scale)
        }

        // Apply max dimension constraint
        if (options.maxDimension && options.maxDimension > 0) {
          const maxDim = options.maxDimension
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW >= targetH) {
              targetH = Math.round((targetH * maxDim) / targetW)
              targetW = maxDim
            } else {
              targetW = Math.round((targetW * maxDim) / targetH)
              targetH = maxDim
            }
          }
        }

        // Ensure dimensions are at least 1px
        targetW = Math.max(1, targetW)
        targetH = Math.max(1, targetH)

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d', {
          alpha: options.targetFormat !== 'jpg' || options.enableRemoveBg,
          willReadFrequently: true,
        })

        if (!ctx) {
          reject(new Error('Gagal membuat context canvas.'))
          return
        }

        // Handle background color for transparent images if Remove BG is disabled
        if (!options.enableRemoveBg && (options.targetFormat === 'jpg' || options.backgroundColor !== 'transparent')) {
          ctx.fillStyle = options.backgroundColor || '#ffffff'
          ctx.fillRect(0, 0, targetW, targetH)
        }

        // Transform for rotation
        ctx.save()
        ctx.translate(targetW / 2, targetH / 2)
        ctx.rotate((item.rotation * Math.PI) / 180)

        const drawW = isRotated90or270 ? targetH : targetW
        const drawH = isRotated90or270 ? targetW : targetH

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
        ctx.restore()

        // Apply Background Removal if enabled
        if (options.enableRemoveBg) {
          applyCanvasBackgroundRemoval(ctx, targetW, targetH, options)
        }

        const mime = getMimeType(options.targetFormat)
        // Quality applies to image/jpeg and image/webp
        const quality =
          options.targetFormat === 'png'
            ? undefined
            : Math.min(Math.max(options.quality, 0.01), 1.0)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengekspor canvas ke blob.'))
              return
            }

            const url = URL.createObjectURL(blob)
            resolve({
              blob,
              url,
              size: blob.size,
              width: targetW,
              height: targetH,
            })
          },
          mime,
          quality
        )
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => {
      reject(new Error('Gagal memproses gambar untuk konversi.'))
    }

    img.src = item.previewUrl
  })
}

/**
 * Builds the target filename based on original name and options
 */
export function generateOutputFilename(
  originalName: string,
  targetFormat: TargetFormat,
  suffix = ''
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  const ext = getFileExtension(targetFormat)
  return `${baseName}${suffix}${ext}`
}

/**
 * Downloads a single Blob with given filename
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Creates a ZIP archive containing all converted images
 */
export async function createZipFromConvertedImages(
  items: ImageConvertItem[],
  options: ConvertOptions,
  _zipFilename = 'gambar-terkonversi.zip'
): Promise<Blob> {
  const zip = new JSZip()

  // Track filenames to avoid duplicate names in zip
  const nameCounts = new Map<string, number>()

  for (const item of items) {
    if (!item.convertedBlob) continue

    let filename = generateOutputFilename(item.name, options.targetFormat, options.filenameSuffix)
    if (nameCounts.has(filename)) {
      const count = nameCounts.get(filename)! + 1
      nameCounts.set(filename, count)
      const baseName = item.name.replace(/\.[^/.]+$/, '')
      const ext = getFileExtension(options.targetFormat)
      filename = `${baseName}${options.filenameSuffix}_(${count})${ext}`
    } else {
      nameCounts.set(filename, 1)
    }

    zip.file(filename, item.convertedBlob)
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}

/**
 * Copies a converted image blob to the user's system clipboard (PNG only or browser supported)
 */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false
    }

    // Modern browsers usually require image/png for clipboard writing
    if (blob.type === 'image/png') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      return true
    }

    // If it's jpg or webp, convert to png blob for clipboard compatibility
    const img = new Image()
    const url = URL.createObjectURL(blob)
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    URL.revokeObjectURL(url)

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.drawImage(img, 0, 0)

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )

    if (pngBlob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ])
      return true
    }
    return false
  } catch (err) {
    console.warn('Clipboard write error:', err)
    return false
  }
}

/**
 * Generates high quality sample canvas demo images for immediate testing
 */
export async function createSampleImages(): Promise<ImageConvertItem[]> {
  // Sample 1: Colorful Gradient Landscape Art
  const canvas1 = document.createElement('canvas')
  canvas1.width = 1600
  canvas1.height = 1000
  const ctx1 = canvas1.getContext('2d')!

  const grad1 = ctx1.createLinearGradient(0, 0, 1600, 1000)
  grad1.addColorStop(0, '#3b82f6')
  grad1.addColorStop(0.5, '#8b5cf6')
  grad1.addColorStop(1, '#ec4899')
  ctx1.fillStyle = grad1
  ctx1.fillRect(0, 0, 1600, 1000)

  // Draw sun / spheres
  ctx1.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx1.beginPath()
  ctx1.arc(800, 450, 240, 0, Math.PI * 2)
  ctx1.fill()

  ctx1.fillStyle = '#ffffff'
  ctx1.font = 'bold 56px system-ui, sans-serif'
  ctx1.textAlign = 'center'
  ctx1.fillText('Sample Artwork HD', 800, 430)

  ctx1.font = '500 24px system-ui, sans-serif'
  ctx1.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx1.fillText('1600 × 1000 px • High Resolution Demo', 800, 490)

  const blob1 = await new Promise<Blob>((resolve) => canvas1.toBlob((b) => resolve(b!), 'image/png'))

  // Sample 2: Badge / Vector Logo with Transparency
  const canvas2 = document.createElement('canvas')
  canvas2.width = 1000
  canvas2.height = 1000
  const ctx2 = canvas2.getContext('2d')!

  // Transparent background with geometric badge
  ctx2.clearRect(0, 0, 1000, 1000)

  const grad2 = ctx2.createLinearGradient(200, 200, 800, 800)
  grad2.addColorStop(0, '#10b981')
  grad2.addColorStop(1, '#06b6d4')
  ctx2.fillStyle = grad2
  ctx2.beginPath()
  if (typeof ctx2.roundRect === 'function') {
    ctx2.roundRect(200, 200, 600, 600, 120)
  } else {
    ctx2.rect(200, 200, 600, 600)
  }
  ctx2.fill()

  ctx2.fillStyle = '#ffffff'
  ctx2.font = 'bold 44px system-ui, sans-serif'
  ctx2.textAlign = 'center'
  ctx2.fillText('Vector Icon Mockup', 500, 480)
  ctx2.font = '22px system-ui, sans-serif'
  ctx2.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx2.fillText('Transparan PNG (1000×1000)', 500, 540)

  const blob2 = await new Promise<Blob>((resolve) => canvas2.toBlob((b) => resolve(b!), 'image/png'))

  const item1 = await createImageItem(blob1, 'sample-artwork-hd.png')
  const item2 = await createImageItem(blob2, 'sample-vector-badge.png')

  return [item1, item2]
}
