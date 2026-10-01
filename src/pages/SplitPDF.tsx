/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: SplitPDF.tsx (Client-side PDF Separator with custom naming, auto-looping, and ZIP packaging).
 */

import { useState, useMemo, useRef, useId, useEffect } from 'react'
import {
  Scissors,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  FolderArchive,
  RefreshCw,
  FileCheck,
  Info,
} from 'lucide-react'
import {
  loadPdfFileInfo,
  calculateSplitChunks,
  splitPdfAndZip,
  downloadFileBlob,
  createDemoPdf,
  type PdfFileInfo,
  type SplitChunkInfo,
  type SplitResultItem,
  type SplitProgress,
} from '../utils/pdfSplitter'
import { formatFileSize } from '../utils/format'

export function SplitPDFPage() {
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Document state
  const [pdfInfo, setPdfInfo] = useState<PdfFileInfo | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)

  // Split settings
  const [pagesPerFile, setPagesPerFile] = useState<number>(2)
  const [customNamesText, setCustomNamesText] = useState<string>('Sertifikat A\nSertifikat B')
  const [zipCustomName, setZipCustomName] = useState<string>('')

  // Processing & Results state
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<SplitProgress | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [splitResult, setSplitResult] = useState<{
    zipBlob: Blob
    zipUrl: string
    items: SplitResultItem[]
  } | null>(null)

  // Automatically update default zip filename when PDF is loaded
  useEffect(() => {
    if (pdfInfo) {
      const base = pdfInfo.name.replace(/\.[^/.]+$/, '')
      setZipCustomName(`${base}_terpisah.zip`)
    }
  }, [pdfInfo])

  // Parse custom names from textarea lines
  const parsedCustomNames = useMemo(() => {
    return customNamesText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }, [customNamesText])

  // Calculate live chunks preview
  const chunks = useMemo<SplitChunkInfo[]>(() => {
    if (!pdfInfo || pdfInfo.totalPages <= 0) return []
    return calculateSplitChunks(
      pdfInfo.totalPages,
      pagesPerFile,
      parsedCustomNames,
      pdfInfo.name
    )
  }, [pdfInfo, pagesPerFile, parsedCustomNames])

  // Handle uploaded file
  const handlePdfUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Harap unggah file dengan format PDF (.pdf).')
      return
    }

    setIsLoadingPdf(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    setSplitResult(null)

    try {
      const { info, arrayBuffer } = await loadPdfFileInfo(file)
      setPdfInfo(info)
      setPdfBuffer(arrayBuffer)
      // Set reasonable default split count (e.g. 15 if 30 pages, or 2)
      if (info.totalPages === 30) {
        setPagesPerFile(15)
      } else if (info.totalPages > 1) {
        setPagesPerFile(Math.min(2, info.totalPages))
      } else {
        setPagesPerFile(1)
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(
        'Gagal membaca file PDF. Pastikan file tidak rusak atau dilindungi kata sandi yang tidak didukung.'
      )
    } finally {
      setIsLoadingPdf(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0])
    }
  }

  // Load demo 30-page PDF
  const handleLoadDemo = async () => {
    setIsLoadingPdf(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    setSplitResult(null)

    try {
      const { arrayBuffer, info } = await createDemoPdf(30)
      setPdfInfo(info)
      setPdfBuffer(arrayBuffer)
      setPagesPerFile(15)
      setCustomNamesText('Sertifikat A\nSertifikat B')
      setZipCustomName('Demo_Sertifikat_Terpisah.zip')
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Gagal membuat contoh PDF demo.')
    } finally {
      setIsLoadingPdf(false)
    }
  }

  const handleReset = () => {
    setPdfInfo(null)
    setPdfBuffer(null)
    setSplitResult(null)
    setErrorMsg(null)
    setSuccessMsg(null)
    setProgress(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Execute PDF Split and Download ZIP
  const handleProcessSplit = async () => {
    if (!pdfBuffer || chunks.length === 0) return

    setIsProcessing(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const finalZipName = zipCustomName.trim()
        ? zipCustomName.trim().endsWith('.zip')
          ? zipCustomName.trim()
          : `${zipCustomName.trim()}.zip`
        : `${pdfInfo?.name.replace(/\.[^/.]+$/, '') || 'document'}_terpisah.zip`

      const result = await splitPdfAndZip(pdfBuffer, chunks, finalZipName, (p) => {
        setProgress(p)
      })

      setSplitResult(result)
      setSuccessMsg(
        `Sukses memisahkan ${chunks.length} dokumen PDF! File ZIP otomatis diunduh.`
      )

      // Auto download ZIP
      downloadFileBlob(result.zipBlob, finalZipName)
    } catch (err: any) {
      console.error('Split error:', err)
      setErrorMsg(`Terjadi kesalahan saat memisahkan PDF: ${err.message || err}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-border-main p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Scissors className="w-3.5 h-3.5" />
            <span>PDF Tools • Split & Separated</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Pisahkan PDF (Separated PDF)
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Potong dokumen PDF multi-halaman menjadi beberapa bagian sesuai jumlah halaman yang diinginkan,
            terapkan penamaan kustom dengan <em>auto-looping</em>, dan unduh seluruh hasilnya dalam 1 arsip ZIP.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STATE 1: No PDF Uploaded */}
      {!pdfInfo && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-200 p-10 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.005]'
                : 'border-border-main bg-bg-card hover:border-primary/50 hover:bg-bg-hover/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
              {isLoadingPdf ? (
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-text-main mb-2">
              {isLoadingPdf ? 'Sedang Membaca Dokumen PDF...' : 'Pilih atau Drag & Drop File PDF'}
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
              Pilih dokumen PDF yang ingin dipisahkan (misalnya sertifikat, berkas laporan, atau faktur multi-halaman).
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center space-x-2 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Pilih File PDF</span>
              </button>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-bg-hover border border-border-main hover:border-primary/40 text-text-main text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 pointer-events-auto shadow-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLoadDemo()
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Coba Contoh PDF Demo (30 Halaman)</span>
              </button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-main space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Scissors className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-main">Pemisahan Fleksibel</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Pisahkan per 2 halaman, per 15 halaman, atau jumlah halaman berapapun secara presisi tanpa kehilangan kualitas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-card border border-border-main space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-main">Penamaan & Looping Otomatis</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Masukkan daftar nama seperti "Sertifikat A" & "Sertifikat B". Jika halaman lebih banyak, nama akan berulang otomatis.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-card border border-border-main space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FolderArchive className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-main">Bundel ZIP Instan</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Seluruh file PDF hasil potongan langsung dibundel ke dalam 1 file .zip terkompresi siap pakai.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: PDF Loaded - Active Configuration & Preview */}
      {pdfInfo && (
        <div className="space-y-6">
          {/* Active File Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border-main flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm shrink-0">
                PDF
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-text-main truncate max-w-xs sm:max-w-md">
                    {pdfInfo.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-3 text-xs text-text-muted mt-0.5">
                  <span className="font-semibold text-primary">
                    {pdfInfo.totalPages} Total Halaman
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(pdfInfo.size)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-bg-hover hover:bg-border-main/50 text-xs font-semibold text-text-main transition-all flex items-center space-x-1.5 border border-border-main"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti PDF</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-all"
                title="Hapus / Reset"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          </div>

          {/* Configuration & Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Settings (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Page Division */}
              <div className="p-6 rounded-3xl bg-bg-card border border-border-main space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-bold text-text-main">
                    <Scissors className="w-4 h-4 text-primary" />
                    <span>Halaman per Dokumen</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {pagesPerFile} Hal / File
                  </span>
                </div>

                {/* Range Slider & Input Stepper */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={1}
                      max={pdfInfo.totalPages}
                      value={pagesPerFile}
                      onChange={(e) =>
                        setPagesPerFile(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full accent-primary h-2 bg-border-main rounded-lg cursor-pointer"
                    />
                    <div className="w-20 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={pdfInfo.totalPages}
                        value={pagesPerFile}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val)) {
                            setPagesPerFile(
                              Math.max(1, Math.min(val, pdfInfo.totalPages))
                            )
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-border-main bg-bg-hover text-text-main text-xs font-bold text-center focus:outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-text-muted">Preset Cepat:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 5, 10, 15].map((preset) => {
                        if (preset > pdfInfo.totalPages && preset !== 1) return null
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPagesPerFile(preset)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              pagesPerFile === preset
                                ? 'bg-primary text-white shadow-xs'
                                : 'bg-bg-hover hover:bg-border-main/50 text-text-muted hover:text-text-main border border-border-main'
                            }`}
                          >
                            {preset} Hal
                          </button>
                        )
                      })}
                      {pdfInfo.totalPages > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPagesPerFile(Math.ceil(pdfInfo.totalPages / 2))
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            pagesPerFile === Math.ceil(pdfInfo.totalPages / 2)
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-bg-hover hover:bg-border-main/50 text-text-muted hover:text-text-main border border-border-main'
                          }`}
                        >
                          Bagi 2 Rata ({Math.ceil(pdfInfo.totalPages / 2)} Hal)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calculation Info Pill */}
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-text-main flex items-start space-x-2.5">
                  <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    Total <strong className="text-primary">{pdfInfo.totalPages} Halaman</strong> akan
                    dipecah menjadi{' '}
                    <strong className="text-primary">{chunks.length} Dokumen PDF</strong> terpisah.
                  </div>
                </div>
              </div>

              {/* Card 2: Custom Naming & Looping */}
              <div className="p-6 rounded-3xl bg-bg-card border border-border-main space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-bold text-text-main">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Daftar Nama File Kustom</span>
                  </div>
                  <span className="text-[11px] text-text-muted">1 nama per baris</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={customNamesText}
                    onChange={(e) => setCustomNamesText(e.target.value)}
                    placeholder="Sertifikat A&#10;Sertifikat B&#10;Sertifikat C"
                    className="w-full p-3 rounded-2xl border border-border-main bg-bg-hover text-text-main text-xs font-mono focus:outline-hidden focus:border-primary resize-y leading-relaxed"
                  />

                  {/* Preset Name Suggestions */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomNamesText('Sertifikat A\nSertifikat B')}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-bg-hover hover:bg-border-main text-text-muted border border-border-main"
                    >
                      + Sertifikat A & B
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomNamesText('Peserta\nPanitia\nPembicara')}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-bg-hover hover:bg-border-main text-text-muted border border-border-main"
                    >
                      + Peserta & Panitia
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomNamesText('Modul 1\nModul 2\nModul 3')}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-bg-hover hover:bg-border-main text-text-muted border border-border-main"
                    >
                      + Modul 1, 2, 3
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomNamesText('')}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-bg-hover hover:bg-border-main text-rose-500 border border-border-main"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                {/* Looping explanation note */}
                <div className="p-3.5 rounded-2xl bg-bg-hover border border-border-main text-[11px] text-text-muted space-y-1">
                  <div className="flex items-center space-x-1.5 font-semibold text-text-main">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span>Sistem Perulangan (Auto-Looping)</span>
                  </div>
                  <p className="leading-relaxed">
                    Jika jumlah file ({chunks.length} file) melebihi jumlah nama yang dimasukkan (
                    {parsedCustomNames.length || 0} nama), penamaan akan berulang secara otomatis dengan
                    penomoran unik: <em>Sertifikat A, Sertifikat B, Sertifikat A (2), ...</em>
                  </p>
                </div>

                {/* ZIP Name Option */}
                <div className="pt-2 border-t border-border-main/60 space-y-1.5">
                  <label className="text-xs font-bold text-text-main flex items-center space-x-1.5">
                    <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nama Arsip ZIP</span>
                  </label>
                  <input
                    type="text"
                    value={zipCustomName}
                    onChange={(e) => setZipCustomName(e.target.value)}
                    placeholder="nama_arsip.zip"
                    className="w-full px-3 py-2 rounded-xl border border-border-main bg-bg-hover text-text-main text-xs focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Chunk Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-bg-card border border-border-main space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-text-main flex items-center space-x-2">
                      <Layers className="w-4.5 h-4.5 text-primary" />
                      <span>Pratinjau Hasil Pemotongan</span>
                    </h3>
                    <p className="text-xs text-text-muted">
                      Daftar {chunks.length} file PDF yang akan digenerate dan dikemas ke dalam ZIP
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {chunks.length} File
                  </span>
                </div>

                {/* Chunks List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {chunks.map((chunk) => (
                    <div
                      key={chunk.index}
                      className="p-3.5 rounded-2xl bg-bg-hover hover:bg-border-subtle/80 border border-border-main transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          #{chunk.chunkNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-text-main truncate">
                            {chunk.fileName}
                          </div>
                          <div className="text-[11px] text-text-muted flex items-center space-x-2 mt-0.5">
                            <span className="font-semibold text-primary">
                              Hal {chunk.startPage} – {chunk.endPage}
                            </span>
                            <span>•</span>
                            <span>{chunk.pageCount} Halaman</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-bg-card border border-border-main text-[10px] font-mono font-medium text-text-muted">
                          .pdf
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Trigger Card */}
                <div className="pt-4 border-t border-border-main space-y-4">
                  {isProcessing ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between text-xs font-bold text-primary">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{progress?.message || 'Memproses PDF...'}</span>
                        </div>
                        <span>
                          {progress
                            ? `${progress.current} / ${progress.total}`
                            : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-border-main h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${
                              progress
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (progress.current / Math.max(1, progress.total)) *
                                        100
                                    )
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleProcessSplit}
                      disabled={isProcessing || chunks.length === 0}
                      className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FolderArchive className="w-5 h-5" />
                      <span>Pisahkan PDF & Unduh ZIP ({chunks.length} File)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>

              {/* Result Download Box (If completed) */}
              {splitResult && (
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-4 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-main">
                          Hasil Pemisahan Siap Diunduh
                        </h4>
                        <p className="text-xs text-text-muted">
                          {splitResult.items.length} PDF terkompresi ({formatFileSize(splitResult.zipBlob.size)})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        downloadFileBlob(
                          splitResult.zipBlob,
                          zipCustomName || `${pdfInfo.name.replace(/\.[^/.]+$/, '')}_terpisah.zip`
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh ZIP Lagi</span>
                    </button>
                  </div>

                  {/* Individual Download List */}
                  <div className="space-y-2 pt-2 border-t border-emerald-500/15">
                    <span className="text-[11px] font-semibold text-text-muted">
                      Atau Unduh File PDF Satuan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {splitResult.items.map((item) => (
                        <div
                          key={item.chunkNumber}
                          className="p-2.5 rounded-xl bg-bg-card border border-border-main flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-text-main truncate">
                              {item.fileName}
                            </p>
                            <p className="text-[10px] text-text-muted">
                              {item.pageRangeText} • {formatFileSize(item.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadFileBlob(item.blob, item.fileName)}
                            className="p-1.5 rounded-lg bg-bg-hover hover:bg-primary/10 hover:text-primary text-text-muted transition-colors shrink-0"
                            title={`Unduh ${item.fileName}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SplitPDFPage
