/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatMessageItem.tsx (Renders individual chat bubble with authentic WhatsApp styling).
 */

import React from 'react'
import type { ChatMessage, PlatformType, ThemeType } from '../../types/fakeChat'
import { Check, CheckCheck, Clock, FileText, Play, Star, CornerDownRight } from 'lucide-react'

interface Props {
  message: ChatMessage
  platform?: PlatformType
  theme: ThemeType
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  onEdit?: (message: ChatMessage) => void
  onDelete?: (id: string) => void
}

/**
 * Parses simple WhatsApp formatting (*bold*, _italic_, ~strike~, `mono`)
 */
const formatWhatsAppText = (text: string) => {
  if (!text) return null

  // Split lines to preserve line breaks
  const lines = text.split('\n')

  return lines.map((line, lineIdx) => {
    // Monospace ```text```
    let formatted = line.replace(/```([^`]+)```/g, '<span class="font-mono bg-black/20 px-1 py-0.5 rounded text-[12px]">$1</span>')
    // Bold *text*
    formatted = formatted.replace(/\*([^*]+)\*/g, '<strong class="font-bold">$1</strong>')
    // Italic _text_
    formatted = formatted.replace(/_([^_]+)_/g, '<em class="italic">$1</em>')
    // Strikethrough ~text~
    formatted = formatted.replace(/~([^~]+)~/g, '<del class="line-through opacity-75">$1</del>')

    return (
      <React.Fragment key={lineIdx}>
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

export const FakeChatMessageItem: React.FC<Props> = ({
  message,
  theme,
  isFirstInGroup = true,
  onEdit,
}) => {
  const isDark = theme === 'dark'
  const isMe = message.sender === 'me'

  // Render Date Divider
  if (message.type === 'date_divider') {
    return (
      <div className="flex justify-center my-3 select-none">
        <div
          className={`px-3 py-1 rounded-lg text-[12px] font-medium shadow-2xs border ${
            isDark
              ? 'bg-[#182229] text-[#8696a0] border-[#222d34]'
              : 'bg-[#ffffff] text-[#54656f] border-[#e9edef]'
          }`}
        >
          {message.text}
        </div>
      </div>
    )
  }

  // Render System Message (e.g. End-to-end encryption)
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 px-6 select-none">
        <div
          className={`px-3.5 py-1.5 rounded-lg text-[11.5px] text-center max-w-md shadow-2xs leading-relaxed border ${
            isDark
              ? 'bg-[#182229]/90 text-[#ffd279] border-[#2f3b43]'
              : 'bg-[#ffeecd] text-[#54656f] border-[#fae2a6]'
          }`}
        >
          {message.text}
        </div>
      </div>
    )
  }

  // Render status icon
  const renderStatusIcon = () => {
    if (!isMe) return null

    switch (message.status) {
      case 'clock':
        return <Clock className="w-3 h-3 text-[#8696a0]" />
      case 'single':
        return <Check className="w-3.5 h-3.5 text-[#8696a0] stroke-[2]" />
      case 'double_gray':
        return <CheckCheck className="w-4 h-4 text-[#8696a0] stroke-[2]" />
      case 'double_blue':
      default:
        return <CheckCheck className="w-4 h-4 text-[#53bdeb] stroke-[2.2]" />
    }
  }

  // Bubble colors
  const bubbleBg = isMe
    ? isDark
      ? 'bg-[#005c4b] text-[#e9edef]'
      : 'bg-[#d9fdd3] text-[#111b21]'
    : isDark
    ? 'bg-[#202c33] text-[#e9edef]'
    : 'bg-[#ffffff] text-[#111b21]'

  // Tail style
  const tailRadius = isMe
    ? isFirstInGroup
      ? 'rounded-2xl rounded-tr-xs'
      : 'rounded-2xl'
    : isFirstInGroup
    ? 'rounded-2xl rounded-tl-xs'
    : 'rounded-2xl'

  return (
    <div
      className={`group relative flex w-full mb-1 transition-opacity ${
        isMe ? 'justify-end' : 'justify-start'
      }`}
      onClick={() => onEdit?.(message)}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-2.5 pt-1.5 pb-1.5 shadow-2xs ${bubbleBg} ${tailRadius} transition-all select-none`}
      >
        {/* Forwarded Tag */}
        {message.isForwarded && (
          <div className="flex items-center space-x-1 text-[11px] italic text-[#8696a0] mb-1">
            <CornerDownRight className="w-3 h-3" />
            <span>Diteruskan</span>
          </div>
        )}

        {/* Group Sender Name (if not sent by me) */}
        {!isMe && message.senderName && (
          <div
            className="text-[12px] font-semibold mb-1"
            style={{ color: message.senderColor || '#06cf9c' }}
          >
            {message.senderName}
          </div>
        )}

        {/* Quoted / Reply Box */}
        {message.replyTo && (
          <div
            className={`rounded-md p-2 mb-1.5 border-l-4 text-xs select-none ${
              isDark
                ? isMe
                  ? 'bg-[#025144]/80 border-[#06cf9c]'
                  : 'bg-[#182229]/90 border-[#ff9f00]'
                : isMe
                ? 'bg-[#c2f1b8]/80 border-[#00a884]'
                : 'bg-[#f0f2f5] border-[#53bdeb]'
            }`}
          >
            <div
              className={`font-semibold text-[11.5px] ${
                isMe ? 'text-[#06cf9c]' : isDark ? 'text-[#ff9f00]' : 'text-[#008069]'
              }`}
            >
              {message.replyTo.senderName}
            </div>
            <div className={`text-[11.5px] truncate opacity-80 ${isDark ? 'text-[#d1d7db]' : 'text-[#3b4a54]'}`}>
              {message.replyTo.text}
            </div>
          </div>
        )}

        {/* Image Content */}
        {message.type === 'image' && message.imageUrl && (
          <div className="rounded-lg overflow-hidden my-0.5 max-w-full">
            <img
              src={message.imageUrl}
              alt="Sent media"
              className="w-full max-h-80 object-cover rounded-lg"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'
              }}
            />
            {message.imageCaption && (
              <div className="pt-1.5 text-[13.5px] leading-snug">
                {formatWhatsAppText(message.imageCaption)}
              </div>
            )}
          </div>
        )}

        {/* Voice Note / Audio Content */}
        {message.type === 'audio' && (
          <div className="flex items-center space-x-3 py-1 px-1 min-w-[210px]">
            {/* Play/Pause Circle */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                isMe
                  ? isDark
                    ? 'bg-[#06cf9c] text-black'
                    : 'bg-[#00a884] text-white'
                  : isDark
                  ? 'bg-[#06cf9c] text-black'
                  : 'bg-[#00a884] text-white'
              }`}
            >
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>

            {/* Waveform Visualization */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-0.5 h-6">
                {[4, 7, 12, 16, 9, 14, 20, 18, 10, 6, 15, 22, 14, 8, 12, 18, 9, 5, 12, 16, 10, 4].map(
                  (h, i) => (
                    <div
                      key={i}
                      className={`w-0.5 rounded-full ${
                        i <= ((message.audioProgress || 50) / 100) * 22
                          ? isDark
                            ? 'bg-[#06cf9c]'
                            : 'bg-[#00a884]'
                          : isDark
                          ? 'bg-[#8696a0]/50'
                          : 'bg-[#8696a0]/40'
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  )
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] opacity-75 mt-0.5">
                <span>{message.audioDuration || '0:32'}</span>
                {message.audioSpeed && (
                  <span className="px-1 py-0.2 rounded bg-black/20 text-[9px] font-bold">
                    {message.audioSpeed}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Content */}
        {message.type === 'document' && (
          <div
            className={`flex items-center space-x-3 p-2 rounded-lg mb-1 ${
              isDark ? 'bg-black/20' : 'bg-black/5'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[13px] truncate">{message.docName || 'Dokumen.pdf'}</div>
              <div className="text-[11px] opacity-75">
                {message.docPages ? `${message.docPages} • ` : ''}
                {message.docSize || '1.2 MB'} • {message.docExt || 'PDF'}
              </div>
            </div>
          </div>
        )}

        {/* Text Message Content */}
        {message.type === 'text' && (
          <div className="text-[13.8px] leading-[1.35] break-words pr-1">
            {message.isDeleted ? (
              <span className="italic text-[#8696a0] flex items-center space-x-1">
                <span>🚫 Pesan ini telah dihapus</span>
              </span>
            ) : (
              formatWhatsAppText(message.text)
            )}
          </div>
        )}

        {/* Timestamp, Star, Status Checkmarks */}
        <div className="flex items-center justify-end space-x-1 text-[11px] text-[#8696a0] mt-0.5 select-none float-right ml-2 -mb-0.5">
          {message.isStarred && <Star className="w-2.5 h-2.5 fill-current text-[#ffd279]" />}
          <span className="text-[10.5px] tracking-tight">{message.time}</span>
          {renderStatusIcon()}
        </div>

        {/* Reactions Pill (e.g. 🙂, ❤️, 😂) */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-2.5 right-2 px-1.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm border text-[11px] ${
              isDark
                ? 'bg-[#202c33] border-[#2f3b43] text-white'
                : 'bg-white border-[#e9edef] text-zinc-900'
            }`}
          >
            {message.reactions.map((r, i) => (
              <span key={i} className="leading-none">
                {r.emoji}
                {r.count && r.count > 1 ? ` ${r.count}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
