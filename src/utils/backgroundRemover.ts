/**
 * Folder: src/utils/
 * Description: Pure vanilla JavaScript / HTML5 Canvas background removal utilities
 *              without any external AI or heavy libraries.
 * This file: backgroundRemover.ts (Algorithmic Background Remover, Fake PNG Cleaner & Chroma Keyer).
 */

export type BgRemovalMode =
  | 'fake-png' // Pola kotak-kotak catur putih & abu-abu (Fake Transparent PNG)
  | 'solid-white' // Latar belakang putih & terang
  | 'solid-black' // Latar belakang hitam & gelap
  | 'green-screen' // Green screen / Chroma key
  | 'custom-color' // Warna kustom dipilih via eyedropper atau color picker

export interface ColorRGB {
  r: number
  g: number
  b: number
}

export interface RemoveBgOptions {
  mode: BgRemovalMode
  targetColor: ColorRGB // Target color for custom-color mode
  tolerance: number // 0 to 100
  feather: number // 0 to 20 (edge smoothing / anti-aliasing)
  contiguous: boolean // true = hanya hapus yang terhubung dari pinggir luar (Flood Fill)
  defringe: boolean // true = bersihkan sisa halo/fringe warna di tepi
}

export const DEFAULT_REMOVE_BG_OPTIONS: RemoveBgOptions = {
  mode: 'fake-png',
  targetColor: { r: 255, g: 255, b: 255 },
  tolerance: 30,
  feather: 4,
  contiguous: true,
  defringe: true,
}

/**
 * Calculates Euclidean color distance between two RGB colors (0 to ~441.67)
 */
export function getColorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  // Perceptually weighted color difference
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db)
}

/**
 * Checks if a pixel matches the removal criteria based on mode
 */
export function isBackgroundPixel(
  r: number,
  g: number,
  b: number,
  options: RemoveBgOptions
): { isBg: boolean; matchFactor: number } {
  const maxWeightedDist = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255) // ~765
  const threshold = (options.tolerance / 100) * maxWeightedDist

  switch (options.mode) {
    case 'fake-png': {
      // Fake PNG checkerboard consists of pure white (#FFF) and light gray (approx #CCC - #EFEFEF)
      // Check distance to White (#FFFFFF)
      const distWhite = getColorDistance(r, g, b, 255, 255, 255)
      // Check distance to light gray (#D8D8D8 or #CCCCCC)
      const distGray1 = getColorDistance(r, g, b, 204, 204, 204)
      const distGray2 = getColorDistance(r, g, b, 230, 230, 230)
      const minDist = Math.min(distWhite, distGray1, distGray2)

      // Also ensure pixel is relatively neutral/grayscale (R, G, B values are close to each other)
      const isNeutral = Math.max(r, g, b) - Math.min(r, g, b) < 25 + options.tolerance * 0.3

      if (minDist <= threshold && isNeutral) {
        const factor = Math.max(0, Math.min(1, minDist / (threshold || 1)))
        return { isBg: true, matchFactor: factor }
      }
      return { isBg: false, matchFactor: 1 }
    }

    case 'solid-white': {
      const dist = getColorDistance(r, g, b, 255, 255, 255)
      if (dist <= threshold) {
        const factor = Math.max(0, Math.min(1, dist / (threshold || 1)))
        return { isBg: true, matchFactor: factor }
      }
      return { isBg: false, matchFactor: 1 }
    }

    case 'solid-black': {
      const dist = getColorDistance(r, g, b, 0, 0, 0)
      if (dist <= threshold) {
        const factor = Math.max(0, Math.min(1, dist / (threshold || 1)))
        return { isBg: true, matchFactor: factor }
      }
      return { isBg: false, matchFactor: 1 }
    }

    case 'green-screen': {
      // High green dominance relative to red and blue
      const greenDominance = g - Math.max(r, b)
      const greenThreshold = 20 - (options.tolerance - 30) * 0.5
      if (greenDominance > Math.max(5, greenThreshold) && g > 60) {
        const factor = Math.max(0, Math.min(1, 1 - greenDominance / 120))
        return { isBg: true, matchFactor: factor }
      }
      return { isBg: false, matchFactor: 1 }
    }

    case 'custom-color': {
      const { r: tr, g: tg, b: tb } = options.targetColor
      const dist = getColorDistance(r, g, b, tr, tg, tb)
      if (dist <= threshold) {
        const factor = Math.max(0, Math.min(1, dist / (threshold || 1)))
        return { isBg: true, matchFactor: factor }
      }
      return { isBg: false, matchFactor: 1 }
    }

    default:
      return { isBg: false, matchFactor: 1 }
  }
}

/**
 * Removes background from an HTMLImageElement using Canvas pixel manipulation.
 * Returns a PNG Blob with transparent background.
 */
export async function processBackgroundRemoval(
  imgElement: HTMLImageElement,
  options: RemoveBgOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; removedPixelsCount: number }> {
  const width = imgElement.naturalWidth || imgElement.width
  const height = imgElement.naturalHeight || imgElement.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    throw new Error('Gagal menginisialisasi Canvas Context 2D.')
  }

  // Draw original image to canvas
  ctx.drawImage(imgElement, 0, 0, width, height)
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  const totalPixels = width * height

  let removedPixelsCount = 0

  if (options.contiguous) {
    // Mode Contiguous: Flood Fill (BFS) dari 4 sisi tepi luar
    // visited array: 0 = not visited, 1 = background/visited, 2 = foreground
    const isBgArray = new Uint8Array(totalPixels)
    const queue = new Int32Array(totalPixels)
    let head = 0
    let tail = 0

    // Enqueue all boundary pixels that match background criteria
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

      const match = isBackgroundPixel(r, g, b, options)
      if (match.isBg) {
        isBgArray[idx] = 1
        queue[tail++] = idx
      } else {
        isBgArray[idx] = 2 // Marked as foreground
      }
    }

    // Top and Bottom borders
    for (let x = 0; x < width; x++) {
      checkAndEnqueue(x, 0)
      checkAndEnqueue(x, height - 1)
    }
    // Left and Right borders
    for (let y = 0; y < height; y++) {
      checkAndEnqueue(0, y)
      checkAndEnqueue(width - 1, y)
    }

    // BFS Expansion
    while (head < tail) {
      const currIdx = queue[head++]
      const cx = currIdx % width
      const cy = Math.floor(currIdx / width)

      // 4-directional neighbors
      const neighbors = [
        cx > 0 ? currIdx - 1 : -1, // Left
        cx < width - 1 ? currIdx + 1 : -1, // Right
        cy > 0 ? currIdx - width : -1, // Top
        cy < height - 1 ? currIdx + width : -1, // Bottom
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

        const match = isBackgroundPixel(r, g, b, options)
        if (match.isBg) {
          isBgArray[nIdx] = 1
          queue[tail++] = nIdx
        } else {
          isBgArray[nIdx] = 2
        }
      }
    }

    // Apply transparency based on flood-fill result
    const featherSpread = Math.max(0, options.feather)
    for (let i = 0; i < totalPixels; i++) {
      if (isBgArray[i] === 1) {
        const pPos = i * 4
        const r = data[pPos]
        const g = data[pPos + 1]
        const b = data[pPos + 2]
        const match = isBackgroundPixel(r, g, b, options)

        if (featherSpread > 0 && match.matchFactor > 0.8) {
          // Soft edge feathering
          const alphaFactor = Math.pow((match.matchFactor - 0.8) / 0.2, 2)
          data[pPos + 3] = Math.round(alphaFactor * data[pPos + 3] * 0.5)
        } else {
          data[pPos + 3] = 0 // Fully transparent
        }
        removedPixelsCount++
      }
    }
  } else {
    // Mode Global: Hapus semua piksel yang cocok di seluruh gambar
    const featherSpread = Math.max(0, options.feather)

    for (let i = 0; i < totalPixels; i++) {
      const pPos = i * 4
      const r = data[pPos]
      const g = data[pPos + 1]
      const b = data[pPos + 2]
      const a = data[pPos + 3]

      if (a === 0) continue

      const match = isBackgroundPixel(r, g, b, options)
      if (match.isBg) {
        if (featherSpread > 0 && match.matchFactor > 0.85) {
          // Soft edge feathering
          const alphaFactor = (match.matchFactor - 0.85) / 0.15
          data[pPos + 3] = Math.round(alphaFactor * a * 0.4)
        } else {
          data[pPos + 3] = 0 // Transparent
        }
        removedPixelsCount++
      }
    }
  }

  // Defringe / Edge Clean (Neutralize edge halos if defringe is enabled)
  if (options.defringe) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        const currentAlpha = data[idx + 3]

        // If this pixel is semi-transparent or on the border of a transparent pixel
        if (currentAlpha > 0 && currentAlpha < 240) {
          // Check neighboring opaque pixels to blend RGB color and eliminate halo
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

  // Put modified pixel data back to canvas
  ctx.putImageData(imgData, 0, 0)

  // Export as PNG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('Gagal mengekspor gambar transparan.'))
    }, 'image/png')
  })

  const url = URL.createObjectURL(blob)

  return {
    blob,
    url,
    width,
    height,
    removedPixelsCount,
  }
}

/**
 * Helper to sample RGB color at a specific coordinate (x, y) on an image
 */
export function samplePixelColor(
  img: HTMLImageElement,
  clickX: number,
  clickY: number,
  displayWidth: number,
  displayHeight: number
): ColorRGB {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { r: 255, g: 255, b: 255 }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Scale click coordinates to actual image natural dimensions
  const scaleX = canvas.width / displayWidth
  const scaleY = canvas.height / displayHeight
  const actualX = Math.floor(Math.max(0, Math.min(canvas.width - 1, clickX * scaleX)))
  const actualY = Math.floor(Math.max(0, Math.min(canvas.height - 1, clickY * scaleY)))

  const p = ctx.getImageData(actualX, actualY, 1, 1).data
  return { r: p[0], g: p[1], b: p[2] }
}

/**
 * Generates a realistic "Fake PNG" demo image with checkerboard background
 * and a rich colorful icon/badge in the middle for instant user test-drive!
 */
export async function createFakePngDemo(): Promise<{ file: Blob; name: string }> {
  const canvas = document.createElement('canvas')
  canvas.width = 1000
  canvas.height = 1000
  const ctx = canvas.getContext('2d')!

  // 1. Draw Fake Transparent Checkerboard Pattern (opaque gray & white squares)
  const squareSize = 25
  for (let y = 0; y < 1000; y += squareSize) {
    for (let x = 0; x < 1000; x += squareSize) {
      const isEven = (Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0
      ctx.fillStyle = isEven ? '#FFFFFF' : '#CCCCCC'
      ctx.fillRect(x, y, squareSize, squareSize)
    }
  }

  // 2. Draw Foreground Subject (Colorful Cyberpunk Robot Badge)
  // Outer shield
  ctx.save()
  const grad = ctx.createLinearGradient(200, 200, 800, 800)
  grad.addColorStop(0, '#6366f1')
  grad.addColorStop(0.5, '#a855f7')
  grad.addColorStop(1, '#ec4899')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(500, 480, 260, 0, Math.PI * 2)
  ctx.fill()

  // Inner star / sparkles
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(500, 420, 100, 0, Math.PI * 2)
  ctx.fill()

  // Cute robot eyes
  ctx.fillStyle = '#1e1b4b'
  ctx.beginPath()
  ctx.arc(460, 415, 20, 0, Math.PI * 2)
  ctx.arc(540, 415, 20, 0, Math.PI * 2)
  ctx.fill()

  // Sparkle light
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(455, 410, 7, 0, Math.PI * 2)
  ctx.arc(535, 410, 7, 0, Math.PI * 2)
  ctx.fill()

  // Text label
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 38px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('FAKE PNG DEMO', 500, 620)
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillText('Pola Kotak Catur Abu & Putih', 500, 665)
  ctx.restore()

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
  return { file: blob, name: 'fake-png-checkerboard-sample.png' }
}

/**
 * Generates a White Background Product Demo image
 */
export async function createSolidWhiteDemo(): Promise<{ file: Blob; name: string }> {
  const canvas = document.createElement('canvas')
  canvas.width = 1000
  canvas.height = 1000
  const ctx = canvas.getContext('2d')!

  // Solid White Background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, 1000, 1000)

  // Floating Isometric Box / Headphones
  const grad = ctx.createLinearGradient(250, 250, 750, 750)
  grad.addColorStop(0, '#f97316')
  grad.addColorStop(1, '#e11d48')
  ctx.fillStyle = grad

  // Rounded product card
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(250, 250, 500, 500, 60)
  } else {
    ctx.rect(250, 250, 500, 500)
  }
  ctx.fill()

  // Headphone / Brand emblem
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 44px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('STUDIO LOGO', 500, 480)
  ctx.font = '22px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillText('Solid White BG Sample', 500, 535)

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
  return { file: blob, name: 'white-bg-product-logo.png' }
}
