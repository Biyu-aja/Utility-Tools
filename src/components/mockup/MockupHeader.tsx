/**
 * Folder: src/components/mockup/
 * Description: Top toolbar for device quick switching, zoom level controls, and high-res export buttons.
 * This file: MockupHeader.tsx
 */

import React from 'react'
import type { DeviceType } from '../../types/mockup'
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Globe,
  Watch,
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface Props {
  currentDevice: DeviceType
  onSelectDevice: (device: DeviceType) => void
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  exportScale: number
  onExportScaleChange: (scale: number) => void
  exportFormat: 'png' | 'jpeg' | 'webp'
  onExportFormatChange: (format: 'png' | 'jpeg' | 'webp') => void
  isExporting: boolean
  isCopied: boolean
  onExport: () => void
  onCopyClipboard: () => void
}

export const MockupHeader: React.FC<Props> = ({
  currentDevice,
  onSelectDevice,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  exportScale,
  onExportScaleChange,
  exportFormat,
  onExportFormatChange,
  isExporting,
  isCopied,
  onExport,
  onCopyClipboard,
}) => {
  const quickDevices: { id: DeviceType; name: string; icon: React.ReactNode }[] = [
    { id: 'iphone-16-pro', name: 'iPhone', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'android-flagship', name: 'Android', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'macbook-pro', name: 'MacBook', icon: <Laptop className="w-3.5 h-3.5" /> },
    { id: 'studio-display', name: 'PC / iMac', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: 'ipad-pro', name: 'iPad', icon: <Tablet className="w-3.5 h-3.5" /> },
    { id: 'browser-window', name: 'Browser', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'apple-watch', name: 'Watch', icon: <Watch className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="bg-bg-card border border-border-main rounded-3xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4 select-none">
      {/* Left: Title & Quick Device Switcher */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center space-x-2 mr-2">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight flex items-center gap-1.5">
              <span>3D Mockup Studio</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                PRO 4K
              </span>
            </h1>
            <p className="text-[11px] text-text-muted hidden sm:block">
              Generate mockup 3D beresolusi tinggi dengan berbagai sudut & facing.
            </p>
          </div>
        </div>

        {/* Device Quick Chips */}
        <div className="flex items-center gap-1 bg-bg-hover/60 p-1 rounded-2xl border border-border-main overflow-x-auto max-w-full">
          {quickDevices.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDevice(item.id)}
              className={`flex items-center space-x-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                currentDevice === item.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-card'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Zoom & Export Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 w-full lg:w-auto">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-bg-hover/60 p-1 rounded-2xl border border-border-main">
          <button
            type="button"
            title="Zoom Out"
            onClick={onZoomOut}
            className="p-1.5 hover:bg-bg-card rounded-xl text-text-muted hover:text-text-main transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Reset Zoom"
            onClick={onZoomReset}
            className="px-2 py-1 text-xs font-mono font-bold text-text-muted hover:text-text-main"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            title="Zoom In"
            onClick={onZoomIn}
            className="p-1.5 hover:bg-bg-card rounded-xl text-text-muted hover:text-text-main transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Resolution Scale Selector */}
        <select
          value={exportScale}
          onChange={(e) => onExportScaleChange(Number(e.target.value))}
          className="bg-bg-card border border-border-main text-text-main text-xs font-bold rounded-2xl px-3 py-2 outline-none cursor-pointer hover:border-primary transition-colors"
        >
          <option value={1}>1x (Standar)</option>
          <option value={2}>2x (Retina HD)</option>
          <option value={3}>3x (Ultra 4K)</option>
        </select>

        {/* Format Selector */}
        <select
          value={exportFormat}
          onChange={(e) => onExportFormatChange(e.target.value as 'png' | 'jpeg' | 'webp')}
          className="bg-bg-card border border-border-main text-text-main text-xs font-bold rounded-2xl px-3 py-2 outline-none cursor-pointer hover:border-primary transition-colors"
        >
          <option value="png">PNG (Transparan)</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>

        {/* Copy to Clipboard */}
        <button
          type="button"
          onClick={onCopyClipboard}
          disabled={isExporting}
          className="py-2 px-3.5 rounded-2xl border border-border-main bg-bg-card hover:bg-bg-hover text-text-main text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-text-muted" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Download Button */}
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="py-2 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Mockup</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
