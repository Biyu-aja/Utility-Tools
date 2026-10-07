/**
 * Folder: src/components/mockup/
 * Description: Tabbed control panel for customizing devices, 3D angles, facing, images, backdrops, and export settings.
 * This file: MockupControls.tsx
 */

import React, { useState } from 'react'
import type {
  MockupState,
  DeviceType,
  AnglePreset,
  ImageFitMode,
  CanvasAspectRatio,
} from '../../types/mockup'
import {
  DEVICE_METAS,
  ANGLE_PRESETS_CONFIG,
  GRADIENT_PRESETS,
  SAMPLE_SCREENS,
} from '../../utils/mockupPresets'
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Globe,
  Watch,
  Compass,
  Sparkles,
  Upload,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Sliders,
  Check,
  Zap,
} from 'lucide-react'

interface Props {
  state: MockupState
  onChange: (updater: (prev: MockupState) => MockupState) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
}

type TabType = 'device' | 'angle' | 'screen' | 'canvas'

export const MockupControls: React.FC<Props> = ({
  state,
  onChange,
  onImageUpload,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('device')
  const currentMeta = DEVICE_METAS[state.device]

  // Helper for updating device
  const setDevice = (device: DeviceType) => {
    const meta = DEVICE_METAS[device]
    const defaultColor = meta.colorPresets[0].hex
    onChange((prev) => ({
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

  // Helper for updating angle preset
  const setAnglePreset = (preset: AnglePreset) => {
    const config = ANGLE_PRESETS_CONFIG[preset]
    onChange((prev) => ({
      ...prev,
      anglePreset: preset,
      transform: {
        ...prev.transform,
        ...config.transform,
      },
    }))
  }

  return (
    <div className="bg-bg-card border border-border-main rounded-3xl shadow-sm flex flex-col overflow-hidden h-full">
      {/* Tab Navigation Header */}
      <div className="flex items-center border-b border-border-main/80 bg-bg-hover/40 p-1.5 gap-1 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab('device')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'device'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Perangkat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('angle')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'angle'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Sudut & 3D</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('screen')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'screen'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Layar & Foto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'canvas'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Background</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 overflow-y-auto space-y-6 max-h-[calc(100vh-280px)] text-text-main">
        {/* ==================================================== */}
        {/* TAB 1: PERANGKAT / DEVICE                           */}
        {/* ==================================================== */}
        {activeTab === 'device' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Device Model Selector Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Pilih Model Mockup
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* iPhone 16 Pro */}
                <button
                  type="button"
                  onClick={() => setDevice('iphone-16-pro')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    state.device === 'iphone-16-pro'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    {state.device === 'iphone-16-pro' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">iPhone 16 Pro</div>
                    <div className="text-[10px] text-text-muted">Dynamic Island & Titanium</div>
                  </div>
                </button>

                {/* Android Flagship */}
                <button
                  type="button"
                  onClick={() => setDevice('android-flagship')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    state.device === 'android-flagship'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-5 h-5 text-indigo-500" />
                    {state.device === 'android-flagship' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">Galaxy / Pixel</div>
                    <div className="text-[10px] text-text-muted">Punch-hole & Slim Bezel</div>
                  </div>
                </button>

                {/* MacBook Pro 16" */}
                <button
                  type="button"
                  onClick={() => setDevice('macbook-pro')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    state.device === 'macbook-pro'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Laptop className="w-5 h-5 text-emerald-500" />
                    {state.device === 'macbook-pro' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">MacBook Pro 16"</div>
                    <div className="text-[10px] text-text-muted">Laptop Keyboard Deck</div>
                  </div>
                </button>

                {/* Studio Display / iMac */}
                <button
                  type="button"
                  onClick={() => setDevice('studio-display')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    state.device === 'studio-display'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Monitor className="w-5 h-5 text-amber-500" />
                    {state.device === 'studio-display' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">PC / Studio Display</div>
                    <div className="text-[10px] text-text-muted">Monitor Stand Elegan</div>
                  </div>
                </button>

                {/* iPad Pro */}
                <button
                  type="button"
                  onClick={() => setDevice('ipad-pro')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    state.device === 'ipad-pro'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Tablet className="w-5 h-5 text-purple-500" />
                    {state.device === 'ipad-pro' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">iPad Pro 12.9"</div>
                    <div className="text-[10px] text-text-muted">Tablet Screen</div>
                  </div>
                </button>

                {/* Safari Browser Window */}
                <button
                  type="button"
                  onClick={() => setDevice('browser-window')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    state.device === 'browser-window'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="w-5 h-5 text-sky-500" />
                    {state.device === 'browser-window' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">Safari Browser</div>
                    <div className="text-[10px] text-text-muted">Web Window Frame</div>
                  </div>
                </button>

                {/* Apple Watch */}
                <button
                  type="button"
                  onClick={() => setDevice('apple-watch')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between col-span-2 transition-all ${
                    state.device === 'apple-watch'
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-border-main hover:border-border-main/80 hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Watch className="w-5 h-5 text-orange-500" />
                      <span className="text-xs font-bold">Apple Watch Ultra</span>
                    </div>
                    {state.device === 'apple-watch' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="text-[10px] text-text-muted">Smartwatch OLED & Digital Crown</div>
                </button>
              </div>
            </div>

            {/* Device Color Finishes */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Warna Bodi / Finish ({state.appearance.finishName})
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {currentMeta.colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          color: preset.hex,
                          finishName: preset.name,
                        },
                      }))
                    }
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-2 ${
                      state.appearance.color === preset.hex
                        ? 'border-primary scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {state.appearance.color === preset.hex && (
                      <Check
                        className={`w-4 h-4 ${
                          preset.hex === '#ffffff' || preset.hex === '#f8fafc'
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}

                {/* Custom Color Picker */}
                <label
                  title="Warna Kustom"
                  className="w-9 h-9 rounded-xl border border-border-main hover:border-primary flex items-center justify-center cursor-pointer bg-bg-hover transition-all"
                >
                  <Palette className="w-4 h-4 text-text-muted" />
                  <input
                    type="color"
                    value={state.appearance.color}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          color: e.target.value,
                          finishName: 'Kustom',
                        },
                      }))
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Orientation Switcher */}
            {currentMeta.supportsOrientation && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                  Orientasi Layar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        orientation: 'portrait',
                      }))
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                      state.orientation === 'portrait'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-main text-text-muted hover:bg-bg-hover'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Portrait (Tegak)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        orientation: 'landscape',
                      }))
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                      state.orientation === 'landscape'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-main text-text-muted hover:bg-bg-hover'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 rotate-90" />
                    <span>Landscape (Miring)</span>
                  </button>
                </div>
              </div>
            )}
            {/* Laptop Hinge Opening Angle (Only for Laptop) */}
            {state.device === 'macbook-pro' && (
              <div className="space-y-3 pt-3 border-t border-border-main">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                    Sudut Bukaan Laptop (Hinge Angle)
                  </label>
                  <span className="font-mono text-xs font-bold text-primary">
                    {state.appearance.laptopLidAngle || 105}°
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Atur derajat bukaan engsel antara layar dan keyboard MacBook.
                </p>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '90° Siku', value: 90 },
                    { label: '105° Natural', value: 105 },
                    { label: '120° Lebar', value: 120 },
                    { label: '135° Tilted', value: 135 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          appearance: {
                            ...prev.appearance,
                            laptopLidAngle: preset.value,
                          },
                        }))
                      }
                      className={`py-1.5 rounded-xl text-[10px] font-bold transition-all border text-center ${
                        (state.appearance.laptopLidAngle || 105) === preset.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border-main text-text-muted hover:bg-bg-hover'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={75}
                  max={140}
                  value={state.appearance.laptopLidAngle || 105}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        laptopLidAngle: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* 3D Volumetric Thickness Controls */}
            <div className="space-y-3 pt-3 border-t border-border-main">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                  Ketebalan Bodi 3D (Chassis Depth)
                </label>
                <span className="font-mono text-xs font-bold text-primary">
                  {state.appearance.thickness || 16}px
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Atur ketebalan fisik bodi metal samping agar perangkat terlihat solid dan bervolume 3D (tidak tipis seperti kertas).
              </p>
              <input
                type="range"
                min={4}
                max={36}
                value={state.appearance.thickness || 16}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      thickness: Number(e.target.value),
                    },
                  }))
                }
                className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center justify-between p-2 rounded-xl bg-bg-hover/50 border border-border-main cursor-pointer">
                  <span className="text-[11px] font-semibold">Tombol Samping 3D</span>
                  <input
                    type="checkbox"
                    checked={state.appearance.showSideButtons ?? true}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          showSideButtons: e.target.checked,
                        },
                      }))
                    }
                    className="w-3.5 h-3.5 accent-primary rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-bg-hover/50 border border-border-main cursor-pointer">
                  <span className="text-[11px] font-semibold">Kamera Belakang 3D</span>
                  <input
                    type="checkbox"
                    checked={state.appearance.showCameraBump ?? true}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          showCameraBump: e.target.checked,
                        },
                      }))
                    }
                    className="w-3.5 h-3.5 accent-primary rounded"
                  />
                </label>
              </div>
            </div>

            {/* Realistic Shadow Controls */}
            <div className="space-y-3 pt-3 border-t border-border-main">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Efek Bayangan 3D (Shadow)
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Kepekatan Bayangan</span>
                    <span>{state.appearance.shadowOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={state.appearance.shadowOpacity}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          shadowOpacity: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Kelembutan Blur Bayangan</span>
                    <span>{state.appearance.shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={80}
                    value={state.appearance.shadowBlur}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          shadowBlur: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: SUDUT & FACING 3D                            */}
        {/* ==================================================== */}
        {activeTab === 'angle' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Facing Angle Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                  Preset Sudut / Facing
                </label>
                <span className="text-[11px] text-primary font-semibold">3D Transform</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Floating Isometric Right (User Reference Match) */}
                <button
                  type="button"
                  onClick={() => setAnglePreset('isometric-right')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state.anglePreset === 'isometric-right'
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                      : 'border-border-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Isometric Right</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                      ⭐ Populer
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Miring 3D ke kanan seperti contoh foto showcase.
                  </p>
                </button>

                {/* Floating Isometric Left */}
                <button
                  type="button"
                  onClick={() => setAnglePreset('isometric-left')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state.anglePreset === 'isometric-left'
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                      : 'border-border-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Isometric Left</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Miring 3D ke kiri dengan kedalaman estetik.
                  </p>
                </button>

                {/* Frontal Flat (0°) */}
                <button
                  type="button"
                  onClick={() => setAnglePreset('frontal')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state.anglePreset === 'frontal'
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                      : 'border-border-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Frontal (0° Rata)</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Lurus simetris tanpa kemiringan sudut.
                  </p>
                </button>

                {/* Dynamic Hero */}
                <button
                  type="button"
                  onClick={() => setAnglePreset('floating-hero')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state.anglePreset === 'floating-hero'
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                      : 'border-border-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Dynamic Hero</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Sudut hero dramatis untuk website & slide.
                  </p>
                </button>

                {/* Tilted Top-Down */}
                <button
                  type="button"
                  onClick={() => setAnglePreset('tilted-top')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state.anglePreset === 'tilted-top'
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                      : 'border-border-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Tilted Top-Down</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Perspektif miring dari atas ke bawah.
                  </p>
                </button>

                {/* Side Profile */}
                <button
                  type="button"
                  onClick={() => setAnglePreset('side-angle')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    state.anglePreset === 'side-angle'
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                      : 'border-border-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Side Profile 35°</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Sudut samping tajam mempertegas bodi samping.
                  </p>
                </button>
              </div>
            </div>

            {/* Flip Controls */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Flip / Balik Arah Facing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      transform: {
                        ...prev.transform,
                        flipX: !prev.transform.flipX,
                      },
                    }))
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                    state.transform.flipX
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-main text-text-muted hover:bg-bg-hover'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Flip Horizontal (X)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      transform: {
                        ...prev.transform,
                        flipY: !prev.transform.flipY,
                      },
                    }))
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                    state.transform.flipY
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-main text-text-muted hover:bg-bg-hover'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  <span>Flip Vertikal (Y)</span>
                </button>
              </div>
            </div>

            {/* Manual 3D Sliders */}
            <div className="space-y-4 pt-4 border-t border-border-main">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Kustomisasi Presisi Sudut 3D</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAnglePreset('isometric-right')}
                  className="text-[11px] text-text-muted hover:text-primary flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sudut</span>
                </button>
              </div>

              {/* Rotate Y (Kiri-Kanan) */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Rotasi Y (Hadap Kiri / Kanan)</span>
                  <span className="font-mono">{state.transform.rotateY}°</span>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  value={state.transform.rotateY}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      anglePreset: 'custom',
                      transform: {
                        ...prev.transform,
                        rotateY: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* Rotate X (Atas-Bawah) */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Rotasi X (Hadap Atas / Bawah)</span>
                  <span className="font-mono">{state.transform.rotateX}°</span>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  value={state.transform.rotateX}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      anglePreset: 'custom',
                      transform: {
                        ...prev.transform,
                        rotateX: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* Rotate Z (Kemiringan Jarum Jam) */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Rotasi Z (Kemiringan Derajat)</span>
                  <span className="font-mono">{state.transform.rotateZ}°</span>
                </div>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  value={state.transform.rotateZ}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      anglePreset: 'custom',
                      transform: {
                        ...prev.transform,
                        rotateZ: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* Floating Elevation */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Ketinggian Mengambang (Floating Height)</span>
                  <span className="font-mono">{state.transform.elevation}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={70}
                  value={state.transform.elevation}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      transform: {
                        ...prev.transform,
                        elevation: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* 3D Perspective Depth */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Kedalaman Perspektif 3D</span>
                  <span className="font-mono">{state.transform.perspective}px</span>
                </div>
                <input
                  type="range"
                  min={600}
                  max={2400}
                  step={50}
                  value={state.transform.perspective}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      transform: {
                        ...prev.transform,
                        perspective: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* Physical Thickness in Angle Tab */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Ketebalan Bodi 3D (Solid Thickness)</span>
                  <span className="font-mono font-bold text-primary">{state.appearance.thickness || 16}px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={36}
                  value={state.appearance.thickness || 16}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        thickness: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* Laptop Hinge Angle in Angle Tab */}
              {state.device === 'macbook-pro' && (
                <div className="pt-2 border-t border-border-main">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Sudut Bukaan Engsel Layar Laptop</span>
                    <span className="font-mono font-bold text-primary">{state.appearance.laptopLidAngle || 105}°</span>
                  </div>
                  <input
                    type="range"
                    min={75}
                    max={140}
                    value={state.appearance.laptopLidAngle || 105}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          laptopLidAngle: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: LAYAR & GAMBAR (SCREEN)                      */}
        {/* ==================================================== */}
        {activeTab === 'screen' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Upload Custom Screenshot */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Upload Screenshot / Gambar Layar
              </label>

              <label className="border-2 border-dashed border-border-main hover:border-primary bg-bg-hover/50 hover:bg-bg-hover rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2 group">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-primary block">
                    Pilih File Gambar
                  </span>
                  <span className="text-[11px] text-text-muted">
                    atau Drag & Drop / Tekan <span className="font-mono font-bold">Ctrl+V</span>
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Built-in Sample UI Screens */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Atau Pilih Contoh Tampilan Desain
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_SCREENS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          imageUrl: sample.url,
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      state.screen.imageUrl === sample.url
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border-main hover:bg-bg-hover'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        ✦
                      </div>
                      <span className="text-xs font-semibold">{sample.name}</span>
                    </div>
                    {state.screen.imageUrl === sample.url && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Fit & Scale Controls */}
            <div className="space-y-4 pt-3 border-t border-border-main">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Penyesuaian Gambar
              </label>

              {/* Fit Mode */}
              <div className="grid grid-cols-3 gap-2">
                {(['cover', 'contain', 'fill'] as ImageFitMode[]).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          imageFit: fit,
                        },
                      }))
                    }
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      state.screen.imageFit === fit
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-main text-text-muted hover:bg-bg-hover'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>

              {/* Image Zoom */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Zoom Gambar Layar</span>
                  <span className="font-mono">{state.screen.imageZoom}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={200}
                  value={state.screen.imageZoom}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      screen: {
                        ...prev.screen,
                        imageZoom: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                />
              </div>

              {/* Image Pan X & Y */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span>Geser X</span>
                    <span className="font-mono">{state.screen.imagePanX}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={state.screen.imagePanX}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          imagePanX: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span>Geser Y</span>
                    <span className="font-mono">{state.screen.imagePanY}%</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={state.screen.imagePanY}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          imagePanY: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Glass Glare & Reflection */}
            <div className="space-y-3 pt-3 border-t border-border-main">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pantulan Kaca (Glass Sheen)</span>
                </label>
                <input
                  type="checkbox"
                  checked={state.screen.showGlare}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      screen: {
                        ...prev.screen,
                        showGlare: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              {state.screen.showGlare && (
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Intensitas Pantulan</span>
                    <span className="font-mono">{state.screen.glareOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={80}
                    value={state.screen.glareOpacity}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          glareOpacity: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Notch & Status Bar */}
            <div className="space-y-3 pt-3 border-t border-border-main">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Detail Layar Tambahan
              </label>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-bg-hover/50 border border-border-main cursor-pointer">
                  <span className="text-xs font-semibold">Tampilkan Notch / Camera Cutout</span>
                  <input
                    type="checkbox"
                    checked={state.screen.showNotch}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          showNotch: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-primary rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-bg-hover/50 border border-border-main cursor-pointer">
                  <span className="text-xs font-semibold">Tampilkan Top Status Bar</span>
                  <input
                    type="checkbox"
                    checked={state.screen.showStatusBar}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        screen: {
                          ...prev.screen,
                          showStatusBar: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-primary rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: BACKGROUND & KANVAS                          */}
        {/* ==================================================== */}
        {activeTab === 'canvas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Background Style Presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Pilih Tema Background
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {GRADIENT_PRESETS.map((preset) => {
                  const isSelected =
                    preset.type === 'transparent'
                      ? state.canvas.bgType === 'transparent'
                      : state.canvas.bgGradient === preset.style &&
                        state.canvas.bgType !== 'transparent'

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          canvas: {
                            ...prev.canvas,
                            bgType: preset.type,
                            bgGradient: preset.style,
                          },
                        }))
                      }
                      className={`h-16 rounded-2xl p-2.5 text-left flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 shadow-sm scale-[1.02]'
                          : 'border-border-main hover:scale-[1.01]'
                      }`}
                      style={{
                        background:
                          preset.type === 'transparent'
                            ? 'repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 50% / 14px 14px'
                            : preset.style,
                      }}
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md w-fit ${
                          preset.id === 'clean-slate-light' || preset.id === 'mesh-candy'
                            ? 'bg-black/10 text-black'
                            : 'bg-black/40 text-white'
                        }`}
                      >
                        {preset.badge}
                      </span>
                      <span
                        className={`text-xs font-bold truncate ${
                          preset.id === 'clean-slate-light' || preset.id === 'mesh-candy'
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      >
                        {preset.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Canvas Aspect Ratio */}
            <div className="space-y-3 pt-3 border-t border-border-main">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Rasio Ukuran Kanvas (Aspect Ratio)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'auto', name: 'Auto (Fit Frame)' },
                    { id: '16:9', name: '16:9 (Dribbble/Slide)' },
                    { id: '4:3', name: '4:3 (Portfolio)' },
                    { id: '1:1', name: '1:1 (Instagram)' },
                    { id: '9:16', name: '9:16 (Story/TikTok)' },
                    { id: '3:2', name: '3:2 (Classic)' },
                  ] as { id: CanvasAspectRatio; name: string }[]
                ).map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        canvas: {
                          ...prev.canvas,
                          aspectRatio: ratio.id,
                        },
                      }))
                    }
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border text-center ${
                      state.canvas.aspectRatio === ratio.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-main text-text-muted hover:bg-bg-hover'
                    }`}
                  >
                    {ratio.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Padding Slider */}
            <div className="space-y-3 pt-3 border-t border-border-main">
              <div className="flex justify-between text-xs font-medium">
                <span className="font-bold text-text-muted uppercase tracking-wider">
                  Padding Sekitar Mockup
                </span>
                <span className="font-mono">{state.canvas.canvasPadding}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={100}
                value={state.canvas.canvasPadding}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    canvas: {
                      ...prev.canvas,
                      canvasPadding: Number(e.target.value),
                    },
                  }))
                }
                className="w-full accent-primary h-1.5 bg-bg-hover rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Reset */}
      <div className="p-4 border-t border-border-main bg-bg-hover/30 flex items-center justify-between text-xs">
        <span className="text-text-muted flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-time 3D Rendering</span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-text-muted hover:text-red-500 font-semibold transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Semua</span>
        </button>
      </div>
    </div>
  )
}
