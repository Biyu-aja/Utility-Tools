/**
 * Folder: src/utils/
 * Description: Presets, default templates, device metadata, and sample screens for Mockup Studio.
 * This file: mockupPresets.ts
 */

import type {
  DeviceMeta,
  DeviceType,
  AnglePreset,
  MockupTransform,
  MockupState,
} from '../types/mockup'

export const DEVICE_METAS: Record<DeviceType, DeviceMeta> = {
  'iphone-16-pro': {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    category: 'mobile',
    screenRatio: { width: 375, height: 812 },
    supportsOrientation: true,
    description: 'Bezel super tipis, Dynamic Island, titanium frame & tombol samping.',
    colorPresets: [
      { name: 'Black Titanium', hex: '#1c1c1e', borderHex: '#3a3a3c' },
      { name: 'Natural Titanium', hex: '#8e8e93', borderHex: '#d1d1d6' },
      { name: 'Desert Titanium', hex: '#b3927d', borderHex: '#dfc8ba' },
      { name: 'White Titanium', hex: '#e5e5ea', borderHex: '#ffffff' },
      { name: 'Deep Navy', hex: '#0f172a', borderHex: '#2563eb' },
    ],
  },
  'android-flagship': {
    id: 'android-flagship',
    name: 'Galaxy / Pixel Phone',
    category: 'mobile',
    screenRatio: { width: 380, height: 820 },
    supportsOrientation: true,
    description: 'Punch-hole camera tengah simetris, bezel minimalis modern.',
    colorPresets: [
      { name: 'Phantom Black', hex: '#111827', borderHex: '#374151' },
      { name: 'Titanium Gray', hex: '#64748b', borderHex: '#94a3b8' },
      { name: 'Cobalt Violet', hex: '#4c1d95', borderHex: '#7c3aed' },
      { name: 'Marble Cream', hex: '#f8fafc', borderHex: '#e2e8f0' },
    ],
  },
  'macbook-pro': {
    id: 'macbook-pro',
    name: 'MacBook Pro 16"',
    category: 'laptop',
    screenRatio: { width: 800, height: 500 },
    supportsOrientation: false,
    description: 'Layar Liquid Retina notch, bodi aluminium solid, keyboard deck & trackpad.',
    colorPresets: [
      { name: 'Space Black', hex: '#1f242d', borderHex: '#374151' },
      { name: 'Space Gray', hex: '#4b5563', borderHex: '#9ca3af' },
      { name: 'Silver Aluminum', hex: '#e2e8f0', borderHex: '#cbd5e1' },
    ],
  },
  'studio-display': {
    id: 'studio-display',
    name: 'Studio Display 5K / iMac',
    category: 'desktop',
    screenRatio: { width: 820, height: 480 },
    supportsOrientation: false,
    description: 'Monitor all-in-one minimalis dengan stand aluminium elegan.',
    colorPresets: [
      { name: 'Silver Stand', hex: '#0f172a', borderHex: '#cbd5e1' },
      { name: 'Space Gray', hex: '#1e293b', borderHex: '#475569' },
      { name: 'Midnight Black', hex: '#000000', borderHex: '#1e293b' },
    ],
  },
  'ipad-pro': {
    id: 'ipad-pro',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    screenRatio: { width: 600, height: 800 },
    supportsOrientation: true,
    description: 'Tablet layar penuh dengan sudut membulat & bezel seragam.',
    colorPresets: [
      { name: 'Space Gray', hex: '#1e293b', borderHex: '#475569' },
      { name: 'Silver Pro', hex: '#f1f5f9', borderHex: '#cbd5e1' },
      { name: 'Starlight Gold', hex: '#fef3c7', borderHex: '#fde68a' },
    ],
  },
  'browser-window': {
    id: 'browser-window',
    name: 'Safari / Clean Browser Frame',
    category: 'browser',
    screenRatio: { width: 840, height: 540 },
    supportsOrientation: false,
    description: 'Frame browser macOS modern lengkap dengan traffic lights & URL bar.',
    colorPresets: [
      { name: 'Dark Mode Safari', hex: '#18181b', borderHex: '#27272a' },
      { name: 'Light Mode Safari', hex: '#ffffff', borderHex: '#e4e4e7' },
      { name: 'Glass Blur', hex: '#090d16cc', borderHex: '#38bdf840' },
    ],
  },
  'apple-watch': {
    id: 'apple-watch',
    name: 'Apple Watch Ultra',
    category: 'wearable',
    screenRatio: { width: 320, height: 390 },
    supportsOrientation: false,
    description: 'Smartwatch layar lengkung dengan Digital Crown & casing titanium.',
    colorPresets: [
      { name: 'Titanium Raw', hex: '#27272a', borderHex: '#71717a' },
      { name: 'Midnight Dark', hex: '#09090b', borderHex: '#27272a' },
      { name: 'Gold Luxury', hex: '#78350f', borderHex: '#d97706' },
    ],
  },
}

export const ANGLE_PRESETS_CONFIG: Record<
  AnglePreset,
  { name: string; description: string; transform: MockupTransform }
> = {
  'isometric-right': {
    name: 'Floating Isometric Right',
    description: 'Sudut miring 3D ke kanan seperti showcase presentasi produk modern.',
    transform: {
      rotateX: 18,
      rotateY: 26,
      rotateZ: 8,
      perspective: 1200,
      scale: 0.95,
      elevation: 32,
      flipX: false,
      flipY: false,
    },
  },
  'isometric-left': {
    name: 'Floating Isometric Left',
    description: 'Sudut miring 3D ke kiri dengan kedalaman dan bayangan mengambang.',
    transform: {
      rotateX: 18,
      rotateY: -26,
      rotateZ: -8,
      perspective: 1200,
      scale: 0.95,
      elevation: 32,
      flipX: false,
      flipY: false,
    },
  },
  frontal: {
    name: 'Frontal Flat (0°)',
    description: 'Tampilan lurus sejajar tanpa rotasi sudut 3D.',
    transform: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      perspective: 1600,
      scale: 1,
      elevation: 12,
      flipX: false,
      flipY: false,
    },
  },
  'floating-hero': {
    name: 'Dynamic Hero View',
    description: 'Sudut dramatis miring ke atas cocok untuk landing page hero banner.',
    transform: {
      rotateX: 12,
      rotateY: -22,
      rotateZ: -12,
      perspective: 1100,
      scale: 0.96,
      elevation: 40,
      flipX: false,
      flipY: false,
    },
  },
  'tilted-top': {
    name: 'Tilted Top-Down',
    description: 'Perspektif miring dari atas ke bawah untuk kesan flat lay 3D.',
    transform: {
      rotateX: 28,
      rotateY: 0,
      rotateZ: 0,
      perspective: 1400,
      scale: 0.98,
      elevation: 24,
      flipX: false,
      flipY: false,
    },
  },
  'side-angle': {
    name: 'Side Profile (35°)',
    description: 'Sudut samping tajam mempertegas ketipisan dan frame bodi perangkat.',
    transform: {
      rotateX: 4,
      rotateY: -36,
      rotateZ: 0,
      perspective: 1300,
      scale: 0.98,
      elevation: 20,
      flipX: false,
      flipY: false,
    },
  },
  custom: {
    name: 'Custom 3D Slider',
    description: 'Atur rotasi X, Y, Z, perspektif, dan zoom secara manual sesuai selera.',
    transform: {
      rotateX: 16,
      rotateY: 24,
      rotateZ: 6,
      perspective: 1200,
      scale: 1,
      elevation: 30,
      flipX: false,
      flipY: false,
    },
  },
}

export const GRADIENT_PRESETS = [
  {
    id: 'transparent',
    name: 'Transparan',
    type: 'transparent' as const,
    style: 'transparent',
    badge: 'PNG Alpha',
  },
  {
    id: 'studio-dark',
    name: 'Studio Obsidian Dark',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #0f172a 100%)',
    badge: 'Dark',
  },
  {
    id: 'studio-spotlight',
    name: 'Studio Spotlight Glow',
    type: 'studio' as const,
    style: 'radial-gradient(circle at 50% 40%, #1e293b 0%, #090d16 80%)',
    badge: 'Spotlight',
  },
  {
    id: 'royal-blue',
    name: 'Deep Oceanic Blue',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)',
    badge: 'Vibrant',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Glow',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #451a03 0%, #b45309 45%, #f59e0b 100%)',
    badge: 'Warm',
  },
  {
    id: 'aurora-purple',
    name: 'Cosmic Aurora',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #2e1065 0%, #7c3aed 50%, #ec4899 100%)',
    badge: 'Gradient',
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Luxury',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    badge: 'Fresh',
  },
  {
    id: 'clean-slate-light',
    name: 'Clean Studio White',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    badge: 'Light',
  },
  {
    id: 'mesh-candy',
    name: 'Mesh Candy Pastel',
    type: 'mesh' as const,
    style: 'radial-gradient(at 0% 0%, #fbcfe8 0px, transparent 50%), radial-gradient(at 100% 0%, #c7d2fe 0px, transparent 50%), radial-gradient(at 100% 100%, #fed7aa 0px, transparent 50%), radial-gradient(at 0% 100%, #a7f3d0 0px, transparent 50%), #f8fafc',
    badge: 'Pastel',
  },
  {
    id: 'cyberpunk-dark',
    name: 'Cyberpunk Neon',
    type: 'gradient' as const,
    style: 'linear-gradient(135deg, #050505 0%, #1a052b 50%, #032b30 100%)',
    badge: 'Neon',
  },
]

// Built-in high-quality SVG sample screens
export const SAMPLE_SCREENS = [
  {
    id: 'muda-education',
    name: 'Edukasi / Landing App (Sesuai Contoh)',
    category: 'mobile',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="750" height="1624" viewBox="0 0 750 1624" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="1624" fill="#0038A8"/>
        <!-- Background grid & radar circles -->
        <circle cx="560" cy="400" r="160" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
        <circle cx="560" cy="400" r="100" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
        <circle cx="560" cy="400" r="40" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
        <circle cx="560" cy="400" r="6" fill="#38bdf8"/>

        <!-- Header -->
        <text x="60" y="160" fill="#FFFFFF" font-family="-apple-system, system-ui, sans-serif" font-weight="900" font-size="28" letter-spacing="1">MUDA berKlānA.</text>
        
        <!-- Action Buttons -->
        <rect x="420" y="128" width="160" height="44" rx="22" fill="#0B2056" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <text x="444" y="156" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="14">DAFTAR KURSUS</text>
        
        <rect x="596" y="128" width="94" height="44" rx="22" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <text x="626" y="156" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="600" font-size="14">MASUK</text>

        <!-- Big Number 01 -->
        <text x="60" y="320" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-weight="900" font-size="120" stroke="rgba(255,255,255,0.8)" stroke-width="2">01</text>
        <text x="64" y="360" fill="#38BDF8" font-family="system-ui, sans-serif" font-weight="700" font-size="16" letter-spacing="3">FOUNDATIONAL PILLAR</text>

        <!-- Headline -->
        <text x="60" y="440" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="42">Menjembatani <tspan fill="#38BDF8">talenta muda</tspan></text>
        <text x="60" y="490" fill="#38BDF8" font-family="system-ui, sans-serif" font-weight="800" font-size="42">vokasi <tspan fill="#FFFFFF">dan pelaku UMKM melalui</tspan></text>
        <text x="60" y="540" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="42">solusi digital praktis, mandiri,</text>
        <text x="60" y="590" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="42">dan berdaya saing.</text>

        <!-- Paragraph Description -->
        <text x="60" y="660" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="20">MUDA berKlanA hadir sebagai inisiatif strategis PT Klana</text>
        <text x="60" y="692" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="20">Obsesi Indonesia untuk menjawab tantangan ganda:</text>
        <text x="60" y="724" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="20">membekali siswa SMK &amp; pencari kerja pemula dengan</text>
        <text x="60" y="756" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="20">keahlian teknis siap pakai berstandar industri.</text>

        <!-- 4 Grid Cards (M, U, D, A) -->
        <!-- Card M -->
        <rect x="60" y="820" width="300" height="280" rx="32" fill="#034EB0" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
        <circle cx="320" cy="860" r="10" fill="#38BDF8" opacity="0.6"/>
        <text x="90" y="900" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="64">M</text>
        <text x="90" y="940" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="24">Mandiri</text>
        <text x="90" y="980" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">Mendorong kemandirian</text>
        <text x="90" y="1006" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">finansial dan lompatan karier</text>
        <text x="90" y="1032" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">talenta muda terampil.</text>

        <!-- Card U -->
        <rect x="390" y="820" width="300" height="280" rx="32" fill="#034EB0" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
        <circle cx="650" cy="860" r="10" fill="#38BDF8" opacity="0.6"/>
        <text x="420" y="900" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="64">U</text>
        <text x="420" y="940" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="24">Unggul</text>
        <text x="420" y="980" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">Menyediakan kurikulum</text>
        <text x="420" y="1006" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">praktis dan standar</text>
        <text x="420" y="1032" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">pengerjaan profesional.</text>

        <!-- Card D -->
        <rect x="60" y="1130" width="300" height="280" rx="32" fill="#034EB0" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
        <circle cx="320" cy="1170" r="10" fill="#38BDF8" opacity="0.6"/>
        <text x="90" y="1210" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="64">D</text>
        <text x="90" y="1250" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="24">Dinamis</text>
        <text x="90" y="1290" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">Selalu relevan dan adaptif</text>
        <text x="90" y="1316" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">mengikuti evolusi tren</text>
        <text x="90" y="1342" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">teknologi web modern.</text>

        <!-- Card A -->
        <rect x="390" y="1130" width="300" height="280" rx="32" fill="#034EB0" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
        <circle cx="650" cy="1170" r="10" fill="#38BDF8" opacity="0.6"/>
        <text x="420" y="1210" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="64">A</text>
        <text x="420" y="1250" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="24">Adaptif</text>
        <text x="420" y="1290" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">Mampu beroperasi efisien</text>
        <text x="420" y="1316" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">di berbagai tingkat</text>
        <text x="420" y="1342" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-weight="400" font-size="16">kebutuhan UMKM.</text>
      </svg>
    `)}`,
  },
  {
    id: 'saas-dashboard',
    name: 'SaaS Analytics Dashboard',
    category: 'desktop',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="1280" height="800" viewBox="0 0 1280 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1280" height="800" fill="#0B0F19"/>
        <!-- Sidebar -->
        <rect width="240" height="800" fill="#111827" stroke="#1F2937" stroke-width="1"/>
        <circle cx="48" cy="48" r="16" fill="#6366F1"/>
        <text x="76" y="54" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="20">Nexus.ai</text>
        
        <rect x="24" y="110" width="192" height="40" rx="10" fill="#4F46E5"/>
        <text x="50" y="135" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="600" font-size="14">Overview</text>
        <text x="50" y="185" fill="#9CA3AF" font-family="system-ui, sans-serif" font-weight="500" font-size="14">Analytics</text>
        <text x="50" y="235" fill="#9CA3AF" font-family="system-ui, sans-serif" font-weight="500" font-size="14">Transactions</text>
        <text x="50" y="285" fill="#9CA3AF" font-family="system-ui, sans-serif" font-weight="500" font-size="14">Customers</text>

        <!-- Top Header -->
        <text x="280" y="56" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="28">Analytics Dashboard</text>
        <rect x="1100" y="32" width="140" height="40" rx="20" fill="#1F2937"/>
        <text x="1130" y="56" fill="#A5B4FC" font-family="system-ui, sans-serif" font-weight="600" font-size="13">✨ Live Sync</text>

        <!-- Stats Grid -->
        <rect x="280" y="100" width="220" height="120" rx="16" fill="#1F2937"/>
        <text x="304" y="136" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Total Revenue</text>
        <text x="304" y="174" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="28">$148,290</text>
        <text x="304" y="200" fill="#34D399" font-family="system-ui, sans-serif" font-size="12">↑ +24.8% vs last mo</text>

        <rect x="520" y="100" width="220" height="120" rx="16" fill="#1F2937"/>
        <text x="544" y="136" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Active Users</text>
        <text x="544" y="174" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="28">64,820</text>
        <text x="544" y="200" fill="#34D399" font-family="system-ui, sans-serif" font-size="12">↑ +18.2% vs last mo</text>

        <rect x="760" y="100" width="220" height="120" rx="16" fill="#1F2937"/>
        <text x="784" y="136" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Conversion Rate</text>
        <text x="784" y="174" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="28">4.82%</text>
        <text x="784" y="200" fill="#34D399" font-family="system-ui, sans-serif" font-size="12">↑ +2.1%</text>

        <rect x="1000" y="100" width="240" height="120" rx="16" fill="#1F2937"/>
        <text x="1024" y="136" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13">Server Uptime</text>
        <text x="1024" y="174" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="28">99.98%</text>
        <text x="1024" y="200" fill="#60A5FA" font-family="system-ui, sans-serif" font-size="12">● Healthy System</text>

        <!-- Chart Area -->
        <rect x="280" y="240" width="960" height="520" rx="20" fill="#111827" stroke="#1F2937" stroke-width="1"/>
        <text x="312" y="280" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="18">Revenue Growth &amp; Projections</text>
        <path d="M 320 660 C 440 600, 520 620, 640 480 C 760 340, 880 440, 1020 360 C 1120 300, 1180 340, 1200 320 L 1200 700 L 320 700 Z" fill="url(#grad1)" opacity="0.3"/>
        <path d="M 320 660 C 440 600, 520 620, 640 480 C 760 340, 880 440, 1020 360 C 1120 300, 1180 340, 1200 320" stroke="#6366F1" stroke-width="4" fill="none"/>
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366F1"/>
            <stop offset="100%" stop-color="#6366F1" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `)}`,
  },
  {
    id: 'fintech-app',
    name: 'Fintech & Wallet UI',
    category: 'mobile',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="750" height="1624" viewBox="0 0 750 1624" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="1624" fill="#0A0A0C"/>
        <!-- Top App Bar -->
        <circle cx="90" cy="140" r="28" fill="#1F222E"/>
        <text x="80" y="148" fill="#FFFFFF" font-size="20">⚡</text>
        <text x="140" y="146" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="16">Halo,</text>
        <text x="186" y="146" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="18">Alexander</text>
        <rect x="610" y="116" width="50" height="50" rx="16" fill="#1F222E"/>
        <text x="625" y="148" fill="#FFFFFF" font-size="20">🔔</text>

        <!-- Balance Card -->
        <rect x="50" y="210" width="650" height="360" rx="36" fill="url(#cardGrad)"/>
        <text x="90" y="270" fill="rgba(255,255,255,0.7)" font-family="system-ui, sans-serif" font-size="16">Total Saldo Aktif</text>
        <text x="90" y="336" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="52">Rp 84.520.000</text>
        <text x="90" y="380" fill="#34D399" font-family="system-ui, sans-serif" font-weight="600" font-size="16">▲ +12.4% bulan ini</text>
        <rect x="90" y="470" width="240" height="60" rx="20" fill="rgba(255,255,255,0.2)"/>
        <text x="145" y="508" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="18">+ Top Up</text>
        <rect x="360" y="470" width="240" height="60" rx="20" fill="rgba(0,0,0,0.3)"/>
        <text x="420" y="508" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="18">↗ Transfer</text>

        <!-- Recent Transactions -->
        <text x="50" y="640" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="26">Transaksi Terkini</text>
        
        <!-- Tx 1 -->
        <rect x="50" y="680" width="650" height="110" rx="24" fill="#161821"/>
        <circle cx="110" cy="735" r="28" fill="#2563EB"/>
        <text x="98" y="743" fill="#FFFFFF" font-size="22">🛍️</text>
        <text x="160" y="728" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="20">Apple Store ID</text>
        <text x="160" y="756" fill="#6B7280" font-family="system-ui, sans-serif" font-size="14">Langganan iCloud</text>
        <text x="540" y="743" fill="#EF4444" font-family="system-ui, sans-serif" font-weight="700" font-size="20">- Rp 45.000</text>

        <!-- Tx 2 -->
        <rect x="50" y="810" width="650" height="110" rx="24" fill="#161821"/>
        <circle cx="110" cy="865" r="28" fill="#10B981"/>
        <text x="98" y="873" fill="#FFFFFF" font-size="22">💰</text>
        <text x="160" y="858" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="20">Client Payment</text>
        <text x="160" y="886" fill="#6B7280" font-family="system-ui, sans-serif" font-size="14">Desain UI Website</text>
        <text x="520" y="873" fill="#10B981" font-family="system-ui, sans-serif" font-weight="700" font-size="20">+ Rp 7.500.000</text>

        <!-- Tx 3 -->
        <rect x="50" y="940" width="650" height="110" rx="24" fill="#161821"/>
        <circle cx="110" cy="995" r="28" fill="#F59E0B"/>
        <text x="98" y="1003" fill="#FFFFFF" font-size="22">☕</text>
        <text x="160" y="988" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="20">Kopi Kenangan</text>
        <text x="160" y="1016" fill="#6B7280" font-family="system-ui, sans-serif" font-size="14">QRIS Payment</text>
        <text x="540" y="1003" fill="#EF4444" font-family="system-ui, sans-serif" font-weight="700" font-size="20">- Rp 38.000</text>

        <defs>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4F46E5"/>
            <stop offset="50%" stop-color="#7C3AED"/>
            <stop offset="100%" stop-color="#EC4899"/>
          </linearGradient>
        </defs>
      </svg>
    `)}`,
  },
]

export const DEFAULT_MOCKUP_STATE: MockupState = {
  device: 'iphone-16-pro',
  orientation: 'portrait',
  anglePreset: 'isometric-right',
  transform: {
    ...ANGLE_PRESETS_CONFIG['isometric-right'].transform,
  },
  screen: {
    imageUrl: SAMPLE_SCREENS[0].url,
    imageFit: 'cover',
    imageZoom: 100,
    imagePanX: 0,
    imagePanY: 0,
    screenBgColor: '#0038A8',
    showGlare: true,
    glareOpacity: 35,
    showNotch: true,
    showStatusBar: true,
    statusBarTime: '09:41',
    statusBarStyle: 'light',
  },
  appearance: {
    color: '#1c1c1e',
    finishName: 'Black Titanium',
    thickness: 16,
    shadowType: 'realistic-floor',
    shadowBlur: 35,
    shadowOpacity: 45,
    showFrameGlow: true,
    showCameraBump: true,
    showSideButtons: true,
    laptopLidAngle: 105,
  },
  canvas: {
    bgType: 'gradient',
    bgColor: '#090d16',
    bgGradient: GRADIENT_PRESETS[1].style, // Studio Obsidian Dark
    aspectRatio: 'auto',
    canvasPadding: 48,
    borderRadius: 28,
  },
  zoomLevel: 100,
}
