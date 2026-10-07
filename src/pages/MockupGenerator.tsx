/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: MockupGenerator.tsx (Main 3D Device Mockup Studio generator page).
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { toPng, toJpeg, toBlob } from 'html-to-image'
import type { MockupState, DeviceType } from '../types/mockup'
import { DEFAULT_MOCKUP_STATE, DEVICE_METAS } from '../utils/mockupPresets'
import { MockupHeader } from '../components/mockup/MockupHeader'
import { MockupCanvas } from '../components/mockup/MockupCanvas'
import { MockupControls } from '../components/mockup/MockupControls'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

export function MockupGeneratorPage() {
  const [mockupState, setMockupState] = useState<MockupState>(() => {
    return JSON.parse(JSON.stringify(DEFAULT_MOCKUP_STATE))
  })

  const [exportScale, setExportScale] = useState<number>(2)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const previewRef = useRef<HTMLDivElement>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Handle image file upload (from input or drop)
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Mohon pilih file gambar yang valid (PNG, JPG, WebP, dsb).', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setMockupState((prev) => ({
          ...prev,
          screen: {
            ...prev.screen,
            imageUrl: result,
          },
        }))
        showToast('Gambar berhasil dipasang ke frame mockup!')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  // Input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0])
    }
  }

  // Global Clipboard Paste Listener (Ctrl+V anywhere on page)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          if (blob) {
            handleImageFile(blob)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [handleImageFile])

  // Switch device helper
  const handleSelectDevice = (device: DeviceType) => {
    const meta = DEVICE_METAS[device]
    const defaultColor = meta.colorPresets[0].hex
    setMockupState((prev) => ({
      ...prev,
      device,
      appearance: {
        ...prev.appearance,
        color: defaultColor,
        finishName: meta.colorPresets[0].name,
      },
      orientation: 'portrait',
    }))
  }

  // Zoom controls
  const handleZoomIn = () => {
    setMockupState((prev) => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 10, 160),
    }))
  }

  const handleZoomOut = () => {
    setMockupState((prev) => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 10, 40),
    }))
  }

  const handleZoomReset = () => {
    setMockupState((prev) => ({
      ...prev,
      zoomLevel: 100,
    }))
  }

  // Reset to default
  const handleReset = () => {
    setMockupState(JSON.parse(JSON.stringify(DEFAULT_MOCKUP_STATE)))
    showToast('Mockup berhasil dikembalikan ke pengaturan bawaan.')
  }

  // High-Resolution Export
  const handleExport = useCallback(async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      let dataUrl = ''
      const options = {
        quality: 0.98,
        pixelRatio: exportScale,
        cacheBust: true,
      }

      if (exportFormat === 'jpeg') {
        dataUrl = await toJpeg(previewRef.current, {
          ...options,
          backgroundColor: '#ffffff',
        })
      } else {
        dataUrl = await toPng(previewRef.current, options)
      }

      const link = document.createElement('a')
      const timestamp = Date.now()
      link.download = `mockup-${mockupState.device}-${mockupState.anglePreset}-${timestamp}.${exportFormat}`
      link.href = dataUrl
      link.click()
      showToast(`Mockup 3D berhasil diunduh dalam resolusi ${exportScale}x!`)
    } catch (err) {
      console.error('Export error:', err)
      showToast('Gagal mengekspor mockup, silakan coba lagi.', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [exportFormat, exportScale, mockupState.anglePreset, mockupState.device])

  // Copy to Clipboard
  const handleCopyClipboard = useCallback(async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      const blob = await toBlob(previewRef.current, {
        quality: 0.98,
        pixelRatio: exportScale,
        cacheBust: true,
      })

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        setIsCopied(true)
        showToast('Gambar mockup 3D berhasil disalin ke clipboard! Siap di-paste ke Figma/Canva/Slides.')
        setTimeout(() => setIsCopied(false), 2500)
      } else {
        showToast('Fitur copy clipboard tidak didukung di browser ini.', 'error')
      }
    } catch (err) {
      console.error('Clipboard copy error:', err)
      showToast('Gagal menyalin gambar ke clipboard.', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [exportScale])

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-2xl border text-white animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-800 text-rose-100'
              : 'bg-zinc-900/90 border-zinc-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Quick Actions Toolbar */}
      <MockupHeader
        currentDevice={mockupState.device}
        onSelectDevice={handleSelectDevice}
        zoomLevel={mockupState.zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        exportScale={exportScale}
        onExportScaleChange={setExportScale}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        isExporting={isExporting}
        isCopied={isCopied}
        onExport={handleExport}
        onCopyClipboard={handleCopyClipboard}
      />

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: 3D Interactive Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-bg-card/40 border border-border-main rounded-3xl min-h-[580px] flex flex-col justify-between overflow-hidden shadow-xs relative">
          <MockupCanvas
            ref={previewRef}
            state={mockupState}
            onImageDrop={handleImageFile}
          />

          {/* Quick Helper Pill at bottom of canvas */}
          <div className="px-6 py-3 border-t border-border-main/60 bg-bg-hover/40 flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>
                Tip: Tekan <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border-main font-mono text-[10px] font-bold">Ctrl+V</kbd> untuk langsung menempelkan screenshot dari clipboard
              </span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[11px]">
              {DEVICE_METAS[mockupState.device].name} • {mockupState.anglePreset}
            </span>
          </div>
        </div>

        {/* Right Side: Tabbed Controls & Customization (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <MockupControls
            state={mockupState}
            onChange={setMockupState}
            onImageUpload={handleFileInputChange}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  )
}

export default MockupGeneratorPage
