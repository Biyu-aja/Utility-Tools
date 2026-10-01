/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatMobileHeader.tsx (Mobile WhatsApp Top Bar for Android & iOS).
 */

import React from 'react'
import type { ContactConfig, HeaderConfig, PlatformType, ThemeType } from '../../types/fakeChat'
import { ArrowLeft, Video, Phone, MoreVertical, CheckCircle2, ChevronLeft, Pin } from 'lucide-react'

interface Props {
  contact: ContactConfig
  header: HeaderConfig
  platform: PlatformType
  theme: ThemeType
}

export const FakeChatMobileHeader: React.FC<Props> = ({ contact, header, platform, theme }) => {
  const isDark = theme === 'dark'
  const isIOS = platform === 'ios'

  return (
    <div className="w-full select-none">
      {/* Header Bar */}
      <div
        className={`px-3 py-2 flex items-center justify-between border-b ${
          isDark
            ? 'bg-[#1f2c34] border-[#2f3b43] text-[#e9edef]'
            : isIOS
            ? 'bg-[#f6f6f6] border-[#e2e8f0] text-[#111b21]'
            : 'bg-[#008069] border-transparent text-white'
        }`}
      >
        {/* Left Section: Back arrow + Avatar + Name */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <button type="button" className="p-1 -ml-1 text-current hover:opacity-80 transition-opacity">
            {isIOS ? <ChevronLeft className="w-6 h-6 stroke-[2.5]" /> : <ArrowLeft className="w-5 h-5 stroke-[2]" />}
          </button>

          {/* Avatar with optional online dot */}
          <div className="relative shrink-0">
            <img
              src={contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover shadow-xs"
              onError={(e) => {
                // Fallback avatar
                ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }}
            />
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1f2c34] rounded-full" />
            )}
          </div>

          {/* Name and status */}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[15px] truncate">{contact.name}</span>
              {contact.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white shrink-0" />
              )}
            </div>
            <div className={`text-[12px] truncate ${isDark ? 'text-[#8696a0]' : isIOS ? 'text-zinc-500' : 'text-emerald-100'}`}>
              {contact.isTyping ? (
                <span className="text-emerald-400 font-medium">sedang mengetik...</span>
              ) : contact.isOnline ? (
                <span className="text-emerald-400 font-medium">online</span>
              ) : (
                <span>{contact.status || 'terakhir dilihat baru saja'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Action Icons */}
        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          {header.showCallButtons && (
            <>
              <button type="button" className="p-2 text-current hover:opacity-80 transition-opacity">
                <Video className="w-5 h-5 stroke-[1.8]" />
              </button>
              <button type="button" className="p-2 text-current hover:opacity-80 transition-opacity">
                <Phone className="w-4.5 h-4.5 stroke-[1.8]" />
              </button>
            </>
          )}
          {header.showMenuButton && (
            <button type="button" className="p-2 text-current hover:opacity-80 transition-opacity">
              <MoreVertical className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Message Banner */}
      {header.pinnedMessage?.enabled && header.pinnedMessage.text && (
        <div
          className={`px-3 py-1.5 flex items-center justify-between text-xs border-b transition-colors ${
            isDark ? 'bg-[#182229] border-[#222d34] text-[#e9edef]' : 'bg-[#ffffff] border-[#e2e8f0] text-[#111b21]'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Pin className="w-3 h-3 rotate-45" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[11px] text-emerald-500">Pesan yang Disematkan</div>
              <p className="truncate text-[12px] opacity-90">{header.pinnedMessage.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
