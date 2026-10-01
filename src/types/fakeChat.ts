/**
 * Folder: src/types/
 * Description: Stores TypeScript interface definitions and data models.
 * This file: fakeChat.ts (Type definitions for Fake WhatsApp Chat generator).
 */

export type PlatformType = 'desktop' | 'android' | 'ios'

export type ThemeType = 'dark' | 'light'

export type MessageStatus = 'clock' | 'single' | 'double_gray' | 'double_blue'

export type MessageType = 'text' | 'image' | 'audio' | 'document' | 'system' | 'date_divider'

export interface QuotedMessage {
  id: string
  senderName: string
  senderColor?: string
  text: string
  hasImage?: boolean
  imageUrl?: string
}

export interface ReactionItem {
  emoji: string
  count?: number
}

export interface ChatMessage {
  id: string
  type: MessageType
  sender: 'me' | 'them'
  senderName?: string // for group chats or custom contact name
  senderColor?: string // hex or color class for group sender name
  text: string
  time: string // e.g. "19.33"
  status?: MessageStatus
  isStarred?: boolean
  isForwarded?: boolean
  isDeleted?: boolean
  // Media properties
  imageUrl?: string
  imageCaption?: string
  audioDuration?: string // e.g. "0:24"
  audioProgress?: number // 0 to 100
  audioSpeed?: string // "1x", "1.5x", "2x"
  docName?: string // e.g. "Tugas_Kelompok.pdf"
  docPages?: string // e.g. "12 halaman"
  docSize?: string // e.g. "2.4 MB"
  docExt?: string // e.g. "PDF"
  // Quoted reply
  replyTo?: QuotedMessage
  // Reactions
  reactions?: ReactionItem[]
}

export interface ContactConfig {
  name: string
  avatarUrl: string
  status: string // "online", "mengetik...", "terakhir dilihat hari ini pukul 19.20", etc.
  isOnline: boolean
  isTyping: boolean
  isVerified: boolean
  isGroup: boolean
  groupMembersCount?: number
}

export interface HeaderConfig {
  showCallButtons: boolean
  showSearchButton: boolean
  showMenuButton: boolean
  pinnedMessage?: {
    enabled: boolean
    title?: string
    text: string
  }
}

export interface MobileStatusBarConfig {
  showStatusBar: boolean
  time: string
  batteryPercentage: number
  isCharging: boolean
  signalStrength: 1 | 2 | 3 | 4
  networkType: '5G' | '4G' | 'LTE' | 'WiFi'
  showWifi: boolean
  showNotch: boolean
  showHomeIndicator: boolean
}

export interface WallpaperConfig {
  type: 'doodle' | 'solid' | 'custom'
  solidColor: string
  customImageUrl?: string
  doodleOpacity: number // 0 to 100
}

export interface FakeChatState {
  platform: PlatformType
  theme: ThemeType
  contact: ContactConfig
  header: HeaderConfig
  mobileStatus: MobileStatusBarConfig
  wallpaper: WallpaperConfig
  messages: ChatMessage[]
  inputPlaceholder: string
  showMockupFrame: boolean
  zoomLevel: number // 80, 100, 120, etc.
}
