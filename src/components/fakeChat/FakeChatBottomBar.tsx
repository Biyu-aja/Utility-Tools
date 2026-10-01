/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatBottomBar.tsx (Renders WhatsApp bottom input bar for Desktop, Android, and iOS).
 */

import React from 'react'
import type { PlatformType, ThemeType } from '../../types/fakeChat'
import { Smile, Paperclip, Mic, Plus, Camera, Sticker } from 'lucide-react'

interface Props {
  platform: PlatformType
  theme: ThemeType
  placeholder?: string
  typedText?: string
  onSendText?: (text: string) => void
  showHomeIndicator?: boolean
}

export const FakeChatBottomBar: React.FC<Props> = ({
  platform,
  theme,
  placeholder = 'Ketik pesan',
  showHomeIndicator = true,
}) => {
  const isDark = theme === 'dark'

  // 1. DESKTOP / WHATSAPP WEB STYLE
  if (platform === 'desktop') {
    return (
      <div
        className={`px-4 py-2.5 flex items-center space-x-3 select-none border-t ${
          isDark
            ? 'bg-[#202c33] border-[#222d34] text-[#8696a0]'
            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f]'
        }`}
      >
        {/* Attachment Icon */}
        <button type="button" className="hover:opacity-80 transition-opacity p-1">
          <Paperclip className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Emoji Smiley */}
        <button type="button" className="hover:opacity-80 transition-opacity p-1">
          <Smile className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Text Input Box */}
        <div
          className={`flex-1 rounded-lg px-3 py-2 text-sm flex items-center ${
            isDark ? 'bg-[#2a3942] text-[#d1d7db]' : 'bg-[#ffffff] text-[#111b21]'
          }`}
        >
          <span className="opacity-60">{placeholder}</span>
        </div>

        {/* Mic Icon */}
        <button type="button" className="hover:opacity-80 transition-opacity p-1">
          <Mic className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    )
  }

  // 2. ANDROID STYLE
  if (platform === 'android') {
    return (
      <div className="w-full select-none pb-2 pt-1 px-2">
        <div className="flex items-center space-x-1.5">
          {/* Main Input Pill */}
          <div
            className={`flex-1 flex items-center space-x-2 px-3 py-2.5 rounded-full shadow-xs ${
              isDark ? 'bg-[#1f2c34] text-[#8696a0]' : 'bg-white text-[#54656f]'
            }`}
          >
            <Smile className="w-5 h-5 stroke-[1.8] shrink-0" />
            <span
              className={`flex-1 text-[14px] truncate ${
                isDark ? 'text-[#8696a0]' : 'text-zinc-500'
              }`}
            >
              {placeholder}
            </span>
            <Paperclip className="w-5 h-5 stroke-[1.8] shrink-0 -rotate-45" />
            <Camera className="w-5 h-5 stroke-[1.8] shrink-0" />
          </div>

          {/* Floating Circle Send/Mic Button */}
          <div className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md shrink-0">
            <Mic className="w-5 h-5" />
          </div>
        </div>

        {/* Optional Android navigation bar line */}
        {showHomeIndicator && (
          <div className="w-32 h-1 bg-current opacity-30 mx-auto mt-3 rounded-full" />
        )}
      </div>
    )
  }

  // 3. iOS STYLE
  return (
    <div
      className={`px-3 pt-2 pb-5 border-t select-none ${
        isDark ? 'bg-[#121b22] border-[#222d34]' : 'bg-[#f6f6f6] border-[#e2e8f0]'
      }`}
    >
      <div className="flex items-center space-x-2">
        {/* Plus Button */}
        <button
          type="button"
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDark ? 'text-[#00a884]' : 'text-[#007aff]'
          }`}
        >
          <Plus className="w-6 h-6 stroke-[2]" />
        </button>

        {/* Input Pill */}
        <div
          className={`flex-1 flex items-center justify-between px-3.5 py-1.5 rounded-2xl border text-sm ${
            isDark
              ? 'bg-[#1f2c34] border-[#2f3b43] text-[#8696a0]'
              : 'bg-white border-[#d1d7db] text-zinc-500'
          }`}
        >
          <span className="text-[14px]">{placeholder}</span>
          <Sticker className="w-4.5 h-4.5 opacity-60" />
        </div>

        {/* Camera */}
        <button type="button" className={`p-1.5 ${isDark ? 'text-[#00a884]' : 'text-[#007aff]'}`}>
          <Camera className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Mic */}
        <button type="button" className={`p-1.5 ${isDark ? 'text-[#00a884]' : 'text-[#007aff]'}`}>
          <Mic className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* iOS Home Indicator Pill */}
      {showHomeIndicator && (
        <div className="w-32 h-1 bg-current opacity-40 mx-auto mt-4 rounded-full" />
      )}
    </div>
  )
}
