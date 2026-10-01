/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatDesktopHeader.tsx (Desktop / WhatsApp Web Top Bar matching user screenshot).
 */

import React from 'react'
import type { ContactConfig, HeaderConfig, ThemeType } from '../../types/fakeChat'
import { Video, Phone, Search, MoreVertical, CheckCircle2 } from 'lucide-react'

interface Props {
  contact: ContactConfig
  header: HeaderConfig
  theme: ThemeType
}

export const FakeChatDesktopHeader: React.FC<Props> = ({ contact, header, theme }) => {
  const isDark = theme === 'dark'

  return (
    <div className="w-full select-none">
      {/* Desktop Header Bar */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b ${
          isDark
            ? 'bg-[#202c33] border-[#222d34] text-[#e9edef]'
            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
        }`}
      >
        {/* Left: Avatar + Contact Name + Status */}
        <div className="flex items-center space-x-3.5 min-w-0 flex-1 cursor-pointer">
          <div className="relative shrink-0">
            <img
              src={contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }}
            />
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#202c33] rounded-full" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-medium text-[15px] truncate tracking-tight">{contact.name}</span>
              {contact.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white shrink-0" />
              )}
            </div>
            {(contact.isTyping || contact.isOnline || contact.status) && (
              <div className={`text-[12px] truncate ${isDark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
                {contact.isTyping ? (
                  <span className="text-emerald-400 font-medium">sedang mengetik...</span>
                ) : contact.isOnline ? (
                  <span className="text-emerald-400 font-medium">online</span>
                ) : (
                  <span>{contact.status}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Icons (Video, Phone, Search, Menu) */}
        <div className={`flex items-center space-x-3.5 shrink-0 ${isDark ? 'text-[#aebac1]' : 'text-[#54656f]'}`}>
          {header.showCallButtons && (
            <>
              <button
                type="button"
                className="p-1 hover:text-white transition-colors"
                title="Panggilan video"
              >
                <Video className="w-5 h-5 stroke-[1.7]" />
              </button>
              <button
                type="button"
                className="p-1 hover:text-white transition-colors"
                title="Panggilan suara"
              >
                <Phone className="w-4.5 h-4.5 stroke-[1.7]" />
              </button>
            </>
          )}
          {header.showSearchButton && (
            <button
              type="button"
              className="p-1 hover:text-white transition-colors"
              title="Cari..."
            >
              <Search className="w-4.5 h-4.5 stroke-[2]" />
            </button>
          )}
          {header.showMenuButton && (
            <button
              type="button"
              className="p-1 hover:text-white transition-colors"
              title="Menu"
            >
              <MoreVertical className="w-4.5 h-4.5 stroke-[2]" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Message Bar (As seen in the user's reference screenshot: 📌 45.58.47.49 3TEtyff7CcvM2nzY) */}
      {header.pinnedMessage?.enabled && header.pinnedMessage.text && (
        <div
          className={`px-4 py-2 flex items-center justify-between text-xs border-b select-none ${
            isDark
              ? 'bg-[#111b21] border-[#222d34] text-[#e9edef]'
              : 'bg-[#ffffff] border-[#e9edef] text-[#111b21]'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <span className="text-sm opacity-80 shrink-0">📌</span>
            <div className="min-w-0 flex-1 font-mono text-[12px] opacity-90 truncate">
              {header.pinnedMessage.text}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
