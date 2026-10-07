/**
 * Folder: src/types/
 * Description: TypeScript definitions for the 3D Device Mockup Studio.
 * This file: mockup.ts (State, device configurations, 3D transforms, and export types).
 */

export type DeviceType =
  | 'iphone-16-pro'
  | 'android-flagship'
  | 'macbook-pro'
  | 'studio-display'
  | 'ipad-pro'
  | 'apple-watch'
  | 'browser-window'

export type DeviceOrientation = 'portrait' | 'landscape'

export type AnglePreset =
  | 'isometric-right'
  | 'isometric-left'
  | 'frontal'
  | 'floating-hero'
  | 'tilted-top'
  | 'side-angle'
  | 'custom'

export type ImageFitMode = 'cover' | 'contain' | 'fill'

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'mesh' | 'studio'

export type CanvasAspectRatio = 'auto' | '1:1' | '16:9' | '4:3' | '9:16' | '3:2'

export interface MockupTransform {
  rotateX: number // degrees (-60 to 60)
  rotateY: number // degrees (-60 to 60)
  rotateZ: number // degrees (-45 to 45)
  perspective: number // px (500 to 2500)
  scale: number // multiplier (0.5 to 1.5)
  elevation: number // px floating shadow distance (0 to 80)
  flipX: boolean // horizontal flip
  flipY: boolean // vertical flip
}

export interface MockupScreenConfig {
  imageUrl: string | null
  imageFit: ImageFitMode
  imageZoom: number // 100% to 250%
  imagePanX: number // -50% to +50%
  imagePanY: number // -50% to +50%
  screenBgColor: string
  showGlare: boolean
  glareOpacity: number // 0 to 100
  showNotch: boolean
  showStatusBar: boolean
  statusBarTime: string
  statusBarStyle: 'light' | 'dark'
}

export interface MockupDeviceAppearance {
  color: string
  finishName: string
  thickness: number // px (4 to 36px, default 16px)
  shadowType: 'realistic-floor' | 'soft-glow' | 'hard-3d' | 'subtle' | 'none'
  shadowBlur: number
  shadowOpacity: number
  showFrameGlow: boolean
  showCameraBump: boolean
  showSideButtons: boolean
  laptopLidAngle: number // degrees (70 to 145, default 105)
}

export interface MockupCanvasConfig {
  bgType: BackgroundType
  bgColor: string
  bgGradient: string
  aspectRatio: CanvasAspectRatio
  canvasPadding: number // px (16 to 120)
  borderRadius: number // canvas corner radius
}

export interface MockupState {
  device: DeviceType
  orientation: DeviceOrientation
  anglePreset: AnglePreset
  transform: MockupTransform
  screen: MockupScreenConfig
  appearance: MockupDeviceAppearance
  canvas: MockupCanvasConfig
  zoomLevel: number // editor canvas preview zoom (25% to 150%)
}

export interface DeviceMeta {
  id: DeviceType
  name: string
  category: 'mobile' | 'laptop' | 'desktop' | 'tablet' | 'wearable' | 'browser'
  screenRatio: { width: number; height: number }
  supportsOrientation: boolean
  colorPresets: { name: string; hex: string; borderHex: string }[]
  description: string
}
