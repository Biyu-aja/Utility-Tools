/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: ExcelConverter.tsx (Comprehensive two-way CSV <-> XLSX Converter
 *              with delimiter auto-detection, multi-sheet support, live spreadsheet preview,
 *              batch processing, and clipboard copying).
 */

import { useState, useId, useRef, useEffect, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FileSpreadsheet,
  FileText,
  ArrowLeftRight,
  UploadCloud,
  Download,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Zap,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  FolderArchive,
  Info,
  SlidersHorizontal,
  Table,
} from 'lucide-react'
import {
  parseCsv,
  detectDelimiter,
  generateCsv,
  generateXlsxBlob,
  parseXlsxFile,
  downloadBlob,
  createZipBundle,
  createSampleCsvData,
  colIndexToLetter,
  type ParsedWorkbook,
  type BatchConvertItem,
} from '../utils/excelConverter'
import { formatFileSize } from '../utils/format'
import { AppRoutes } from '../constants/listed'

interface ExcelConverterProps {
  defaultMode?: 'csv-to-xlsx' | 'xlsx-to-csv'
}

export function ExcelConverterPage({ defaultMode }: ExcelConverterProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine current mode from path or prop
  const currentMode = useMemo<'csv-to-xlsx' | 'xlsx-to-csv'>(() => {
    if (location.pathname.includes(AppRoutes.XlsxToCsv)) {
      return 'xlsx-to-csv'
    }
    if (location.pathname.includes(AppRoutes.CsvToXlsx)) {
      return 'csv-to-xlsx'
    }
    return defaultMode || 'csv-to-xlsx'
  }, [location.pathname, defaultMode])

  // Mode change handler
  const handleSwitchMode = (mode: 'csv-to-xlsx' | 'xlsx-to-csv') => {
    if (mode === 'csv-to-xlsx') {
      navigate(`/${AppRoutes.CsvToXlsx}`)
    } else {
      navigate(`/${AppRoutes.XlsxToCsv}`)
    }
  }

  // -------------------------------------------------------------
  // STATE: CSV TO XLSX
  // -------------------------------------------------------------
  const [csvInputMethod, setCsvInputMethod] = useState<'upload' | 'paste'>('upload')
  const [csvRawText, setCsvRawText] = useState<string>('')
  const [csvUploadedFileName, setCsvUploadedFileName] = useState<string>('data_convert.csv')
  const [csvDelimiterOption, setCsvDelimiterOption] = useState<string>('auto')
  const [detectedCsvDelimiter, setDetectedCsvDelimiter] = useState<string>(',')
  const [xlsxSheetName, setXlsxSheetName] = useState<string>('Sheet1')
  const [xlsxStyleHeader, setXlsxStyleHeader] = useState<boolean>(true)
  const [xlsxSmartTypes, setXlsxSmartTypes] = useState<boolean>(true)
  const [xlsxAutoWidth, setXlsxAutoWidth] = useState<boolean>(true)
  const [csvOutputName, setCsvOutputName] = useState<string>('data_convert.xlsx')

  // Parsed CSV grid
  const [csvParsedGrid, setCsvParsedGrid] = useState<string[][]>([])
  const [isProcessingCsv, setIsProcessingCsv] = useState<boolean>(false)

  // -------------------------------------------------------------
  // STATE: XLSX TO CSV
  // -------------------------------------------------------------
  const [xlsxWorkbook, setXlsxWorkbook] = useState<ParsedWorkbook | null>(null)
  const [selectedSheetName, setSelectedSheetName] = useState<string>('')
  const [csvExportDelimiter, setCsvExportDelimiter] = useState<string>(',')
  const [csvExportWithBom, setCsvExportWithBom] = useState<boolean>(true)
  const [csvExportQuoteAll, setCsvExportQuoteAll] = useState<boolean>(false)
  const [xlsxOutputName, setXlsxOutputName] = useState<string>('data_export.csv')
  const [isProcessingXlsx, setIsProcessingXlsx] = useState<boolean>(false)

  // -------------------------------------------------------------
  // COMMON UI STATE
  // -------------------------------------------------------------
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [previewLimit, setPreviewLimit] = useState<number>(25)
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Batch queue for multiple files
  const [batchQueue, setBatchQueue] = useState<BatchConvertItem[]>([])

  // Notify helper
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }, [])

  // -------------------------------------------------------------
  // CSV PARSING EFFECT
  // -------------------------------------------------------------
  useEffect(() => {
    if (currentMode !== 'csv-to-xlsx') return

    if (!csvRawText.trim()) {
      setCsvParsedGrid([])
      return
    }

    try {
      const autoDelim = detectDelimiter(csvRawText)
      setDetectedCsvDelimiter(autoDelim)

      const activeDelim = csvDelimiterOption === 'auto' ? autoDelim : csvDelimiterOption
      const { data } = parseCsv(csvRawText, { delimiter: activeDelim })
      setCsvParsedGrid(data)
    } catch (err) {
      console.error('Error parsing CSV:', err)
      setCsvParsedGrid([])
    }
  }, [csvRawText, csvDelimiterOption, currentMode])

  // -------------------------------------------------------------
  // SAMPLE DATA LOADERS
  // -------------------------------------------------------------
  const handleLoadSampleCsv = () => {
    const sample = createSampleCsvData()
    setCsvRawText(sample)
    setCsvUploadedFileName('laporan_penjualan_sample.csv')
    setCsvOutputName('laporan_penjualan_sample.xlsx')
    setCsvInputMethod('paste')
    showToast('success', 'Data contoh CSV berhasil dimuat!')
  }

  const handleLoadSampleXlsx = async () => {
    try {
      setIsProcessingXlsx(true)
      const sample = createSampleCsvData()
      const { data } = parseCsv(sample, { delimiter: ',' })
      const blob = await generateXlsxBlob(data, {
        sheetName: 'Laporan Penjualan',
        styleHeader: true,
      })
      const parsed = await parseXlsxFile(blob, 'sample_penjualan.xlsx')
      setXlsxWorkbook(parsed)
      setSelectedSheetName(parsed.activeSheetName)
      setXlsxOutputName('sample_penjualan.csv')
      showToast('success', 'Contoh file Excel (.xlsx) berhasil dibuat dan dimuat!')
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal membuat contoh file Excel.')
    } finally {
      setIsProcessingXlsx(false)
    }
  }

  // -------------------------------------------------------------
  // FILE UPLOAD HANDLERS
  // -------------------------------------------------------------
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    // If multiple files, handle batch
    if (files.length > 1) {
      await handleBatchUpload(Array.from(files))
      return
    }

    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase() || ''

    // Smart detect opposite format drop
    if (currentMode === 'csv-to-xlsx' && (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm')) {
      handleSwitchMode('xlsx-to-csv')
      showToast('info', 'Terdeteksi file Excel! Beralih otomatis ke mode XLSX to CSV.')
      await processSingleXlsx(file)
      return
    }

    if (currentMode === 'xlsx-to-csv' && (ext === 'csv' || ext === 'txt' || ext === 'tsv')) {
      handleSwitchMode('csv-to-xlsx')
      showToast('info', 'Terdeteksi file CSV/Teks! Beralih otomatis ke mode CSV to XLSX.')
      await processSingleCsv(file)
      return
    }

    if (currentMode === 'csv-to-xlsx') {
      await processSingleCsv(file)
    } else {
      await processSingleXlsx(file)
    }
  }

  const processSingleCsv = async (file: File) => {
    try {
      setIsProcessingCsv(true)
      const text = await file.text()
      setCsvRawText(text)
      setCsvUploadedFileName(file.name)
      const base = file.name.replace(/\.[^/.]+$/, '')
      setCsvOutputName(`${base}.xlsx`)
      setXlsxSheetName(base.slice(0, 31) || 'Sheet1')
      setCsvInputMethod('upload')
      showToast('success', `File ${file.name} berhasil dibaca.`)
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal membaca file CSV. Pastikan file valid.')
    } finally {
      setIsProcessingCsv(false)
    }
  }

  const processSingleXlsx = async (file: File) => {
    try {
      setIsProcessingXlsx(true)
      const parsed = await parseXlsxFile(file, file.name)
      setXlsxWorkbook(parsed)
      setSelectedSheetName(parsed.activeSheetName)
      const base = file.name.replace(/\.[^/.]+$/, '')
      setXlsxOutputName(`${base}.csv`)
      showToast('success', `File Excel ${file.name} berhasil dibaca (${parsed.sheets.length} sheet).`)
    } catch (err) {
      console.error(err)
      showToast(
        'error',
        'Gagal membaca file Excel. Pastikan file berformat .xlsx OpenXML yang valid.'
      )
    } finally {
      setIsProcessingXlsx(false)
    }
  }

  // -------------------------------------------------------------
  // BATCH PROCESSING
  // -------------------------------------------------------------
  const handleBatchUpload = async (fileArray: File[]) => {
    const newItems: BatchConvertItem[] = fileArray.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      fileName: f.name,
      originalSize: f.size,
      status: 'pending',
    }))

    setBatchQueue(newItems)
    showToast('info', `Memproses ${fileArray.length} file secara batch...`)

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const itemId = newItems[i].id

      setBatchQueue((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: 'processing' } : item))
      )

      try {
        if (currentMode === 'csv-to-xlsx') {
          const text = await file.text()
          const { data } = parseCsv(text)
          const base = file.name.replace(/\.[^/.]+$/, '')
          const blob = await generateXlsxBlob(data, {
            sheetName: base.slice(0, 31) || 'Sheet1',
            styleHeader: xlsxStyleHeader,
            autoFitWidth: xlsxAutoWidth,
            smartDataTypes: xlsxSmartTypes,
          })
          const outName = `${base}.xlsx`

          setBatchQueue((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: 'done',
                    resultBlob: blob,
                    resultSize: blob.size,
                    resultFileName: outName,
                    previewData: data.slice(0, 5),
                  }
                : item
            )
          )
        } else {
          const parsed = await parseXlsxFile(file, file.name)
          const sheetData = parsed.data
          const csvText = generateCsv(sheetData, {
            delimiter: csvExportDelimiter,
            withBom: csvExportWithBom,
            quoteAll: csvExportQuoteAll,
          })
          const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' })
          const base = file.name.replace(/\.[^/.]+$/, '')
          const outName = `${base}.csv`

          setBatchQueue((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: 'done',
                    resultBlob: blob,
                    resultSize: blob.size,
                    resultFileName: outName,
                    previewData: sheetData.slice(0, 5),
                    sheetNames: parsed.sheets.map((s) => s.name),
                  }
                : item
            )
          )
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Gagal konversi'
        setBatchQueue((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'error',
                  errorMessage: errorMsg,
                }
              : item
          )
        )
      }
    }

    showToast('success', 'Batch konversi selesai!')
  }

  // Download all batch as ZIP
  const handleDownloadBatchZip = async () => {
    const readyFiles = batchQueue
      .filter((item) => item.status === 'done' && item.resultBlob && item.resultFileName)
      .map((item) => ({
        name: item.resultFileName!,
        blob: item.resultBlob!,
      }))

    if (readyFiles.length === 0) {
      showToast('error', 'Belum ada file yang berhasil dikonversi.')
      return
    }

    try {
      const zipBlob = await createZipBundle(readyFiles)
      const zipName =
        currentMode === 'csv-to-xlsx'
          ? 'kumpulan_file_excel.zip'
          : 'kumpulan_file_csv.zip'
      downloadBlob(zipBlob, zipName)
      showToast('success', 'File ZIP berhasil diunduh!')
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal membuat file ZIP.')
    }
  }

  // -------------------------------------------------------------
  // EXPORT ACTION: CSV TO XLSX
  // -------------------------------------------------------------
  const handleExportXlsx = async () => {
    if (csvParsedGrid.length === 0) {
      showToast('error', 'Tidak ada data CSV untuk dikonversi.')
      return
    }

    try {
      setIsProcessingCsv(true)
      const blob = await generateXlsxBlob(csvParsedGrid, {
        sheetName: xlsxSheetName || 'Sheet1',
        styleHeader: xlsxStyleHeader,
        autoFitWidth: xlsxAutoWidth,
        smartDataTypes: xlsxSmartTypes,
      })

      const finalName = csvOutputName.endsWith('.xlsx')
        ? csvOutputName
        : `${csvOutputName}.xlsx`
      downloadBlob(blob, finalName)
      showToast('success', `File ${finalName} berhasil dibuat dan diunduh!`)
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal mengonversi ke file Excel.')
    } finally {
      setIsProcessingCsv(false)
    }
  }

  // -------------------------------------------------------------
  // EXPORT ACTION: XLSX TO CSV
  // -------------------------------------------------------------
  const activeXlsxGrid = useMemo<string[][]>(() => {
    if (!xlsxWorkbook) return []
    if (selectedSheetName && xlsxWorkbook.allSheetsData?.[selectedSheetName]) {
      return xlsxWorkbook.allSheetsData[selectedSheetName]
    }
    return xlsxWorkbook.data || []
  }, [xlsxWorkbook, selectedSheetName])

  const handleExportCsv = () => {
    if (activeXlsxGrid.length === 0) {
      showToast('error', 'Tidak ada data lembar kerja untuk diekspor.')
      return
    }

    try {
      const csvString = generateCsv(activeXlsxGrid, {
        delimiter: csvExportDelimiter,
        withBom: csvExportWithBom,
        quoteAll: csvExportQuoteAll,
      })

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' })
      const finalName = xlsxOutputName.endsWith('.csv')
        ? xlsxOutputName
        : `${xlsxOutputName}.csv`
      downloadBlob(blob, finalName)
      showToast('success', `File ${finalName} berhasil diunduh!`)
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal mengonversi ke file CSV.')
    }
  }

  // Copy CSV to clipboard
  const handleCopyCsvClipboard = async () => {
    if (activeXlsxGrid.length === 0) return

    try {
      const csvString = generateCsv(activeXlsxGrid, {
        delimiter: csvExportDelimiter,
        withBom: false, // clipboard doesn't need BOM
        quoteAll: csvExportQuoteAll,
      })
      await navigator.clipboard.writeText(csvString)
      setCopiedSuccess(true)
      showToast('success', 'Teks CSV berhasil disalin ke clipboard!')
      setTimeout(() => setCopiedSuccess(false), 2500)
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal menyalin ke clipboard.')
    }
  }

  // Export all sheets as ZIP (if multi-sheet)
  const handleExportAllSheetsZip = async () => {
    if (!xlsxWorkbook || !xlsxWorkbook.allSheetsData) return

    try {
      const files: { name: string; blob: Blob }[] = []
      const baseName = xlsxWorkbook.fileName.replace(/\.[^/.]+$/, '')

      for (const sheet of xlsxWorkbook.sheets) {
        const sheetData = xlsxWorkbook.allSheetsData[sheet.name] || []
        const csvString = generateCsv(sheetData, {
          delimiter: csvExportDelimiter,
          withBom: csvExportWithBom,
          quoteAll: csvExportQuoteAll,
        })
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' })
        const safeSheetName = sheet.name.replace(/[\\/*?[\]:]/g, '_')
        files.push({
          name: `${baseName}_${safeSheetName}.csv`,
          blob,
        })
      }

      const zipBlob = await createZipBundle(files)
      downloadBlob(zipBlob, `${baseName}_semua_sheet_csv.zip`)
      showToast('success', `Berhasil mengunduh arsip ZIP berisi ${files.length} file CSV!`)
    } catch (err) {
      console.error(err)
      showToast('error', 'Gagal mengekspor semua sheet ke ZIP.')
    }
  }

  // -------------------------------------------------------------
  // ACTIVE TABLE FOR PREVIEW
  // -------------------------------------------------------------
  const activeTableData = currentMode === 'csv-to-xlsx' ? csvParsedGrid : activeXlsxGrid

  // Filter preview data by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeTableData
    }
    const q = searchQuery.toLowerCase()
    return activeTableData.filter((row, idx) => {
      if (idx === 0) return true // always keep header
      return row.some((cell) => cell.toLowerCase().includes(q))
    })
  }, [activeTableData, searchQuery])

  const visibleRows = useMemo(() => {
    if (previewLimit === -1) return filteredRows
    return filteredRows.slice(0, previewLimit)
  }, [filteredRows, previewLimit])

  const tableColCount = activeTableData.length > 0 ? activeTableData[0].length : 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-bg-card'
              : notification.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 bg-bg-card'
                : 'bg-primary/10 border-primary/20 text-primary bg-bg-card'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-primary shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Mode Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-border-main p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline & 100% Client-Side Spreadsheet Converter</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
              {currentMode === 'csv-to-xlsx' ? 'CSV ke Excel (.XLSX)' : 'Excel (.XLSX) ke CSV'}
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              {currentMode === 'csv-to-xlsx'
                ? 'Ubah file data berpemisah CSV/TSV atau teks mentah menjadi spreadsheet Microsoft Excel (.xlsx) dengan pemformatan tipe data pintar, header tebal, dan auto-fit lebar kolom.'
                : 'Ekspor tabel dari spreadsheet Excel (.xlsx) ke format teks CSV dengan pilihan pemisah koma/titik koma, dukungan multi-sheet, dan encoding UTF-8 dengan BOM.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-bg-card/90 backdrop-blur-xs border border-border-main p-1.5 rounded-2xl flex items-center shadow-xs shrink-0 self-start md:self-auto">
            <button
              onClick={() => handleSwitchMode('csv-to-xlsx')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentMode === 'csv-to-xlsx'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV to XLSX</span>
            </button>
            <div className="px-1 text-text-muted/40">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => handleSwitchMode('xlsx-to-csv')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentMode === 'xlsx-to-csv'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>XLSX to CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Options (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Card */}
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-main flex items-center space-x-2">
                {currentMode === 'csv-to-xlsx' ? (
                  <>
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <span>Sumber Data CSV</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <span>Sumber File Excel (.xlsx)</span>
                  </>
                )}
              </h2>

              {/* Sample Data Trigger */}
              <button
                onClick={currentMode === 'csv-to-xlsx' ? handleLoadSampleCsv : handleLoadSampleXlsx}
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Coba Data Contoh</span>
              </button>
            </div>

            {/* In CSV Mode: Option to Switch between Upload and Paste */}
            {currentMode === 'csv-to-xlsx' && (
              <div className="grid grid-cols-2 gap-2 bg-bg-hover/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCsvInputMethod('upload')}
                  className={`py-1.5 rounded-lg transition-all ${
                    csvInputMethod === 'upload'
                      ? 'bg-bg-card text-text-main shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Upload File CSV
                </button>
                <button
                  onClick={() => setCsvInputMethod('paste')}
                  className={`py-1.5 rounded-lg transition-all ${
                    csvInputMethod === 'paste'
                      ? 'bg-bg-card text-text-main shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Tulis / Paste CSV
                </button>
              </div>
            )}

            {/* Drag & Drop Zone */}
            {currentMode === 'xlsx-to-csv' || csvInputMethod === 'upload' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files) {
                    handleFileUpload(e.dataTransfer.files)
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : 'border-border-main hover:border-primary/50 hover:bg-bg-hover/50'
                }`}
              >
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={
                    currentMode === 'csv-to-xlsx'
                      ? '.csv,.txt,.tsv,text/csv,text/plain'
                      : '.xlsx,.xlsm,.xltx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  }
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">
                      Tarik & lepas file {currentMode === 'csv-to-xlsx' ? 'CSV / TSV' : 'Excel (.xlsx)'} ke sini
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      atau <span className="text-primary font-semibold underline">klik untuk memilih file</span> dari komputer
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted bg-bg-hover px-2.5 py-1 rounded-full border border-border-main">
                    Dukungan batch: Anda dapat memilih beberapa file sekaligus
                  </span>
                </div>
              </div>
            ) : (
              /* Paste CSV Direct Textarea */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Tempel teks berpemisah koma/titik koma/tab di sini:</span>
                  <span>{csvRawText.length} karakter</span>
                </div>
                <textarea
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder="Nama,Kategori,Harga,Jumlah&#10;Kopi Mantan,Minuman,18000,10&#10;Croissant Butter,Makanan,25000,5"
                  rows={8}
                  className="w-full rounded-2xl border border-border-main bg-bg-hover/40 p-3 text-xs font-mono text-text-main focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                />
                {csvRawText && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setCsvRawText('')}
                      className="text-xs text-rose-500 hover:underline flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Teks</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Active File Badge / Info */}
            {currentMode === 'csv-to-xlsx' && csvParsedGrid.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-text-main truncate">
                      {csvUploadedFileName}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {csvParsedGrid.length} baris total • {tableColCount} kolom
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold shrink-0">
                  Pemisah: {detectedCsvDelimiter === '\t' ? 'TAB' : `"${detectedCsvDelimiter}"`}
                </span>
              </div>
            )}

            {currentMode === 'xlsx-to-csv' && xlsxWorkbook && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-text-main truncate">
                      {xlsxWorkbook.fileName}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {activeXlsxGrid.length} baris • {xlsxWorkbook.sheets.length} sheet
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold shrink-0">
                  {selectedSheetName}
                </span>
              </div>
            )}
          </div>

          {/* Options Card */}
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-text-main flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <span>Pengaturan Konversi</span>
            </h2>

            {currentMode === 'csv-to-xlsx' ? (
              /* CSV TO XLSX OPTIONS */
              <div className="space-y-4">
                {/* Delimiter Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-main flex items-center justify-between">
                    <span>Karakter Pemisah (Delimiter)</span>
                    {detectedCsvDelimiter && csvDelimiterOption === 'auto' && (
                      <span className="text-[11px] text-primary font-normal">
                        Terdeteksi:{' '}
                        {detectedCsvDelimiter === ','
                          ? 'Koma (,)'
                          : detectedCsvDelimiter === ';'
                            ? 'Titik Koma (;)'
                            : detectedCsvDelimiter === '\t'
                              ? 'Tab'
                              : 'Pipe (|)'}
                      </span>
                    )}
                  </label>
                  <select
                    value={csvDelimiterOption}
                    onChange={(e) => setCsvDelimiterOption(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border-main bg-bg-hover px-3 py-2 text-text-main focus:outline-hidden focus:border-primary"
                  >
                    <option value="auto">Deteksi Otomatis (Rekomendasi)</option>
                    <option value=",">Koma ( , ) - Standar Internasional</option>
                    <option value=";">Titik Koma ( ; ) - Standar Indonesia / Eropa</option>
                    <option value="	">Tab ( \t ) - TSV</option>
                    <option value="|">Garis Tegak ( | ) - Pipe</option>
                  </select>
                </div>

                {/* Sheet Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-main">
                    Nama Lembar Kerja (Sheet Name)
                  </label>
                  <input
                    type="text"
                    value={xlsxSheetName}
                    onChange={(e) => setXlsxSheetName(e.target.value)}
                    maxLength={31}
                    placeholder="Sheet1"
                    className="w-full text-xs rounded-xl border border-border-main bg-bg-hover px-3 py-2 text-text-main focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={xlsxStyleHeader}
                      onChange={(e) => setXlsxStyleHeader(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border-main"
                    />
                    <span className="text-xs text-text-main font-medium">
                      Beri gaya pada baris pertama (Header tebal & latar halus)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={xlsxSmartTypes}
                      onChange={(e) => setXlsxSmartTypes(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border-main"
                    />
                    <span className="text-xs text-text-main font-medium">
                      Tipe data cerdas (Angka & Boolean otomatis, nomor HP tetap teks)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={xlsxAutoWidth}
                      onChange={(e) => setXlsxAutoWidth(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-border-main"
                    />
                    <span className="text-xs text-text-main font-medium">
                      Lebar kolom otomatis (Auto-fit proporsional dengan isi teks)
                    </span>
                  </label>
                </div>

                {/* Output Filename */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-text-main">
                    Nama File Output (.xlsx)
                  </label>
                  <input
                    type="text"
                    value={csvOutputName}
                    onChange={(e) => setCsvOutputName(e.target.value)}
                    placeholder="hasil_konversi.xlsx"
                    className="w-full text-xs rounded-xl border border-border-main bg-bg-hover px-3 py-2 text-text-main focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Primary Action Button */}
                <button
                  disabled={csvParsedGrid.length === 0 || isProcessingCsv}
                  onClick={handleExportXlsx}
                  className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all"
                >
                  {isProcessingCsv ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Mengonversi...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Unduh File Excel (.XLSX)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* XLSX TO CSV OPTIONS */
              <div className="space-y-4">
                {/* Multi-Sheet Selector if applicable */}
                {xlsxWorkbook && xlsxWorkbook.sheets.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-main flex items-center justify-between">
                      <span>Pilih Lembar Kerja (Sheet)</span>
                      <span className="text-[11px] text-text-muted">
                        Total {xlsxWorkbook.sheets.length} sheets
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {xlsxWorkbook.sheets.map((sheet) => (
                        <button
                          key={sheet.sheetId}
                          onClick={() => setSelectedSheetName(sheet.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            selectedSheetName === sheet.name
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-bg-hover text-text-muted hover:text-text-main border border-border-main'
                          }`}
                        >
                          {sheet.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delimiter Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-main">
                    Karakter Pemisah CSV
                  </label>
                  <select
                    value={csvExportDelimiter}
                    onChange={(e) => setCsvExportDelimiter(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border-main bg-bg-hover px-3 py-2 text-text-main focus:outline-hidden focus:border-primary"
                  >
                    <option value=",">Koma ( , ) - Standar Internasional</option>
                    <option value=";">Titik Koma ( ; ) - Standar Excel Indonesia / Windows</option>
                    <option value="	">Tab ( \t ) - TSV</option>
                    <option value="|">Garis Tegak ( | ) - Pipe</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={csvExportWithBom}
                      onChange={(e) => setCsvExportWithBom(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-border-main"
                    />
                    <div>
                      <span className="text-xs text-text-main font-medium block">
                        Sertakan UTF-8 BOM
                      </span>
                      <span className="text-[11px] text-text-muted block">
                        Mencegah teks rusak saat dibuka kembali di Microsoft Excel Windows
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={csvExportQuoteAll}
                      onChange={(e) => setCsvExportQuoteAll(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-border-main"
                    />
                    <span className="text-xs text-text-main font-medium">
                      Bungkus semua kolom dengan tanda petik ganda (&quot;)
                    </span>
                  </label>
                </div>

                {/* Output Filename */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-text-main">
                    Nama File Output (.csv)
                  </label>
                  <input
                    type="text"
                    value={xlsxOutputName}
                    onChange={(e) => setXlsxOutputName(e.target.value)}
                    placeholder="data_export.csv"
                    className="w-full text-xs rounded-xl border border-border-main bg-bg-hover px-3 py-2 text-text-main focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    disabled={activeXlsxGrid.length === 0 || isProcessingXlsx}
                    onClick={handleExportCsv}
                    className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh CSV</span>
                  </button>

                  <button
                    disabled={activeXlsxGrid.length === 0}
                    onClick={handleCopyCsvClipboard}
                    className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-bg-hover hover:bg-bg-hover/80 border border-border-main text-text-main font-bold text-xs sm:text-sm transition-all"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Teks</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Multi-sheet ZIP export button */}
                {xlsxWorkbook && xlsxWorkbook.sheets.length > 1 && (
                  <button
                    onClick={handleExportAllSheetsZip}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-bg-hover hover:bg-bg-hover/80 border border-border-main text-text-main font-semibold text-xs transition-all text-primary"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>Unduh Semua Sheet ({xlsxWorkbook.sheets.length}) sebagai ZIP</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Table Preview & Batch Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Batch Queue Card if items exist */}
          {batchQueue.length > 0 && (
            <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-text-main">
                    Antrean Batch ({batchQueue.length} File)
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadBatchZip}
                    className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>Unduh Semua (.ZIP)</span>
                  </button>
                  <button
                    onClick={() => setBatchQueue([])}
                    className="text-xs text-text-muted hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {batchQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-bg-hover/60 border border-border-main text-xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {item.status === 'done' ? (
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : item.status === 'processing' ? (
                        <RefreshCw className="w-4 h-4 text-primary animate-spin shrink-0" />
                      ) : item.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <Layers className="w-4 h-4 text-text-muted shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-text-main truncate">{item.fileName}</p>
                        <p className="text-[11px] text-text-muted">
                          {formatFileSize(item.originalSize)}
                          {item.resultSize && ` ➔ ${formatFileSize(item.resultSize)}`}
                        </p>
                      </div>
                    </div>

                    <div>
                      {item.status === 'done' && item.resultBlob && item.resultFileName && (
                        <button
                          onClick={() => downloadBlob(item.resultBlob!, item.resultFileName!)}
                          className="flex items-center space-x-1 text-primary hover:underline font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>
                      )}
                      {item.status === 'error' && (
                        <span className="text-rose-500 font-medium">Gagal</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Live Spreadsheet Table Preview */}
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Table className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-main">Pratinjau Spreadsheet</h3>
                {activeTableData.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {activeTableData.length} Baris x {tableColCount} Kolom
                  </span>
                )}
              </div>

              {/* Controls: Search & Row Limit */}
              {activeTableData.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari data..."
                      className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-border-main bg-bg-hover text-text-main focus:outline-hidden focus:border-primary w-32 sm:w-40"
                    />
                  </div>

                  <select
                    value={previewLimit}
                    onChange={(e) => setPreviewLimit(Number(e.target.value))}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-border-main bg-bg-hover text-text-main focus:outline-hidden focus:border-primary"
                  >
                    <option value={10}>10 Baris</option>
                    <option value={25}>25 Baris</option>
                    <option value={50}>50 Baris</option>
                    <option value={100}>100 Baris</option>
                    <option value={-1}>Semua Baris</option>
                  </select>
                </div>
              )}
            </div>

            {/* Table or Empty State */}
            {activeTableData.length === 0 ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-border-main/60 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-bg-hover text-text-muted flex items-center justify-center mx-auto">
                  <Table className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">Belum Ada Data Spreadsheet</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                    Unggah file {currentMode === 'csv-to-xlsx' ? 'CSV' : 'Excel (.xlsx)'} atau klik tombol &quot;Coba Data Contoh&quot; untuk melihat tabel pratinjau langsung di sini.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="overflow-x-auto max-h-[500px] border border-border-main rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-bg-hover border-b border-border-main sticky top-0 z-10 font-bold text-text-main">
                        <th className="py-2.5 px-3 border-r border-border-main/60 text-center w-12 text-text-muted font-mono bg-bg-hover">
                          #
                        </th>
                        {Array.from({ length: tableColCount }).map((_, colIdx) => (
                          <th
                            key={colIdx}
                            className="py-2.5 px-3 border-r border-border-main/60 last:border-r-0 whitespace-nowrap bg-bg-hover"
                          >
                            <span className="text-[10px] text-primary/70 block uppercase font-mono">
                              {colIndexToLetter(colIdx)}
                            </span>
                            <span className="truncate block">
                              {activeTableData[0]?.[colIdx] || `Kolom ${colIdx + 1}`}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main/40 font-normal">
                      {visibleRows.map((row, rowIdx) => {
                        // Skip header row if visibleRows contains it and rowIdx is 0
                        const isHeaderRow = rowIdx === 0
                        return (
                          <tr
                            key={rowIdx}
                            className={`hover:bg-bg-hover/60 transition-colors ${
                              isHeaderRow
                                ? 'bg-primary/5 font-semibold text-text-main'
                                : rowIdx % 2 === 0
                                  ? 'bg-transparent'
                                  : 'bg-bg-hover/20'
                            }`}
                          >
                            <td className="py-2 px-3 border-r border-border-main/40 text-center text-[11px] text-text-muted font-mono bg-bg-hover/30">
                              {rowIdx + 1}
                            </td>
                            {Array.from({ length: tableColCount }).map((_, colIdx) => (
                              <td
                                key={colIdx}
                                className="py-2 px-3 border-r border-border-main/40 last:border-r-0 whitespace-nowrap max-w-xs truncate text-text-main"
                              >
                                {row[colIdx] ?? ''}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="flex items-center justify-between text-[11px] text-text-muted px-1 pt-1">
                  <span>
                    Menampilkan {visibleRows.length} dari {filteredRows.length} baris
                    {searchQuery && ' (terfilter)'}
                  </span>
                  <span>100% diproses di browser tanpa upload ke server</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExcelConverterPage
