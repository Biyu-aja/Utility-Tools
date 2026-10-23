/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: ImageConverter.tsx (Focused Image Converter & Compressor with
 *              interactive Color Picker, Eyedropper & Transparency on-demand options).
 */

import { useState, useRef, useEffect, useId, useMemo, useCallback } from 'react'
import {
  UploadCloud,
  FileImage,
  Sparkles,
  Download,
  Trash2,
  RotateCw,
  Eye,
  Copy,
  Check,
  Zap,
  Sliders,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Eraser,
  Grid,
  Wand2,
  Pipette,
  Palette,
  Crosshair,
  Lock,
  Unlock,
  SlidersHorizontal,
  Maximize2,
} from 'lucide-react'
import {
  type ImageConvertItem,
  type ConvertOptions,
  type TargetFormat,
  type BgRemovalMode,
  DEFAULT_CONVERT_OPTIONS,
  createImageItem,
  convertSingleImage,
  generateOutputFilename,
  downloadBlob,
  createZipFromConvertedImages,
  copyBlobToClipboard,
  createSampleImages,
  createFakePngDemo,
  samplePixelColor,
} from '../utils/imageConverter'
import { formatFileSize } from '../utils/format'

export function ImageConverterPage() {
  const fileInputId = useId()
  const addMoreInputId = useId()
  const dropzoneRef = useRef<HTMLDivElement>(null)

  // State
  const [items, setItems] = useState<ImageConvertItem[]>([])
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_CONVERT_OPTIONS)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<ImageConvertItem | null>(null)
  const [previewMode, setPreviewMode] = useState<'side-by-side' | 'toggle'>('side-by-side')
  const [toggleOriginal, setToggleOriginal] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Modal State for On-Demand Transparency / Remove BG Export
  const [transparentExportModalItem, setTransparentExportModalItem] = useState<ImageConvertItem | null>(null)
  const [transparentExportMode, setTransparentExportMode] = useState<BgRemovalMode>('custom-color')
  const [transparentTolerance, setTransparentTolerance] = useState<number>(32)
  const [transparentFeather, setTransparentFeather] = useState<number>(4)
  const [transparentCustomHex, setTransparentCustomHex] = useState<string>('#dc2626')
  const [transparentContiguous, setTransparentContiguous] = useState<boolean>(true)
  const [transparentTargetFormat, setTransparentTargetFormat] = useState<TargetFormat>('png')
  const [transparentModalView, setTransparentModalView] = useState<'transparent' | 'original'>('transparent')
  const [isEyedropperActive, setIsEyedropperActive] = useState(false)
  const [transparentPreviewResult, setTransparentPreviewResult] = useState<{
    url: string
    blob: Blob
    size: number
  } | null>(null)
  const [isGeneratingTransparent, setIsGeneratingTransparent] = useState(false)

  // Modal State for Custom PX Resize
  const [resizeModalItem, setResizeModalItem] = useState<ImageConvertItem | null>(null)
  const [modalCustomWidth, setModalCustomWidth] = useState<number | ''>('')
  const [modalCustomHeight, setModalCustomHeight] = useState<number | ''>('')
  const [modalLockAspectRatio, setModalLockAspectRatio] = useState<boolean>(true)

  // Keep a ref to items for cleanup on unmount
  const itemsRef = useRef(items)
  itemsRef.current = items

  // Notification helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr))
    }, 4000)
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        try {
          URL.revokeObjectURL(item.previewUrl)
          if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl)
        } catch {
          // ignore
        }
      })
    }
  }, [])

  // Process files into ImageConvertItems
  const addFiles = useCallback(async (files: (File | Blob)[], customNames?: string[]) => {
    if (!files.length) return

    const validFiles: { file: File | Blob; name?: string }[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const name = customNames ? customNames[i] : (f instanceof File ? f.name : undefined)
      if (f.type && !f.type.startsWith('image/') && !(f instanceof File && /\.(png|jpe?g|webp|bmp|gif|svg|avif|ico)$/i.test(f.name))) {
        continue
      }
      validFiles.push({ file: f, name })
    }

    if (validFiles.length === 0) {
      showToast('Harap pilih file gambar yang valid (PNG, JPG, WebP, GIF, BMP, AVIF).', 'error')
      return
    }

    const newItems: ImageConvertItem[] = []
    for (const { file, name } of validFiles) {
      try {
        const item = await createImageItem(file, name)
        newItems.push(item)
      } catch (err: any) {
        console.error('Error reading image:', err)
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems])
      showToast(`Berhasil menambahkan ${newItems.length} gambar!`, 'success')
    }
  }, [showToast])

  // Global Clipboard Paste Listener (Ctrl + V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return
      }

      const clipboardItems = e.clipboardData?.items
      if (!clipboardItems) return

      const imageFiles: File[] = []
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i]
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          if (blob) {
            imageFiles.push(blob)
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        await addFiles(imageFiles)
        showToast(`📋 Ditempel ${imageFiles.length} gambar dari Clipboard!`, 'success')
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [addFiles, showToast])

  // Button to trigger navigator.clipboard.read()
  const handlePasteButtonClick = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        showToast('Gunakan pintasan keyboard Ctrl + V untuk menempel gambar.', 'info')
        return
      }

      const clipboardItems = await navigator.clipboard.read()
      const files: Blob[] = []

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            files.push(blob)
          }
        }
      }

      if (files.length > 0) {
        await addFiles(files)
        showToast(`📋 Berhasil menempel ${files.length} gambar dari Clipboard!`, 'success')
      } else {
        showToast('Tidak ada gambar yang ditemukan di clipboard. Salin gambar lalu tekan Ctrl+V.', 'info')
      }
    } catch (err: any) {
      console.warn('Clipboard read error:', err)
      showToast('Tekan tombol keyboard Ctrl + V untuk menempel gambar secara langsung.', 'info')
    }
  }

  // Sample Loaders
  const handleLoadSamples = async () => {
    try {
      const sampleItems = await createSampleImages()
      setItems((prev) => [...prev, ...sampleItems])
      showToast('Contoh gambar berhasil dimuat!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat contoh gambar.', 'error')
    }
  }

  const handleLoadFakePngSample = async () => {
    try {
      const demo = await createFakePngDemo()
      const item = await createImageItem(demo.file, demo.name)
      setItems((prev) => [...prev, item])
      showToast('Contoh Fake PNG (Kotak-Kotak) berhasil dimuat!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat demo Fake PNG.', 'error')
    }
  }

  // Convert execution
  const convertItemsEffectively = useCallback(
    async (targetItems: ImageConvertItem[], currentOptions: ConvertOptions) => {
      const updated = await Promise.all(
        targetItems.map(async (item) => {
          try {
            const result = await convertSingleImage(item, currentOptions)
            if (item.convertedUrl && item.convertedUrl !== result.url) {
              try {
                URL.revokeObjectURL(item.convertedUrl)
              } catch {
                // ignore
              }
            }
            return {
              ...item,
              convertedBlob: result.blob,
              convertedUrl: result.url,
              convertedSize: result.size,
              convertedWidth: result.width,
              convertedHeight: result.height,
              isConverting: false,
              error: undefined,
            }
          } catch (err: any) {
            return {
              ...item,
              isConverting: false,
              error: err.message || 'Gagal mengonversi gambar',
            }
          }
        })
      )
      return updated
    },
    []
  )

  // Debounced conversion trigger
  useEffect(() => {
    if (items.length === 0) return

    let isMounted = true
    const timeout = setTimeout(async () => {
      const updated = await convertItemsEffectively(items, options)
      if (isMounted) {
        setItems(updated)
      }
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [
    options.targetFormat,
    options.quality,
    options.resizeMode,
    options.scale,
    options.customWidth,
    options.customHeight,
    options.maintainAspectRatio,
    options.maxDimension,
    options.backgroundColor,
    options.filenameSuffix,
    options.includeDimensionsInFilename,
    items.length,
    items.map((i) => `${i.id}-${i.rotation}-${i.customWidth || ''}-${i.customHeight || ''}`).join(','),
  ])

  // Live recalculation for Transparent Export Modal
  useEffect(() => {
    if (!transparentExportModalItem) {
      if (transparentPreviewResult) {
        URL.revokeObjectURL(transparentPreviewResult.url)
        setTransparentPreviewResult(null)
      }
      return
    }

    let isMounted = true
    setIsGeneratingTransparent(true)

    const timer = setTimeout(async () => {
      try {
        const hex = transparentCustomHex
        const rgbMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        const rgb = rgbMatch
          ? { r: parseInt(rgbMatch[1], 16), g: parseInt(rgbMatch[2], 16), b: parseInt(rgbMatch[3], 16) }
          : { r: 255, g: 255, b: 255 }

        const customOpts: ConvertOptions = {
          ...options,
          targetFormat: transparentTargetFormat,
          enableRemoveBg: true,
          removeBgMode: transparentExportMode,
          removeBgTolerance: transparentTolerance,
          removeBgFeather: transparentFeather,
          removeBgContiguous: transparentContiguous,
          removeBgColor: rgb,
          removeBgDefringe: true,
        }

        const res = await convertSingleImage(transparentExportModalItem, customOpts)
        if (isMounted) {
          setTransparentPreviewResult({
            url: res.url,
            blob: res.blob,
            size: res.size,
          })
        }
      } catch (err) {
        console.error('Error generating transparent preview:', err)
      } finally {
        if (isMounted) setIsGeneratingTransparent(false)
      }
    }, 120)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [
    transparentExportModalItem,
    transparentExportMode,
    transparentTolerance,
    transparentFeather,
    transparentCustomHex,
    transparentContiguous,
    transparentTargetFormat,
    options.quality,
    options.scale,
  ])

  // Handle click on preview image to sample color directly with Eyedropper
  const handlePreviewImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!transparentExportModalItem) return

    const img = e.currentTarget
    const rect = img.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const sampleImg = new Image()
    sampleImg.crossOrigin = 'anonymous'
    sampleImg.onload = () => {
      const rgb = samplePixelColor(sampleImg, clickX, clickY, rect.width, rect.height)
      const hex = '#' + [rgb.r, rgb.g, rgb.b].map((x) => x.toString(16).padStart(2, '0')).join('')
      setTransparentCustomHex(hex)
      setTransparentExportMode('custom-color')
      showToast(`Warna ${hex.toUpperCase()} berhasil diambil dari foto!`, 'success')
      setIsEyedropperActive(false)
    }
    sampleImg.src = transparentExportModalItem.previewUrl
  }

  // Native Browser EyeDropper API
  const handleNativeEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        if (result.sRGBHex) {
          setTransparentCustomHex(result.sRGBHex)
          setTransparentExportMode('custom-color')
          showToast(`Warna ${result.sRGBHex.toUpperCase()} berhasil dipilih!`, 'success')
        }
      } catch {
        // User cancelled picker
      }
    } else {
      setIsEyedropperActive(true)
      showToast('Klik langsung pada bagian warna latar foto di atas untuk mengambil warnanya.', 'info')
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      await addFiles(droppedFiles)
    }
  }

  // Rotate item 90 degrees
  const handleRotate = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextRotation = (item.rotation + 90) % 360
          return { ...item, rotation: nextRotation, isConverting: true }
        }
        return item
      })
    )
  }

  // Remove single item
  const handleRemove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) {
        try {
          URL.revokeObjectURL(target.previewUrl)
          if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl)
        } catch {
          // ignore
        }
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  // Clear all
  const handleClearAll = () => {
    items.forEach((item) => {
      try {
        URL.revokeObjectURL(item.previewUrl)
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl)
      } catch {
        // ignore
      }
    })
    setItems([])
    setSelectedPreviewItem(null)
    showToast('Semua gambar dibersihkan.', 'info')
  }

  // Download single converted image
  const handleDownloadSingle = (item: ImageConvertItem) => {
    if (!item.convertedBlob) return
    const finalW = item.convertedWidth || item.originalWidth
    const finalH = item.convertedHeight || item.originalHeight
    const filename = generateOutputFilename(
      item.name,
      options.targetFormat,
      options.filenameSuffix,
      { width: finalW, height: finalH },
      options.includeDimensionsInFilename
    )
    downloadBlob(item.convertedBlob, filename)
    showToast(`Mengunduh ${filename} (${finalW} × ${finalH} px)`, 'success')
  }

  // Download all as ZIP
  const handleDownloadZip = async () => {
    if (items.length === 0) return
    const readyItems = items.filter((i) => i.convertedBlob)
    if (readyItems.length === 0) {
      showToast('Belum ada gambar yang siap diunduh.', 'error')
      return
    }

    setIsProcessingBatch(true)
    try {
      const zipBlob = await createZipFromConvertedImages(readyItems, options)
      const zipName = `converted-images-${options.targetFormat}-${Date.now().toString().slice(-4)}.zip`
      downloadBlob(zipBlob, zipName)
      showToast(`Arsip ZIP ${zipName} (${readyItems.length} gambar) berhasil diunduh!`, 'success')
    } catch (err: any) {
      console.error(err)
      showToast('Gagal membuat file ZIP.', 'error')
    } finally {
      setIsProcessingBatch(false)
    }
  }

  // Copy converted image to clipboard
  const handleCopyImage = async (item: ImageConvertItem) => {
    if (!item.convertedBlob) return
    const finalW = item.convertedWidth || item.originalWidth
    const finalH = item.convertedHeight || item.originalHeight
    const success = await copyBlobToClipboard(item.convertedBlob)
    if (success) {
      setCopiedId(item.id)
      showToast(`📋 Gambar (${finalW} × ${finalH} px) berhasil disalin ke clipboard! Langsung tempel (Ctrl+V) di aplikasi lain tanpa unduh.`, 'success')
      setTimeout(() => setCopiedId(null), 2500)
    } else {
      showToast('Browser Anda membatasi penyalinan langsung ke clipboard. Silakan gunakan tombol Unduh.', 'info')
    }
  }

  // Download transparent export
  const handleDownloadTransparentExport = () => {
    if (!transparentExportModalItem || !transparentPreviewResult) return
    const finalW = transparentExportModalItem.originalWidth
    const finalH = transparentExportModalItem.originalHeight
    const filename = generateOutputFilename(
      transparentExportModalItem.name,
      transparentTargetFormat,
      '-transparent',
      { width: finalW, height: finalH },
      options.includeDimensionsInFilename
    )
    downloadBlob(transparentPreviewResult.blob, filename)
    showToast(`Mengunduh ${filename} (${finalW} × ${finalH} px - Latar Transparan)`, 'success')
    setTransparentExportModalItem(null)
  }

  // Copy transparent export to clipboard
  const handleCopyTransparentExport = async () => {
    if (!transparentExportModalItem || !transparentPreviewResult) return
    const finalW = transparentExportModalItem.originalWidth
    const finalH = transparentExportModalItem.originalHeight
    const success = await copyBlobToClipboard(transparentPreviewResult.blob)
    if (success) {
      showToast(`📋 Gambar transparan (${finalW} × ${finalH} px) berhasil disalin ke clipboard! Siap ditempel (Ctrl+V).`, 'success')
      setTransparentExportModalItem(null)
    } else {
      showToast('Gunakan tombol Unduh Transparan jika browser Anda membatasi clipboard.', 'info')
    }
  }

  // Open resize modal for item
  const openResizeModalForItem = (item: ImageConvertItem) => {
    setResizeModalItem(item)
    const baseW = item.rotation % 180 !== 0 ? item.originalHeight : item.originalWidth
    const baseH = item.rotation % 180 !== 0 ? item.originalWidth : item.originalHeight
    setModalCustomWidth(item.customWidth || item.convertedWidth || baseW)
    setModalCustomHeight(item.customHeight || item.convertedHeight || baseH)
    setModalLockAspectRatio(true)
  }

  // Handle modal width change
  const handleModalWidthChange = (val: number | '') => {
    setModalCustomWidth(val)
    if (modalLockAspectRatio && resizeModalItem && typeof val === 'number' && val > 0) {
      const baseW = resizeModalItem.rotation % 180 !== 0 ? resizeModalItem.originalHeight : resizeModalItem.originalWidth
      const baseH = resizeModalItem.rotation % 180 !== 0 ? resizeModalItem.originalWidth : resizeModalItem.originalHeight
      const newH = Math.max(1, Math.round((baseH * val) / baseW))
      setModalCustomHeight(newH)
    }
  }

  // Handle modal height change
  const handleModalHeightChange = (val: number | '') => {
    setModalCustomHeight(val)
    if (modalLockAspectRatio && resizeModalItem && typeof val === 'number' && val > 0) {
      const baseW = resizeModalItem.rotation % 180 !== 0 ? resizeModalItem.originalHeight : resizeModalItem.originalWidth
      const baseH = resizeModalItem.rotation % 180 !== 0 ? resizeModalItem.originalWidth : resizeModalItem.originalHeight
      const newW = Math.max(1, Math.round((baseW * val) / baseH))
      setModalCustomWidth(newW)
    }
  }

  // Apply modal resize
  const handleApplyModalResize = (applyToAll = false) => {
    if (!resizeModalItem) return
    const w = typeof modalCustomWidth === 'number' && modalCustomWidth > 0 ? modalCustomWidth : undefined
    const h = typeof modalCustomHeight === 'number' && modalCustomHeight > 0 ? modalCustomHeight : undefined

    if (!w && !h) {
      showToast('Masukkan ukuran piksel yang valid.', 'error')
      return
    }

    if (applyToAll) {
      setOptions((o) => ({
        ...o,
        resizeMode: 'custom-px',
        customWidth: w,
        customHeight: h,
      }))
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          customWidth: w,
          customHeight: h,
          isConverting: true,
        }))
      )
      showToast(`Ukuran ${w} × ${h} px diterapkan ke semua (${items.length}) gambar!`, 'success')
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === resizeModalItem.id
            ? { ...i, customWidth: w, customHeight: h, isConverting: true }
            : i
        )
      )
      showToast(`Ukuran ${resizeModalItem.name} diubah menjadi ${w} × ${h} px!`, 'success')
    }

    setResizeModalItem(null)
  }

  // Reset modal resize
  const handleResetModalResize = () => {
    if (!resizeModalItem) return
    setItems((prev) =>
      prev.map((i) =>
        i.id === resizeModalItem.id
          ? { ...i, customWidth: undefined, customHeight: undefined, isConverting: true }
          : i
      )
    )
    showToast(`Ukuran ${resizeModalItem.name} dikembalikan ke asli.`, 'info')
    setResizeModalItem(null)
  }

  // Global toolbar width change
  const handleGlobalWidthChange = (val: number | '') => {
    const num = typeof val === 'number' && val > 0 ? val : undefined
    if (num && options.maintainAspectRatio && items.length > 0) {
      const primaryItem = items[0]
      const baseW = primaryItem.rotation % 180 !== 0 ? primaryItem.originalHeight : primaryItem.originalWidth
      const baseH = primaryItem.rotation % 180 !== 0 ? primaryItem.originalWidth : primaryItem.originalHeight
      const newH = Math.max(1, Math.round((baseH * num) / baseW))
      setOptions((o) => ({ ...o, resizeMode: 'custom-px', customWidth: num, customHeight: newH }))
    } else {
      setOptions((o) => ({ ...o, resizeMode: 'custom-px', customWidth: num }))
    }
  }

  // Global toolbar height change
  const handleGlobalHeightChange = (val: number | '') => {
    const num = typeof val === 'number' && val > 0 ? val : undefined
    if (num && options.maintainAspectRatio && items.length > 0) {
      const primaryItem = items[0]
      const baseW = primaryItem.rotation % 180 !== 0 ? primaryItem.originalHeight : primaryItem.originalWidth
      const baseH = primaryItem.rotation % 180 !== 0 ? primaryItem.originalWidth : primaryItem.originalHeight
      const newW = Math.max(1, Math.round((baseW * num) / baseH))
      setOptions((o) => ({ ...o, resizeMode: 'custom-px', customWidth: newW, customHeight: num }))
    } else {
      setOptions((o) => ({ ...o, resizeMode: 'custom-px', customHeight: num }))
    }
  }

  // Totals
  const totalOriginalSize = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.originalSize, 0)
  }, [items])

  const totalConvertedSize = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.convertedSize || curr.originalSize), 0)
  }, [items])

  const overallSavingsPercent = useMemo(() => {
    if (totalOriginalSize === 0 || totalConvertedSize === 0) return 0
    const diff = totalOriginalSize - totalConvertedSize
    return Math.round((diff / totalOriginalSize) * 100)
  }, [totalOriginalSize, totalConvertedSize])

  // Presets
  const qualityPresets = [
    { label: 'Hemat', val: 0.5 },
    { label: 'Sedang', val: 0.7 },
    { label: 'Tinggi', val: 0.85 },
    { label: 'Maksimal', val: 1.0 },
  ]

  const scalePresets = [
    { label: '100% (Asli)', val: 1.0 },
    { label: '75%', val: 0.75 },
    { label: '50%', val: 0.5 },
    { label: '25%', val: 0.25 },
  ]

  // Color Swatch Presets for Custom Color
  const colorSwatchPresets = [
    { label: 'Merah Pas Foto', hex: '#dc2626', bg: 'bg-red-600' },
    { label: 'Biru Pas Foto', hex: '#2563eb', bg: 'bg-blue-600' },
    { label: 'Hijau Screen', hex: '#16a34a', bg: 'bg-green-600' },
    { label: 'Kuning', hex: '#eab308', bg: 'bg-yellow-500' },
    { label: 'Putih', hex: '#ffffff', bg: 'bg-white border' },
    { label: 'Hitam', hex: '#000000', bg: 'bg-black' },
    { label: 'Abu-abu', hex: '#64748b', bg: 'bg-slate-500' },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : notification.type === 'error'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-primary/15 border-primary/30 text-primary'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {notification.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium text-text-main">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-border-main p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Image Converter Studio</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Copy-Paste (Ctrl+V) Ready</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side / Privasi Aman</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Konversi & Kompres Gambar
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Ubah format gambar ke <strong className="text-text-main font-semibold">PNG</strong>,{' '}
            <strong className="text-text-main font-semibold">JPG</strong>, atau{' '}
            <strong className="text-text-main font-semibold">WebP</strong> secara instan dengan
            menempel langsung (<kbd className="px-1.5 py-0.5 rounded-md bg-bg-card border border-border-main text-[11px] font-mono">Ctrl + V</kbd>)
            atau memilih file. Sesuaikan tingkat kejelasan/kualitas dan lihat perkiraan ukuran akhirnya secara real-time!
          </p>
        </div>
      </div>

      {/* Dropzone & Paste Action Area */}
      <div
        ref={dropzoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all duration-200 text-center flex flex-col items-center justify-center space-y-4 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.008]'
            : 'border-border-main hover:border-primary/50 bg-bg-card/60'
        }`}
      >
        <input
          id={fileInputId}
          type="file"
          multiple
          accept="image/*,.png,.jpg,.jpeg,.webp,.bmp,.gif,.svg,.avif,.ico"
          className="hidden"
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              await addFiles(Array.from(e.target.files))
              e.target.value = ''
            }
          }}
        />

        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="max-w-md space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-text-main">
            Tarik & Lepas Gambar di Sini, atau Tempel (Ctrl+V)
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Mendukung file tunggal atau banyak sekaligus: PNG, JPG/JPEG, WebP, GIF, BMP, SVG, AVIF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <label
            htmlFor={fileInputId}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileImage className="w-4 h-4" />
            <span>Pilih File Gambar</span>
          </label>

          <button
            type="button"
            onClick={handlePasteButtonClick}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-bg-card hover:bg-bg-hover border border-border-main text-text-main text-sm font-semibold transition-all hover:border-primary/50 shadow-xs"
          >
            <Copy className="w-4 h-4 text-primary" />
            <span>Tempel Clipboard (Ctrl+V)</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSamples}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-bg-card hover:bg-bg-hover border border-border-main text-text-muted hover:text-text-main text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Muat Contoh Demo</span>
          </button>

          <button
            type="button"
            onClick={handleLoadFakePngSample}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-bg-card hover:bg-bg-hover border border-border-main text-text-muted hover:text-text-main text-xs font-semibold transition-all"
          >
            <Grid className="w-3.5 h-3.5 text-blue-500" />
            <span>Contoh Fake PNG</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area (Settings + Image List) */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Conversion Control Toolbar */}
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-main">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-main">Pengaturan Konversi & Kualitas</h2>
                  <p className="text-xs text-text-muted">
                    Sesuaikan format target, tingkat kompresi/kejelasan, dan dimensi output.
                  </p>
                </div>
              </div>

              {/* Suffix / Quick Naming */}
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-primary hover:underline self-start sm:self-center"
              >
                <span>{showAdvanced ? 'Sembunyikan Opsi Lanjutan' : 'Opsi Lanjutan (Resize & Suffix)'}</span>
              </button>
            </div>

            {/* Grid Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Target Format Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                  1. Format Output
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-bg-hover/60 border border-border-main rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOptions((o) => ({ ...o, targetFormat: 'webp' }))}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      options.targetFormat === 'webp'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:text-text-main hover:bg-bg-card'
                    }`}
                  >
                    <span className="text-sm">WEBP</span>
                    <span className="text-[10px] opacity-85 font-normal">Paling Ringan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOptions((o) => ({ ...o, targetFormat: 'png' }))}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      options.targetFormat === 'png'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:text-text-main hover:bg-bg-card'
                    }`}
                  >
                    <span className="text-sm">PNG</span>
                    <span className="text-[10px] opacity-85 font-normal">Lossless / Transparan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOptions((o) => ({ ...o, targetFormat: 'jpg' }))}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      options.targetFormat === 'jpg'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:text-text-main hover:bg-bg-card'
                    }`}
                  >
                    <span className="text-sm">JPG</span>
                    <span className="text-[10px] opacity-85 font-normal">Kompatibel Luas</span>
                  </button>
                </div>
              </div>

              {/* 2. Quality / Kejelasan Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center space-x-1.5">
                    <span>2. Kejelasan & Kualitas</span>
                    <span className="text-[10px] font-normal normal-case text-text-muted">
                      ({options.targetFormat === 'png' ? 'PNG Lossless' : `${Math.round(options.quality * 100)}%`})
                    </span>
                  </label>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                      options.targetFormat === 'png'
                        ? 'bg-bg-hover text-text-muted'
                        : options.quality >= 0.8
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : options.quality >= 0.6
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {options.targetFormat === 'png' ? '100% Lossless' : `${Math.round(options.quality * 100)}%`}
                  </span>
                </div>

                {options.targetFormat === 'png' ? (
                  <div className="p-3 bg-bg-hover/60 border border-border-main rounded-2xl text-xs text-text-muted leading-relaxed">
                    ℹ️ Format PNG mempertahankan kualitas 100% tanpa penurunan kejelasan (lossless).
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={options.quality}
                      onChange={(e) =>
                        setOptions((o) => ({ ...o, quality: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-primary cursor-pointer h-2 bg-bg-hover rounded-lg"
                    />

                    <div className="grid grid-cols-4 gap-1.5">
                      {qualityPresets.map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setOptions((o) => ({ ...o, quality: preset.val }))}
                          className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                            Math.abs(options.quality - preset.val) < 0.02
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-bg-card border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Resolusi & Ukuran Gambar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    3. Ukuran & Resolusi
                  </label>

                  {/* Mode switcher tabs: Skala (%) vs Kustom (px) */}
                  <div className="inline-flex rounded-xl bg-bg-hover p-0.5 border border-border-main text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setOptions((o) => ({ ...o, resizeMode: 'scale' }))}
                      className={`px-2.5 py-0.5 rounded-lg transition-all ${
                        options.resizeMode === 'scale'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      % Skala
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const firstItem = items[0]
                        const baseW = firstItem ? (firstItem.rotation % 180 !== 0 ? firstItem.originalHeight : firstItem.originalWidth) : 1920
                        const baseH = firstItem ? (firstItem.rotation % 180 !== 0 ? firstItem.originalWidth : firstItem.originalHeight) : 1080
                        setOptions((o) => ({
                          ...o,
                          resizeMode: 'custom-px',
                          customWidth: o.customWidth || baseW,
                          customHeight: o.customHeight || baseH,
                        }))
                      }}
                      className={`px-2.5 py-0.5 rounded-lg transition-all flex items-center space-x-1 ${
                        options.resizeMode === 'custom-px'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Ubah px</span>
                    </button>
                  </div>
                </div>

                {options.resizeMode === 'scale' ? (
                  /* Scale Mode */
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted text-[11px]">Rasio Pengali:</span>
                      <span className="font-bold text-primary font-mono text-xs">
                        {Math.round(options.scale * 100)}% Ukuran
                        {items.length === 1 && (
                          <span className="text-[11px] text-text-muted font-normal ml-1.5">
                            ({items[0].convertedWidth || Math.round(items[0].originalWidth * options.scale)} × {items[0].convertedHeight || Math.round(items[0].originalHeight * options.scale)} px)
                          </span>
                        )}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={options.scale}
                      onChange={(e) => setOptions((o) => ({ ...o, scale: parseFloat(e.target.value) }))}
                      className="w-full accent-primary cursor-pointer h-2 bg-bg-hover rounded-lg"
                    />

                    <div className="grid grid-cols-4 gap-1.5">
                      {scalePresets.map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setOptions((o) => ({ ...o, scale: preset.val }))}
                          className={`py-1.5 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                            Math.abs(options.scale - preset.val) < 0.02
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-bg-card border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Custom PX Mode */
                  <div className="space-y-2.5 p-3 bg-bg-hover/60 border border-primary/25 rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted block">
                          Lebar (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={options.customWidth || ''}
                          onChange={(e) =>
                            handleGlobalWidthChange(e.target.value ? parseInt(e.target.value) : '')
                          }
                          placeholder="Lebar px"
                          className="w-full px-2.5 py-1.5 bg-bg-card border border-border-main rounded-xl text-xs font-mono font-bold text-text-main focus:outline-none focus:border-primary shadow-xs"
                        />
                      </div>

                      <div className="pt-4 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOptions((o) => ({ ...o, maintainAspectRatio: !o.maintainAspectRatio }))
                          }
                          title={
                            options.maintainAspectRatio
                              ? 'Kunci Rasio Aktif: Menjaga proporsi gambar'
                              : 'Rasio Bebas: Anda dapat mengubah lebar & tinggi secara independen'
                          }
                          className={`p-2 rounded-xl border transition-all ${
                            options.maintainAspectRatio
                              ? 'bg-primary/10 border-primary text-primary shadow-xs'
                              : 'bg-bg-card border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          {options.maintainAspectRatio ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted block">
                          Tinggi (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={options.customHeight || ''}
                          onChange={(e) =>
                            handleGlobalHeightChange(e.target.value ? parseInt(e.target.value) : '')
                          }
                          placeholder="Tinggi px"
                          className="w-full px-2.5 py-1.5 bg-bg-card border border-border-main rounded-xl text-xs font-mono font-bold text-text-main focus:outline-none focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Quick Presets for Custom PX */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {[
                        { label: 'FHD', w: 1920, h: 1080 },
                        { label: 'HD', w: 1280, h: 720 },
                        { label: '1:1', w: 1080, h: 1080 },
                        { label: '9:16', w: 1080, h: 1920 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setOptions((o) => ({
                              ...o,
                              resizeMode: 'custom-px',
                              customWidth: preset.w,
                              customHeight: preset.h,
                            }))
                          }
                          className={`py-0.5 px-2 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                            options.customWidth === preset.w && options.customHeight === preset.h
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-bg-card border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}

                      {items.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const first = items[0]
                            const baseW = first.rotation % 180 !== 0 ? first.originalHeight : first.originalWidth
                            const baseH = first.rotation % 180 !== 0 ? first.originalWidth : first.originalHeight
                            setOptions((o) => ({
                              ...o,
                              resizeMode: 'custom-px',
                              customWidth: baseW,
                              customHeight: baseH,
                            }))
                          }}
                          className="py-0.5 px-2 rounded-lg text-[10px] font-mono font-bold bg-bg-card border border-border-main text-text-muted hover:text-text-main"
                        >
                          Reset Asli
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Options (Foldable) */}
            {showAdvanced && (
              <div className="pt-4 border-t border-border-main grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Batas Maksimal Resolusi</label>
                  <select
                    value={options.maxDimension || 0}
                    onChange={(e) =>
                      setOptions((o) => ({ ...o, maxDimension: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full bg-bg-card border border-border-main rounded-xl px-3 py-2 text-xs font-medium text-text-main focus:outline-none focus:border-primary"
                  >
                    <option value={0}>Resolusi Asli (Tanpa Batas)</option>
                    <option value={3840}>Maksimal 4K (3840 px)</option>
                    <option value={1920}>Maksimal Full HD (1920 px)</option>
                    <option value={1280}>Maksimal HD (1280 px)</option>
                    <option value={800}>Maksimal Web (800 px)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">
                    Latar Transparansi (Untuk JPG)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.backgroundColor === 'transparent' ? '#ffffff' : options.backgroundColor}
                      onChange={(e) => setOptions((o) => ({ ...o, backgroundColor: e.target.value }))}
                      className="w-9 h-9 p-0.5 rounded-xl border border-border-main cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-text-muted font-mono">{options.backgroundColor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Akhiran Nama File (Suffix)</label>
                  <input
                    type="text"
                    value={options.filenameSuffix}
                    onChange={(e) => setOptions((o) => ({ ...o, filenameSuffix: e.target.value }))}
                    placeholder="Contoh: -converted"
                    className="w-full bg-bg-card border border-border-main rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Ukuran (px) di Nama File</label>
                  <label className="flex items-center space-x-2.5 pt-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={options.includeDimensionsInFilename || false}
                      onChange={(e) =>
                        setOptions((o) => ({ ...o, includeDimensionsInFilename: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-border-main text-primary focus:ring-primary accent-primary"
                    />
                    <span className="text-xs text-text-main font-medium">
                      Sertakan px (misal <span className="font-mono text-primary font-bold text-[11px]">_1920x1080</span>)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Overall Results & Action Bar */}
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Total File
                </span>
                <p className="text-xl sm:text-2xl font-black text-text-main">{items.length} Gambar</p>
              </div>

              {items.length === 1 && (
                <>
                  <div className="h-10 w-px bg-border-main hidden sm:block" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      Dimensi Output
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-primary font-mono">
                      {items[0].convertedWidth || items[0].originalWidth} × {items[0].convertedHeight || items[0].originalHeight} px
                    </p>
                  </div>
                </>
              )}

              <div className="h-10 w-px bg-border-main hidden sm:block" />

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Ukuran Asli
                </span>
                <p className="text-sm sm:text-base font-bold text-text-muted">
                  {formatFileSize(totalOriginalSize)}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-text-muted hidden sm:block" />

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Ukuran Akhir (Hasil)
                </span>
                <p className="text-xl sm:text-2xl font-black text-primary">
                  {formatFileSize(totalConvertedSize)}
                </p>
              </div>

              {overallSavingsPercent !== 0 && (
                <div
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-2xl text-xs font-bold ${
                    overallSavingsPercent > 0
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {overallSavingsPercent > 0
                      ? `Hemat ${overallSavingsPercent}% (-${formatFileSize(totalOriginalSize - totalConvertedSize)})`
                      : `+${Math.abs(overallSavingsPercent)}% Ukuran`}
                  </span>
                </div>
              )}
            </div>

            {/* Batch & Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
              <input
                id={addMoreInputId}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    await addFiles(Array.from(e.target.files))
                    e.target.value = ''
                  }
                }}
              />
              <label
                htmlFor={addMoreInputId}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-bg-card hover:bg-bg-hover border border-border-main text-text-main text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>Tambah</span>
              </label>

              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-bg-card hover:bg-rose-500/10 border border-border-main hover:border-rose-500/30 text-text-muted hover:text-rose-500 text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>

              {/* Direct Quick Copy for Single Image */}
              {items.length === 1 && (
                <button
                  type="button"
                  onClick={() => handleCopyImage(items[0])}
                  disabled={!items[0].convertedBlob}
                  title="Salin hasil gambar langsung ke clipboard tanpa download (Ctrl+V di aplikasi lain)"
                  className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 ${
                    copiedId === items[0].id
                      ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {copiedId === items[0].id ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Hasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Salin Hasil</span>
                      <span className="text-[11px] font-mono opacity-85 hidden sm:inline">
                        ({items[0].convertedWidth || items[0].originalWidth} × {items[0].convertedHeight || items[0].originalHeight} px)
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Download Action: Single Direct Download or Batch ZIP */}
              {items.length === 1 ? (
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(items[0])}
                  disabled={!items[0].convertedBlob}
                  title={`Unduh ${items[0].name} (${items[0].convertedWidth || items[0].originalWidth} × ${items[0].convertedHeight || items[0].originalHeight} px)`}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh {options.targetFormat.toUpperCase()}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-black/25 text-white">
                    {items[0].convertedWidth || items[0].originalWidth} × {items[0].convertedHeight || items[0].originalHeight} px
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isProcessingBatch || items.length === 0}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isProcessingBatch ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengemas ZIP...</span>
                    </>
                  ) : (
                    <>
                      <FolderArchive className="w-4 h-4" />
                      <span>Unduh Semua ({items.length} Gambar .ZIP)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Converted Image Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => {
              const originalKb = item.originalSize
              const convertedKb = item.convertedSize || item.originalSize
              const diffPercent = Math.round(((convertedKb - originalKb) / originalKb) * 100)
              const isSaved = diffPercent < 0
              const finalW = item.convertedWidth || item.originalWidth
              const finalH = item.convertedHeight || item.originalHeight

              return (
                <div
                  key={item.id}
                  className="bg-bg-card border border-border-main rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Card Header & Preview */}
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail preview with zoom & rotate overlay */}
                    <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-bg-hover/80 border border-border-main shrink-0 flex items-center justify-center">
                      <img
                        src={item.convertedUrl || item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                      />

                      {/* Action overlays on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedPreviewItem(item)}
                          title="Pratinjau Layar Penuh"
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition-transform hover:scale-110"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotate(item.id)}
                          title="Putar 90°"
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition-transform hover:scale-110"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Number Badge */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Metadata & Size Transformation */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="text-sm font-bold text-text-main truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          title="Hapus gambar ini"
                          className="text-text-muted hover:text-rose-500 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dimensions: Asli & Output px */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-bg-hover text-text-muted border border-border-main" title="Ukuran asli gambar">
                          Asli: {item.originalWidth} × {item.originalHeight} px
                        </span>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                        <button
                          type="button"
                          onClick={() => openResizeModalForItem(item)}
                          title="Klik untuk mengubah ukuran piksel (px) gambar ini"
                          className="inline-flex items-center space-x-1 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold border border-primary/30 transition-all cursor-pointer group hover:scale-[1.02]"
                        >
                          <span>Output: {finalW} × {finalH} px</span>
                          <SlidersHorizontal className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openResizeModalForItem(item)}
                          title="Ubah resolusi lebar & tinggi (px)"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-bg-hover hover:bg-bg-hover/80 border border-border-main text-text-muted hover:text-text-main text-[10px] font-semibold transition-all"
                        >
                          <span>Ubah px</span>
                        </button>
                      </div>

                      {/* Size Comparison Badge */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="flex items-center space-x-1.5 text-xs">
                          <span className="text-text-muted font-medium line-through decoration-text-muted/60">
                            {formatFileSize(item.originalSize)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-text-muted" />
                          <span className="font-extrabold text-primary text-sm">
                            {formatFileSize(convertedKb)}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSaved
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : diffPercent === 0
                              ? 'bg-bg-hover text-text-muted'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isSaved ? `Hemat ${Math.abs(diffPercent)}%` : diffPercent > 0 ? `+${diffPercent}%` : 'Sama'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions: Quick Actions + Transparent Export Option */}
                  <div className="pt-3 border-t border-border-main flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 text-xs text-text-muted">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="uppercase font-bold text-text-main text-[11px]">
                        {options.targetFormat}
                      </span>
                      <span>•</span>
                      <span>
                        {options.targetFormat === 'png'
                          ? 'Lossless'
                          : `Kualitas ${Math.round(options.quality * 100)}%`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Button to Open Transparent / Remove BG Settings for this image */}
                      <button
                        type="button"
                        onClick={() => {
                          setTransparentExportModalItem(item)
                          setTransparentTargetFormat(options.targetFormat === 'jpg' ? 'png' : options.targetFormat)
                        }}
                        title="Atur transparansi latar belakang (Warna Kustom, Fake PNG, Putih) sebelum diunduh atau disalin"
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Opsi Transparan</span>
                      </button>

                      {/* Salin Hasil (Copy to Clipboard) - Enhanced & Prominent */}
                      <button
                        type="button"
                        onClick={() => handleCopyImage(item)}
                        disabled={!item.convertedBlob}
                        title={`Salin hasil (${finalW} × ${finalH} px) ke clipboard. Langsung tempel (Ctrl+V) di aplikasi lain tanpa perlu download.`}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 ${
                          copiedId === item.id
                            ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50'
                        }`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-[11px]">Tersalin ({finalW} × ${finalH} px)!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[11px]">Salin Hasil</span>
                          </>
                        )}
                      </button>

                      {/* Standard Download Button with Dimensions */}
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        disabled={!item.convertedBlob}
                        title={`Unduh file ${options.targetFormat.toUpperCase()} dengan ukuran ${finalW} × ${finalH} px`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all shadow-xs hover:shadow-sm disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh {options.targetFormat.toUpperCase()}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/25 text-white font-medium">
                          {finalW} × {finalH} px
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal: Ubah Ukuran Piksel (Custom PX Resize) */}
      {resizeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-bg-card border border-border-main rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-bg-card/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">
                    Ubah Ukuran Gambar (px)
                  </h3>
                  <p className="text-xs text-text-muted truncate max-w-xs">
                    {resizeModalItem.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setResizeModalItem(null)}
                className="p-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Dimensions Comparison Indicator */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-bg-hover/60 border border-border-main text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Ukuran Asli</span>
                  <span className="font-mono font-bold text-text-main">
                    {resizeModalItem.originalWidth} × {resizeModalItem.originalHeight} px
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] uppercase font-bold text-primary block">Ukuran Baru</span>
                  <span className="font-mono font-extrabold text-primary">
                    {modalCustomWidth || 0} × {modalCustomHeight || 0} px
                  </span>
                </div>
              </div>

              {/* Width & Height Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-main">Tentukan Dimensi Piksel:</label>
                  <span className="text-[11px] text-text-muted">
                    {modalLockAspectRatio ? '🔗 Rasio Terkunci (Proporsional)' : '🔓 Rasio Bebas (Bisa Peregangan)'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold text-text-muted block">Lebar (px)</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={modalCustomWidth}
                      onChange={(e) =>
                        handleModalWidthChange(e.target.value ? parseInt(e.target.value) : '')
                      }
                      className="w-full px-3 py-2.5 bg-bg-card border border-border-main rounded-2xl text-sm font-mono font-bold text-text-main focus:outline-none focus:border-primary shadow-xs"
                      placeholder="Contoh: 1920"
                    />
                  </div>

                  <div className="pt-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalLockAspectRatio(!modalLockAspectRatio)}
                      title={
                        modalLockAspectRatio
                          ? 'Kunci Rasio Aktif: Menjaga proporsi gambar agar tidak terdistorsi'
                          : 'Rasio Bebas: Anda dapat mengubah lebar & tinggi secara independen'
                      }
                      className={`p-2.5 rounded-2xl border transition-all ${
                        modalLockAspectRatio
                          ? 'bg-primary/10 border-primary text-primary shadow-xs'
                          : 'bg-bg-hover border-border-main text-text-muted hover:text-text-main'
                      }`}
                    >
                      {modalLockAspectRatio ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold text-text-muted block">Tinggi (px)</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={modalCustomHeight}
                      onChange={(e) =>
                        handleModalHeightChange(e.target.value ? parseInt(e.target.value) : '')
                      }
                      className="w-full px-3 py-2.5 bg-bg-card border border-border-main rounded-2xl text-sm font-mono font-bold text-text-main focus:outline-none focus:border-primary shadow-xs"
                      placeholder="Contoh: 1080"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-main block">Pilihan Resolusi Cepat:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Ukuran Asli', w: resizeModalItem.originalWidth, h: resizeModalItem.originalHeight },
                    { label: 'Full HD 1080p', w: 1920, h: 1080 },
                    { label: 'HD 720p', w: 1280, h: 720 },
                    { label: 'Instagram (1:1)', w: 1080, h: 1080 },
                    { label: 'Story / Reel (9:16)', w: 1080, h: 1920 },
                    { label: 'Web Optimal', w: 800, h: 600 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setModalCustomWidth(preset.w)
                        setModalCustomHeight(preset.h)
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition-all text-xs ${
                        modalCustomWidth === preset.w && modalCustomHeight === preset.h
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                          : 'bg-bg-hover/60 border-border-main text-text-muted hover:text-text-main'
                      }`}
                    >
                      <span className="font-semibold block">{preset.label}</span>
                      <span className="font-mono text-[10px] opacity-75">{preset.w} × {preset.h} px</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-border-main bg-bg-card flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetModalResize}
                className="px-3.5 py-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-muted hover:text-text-main text-xs font-semibold transition-colors"
              >
                Reset ke Asli
              </button>

              <div className="flex items-center space-x-2">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleApplyModalResize(true)}
                    className="px-3.5 py-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-main text-xs font-bold border border-border-main transition-colors shadow-xs"
                  >
                    Terapkan Semua ({items.length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleApplyModalResize(false)}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Terapkan Ukuran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: On-Demand Transparent BG Export & Customizer */}
      {transparentExportModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-bg-card border border-border-main rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-bg-card/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Eraser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">
                    Ekspor dengan Latar Transparan
                  </h3>
                  <p className="text-xs text-text-muted truncate max-w-sm">
                    {transparentExportModalItem.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTransparentExportModalItem(null)}
                className="p-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 space-y-5">
              {/* Preview with High-Contrast Grid Backdrop & View Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {/* View Mode Tabs */}
                  <div className="inline-flex rounded-xl bg-bg-hover p-1 border border-border-main text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setTransparentModalView('transparent')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        transparentModalView === 'transparent'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Pratinjau Hasil Transparan
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransparentModalView('original')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                        transparentModalView === 'original'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Foto Asli (Klik untuk Ambil Warna)</span>
                    </button>
                  </div>

                  {transparentPreviewResult && (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-primary font-mono font-bold">
                        {formatFileSize(transparentPreviewResult.size)}
                      </span>
                      <span className="text-text-muted">•</span>
                      <span className="font-mono font-bold text-text-main px-2 py-0.5 rounded-md bg-bg-hover">
                        {transparentExportModalItem.originalWidth} × {transparentExportModalItem.originalHeight} px
                      </span>
                    </div>
                  )}
                </div>

                {/* Main Interactive Canvas/Preview Box */}
                <div className="relative h-64 rounded-2xl overflow-hidden bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] [background-size:14px_14px] bg-slate-100 dark:bg-slate-900 border border-border-main flex items-center justify-center p-2 group">
                  {isGeneratingTransparent && transparentModalView === 'transparent' ? (
                    <div className="flex flex-col items-center space-y-2 text-text-muted">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Memproses transparansi...</span>
                    </div>
                  ) : (
                    <img
                      src={
                        transparentModalView === 'original'
                          ? transparentExportModalItem.previewUrl
                          : transparentPreviewResult?.url || transparentExportModalItem.previewUrl
                      }
                      alt="Preview"
                      onClick={handlePreviewImageClick}
                      className={`max-h-full max-w-full object-contain ${
                        transparentExportMode === 'custom-color' || transparentModalView === 'original' || isEyedropperActive
                          ? 'cursor-crosshair'
                          : ''
                      }`}
                      title="Klik di mana saja pada foto untuk mengambil warna latar belakang!"
                    />
                  )}

                  {/* Pipette / Click-to-Pick Overlay hint */}
                  {(transparentExportMode === 'custom-color' || transparentModalView === 'original') && (
                    <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium flex items-center justify-between pointer-events-none">
                      <div className="flex items-center space-x-1.5">
                        <Pipette className="w-3.5 h-3.5 text-amber-400" />
                        <span>Klik pada warna latar di foto untuk langsung mengambil warnanya</span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 uppercase">
                        {transparentCustomHex}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Selection Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-main">Pilih Pola Latar yang Dihapus:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransparentExportMode('custom-color')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      transparentExportMode === 'custom-color'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                        : 'bg-bg-hover/60 border-border-main text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Warna Kustom</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-80 block mt-0.5">Merah, biru, foto profil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransparentExportMode('fake-png')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      transparentExportMode === 'fake-png'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                        : 'bg-bg-hover/60 border-border-main text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <Grid className="w-3.5 h-3.5" />
                      <span>Fake PNG</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-80 block mt-0.5">Kotak catur putih-abu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransparentExportMode('solid-white')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      transparentExportMode === 'solid-white'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                        : 'bg-bg-hover/60 border-border-main text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Latar Putih</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-80 block mt-0.5">Logo & foto produk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransparentExportMode('solid-black')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      transparentExportMode === 'solid-black'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                        : 'bg-bg-hover/60 border-border-main text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Latar Hitam</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-80 block mt-0.5">Latar gelap/hitam</span>
                  </button>
                </div>
              </div>

              {/* Color Picker & Eyedropper Controls (Shown for Warna Kustom) */}
              {transparentExportMode === 'custom-color' && (
                <div className="p-4 rounded-2xl bg-bg-hover/70 border border-primary/30 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {/* Color swatch with native picker */}
                      <label className="relative cursor-pointer group shrink-0">
                        <div
                          className="w-10 h-10 rounded-2xl border-2 border-border-main shadow-sm flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ backgroundColor: transparentCustomHex }}
                        >
                          <Palette className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                        <input
                          type="color"
                          value={transparentCustomHex}
                          onChange={(e) => setTransparentCustomHex(e.target.value)}
                          className="sr-only"
                        />
                      </label>

                      <div>
                        <span className="text-xs font-bold text-text-main block">Warna yang Dihapus</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <input
                            type="text"
                            value={transparentCustomHex}
                            onChange={(e) => setTransparentCustomHex(e.target.value)}
                            placeholder="#DC2626"
                            className="w-24 px-2 py-0.5 text-xs font-mono font-bold bg-bg-card border border-border-main rounded-lg text-text-main uppercase focus:outline-none focus:border-primary"
                          />
                          <span className="text-[11px] text-text-muted">Klik kotak untuk ganti warna</span>
                        </div>
                      </div>
                    </div>

                    {/* Eyedropper Button */}
                    <button
                      type="button"
                      onClick={handleNativeEyeDropper}
                      className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-bg-card hover:bg-bg-hover border border-border-main text-text-main text-xs font-bold transition-all shadow-xs hover:border-primary/50 self-start sm:self-center"
                    >
                      <Pipette className="w-4 h-4 text-primary" />
                      <span>Pipet / Ambil dari Foto</span>
                    </button>
                  </div>

                  {/* Preset Swatches for Quick Click */}
                  <div className="space-y-1.5 pt-1 border-t border-border-main/70">
                    <span className="text-[11px] font-semibold text-text-muted block">
                      Pilihan Warna Cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {colorSwatchPresets.map((swatch) => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => setTransparentCustomHex(swatch.hex)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                            transparentCustomHex.toLowerCase() === swatch.hex.toLowerCase()
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                              : 'bg-bg-card border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${swatch.bg} shrink-0`} />
                          <span>{swatch.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Slider Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-main">Toleransi Pembersihan</span>
                    <span className="font-mono font-bold text-primary">{transparentTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="85"
                    step="1"
                    value={transparentTolerance}
                    onChange={(e) => setTransparentTolerance(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-bg-hover rounded-lg"
                  />
                  <p className="text-[10px] text-text-muted">
                    Naikkan toleransi jika masih ada sisa warna merah/latar di sekitar kepala/bahu.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-main">Kehalusan Tepi (Feather)</span>
                    <span className="font-mono font-bold text-primary">{transparentFeather} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={transparentFeather}
                    onChange={(e) => setTransparentFeather(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-bg-hover rounded-lg"
                  />
                  <p className="text-[10px] text-text-muted">
                    Menghaluskan lekuk rambut dan pakaian agar potongan tidak tampak kasar.
                  </p>
                </div>
              </div>

              {/* Format Selection for Transparent Output */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-main">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-text-main">Format Transparan:</span>
                  <div className="inline-flex rounded-xl bg-bg-hover p-1 border border-border-main">
                    <button
                      type="button"
                      onClick={() => setTransparentTargetFormat('png')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        transparentTargetFormat === 'png' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransparentTargetFormat('webp')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        transparentTargetFormat === 'webp' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      WEBP
                    </button>
                  </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={transparentContiguous}
                    onChange={(e) => setTransparentContiguous(e.target.checked)}
                    className="rounded border-border-main text-primary focus:ring-primary accent-primary"
                  />
                  <span className="font-medium text-text-main">
                    Hanya dari Tepi Luar (*Lindungi Isi Dalam*)
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-border-main bg-bg-card flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTransparentExportModalItem(null)}
                className="px-4 py-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-muted hover:text-text-main text-xs font-semibold transition-colors"
              >
                Batal
              </button>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleCopyTransparentExport}
                  disabled={!transparentPreviewResult}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Hasil ({transparentExportModalItem.originalWidth} × {transparentExportModalItem.originalHeight} px)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTransparentExport}
                  disabled={!transparentPreviewResult}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors inline-flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh {transparentTargetFormat.toUpperCase()} ({transparentExportModalItem.originalWidth} × {transparentExportModalItem.originalHeight} px)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Side-by-Side Comparison Modal */}
      {selectedPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-bg-card border border-border-main rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-bg-card/80">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  HD
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text-main truncate max-w-xs sm:max-w-md">
                    {selectedPreviewItem.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    Pratinjau Perbandingan Kualitas & Kejelasan Gambar
                  </p>
                </div>
              </div>

              {/* View mode toggle & Close */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-1 p-1 bg-bg-hover border border-border-main rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('side-by-side')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      previewMode === 'side-by-side' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Berdampingan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewMode('toggle')
                      setToggleOriginal(false)
                    }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      previewMode === 'toggle' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Bandingkan Toggle
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPreviewItem(null)}
                  className="p-2 rounded-xl bg-bg-hover hover:bg-bg-hover/80 text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {previewMode === 'side-by-side' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Image Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                      <span>Gambar Asli</span>
                      <span className="font-mono text-text-main">
                        {formatFileSize(selectedPreviewItem.originalSize)} ({selectedPreviewItem.originalWidth} × {selectedPreviewItem.originalHeight})
                      </span>
                    </div>
                    <div className="h-80 sm:h-96 rounded-2xl bg-bg-hover border border-border-main overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={selectedPreviewItem.previewUrl}
                        alt="Original"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Converted Image Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span>Hasil Konversi ({options.targetFormat.toUpperCase()})</span>
                      <span className="font-mono">
                        {formatFileSize(selectedPreviewItem.convertedSize || selectedPreviewItem.originalSize)} (
                        {selectedPreviewItem.convertedWidth || selectedPreviewItem.originalWidth} × {selectedPreviewItem.convertedHeight || selectedPreviewItem.originalHeight})
                      </span>
                    </div>
                    <div className="h-80 sm:h-96 rounded-2xl bg-bg-hover border border-primary/40 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={selectedPreviewItem.convertedUrl || selectedPreviewItem.previewUrl}
                        alt="Converted"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Toggle Mode */
                <div className="space-y-3 flex flex-col items-center">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onMouseDown={() => setToggleOriginal(true)}
                      onMouseUp={() => setToggleOriginal(false)}
                      onTouchStart={() => setToggleOriginal(true)}
                      onTouchEnd={() => setToggleOriginal(false)}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm select-none"
                    >
                      {toggleOriginal ? '👀 Menampilkan ASLI' : '👆 Tahan untuk Lihat Asli'}
                    </button>
                    <span className="text-xs font-bold text-text-main">
                      {toggleOriginal ? 'Mode: Asli' : `Mode: Hasil (${options.targetFormat.toUpperCase()})`}
                    </span>
                  </div>

                  <div className="w-full h-96 sm:h-[450px] rounded-2xl bg-bg-hover border border-border-main overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={toggleOriginal ? selectedPreviewItem.previewUrl : selectedPreviewItem.convertedUrl || selectedPreviewItem.previewUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-main bg-bg-card flex items-center justify-between">
              <div className="text-xs text-text-muted">
                Pengaturan aktif:{' '}
                <strong className="text-text-main uppercase">{options.targetFormat}</strong> •{' '}
                {options.targetFormat === 'png' ? 'Lossless' : `Kualitas ${Math.round(options.quality * 100)}%`} •{' '}
                Skala {Math.round(options.scale * 100)}% •{' '}
                <span className="font-mono font-bold text-primary">
                  {selectedPreviewItem.convertedWidth || selectedPreviewItem.originalWidth} × {selectedPreviewItem.convertedHeight || selectedPreviewItem.originalHeight} px
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCopyImage(selectedPreviewItem)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors inline-flex items-center space-x-1.5 ${
                    copiedId === selectedPreviewItem.id
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {copiedId === selectedPreviewItem.id ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Hasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Salin Hasil ({selectedPreviewItem.convertedWidth || selectedPreviewItem.originalWidth} × {selectedPreviewItem.convertedHeight || selectedPreviewItem.originalHeight} px)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(selectedPreviewItem)}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors inline-flex items-center space-x-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh {options.targetFormat.toUpperCase()} ({selectedPreviewItem.convertedWidth || selectedPreviewItem.originalWidth} × {selectedPreviewItem.convertedHeight || selectedPreviewItem.originalHeight} px)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide & Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <FileImage className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-main">Memilih Format yang Tepat</h4>
          <ul className="text-xs text-text-muted space-y-2 leading-relaxed">
            <li>
              <strong className="text-text-main font-semibold">WebP:</strong> Format modern paling efisien untuk web, ukuran jauh lebih kecil dengan kualitas tajam.
            </li>
            <li>
              <strong className="text-text-main font-semibold">PNG:</strong> Format tanpa kompresi pecah (*lossless*) & mendukung latar transparan.
            </li>
            <li>
              <strong className="text-text-main font-semibold">JPG:</strong> Kompatibel untuk semua sistem & perangkat cetak.
            </li>
          </ul>
        </div>

        <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-main">Tips Mengatur Kejelasan</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Pengaturan kualitas di kisaran <strong className="text-text-main font-semibold">80% – 85%</strong> menghasilkan gambar yang secara kasat mata sama jernihnya dengan aslinya, namun menghemat ukuran file hingga <strong className="text-emerald-600 dark:text-emerald-400 font-bold">70% – 90%</strong>.
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Copy className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-main">Pintasan Copy-Paste</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Ambil tangkapan layar (<kbd className="px-1 py-0.5 rounded bg-bg-hover border border-border-main font-mono text-[10px]">Win + Shift + S</kbd> / <kbd className="px-1 py-0.5 rounded bg-bg-hover border border-border-main font-mono text-[10px]">Cmd + Shift + 4</kbd>) atau salin gambar dari web manapun, lalu langsung tekan <kbd className="px-1.5 py-0.5 rounded bg-bg-hover border border-border-main font-mono text-[10px]">Ctrl + V</kbd> di halaman ini!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageConverterPage
