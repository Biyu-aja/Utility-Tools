/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: PhotoToPDF.tsx (Full-featured client-side Photo to PDF converter).
 */

import { useState, useRef, useEffect, useId } from 'react'
import {
  FileImage,
  UploadCloud,
  Trash2,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  Settings2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import type {
  ImageItem,
  PdfOptions,
  PageSize,
  Orientation,
  MarginSize,
  Quality,
} from '../utils/pdfGenerator'
import {
  generatePdfFromImages,
  downloadBlob,
} from '../utils/pdfGenerator'
import { formatFileSize } from '../utils/format'

export function PhotoToPDFPage() {
  const fileInputId = useId()
  const addMoreInputId = useId()

  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // PDF generation options
  const [options, setOptions] = useState<PdfOptions>({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 'none',
    imageFit: 'contain',
    quality: 'high',
    filename: 'dokumen-foto.pdf',
  })

  // Live PDF preview state
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [currentPdfBlob, setCurrentPdfBlob] = useState<Blob | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Keep refs for unmount cleanup
  const imagesRef = useRef(images)
  imagesRef.current = images
  const previewBlobUrlRef = useRef(previewBlobUrl)
  previewBlobUrlRef.current = previewBlobUrl

  // Cleanup object URLs ONLY when truly unmounting the component
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        try {
          URL.revokeObjectURL(img.previewUrl)
        } catch {
          // ignore
        }
      })
      if (previewBlobUrlRef.current) {
        try {
          URL.revokeObjectURL(previewBlobUrlRef.current)
        } catch {
          // ignore
        }
      }
    }
  }, [])

  // Clipboard paste support (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        addFiles(imageFiles)
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  // Helper to read image dimensions
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        resolve({ width: 800, height: 600 })
      }
      img.src = url
    })
  }

  // Handle incoming files
  const addFiles = async (files: FileList | File[]) => {
    setErrorMsg(null)
    setSuccessMsg(null)

    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (validFiles.length === 0) {
      setErrorMsg('Silakan pilih file gambar yang valid (JPG, PNG, WebP, GIF, SVG, BMP).')
      return
    }

    const newItems: ImageItem[] = []
    for (const file of validFiles) {
      const previewUrl = URL.createObjectURL(file)
      const dims = await getImageDimensions(previewUrl)
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        file,
        name: file.name,
        previewUrl,
        size: file.size,
        width: dims.width,
        height: dims.height,
        rotation: 0,
      })
    }

    setImages((prev) => [...prev, ...newItems])
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  // Reorder & Transform actions
  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const updated = [...prev]
      const [moved] = updated.splice(index, 1)
      updated.splice(targetIndex, 0, moved)
      return updated
    })
  }

  const rotateImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev]
      const current = updated[index]
      updated[index] = {
        ...current,
        rotation: (current.rotation + 90) % 360,
      }
      return updated
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearAllImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setImages([])
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl)
      setPreviewBlobUrl(null)
    }
    setCurrentPdfBlob(null)
    setSuccessMsg(null)
  }

  const reverseOrder = () => {
    setImages((prev) => [...prev].reverse())
  }

  // Demo sample images generator
  const loadSampleImages = () => {
    const samples = [
      {
        title: 'Dokumen Sertifikat',
        color1: '#3b82f6',
        color2: '#1d4ed8',
        w: 1200,
        h: 800,
      },
      {
        title: 'Foto Laporan Proyek',
        color1: '#10b981',
        color2: '#047857',
        w: 800,
        h: 1100,
      },
      {
        title: 'Kwitansi & Faktur',
        color1: '#f59e0b',
        color2: '#d97706',
        w: 900,
        h: 1200,
      },
    ]

    const newItems: ImageItem[] = []

    samples.forEach((sample, i) => {
      const canvas = document.createElement('canvas')
      canvas.width = sample.w
      canvas.height = sample.h
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, sample.w, sample.h)
        grad.addColorStop(0, sample.color1)
        grad.addColorStop(1, sample.color2)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, sample.w, sample.h)

        // Card pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.roundRect(40, 40, sample.w - 80, sample.h - 80, 24)
        ctx.fill()

        // Text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 44px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`Sample Halaman ${i + 1}`, sample.w / 2, sample.h / 2 - 30)

        ctx.font = '24px sans-serif'
        ctx.fillText(sample.title, sample.w / 2, sample.h / 2 + 30)
        ctx.fillText(`${sample.w} x ${sample.h} px`, sample.w / 2, sample.h / 2 + 70)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        const byteString = atob(dataUrl.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let j = 0; j < byteString.length; j++) {
          ia[j] = byteString.charCodeAt(j)
        }
        const blob = new Blob([ab], { type: 'image/jpeg' })
        const file = new File([blob], `sample-${i + 1}.jpg`, { type: 'image/jpeg' })
        const previewUrl = URL.createObjectURL(blob)

        newItems.push({
          id: `sample-${i}-${Date.now()}`,
          file,
          name: `Sample_${sample.title.replace(/\s+/g, '_')}.jpg`,
          previewUrl,
          size: blob.size,
          width: sample.w,
          height: sample.h,
          rotation: 0,
        })
      }
    })

    setImages((prev) => [...prev, ...newItems])
    setSuccessMsg('3 gambar contoh berhasil dimuat!')
  }

  // Convert & Download action
  const handleConvertAndDownload = async () => {
    if (images.length === 0) return
    setIsProcessing(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    setProgress({ current: 1, total: images.length })

    try {
      const pdfBlob = await generatePdfFromImages(images, options, (current, total) => {
        setProgress({ current, total })
      })

      setCurrentPdfBlob(pdfBlob)
      downloadBlob(pdfBlob, options.filename || 'dokumen-foto.pdf')
      setSuccessMsg(`PDF berhasil dibuat (${formatFileSize(pdfBlob.size)}) dan diunduh!`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghasilkan file PDF'
      setErrorMsg(message)
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  // Generate for live preview
  const handleOpenPreview = async () => {
    if (images.length === 0) return
    setIsProcessing(true)
    setErrorMsg(null)
    setProgress({ current: 1, total: images.length })

    try {
      const pdfBlob = await generatePdfFromImages(images, options, (current, total) => {
        setProgress({ current, total })
      })

      setCurrentPdfBlob(pdfBlob)
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl)
      }
      const newUrl = URL.createObjectURL(pdfBlob)
      setPreviewBlobUrl(newUrl)
      setIsPreviewModalOpen(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat pratinjau PDF'
      setErrorMsg(message)
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  // Total input size
  const totalInputSize = images.reduce((acc, curr) => acc + curr.size, 0)

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-border-main p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              <span>100% Client-Side & Private</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              Konversi Foto ke PDF
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Gabungkan dan ubah berbagai foto (JPG, PNG, WebP) menjadi satu dokumen PDF
              berkualitas tinggi dalam hitungan detik tanpa upload ke server.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadSampleImages}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-bg-card hover:bg-bg-hover text-text-main border border-border-main shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Coba Contoh Foto</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Badges */}
        <div className="mt-6 pt-6 border-t border-border-main/60 flex flex-wrap gap-4 sm:gap-6 text-xs text-text-muted">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Aman & Terlindungi (Offline)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Ukuran Fleksibel (A4, Letter, Asli)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <RotateCw className="w-4 h-4 text-indigo-500" />
            <span>Rotasi & Urutan Kustom</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload area and Image gallery */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center cursor-pointer flex flex-col items-center justify-center group ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border-main hover:border-primary/50 bg-bg-card/60 hover:bg-bg-card'
            }`}
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            <input
              id={fileInputId}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  addFiles(e.target.files)
                  e.target.value = ''
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-main mb-1">
              Tarik & Lepas Gambar di Sini, atau Klik untuk Memilih
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mb-4">
              Mendukung JPG, PNG, WebP, GIF, SVG, BMP. Anda juga bisa menekan{' '}
              <kbd className="px-1.5 py-0.5 rounded-md bg-bg-hover border border-border-main text-[11px] font-mono">
                Ctrl + V
              </kbd>{' '}
              untuk paste gambar langsung.
            </p>

            <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all pointer-events-none">
              <Plus className="w-4 h-4" />
              <span>Pilih Gambar dari Komputer</span>
            </span>
          </div>

          {/* Image List / Gallery */}
          {images.length > 0 && (
            <div className="space-y-4">
              {/* Header actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-card border border-border-main rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <FileImage className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-text-main">
                    Daftar Halaman ({images.length} Gambar)
                  </span>
                  <span className="text-xs text-text-muted">
                    • Total {formatFileSize(totalInputSize)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById(addMoreInputId)?.click()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-main bg-bg-hover hover:bg-border-subtle border border-border-main transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                  <input
                    id={addMoreInputId}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        addFiles(e.target.files)
                        e.target.value = ''
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={reverseOrder}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-hover border border-border-main transition-colors cursor-pointer"
                    title="Balik Urutan Gambar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Balik Urutan</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Hapus Semua Gambar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan</span>
                  </button>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {images.map((img, idx) => {
                  const isRotatedSides = img.rotation === 90 || img.rotation === 270
                  return (
                    <div
                      key={img.id}
                      className="group relative bg-bg-card border border-border-main hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-150 flex flex-col shadow-xs hover:shadow-md"
                    >
                      {/* Page index badge */}
                      <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-bold tracking-wider">
                        Hal. {idx + 1}
                      </div>

                      {/* Image Preview Canvas Holder */}
                      <div className="relative w-full h-44 bg-bg-hover/80 flex items-center justify-center overflow-hidden p-2">
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          style={{
                            transform: `rotate(${img.rotation}deg)`,
                            transition: 'transform 0.2s ease-in-out',
                          }}
                          className={`max-h-full max-w-full object-contain rounded shadow-xs ${
                            isRotatedSides ? 'scale-90' : ''
                          }`}
                        />
                      </div>

                      {/* Info & Toolbar */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-bg-card border-t border-border-main">
                        <div>
                          <p
                            className="text-xs font-semibold text-text-main truncate"
                            title={img.name}
                          >
                            {img.name}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-text-muted mt-0.5">
                            <span>
                              {img.width} × {img.height} px
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(img.size)}</span>
                            {img.rotation > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-medium">{img.rotation}°</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                          {/* Reorder Up / Down */}
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              title="Pindah ke Halaman Sebelumnya"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'down')}
                              disabled={idx === images.length - 1}
                              className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              title="Pindah ke Halaman Berikutnya"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Rotate & Delete */}
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => rotateImage(idx)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Putar 90° Searah Jarum Jam"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Hapus Halaman Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Settings & Action Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-border-main">
              <Settings2 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-text-main">Pengaturan Dokumen PDF</h2>
            </div>

            {/* Page Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main block">
                Ukuran Kertas (Page Size)
              </label>
              <select
                value={options.pageSize}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, pageSize: e.target.value as PageSize }))
                }
                className="w-full text-xs font-medium bg-bg-card border border-border-main rounded-xl px-3 py-2.5 text-text-main focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="a4">A4 (210 × 297 mm) - Standar</option>
                <option value="letter">Letter (215.9 × 279.4 mm)</option>
                <option value="legal">Legal (215.9 × 355.6 mm)</option>
                <option value="a3">A3 (297 × 420 mm) - Poster / Besar</option>
                <option value="a5">A5 (148 × 210 mm) - Buku / Kecil</option>
                <option value="fit">Fit to Image (Sesuai Dimensi Gambar Asli)</option>
              </select>
            </div>

            {/* Orientation */}
            {options.pageSize !== 'fit' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main block">
                  Orientasi Halaman
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Otomatis' },
                    { id: 'portrait', label: 'Tegak' },
                    { id: 'landscape', label: 'Mendatar' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setOptions((prev) => ({
                          ...prev,
                          orientation: item.id as Orientation,
                        }))
                      }
                      className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        options.orientation === item.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-bg-card text-text-muted hover:text-text-main border-border-main hover:bg-bg-hover'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Margins */}
            {options.pageSize !== 'fit' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main block">
                  Margin Halaman
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: '0 mm' },
                    { id: 'small', label: '6 mm' },
                    { id: 'standard', label: '15 mm' },
                    { id: 'large', label: '25 mm' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setOptions((prev) => ({
                          ...prev,
                          margin: item.id as MarginSize,
                        }))
                      }
                      className={`px-2 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        options.margin === item.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-bg-card text-text-muted hover:text-text-main border-border-main hover:bg-bg-hover'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Fit */}
            {options.pageSize !== 'fit' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main block">
                  Penempatan Gambar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => ({ ...prev, imageFit: 'contain' }))}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      options.imageFit === 'contain'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-bg-card text-text-muted hover:text-text-main border-border-main hover:bg-bg-hover'
                    }`}
                  >
                    Pas (Jaga Proporsi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => ({ ...prev, imageFit: 'fill' }))}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      options.imageFit === 'fill'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-bg-card text-text-muted hover:text-text-main border-border-main hover:bg-bg-hover'
                    }`}
                  >
                    Penuh (Isi Margin)
                  </button>
                </div>
              </div>
            )}

            {/* Quality & Compression */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main block">
                Kualitas & Kompresi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'high', label: 'Tinggi (92%)' },
                  { id: 'medium', label: 'Sedang (80%)' },
                  { id: 'low', label: 'Hemat (60%)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setOptions((prev) => ({ ...prev, quality: item.id as Quality }))
                    }
                    className={`px-2 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      options.quality === item.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-bg-card text-text-muted hover:text-text-main border-border-main hover:bg-bg-hover'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Filename */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main block">
                Nama File PDF
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={options.filename}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, filename: e.target.value }))
                  }
                  placeholder="nama-file.pdf"
                  className="w-full text-xs font-medium bg-bg-card border border-border-main rounded-xl px-3 py-2.5 text-text-main focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-border-main">
              {/* Progress Indicator */}
              {isProcessing && progress && (
                <div className="space-y-1.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex justify-between text-xs font-semibold text-primary">
                    <span>Memproses Halaman...</span>
                    <span>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-border-main rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 transition-all duration-200"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvertAndDownload}
                disabled={images.length === 0 || isProcessing}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Membuat PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Konversi & Unduh PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenPreview}
                disabled={images.length === 0 || isProcessing}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-bg-hover hover:bg-border-subtle disabled:opacity-50 disabled:cursor-not-allowed text-text-main text-xs font-bold border border-border-main transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-primary" />
                <span>Pratinjau PDF (Preview)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Live Preview Modal */}
      {isPreviewModalOpen && previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-5xl h-[90vh] bg-bg-card border border-border-main rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-bg-card/80">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    Pratinjau: {options.filename}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {images.length} Halaman • Siap diunduh
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPdfBlob) {
                      downloadBlob(currentPdfBlob, options.filename)
                    }
                  }}
                  className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Sekarang</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-hover transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Viewer */}
            <div className="flex-1 w-full bg-slate-900/10 dark:bg-slate-950 p-2 sm:p-4">
              <iframe
                src={previewBlobUrl}
                title="Pratinjau Dokumen PDF"
                className="w-full h-full rounded-xl border border-border-main shadow-inner bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoToPDFPage
