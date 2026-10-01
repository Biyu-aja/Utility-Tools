/**
 * Folder: src/utils/
 * Description: Stores helper utilities and asset generators.
 * This file: fakeChatDoodle.ts (Provides authentic WhatsApp doodle SVG background pattern and theme colors).
 */

/**
 * Authentic WhatsApp vector doodle background pattern
 */
export const WHATSAPP_DOODLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="412" height="412" viewBox="0 0 412 412" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Chat Bubble -->
  <path d="M40 30h40a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H60l-15 10v-10h-5a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10z"/>
  <circle cx="55" cy="50" r="2" fill="currentColor"/>
  <circle cx="65" cy="50" r="2" fill="currentColor"/>
  <circle cx="75" cy="50" r="2" fill="currentColor"/>

  <!-- Coffee Cup -->
  <path d="M140 45h30v25a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12V45z"/>
  <path d="M170 52h8a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5h-8"/>
  <path d="M136 85h38"/>
  <path d="M148 35q4-5 2-10"/>
  <path d="M158 35q4-5 2-10"/>

  <!-- Gamepad -->
  <rect x="230" y="38" width="50" height="30" rx="12"/>
  <line x1="242" y1="48" x2="242" y2="58"/>
  <line x1="237" y1="53" x2="247" y2="53"/>
  <circle cx="265" cy="49" r="2.5" fill="currentColor"/>
  <circle cx="272" cy="56" r="2.5" fill="currentColor"/>

  <!-- Cloud / Sun -->
  <path d="M330 55a12 12 0 0 1 22-5 10 10 0 0 1 14 9 8 8 0 0 1-2 15h-32a10 10 0 0 1-2-19z"/>
  
  <!-- Clock -->
  <circle cx="50" cy="145" r="18"/>
  <polyline points="50,135 50,145 58,145"/>

  <!-- Paper Plane -->
  <path d="M130 135l50 15-50 25 15-25-15-15z"/>
  <line x1="145" y1="150" x2="180" y2="150"/>

  <!-- Smiley Face -->
  <circle cx="250" cy="140" r="18"/>
  <circle cx="243" cy="135" r="2.5" fill="currentColor"/>
  <circle cx="257" cy="135" r="2.5" fill="currentColor"/>
  <path d="M243 148q7 8 14 0"/>

  <!-- Heart -->
  <path d="M340 135a8 8 0 0 0-12 10l12 12 12-12a8 8 0 0 0-12-10z"/>

  <!-- Camera -->
  <rect x="35" y="225" width="38" height="26" rx="5"/>
  <path d="M46 225l3-6h16l3 6"/>
  <circle cx="54" cy="238" r="7"/>

  <!-- Music Note -->
  <path d="M150 220v25a7 7 0 1 1-5-6.5V225l25-5v19a7 7 0 1 1-5-6.5V215l-15 5"/>

  <!-- Star -->
  <polygon points="250,215 254,226 266,226 256,233 260,244 250,237 240,244 244,233 234,226 246,226"/>

  <!-- Light Bulb -->
  <path d="M335 220a14 14 0 0 1 20 18c-2 3-3 5-3 8h-14c0-3-1-5-3-8a14 14 0 0 1 0-18z"/>
  <rect x="338" y="246" width="14" height="6" rx="2"/>

  <!-- Mountain / Landscape Photo -->
  <rect x="35" y="315" width="40" height="30" rx="4"/>
  <polyline points="38,340 48,328 58,338 66,330 73,340"/>
  <circle cx="46" cy="323" r="3"/>

  <!-- Headphone -->
  <path d="M135 330a18 18 0 0 1 36 0v10a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4"/>
  <path d="M171 330v10a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4"/>

  <!-- Gift Box -->
  <rect x="235" y="315" width="34" height="28" rx="3"/>
  <line x1="235" y1="324" x2="269" y2="324"/>
  <line x1="252" y1="315" x2="252" y2="343"/>
  <path d="M252 315q-7-10-12 0t12 0"/>
  <path d="M252 315q7-10 12 0t-12 0"/>

  <!-- Padlock (Security) -->
  <rect x="335" y="322" width="26" height="22" rx="4"/>
  <path d="M341 322v-6a7 7 0 0 1 14 0v6"/>
  <circle cx="348" cy="331" r="2.5" fill="currentColor"/>

  <!-- Tiny Decorative Dots & Crosses -->
  <circle cx="105" cy="60" r="1.5" fill="currentColor"/>
  <circle cx="205" cy="40" r="1.5" fill="currentColor"/>
  <circle cx="305" cy="70" r="1.5" fill="currentColor"/>
  <circle cx="95" cy="160" r="1.5" fill="currentColor"/>
  <circle cx="205" cy="140" r="1.5" fill="currentColor"/>
  <circle cx="300" cy="165" r="1.5" fill="currentColor"/>
  <circle cx="100" cy="250" r="1.5" fill="currentColor"/>
  <circle cx="205" cy="245" r="1.5" fill="currentColor"/>
  <circle cx="300" cy="240" r="1.5" fill="currentColor"/>
  <circle cx="105" cy="340" r="1.5" fill="currentColor"/>
  <circle cx="205" cy="330" r="1.5" fill="currentColor"/>
  <circle cx="305" cy="335" r="1.5" fill="currentColor"/>

  <!-- Tiny + marks -->
  <path d="M15 105h6M18 102v6"/>
  <path d="M195 95h6M198 92v6"/>
  <path d="M385 105h6M388 102v6"/>
  <path d="M25 295h6M28 292v6"/>
  <path d="M185 285h6M188 282v6"/>
  <path d="M380 280h6M383 277v6"/>
</svg>`

export const WHATSAPP_DOODLE_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(WHATSAPP_DOODLE_SVG)}`

export const WHATSAPP_THEME_COLORS = {
  dark: {
    bg: '#0b141a', // true dark WhatsApp background
    doodleColor: '#8696a0',
    headerBg: '#202c33',
    headerBorder: '#2f3b43',
    pinnedBg: '#182229',
    pinnedBorder: '#233138',
    bubbleMe: '#005c4b',
    bubbleMeHover: '#006c58',
    bubbleThem: '#202c33',
    bubbleThemHover: '#26353d',
    textMain: '#e9edef',
    textMuted: '#8696a0',
    timestampMe: '#8696a0',
    timestampThem: '#8696a0',
    blueTick: '#53bdeb',
    grayTick: '#8696a0',
    replyMeBg: '#025144',
    replyThemBg: '#182229',
    inputBarBg: '#202c33',
    inputFieldBg: '#2a3942',
    dateChipBg: '#182229',
    dateChipText: '#8696a0',
    systemBubbleBg: '#182229',
    systemBubbleText: '#ffd279',
  },
  light: {
    bg: '#efeae2',
    doodleColor: '#54656f',
    headerBg: '#f0f2f5',
    headerBorder: '#d1d7db',
    pinnedBg: '#ffffff',
    pinnedBorder: '#e9edef',
    bubbleMe: '#d9fdd3',
    bubbleMeHover: '#cff9c6',
    bubbleThem: '#ffffff',
    bubbleThemHover: '#f5f7f9',
    textMain: '#111b21',
    textMuted: '#667781',
    timestampMe: '#667781',
    timestampThem: '#667781',
    blueTick: '#53bdeb',
    grayTick: '#8696a0',
    replyMeBg: '#c2f1b8',
    replyThemBg: '#f0f2f5',
    inputBarBg: '#f0f2f5',
    inputFieldBg: '#ffffff',
    dateChipBg: '#ffffff',
    dateChipText: '#54656f',
    systemBubbleBg: '#ffeecd',
    systemBubbleText: '#54656f',
  }
}
