/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: FakeChat.tsx (Main Fake WhatsApp Chat generator tool page).
 */

import { useState, useRef, useCallback } from 'react'
import { toPng, toBlob } from 'html-to-image'
import type { FakeChatState } from '../types/fakeChat'
import { PRESET_CHATS } from '../utils/fakeChatPresets'
import { FakeChatPreview } from '../components/fakeChat/FakeChatPreview'
import { FakeChatEditor } from '../components/fakeChat/FakeChatEditor'
import {
  MessageSquare,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'

export function FakeChatPage() {
  // Initialize state with the user's screenshot replica preset
  const [chatState, setChatState] = useState<FakeChatState>(() => {
    return JSON.parse(JSON.stringify(PRESET_CHATS[0].state))
  })

  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // High-Resolution Screenshot Download
  const handleExportImage = useCallback(async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.98,
        pixelRatio: 2, // Crisp 2x retina export
        cacheBust: true,
      })

      const link = document.createElement('a')
      link.download = `whatsapp-chat-${chatState.contact.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      showToast('Screenshot WhatsApp berhasil diunduh dalam resolusi tinggi!')
    } catch (err) {
      console.error('Export error:', err)
      showToast('Gagal mengekspor gambar, silakan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }, [chatState.contact.name])

  // Copy Screenshot to Clipboard
  const handleCopyImage = useCallback(async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      const blob = await toBlob(previewRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      })

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        setIsCopied(true)
        showToast('Gambar screenshot berhasil disalin ke clipboard! Siap di-paste.')
        setTimeout(() => setIsCopied(false), 2500)
      } else {
        showToast('Fitur copy clipboard tidak didukung di browser ini.')
      }
    } catch (err) {
      console.error('Clipboard copy error:', err)
      showToast('Gagal menyalin gambar ke clipboard.')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-border-main p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Fake Chat Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Pembuat Fake WhatsApp Chat (Mobile & Desktop)
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Buat tiruan percakapan WhatsApp yang 100% realistis untuk mode Desktop (WhatsApp Web)
            dan Smartphone (Android / iPhone). Kustomisasi pesan teks, quote balasan, voice note, foto, reaksi emoji,
            disematkan (pinned), status centang biru, dan ekspor screenshot jernih.
          </p>
        </div>
      </div>

      {/* Main Studio Grid: Editor (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Controls (5 columns on large screen) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          <FakeChatEditor
            state={chatState}
            onChange={setChatState}
            onExportImage={handleExportImage}
            onCopyImage={handleCopyImage}
            onToastMessage={showToast}
            isExporting={isExporting}
            isCopied={isCopied}
          />
        </div>

        {/* Right Column: Live Interactive Preview (7 columns on large screen) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4 sticky top-6">
          <div className="bg-bg-card border border-border-main rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col items-center">
            {/* Preview Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border-main text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <span className="text-text-muted">Mode Tampilan:</span>
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold uppercase tracking-wider text-[11px]">
                  {chatState.platform === 'desktop'
                    ? '💻 Desktop (WhatsApp Web)'
                    : chatState.platform === 'ios'
                    ? '🍏 iPhone (iOS)'
                    : '🤖 Android'}
                </span>
              </div>

              {/* Zoom and Reset Controls */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setChatState((prev) => ({
                      ...prev,
                      zoomLevel: Math.max(70, prev.zoomLevel - 10),
                    }))
                  }
                  className="p-1.5 rounded-lg bg-bg-hover hover:bg-border-main border border-border-main text-text-muted hover:text-text-main cursor-pointer"
                  title="Perkecil Preview"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-text-muted">{chatState.zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() =>
                    setChatState((prev) => ({
                      ...prev,
                      zoomLevel: Math.min(130, prev.zoomLevel + 10),
                    }))
                  }
                  className="p-1.5 rounded-lg bg-bg-hover hover:bg-border-main border border-border-main text-text-muted hover:text-text-main cursor-pointer"
                  title="Perbesar Preview"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setChatState((prev) => ({
                      ...prev,
                      zoomLevel: 100,
                    }))
                  }
                  className="p-1.5 rounded-lg bg-bg-hover hover:bg-border-main border border-border-main text-text-muted hover:text-text-main cursor-pointer"
                  title="Reset Zoom 100%"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Chat Canvas Component */}
            <FakeChatPreview
              ref={previewRef}
              state={chatState}
              onEditMessage={() => {
                const editorTabBtn = document.querySelector('[data-tab="messages"]') as HTMLElement
                editorTabBtn?.click()
              }}
            />

            {/* Quick Export Hint */}
            <div className="w-full flex items-center justify-between text-xs text-text-muted mt-4 pt-3 border-t border-border-main">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Render lokal & privasi 100% aman di browser</span>
              </span>
              <span className="text-[11px]">Klik pesan di daftar untuk mengedit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FakeChatPage
