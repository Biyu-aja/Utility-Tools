/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatJsonModal.tsx (Modal dialog for importing JSON, viewing format schema, and downloading templates).
 */

import React, { useState } from 'react'
import type { FakeChatState } from '../../types/fakeChat'
import {
  SAMPLE_TEMPLATE_JSON,
  SAMPLE_MINIMAL_JSON,
  validateAndParseChatJson,
  downloadJsonTemplate,
} from '../../utils/fakeChatJsonHelper'
import {
  X,
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Sparkles,
  Check,
  Code2,
} from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onApplyJson: (state: FakeChatState) => void
}

export const FakeChatJsonModal: React.FC<Props> = ({ isOpen, onClose, onApplyJson }) => {
  const [jsonInput, setJsonInput] = useState<string>(() =>
    JSON.stringify(SAMPLE_TEMPLATE_JSON, null, 2)
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  if (!isOpen) return null

  // Handle validating & applying JSON
  const handleValidateAndApply = () => {
    const result = validateAndParseChatJson(jsonInput)
    if (!result.success || !result.data) {
      setValidationError(result.error || 'Format JSON tidak valid.')
      setValidationSuccess(null)
      return
    }

    setValidationError(null)
    setValidationSuccess(`Format valid! Terdeteksi ${result.messageCount} pesan.`)

    // Apply state
    setTimeout(() => {
      onApplyJson(result.data!)
      onClose()
    }, 400)
  }

  // Handle uploading a .json file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        setJsonInput(text)
        // Auto validate
        const res = validateAndParseChatJson(text)
        if (res.success) {
          setValidationSuccess(`File "${file.name}" valid! Terdeteksi ${res.messageCount} pesan.`)
          setValidationError(null)
        } else {
          setValidationError(res.error || 'Format file JSON tidak sesuai.')
          setValidationSuccess(null)
        }
      } catch (err) {
        setValidationError(`Gagal membaca file: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
  }

  // Copy template to clipboard
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(jsonInput)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Format / Prettify JSON
  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setValidationError(null)
    } catch (e) {
      setValidationError(`Gagal memformat JSON: ${(e as Error).message}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-bg-card border border-border-main rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-bg-hover/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">
                Import JSON & Format Otomatis
              </h3>
              <p className="text-xs text-text-muted">
                Isi seluruh obrolan WhatsApp secara instan dengan format JSON yang sesuai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-border-main transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar: Download format, Load Sample, Upload */}
        <div className="px-6 py-3 border-b border-border-main bg-bg-card flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center flex-wrap gap-2">
            {/* Download Full Format */}
            <button
              type="button"
              onClick={() => downloadJsonTemplate('full')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all cursor-pointer"
              title="Download file template JSON lengkap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Format JSON</span>
            </button>

            {/* Download Minimal Format */}
            <button
              type="button"
              onClick={() => downloadJsonTemplate('minimal')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-bg-hover hover:bg-border-main text-text-main border border-border-main rounded-xl transition-all cursor-pointer"
              title="Download format sederhana"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Format Minimal</span>
            </button>

            {/* Load Full Template to Editor */}
            <button
              type="button"
              onClick={() => {
                setJsonInput(JSON.stringify(SAMPLE_TEMPLATE_JSON, null, 2))
                setValidationError(null)
                setValidationSuccess('Format contoh lengkap dimuat!')
              }}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Contoh Lengkap</span>
            </button>

            {/* Load Minimal Template to Editor */}
            <button
              type="button"
              onClick={() => {
                setJsonInput(JSON.stringify(SAMPLE_MINIMAL_JSON, null, 2))
                setValidationError(null)
                setValidationSuccess('Format contoh minimal dimuat!')
              }}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Contoh Minimal</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Upload File Input */}
            <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File .JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Modal Body: Textarea Editor */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
              <span className="flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-primary" />
                <span>Editor / Paste Data JSON (Harus Sesuai Format):</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrettify}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Rapikan JSON
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="text-text-muted hover:text-text-main flex items-center space-x-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value)
                setValidationError(null)
                setValidationSuccess(null)
              }}
              placeholder='Paste struktur JSON di sini...'
              className="w-full p-4 font-mono text-xs bg-bg-hover/80 text-text-main border border-border-main rounded-2xl focus:outline-primary leading-relaxed shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Validation Feedback Messages */}
          {validationError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start space-x-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Format JSON Tidak Sesuai</div>
                <div className="mt-0.5 leading-relaxed">{validationError}</div>
              </div>
            </div>
          )}

          {validationSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">JSON Valid</div>
                <div className="mt-0.5 leading-relaxed">{validationSuccess}</div>
              </div>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="p-4 bg-bg-hover/40 border border-border-main rounded-2xl space-y-2 text-[11.5px] text-text-muted leading-relaxed">
            <div className="font-bold text-text-main flex items-center space-x-1.5">
              <span>💡 Panduan Format JSON:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                <strong className="text-text-main">messages</strong>: Array daftar pesan (wajib). Setiap pesan berisi <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">sender</code> (<code>&quot;me&quot;</code> atau <code>&quot;them&quot;</code>), <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">text</code>, <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">time</code>, dan <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">type</code> (<code>&quot;text&quot;</code>, <code>&quot;image&quot;</code>, <code>&quot;audio&quot;</code>, <code>&quot;date_divider&quot;</code>).
              </li>
              <li>
                <strong className="text-text-main">contact</strong>: Berisi <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">name</code>, <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">avatarUrl</code>, <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">status</code>, dan <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">isOnline</code>.
              </li>
              <li>
                <strong className="text-text-main">platform</strong>: <code>&quot;desktop&quot;</code>, <code>&quot;android&quot;</code>, atau <code>&quot;ios&quot;</code>.
              </li>
              <li>
                <strong className="text-text-main">theme</strong>: <code>&quot;dark&quot;</code> atau <code>&quot;light&quot;</code>.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-main bg-bg-hover/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-main rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleValidateAndApply}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Validasi & Terapkan Otomatis</span>
          </button>
        </div>
      </div>
    </div>
  )
}
