/**
 * Folder: src/utils/
 * Description: Stores helper utilities and JSON schema validation for Fake WhatsApp Chat.
 * This file: fakeChatJsonHelper.ts (JSON schema template, validation, parsing, and export).
 */

import type { FakeChatState, ChatMessage, MessageType, MessageStatus, PlatformType, ThemeType } from '../types/fakeChat'

/**
 * Standard complete template format with full comments / explanation
 */
export const SAMPLE_TEMPLATE_JSON: FakeChatState = {
  platform: 'desktop', // Pilihan: "desktop" | "android" | "ios"
  theme: 'dark', // Pilihan: "dark" | "light"
  contact: {
    name: 'Rpl Keisya[1]',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online', // Contoh: "online", "mengetik...", "terakhir dilihat hari ini pukul 19.20"
    isOnline: true,
    isTyping: false,
    isVerified: false,
    isGroup: false,
  },
  header: {
    showCallButtons: true,
    showSearchButton: true,
    showMenuButton: true,
    pinnedMessage: {
      enabled: true,
      title: 'Pesan Disematkan',
      text: '45.58.47.49 3TEtyff7CcvM2nzY',
    },
  },
  mobileStatus: {
    showStatusBar: true,
    time: '20:56',
    batteryPercentage: 85,
    isCharging: false,
    signalStrength: 4, // 1 sampai 4 bar
    networkType: '5G', // "5G" | "4G" | "LTE" | "WiFi"
    showWifi: true,
    showNotch: true,
    showHomeIndicator: true,
  },
  wallpaper: {
    type: 'doodle', // "doodle" | "solid" | "custom"
    solidColor: '#0b141a',
    doodleOpacity: 12, // 0 sampai 100
  },
  inputPlaceholder: 'Ketik pesan',
  showMockupFrame: false,
  zoomLevel: 100,
  messages: [
    {
      id: 'msg-1',
      type: 'date_divider', // Tipe: "text" | "image" | "audio" | "document" | "date_divider" | "system"
      sender: 'them',
      text: 'Kemarin',
      time: '',
    },
    {
      id: 'msg-2',
      type: 'text',
      sender: 'me', // "me" (Saya / hijau kanan) atau "them" (Kontak / kiri)
      text: 'How to claim yt premium?',
      time: '19.33',
      status: 'double_blue', // "double_blue" | "double_gray" | "single" | "clock"
    },
    {
      id: 'msg-3',
      type: 'text',
      sender: 'them',
      text: 'go to fitur premium then theres yt premium',
      time: '19.35',
      reactions: [
        {
          emoji: '🙂',
          count: 1,
        },
      ],
    },
    {
      id: 'msg-4',
      type: 'text',
      sender: 'them',
      text: 'yeah sure',
      time: '20.55',
      replyTo: {
        id: 'msg-2',
        senderName: 'Anda',
        text: 'How to claim yt premium?',
      },
    },
    {
      id: 'msg-5',
      type: 'image',
      sender: 'me',
      text: '',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'Foto bukti checkout berhasil',
      time: '20.56',
      status: 'double_blue',
    },
    {
      id: 'msg-6',
      type: 'audio',
      sender: 'them',
      text: '',
      audioDuration: '0:42',
      audioProgress: 60,
      audioSpeed: '1.5x',
      time: '20.57',
    },
  ],
}

/**
 * Minimal concise format template for quick writing
 */
export const SAMPLE_MINIMAL_JSON = {
  contactName: 'Keisya',
  platform: 'desktop',
  theme: 'dark',
  messages: [
    { sender: 'me', text: 'Halo apa kabar?', time: '10.00', status: 'double_blue' },
    { sender: 'them', text: 'Baik! Kamu lagi di mana?', time: '10.01' },
    { sender: 'me', text: 'Lagi di perpus nih', time: '10.02', status: 'double_blue' },
  ],
}

export interface ValidationResult {
  success: boolean
  data?: FakeChatState
  error?: string
  messageCount?: number
}

/**
 * Validates and normalizes any JSON object or string into a strict FakeChatState
 */
export function validateAndParseChatJson(input: unknown): ValidationResult {
  try {
    let raw: Record<string, unknown>

    if (typeof input === 'string') {
      const trimmed = input.trim()
      if (!trimmed) {
        return { success: false, error: 'JSON tidak boleh kosong.' }
      }
      try {
        raw = JSON.parse(trimmed)
      } catch (e) {
        return {
          success: false,
          error: `Sintaks JSON tidak valid: ${(e as Error).message}`,
        }
      }
    } else if (typeof input === 'object' && input !== null) {
      raw = input as Record<string, unknown>
    } else {
      return { success: false, error: 'Format JSON harus berupa Object.' }
    }

    // Support direct array of messages: [ { sender: "me", text: "..." } ]
    if (Array.isArray(raw)) {
      raw = {
        messages: raw,
      }
    }

    // Check if messages exist and is array
    if (!('messages' in raw) || !Array.isArray(raw.messages)) {
      return {
        success: false,
        error: "Field 'messages' harus berupa array daftar pesan.",
      }
    }

    // Normalize Platform
    const validPlatforms: PlatformType[] = ['desktop', 'android', 'ios']
    const platform: PlatformType =
      typeof raw.platform === 'string' && validPlatforms.includes(raw.platform as PlatformType)
        ? (raw.platform as PlatformType)
        : 'desktop'

    // Normalize Theme
    const validThemes: ThemeType[] = ['dark', 'light']
    const theme: ThemeType =
      typeof raw.theme === 'string' && validThemes.includes(raw.theme as ThemeType)
        ? (raw.theme as ThemeType)
        : 'dark'

    // Normalize Contact
    const rawContact = (typeof raw.contact === 'object' && raw.contact !== null ? raw.contact : {}) as Record<string, unknown>
    const contactName =
      (typeof raw.contactName === 'string' && raw.contactName) ||
      (typeof rawContact.name === 'string' && rawContact.name) ||
      'Kontak WhatsApp'

    const contact = {
      name: contactName,
      avatarUrl:
        typeof rawContact.avatarUrl === 'string' && rawContact.avatarUrl
          ? rawContact.avatarUrl
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: typeof rawContact.status === 'string' ? rawContact.status : 'online',
      isOnline: typeof rawContact.isOnline === 'boolean' ? rawContact.isOnline : true,
      isTyping: typeof rawContact.isTyping === 'boolean' ? rawContact.isTyping : false,
      isVerified: typeof rawContact.isVerified === 'boolean' ? rawContact.isVerified : false,
      isGroup: typeof rawContact.isGroup === 'boolean' ? rawContact.isGroup : false,
    }

    // Normalize Header
    const rawHeader = (typeof raw.header === 'object' && raw.header !== null ? raw.header : {}) as Record<string, unknown>
    const rawPinned = (typeof rawHeader.pinnedMessage === 'object' && rawHeader.pinnedMessage !== null
      ? rawHeader.pinnedMessage
      : {}) as Record<string, unknown>

    const header = {
      showCallButtons: typeof rawHeader.showCallButtons === 'boolean' ? rawHeader.showCallButtons : true,
      showSearchButton: typeof rawHeader.showSearchButton === 'boolean' ? rawHeader.showSearchButton : true,
      showMenuButton: typeof rawHeader.showMenuButton === 'boolean' ? rawHeader.showMenuButton : true,
      pinnedMessage: {
        enabled: typeof rawPinned.enabled === 'boolean' ? rawPinned.enabled : Boolean(rawPinned.text),
        title: typeof rawPinned.title === 'string' ? rawPinned.title : '',
        text: typeof rawPinned.text === 'string' ? rawPinned.text : '',
      },
    }

    // Normalize Mobile Status Bar
    const rawMobile = (typeof raw.mobileStatus === 'object' && raw.mobileStatus !== null
      ? raw.mobileStatus
      : {}) as Record<string, unknown>

    const mobileStatus = {
      showStatusBar: typeof rawMobile.showStatusBar === 'boolean' ? rawMobile.showStatusBar : true,
      time: typeof rawMobile.time === 'string' && rawMobile.time ? rawMobile.time : '20:56',
      batteryPercentage: typeof rawMobile.batteryPercentage === 'number' ? rawMobile.batteryPercentage : 80,
      isCharging: typeof rawMobile.isCharging === 'boolean' ? rawMobile.isCharging : false,
      signalStrength: ([1, 2, 3, 4].includes(rawMobile.signalStrength as number) ? rawMobile.signalStrength : 4) as 1 | 2 | 3 | 4,
      networkType: (['5G', '4G', 'LTE', 'WiFi'].includes(rawMobile.networkType as string) ? rawMobile.networkType : '5G') as '5G' | '4G' | 'LTE' | 'WiFi',
      showWifi: typeof rawMobile.showWifi === 'boolean' ? rawMobile.showWifi : true,
      showNotch: typeof rawMobile.showNotch === 'boolean' ? rawMobile.showNotch : true,
      showHomeIndicator: typeof rawMobile.showHomeIndicator === 'boolean' ? rawMobile.showHomeIndicator : true,
    }

    // Normalize Wallpaper
    const rawWall = (typeof raw.wallpaper === 'object' && raw.wallpaper !== null ? raw.wallpaper : {}) as Record<string, unknown>
    const wallpaper = {
      type: (['doodle', 'solid', 'custom'].includes(rawWall.type as string) ? rawWall.type : 'doodle') as 'doodle' | 'solid' | 'custom',
      solidColor: typeof rawWall.solidColor === 'string' ? rawWall.solidColor : '#0b141a',
      customImageUrl: typeof rawWall.customImageUrl === 'string' ? rawWall.customImageUrl : undefined,
      doodleOpacity: typeof rawWall.doodleOpacity === 'number' ? rawWall.doodleOpacity : 12,
    }

    // Normalize Messages Array
    const validMessageTypes: MessageType[] = ['text', 'image', 'audio', 'document', 'system', 'date_divider']
    const validStatuses: MessageStatus[] = ['clock', 'single', 'double_gray', 'double_blue']

    const normalizedMessages: ChatMessage[] = []

    for (let i = 0; i < raw.messages.length; i++) {
      const item = raw.messages[i]
      if (typeof item !== 'object' || item === null) {
        return {
          success: false,
          error: `Pesan pada urutan #${i + 1} tidak valid (harus berupa object).`,
        }
      }

      const m = item as Record<string, unknown>

      // Validate Sender
      const sender: 'me' | 'them' = m.sender === 'me' ? 'me' : 'them'

      // Validate Type
      const type: MessageType =
        typeof m.type === 'string' && validMessageTypes.includes(m.type as MessageType)
          ? (m.type as MessageType)
          : 'text'

      // Validate Text
      const text = typeof m.text === 'string' ? m.text : ''

      // Validate Time
      const time =
        typeof m.time === 'string' && m.time
          ? m.time
          : `${new Date().getHours().toString().padStart(2, '0')}.${new Date().getMinutes().toString().padStart(2, '0')}`

      // Validate Status
      const status: MessageStatus | undefined =
        sender === 'me'
          ? typeof m.status === 'string' && validStatuses.includes(m.status as MessageStatus)
            ? (m.status as MessageStatus)
            : 'double_blue'
          : undefined

      // Quoted reply
      let replyTo = undefined
      if (typeof m.replyTo === 'object' && m.replyTo !== null) {
        const r = m.replyTo as Record<string, unknown>
        replyTo = {
          id: typeof r.id === 'string' ? r.id : `reply_${i}`,
          senderName: typeof r.senderName === 'string' ? r.senderName : sender === 'me' ? contact.name : 'Anda',
          text: typeof r.text === 'string' ? r.text : '',
        }
      }

      // Reactions
      let reactions = undefined
      if (Array.isArray(m.reactions)) {
        reactions = m.reactions
          .filter((r) => typeof r === 'object' && r !== null && typeof r.emoji === 'string')
          .map((r) => ({
            emoji: r.emoji as string,
            count: typeof r.count === 'number' ? r.count : 1,
          }))
      }

      const msgObj: ChatMessage = {
        id: typeof m.id === 'string' && m.id ? m.id : `msg_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        sender,
        text,
        time,
        status,
        imageUrl: typeof m.imageUrl === 'string' ? m.imageUrl : undefined,
        imageCaption: typeof m.imageCaption === 'string' ? m.imageCaption : undefined,
        audioDuration: typeof m.audioDuration === 'string' ? m.audioDuration : undefined,
        audioProgress: typeof m.audioProgress === 'number' ? m.audioProgress : undefined,
        audioSpeed: typeof m.audioSpeed === 'string' ? m.audioSpeed : undefined,
        docName: typeof m.docName === 'string' ? m.docName : undefined,
        docSize: typeof m.docSize === 'string' ? m.docSize : undefined,
        docExt: typeof m.docExt === 'string' ? m.docExt : undefined,
        replyTo,
        reactions,
      }

      normalizedMessages.push(msgObj)
    }

    const finalState: FakeChatState = {
      platform,
      theme,
      contact,
      header,
      mobileStatus,
      wallpaper,
      messages: normalizedMessages,
      inputPlaceholder: typeof raw.inputPlaceholder === 'string' ? raw.inputPlaceholder : 'Ketik pesan',
      showMockupFrame: typeof raw.showMockupFrame === 'boolean' ? raw.showMockupFrame : false,
      zoomLevel: typeof raw.zoomLevel === 'number' ? raw.zoomLevel : 100,
    }

    return {
      success: true,
      data: finalState,
      messageCount: normalizedMessages.length,
    }
  } catch (err) {
    return {
      success: false,
      error: `Gagal memproses data JSON: ${(err as Error).message}`,
    }
  }
}

/**
 * Downloads a formatted JSON template to user's device
 */
export function downloadJsonTemplate(type: 'full' | 'minimal' = 'full') {
  const content = type === 'full' ? SAMPLE_TEMPLATE_JSON : SAMPLE_MINIMAL_JSON
  const jsonString = JSON.stringify(content, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = type === 'full' ? 'format-fake-whatsapp-chat.json' : 'format-minimal-fake-chat.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
