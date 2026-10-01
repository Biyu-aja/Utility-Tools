/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatPreview.tsx (Main chat preview canvas rendering Desktop and Mobile modes).
 */

import React, { forwardRef } from 'react'
import type { FakeChatState, ChatMessage } from '../../types/fakeChat'
import { WHATSAPP_DOODLE_DATA_URL } from '../../utils/fakeChatDoodle'
import { FakeChatDesktopHeader } from './FakeChatDesktopHeader'
import { FakeChatMobileHeader } from './FakeChatMobileHeader'
import { FakeChatMobileStatusBar } from './FakeChatMobileStatusBar'
import { FakeChatMessageItem } from './FakeChatMessageItem'
import { FakeChatBottomBar } from './FakeChatBottomBar'

interface Props {
  state: FakeChatState
  onEditMessage?: (message: ChatMessage) => void
  onDeleteMessage?: (id: string) => void
}

export const FakeChatPreview = forwardRef<HTMLDivElement, Props>(
  ({ state, onEditMessage, onDeleteMessage }, ref) => {
    const isDark = state.theme === 'dark'
    const isDesktop = state.platform === 'desktop'

    // Background style configuration
    const backgroundStyle: React.CSSProperties = {
      backgroundColor:
        state.wallpaper.type === 'solid'
          ? state.wallpaper.solidColor
          : isDark
          ? '#0b141a'
          : '#efeae2',
      backgroundImage:
        state.wallpaper.type === 'custom' && state.wallpaper.customImageUrl
          ? `url(${state.wallpaper.customImageUrl})`
          : state.wallpaper.type === 'doodle'
          ? `url("${WHATSAPP_DOODLE_DATA_URL}")`
          : 'none',
      backgroundRepeat: 'repeat',
      backgroundSize: state.wallpaper.type === 'doodle' ? '412px 412px' : 'cover',
      backgroundPosition: 'center',
    }

    return (
      <div className="flex justify-center items-center p-2 sm:p-4 overflow-x-auto w-full">
        {/* Main Capture Element Ref */}
        <div
          ref={ref}
          className={`relative transition-all duration-200 overflow-hidden flex flex-col ${
            isDesktop
              ? 'w-full max-w-4xl min-h-[580px] rounded-2xl shadow-2xl border border-[#2f3b43]/40'
              : state.showMockupFrame
              ? 'w-full max-w-[390px] min-h-[720px] rounded-[42px] p-2 bg-[#1c1c1e] shadow-2xl border-4 border-zinc-800'
              : 'w-full max-w-[390px] min-h-[680px] rounded-2xl shadow-xl border border-zinc-700/30'
          }`}
          style={{
            transform: state.zoomLevel !== 100 ? `scale(${state.zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Inner Phone Screen Container (if mockup frame enabled) */}
          <div
            className={`w-full flex-1 flex flex-col relative overflow-hidden ${
              !isDesktop && state.showMockupFrame ? 'rounded-[34px]' : ''
            }`}
          >
            {/* 1. TOP HEADER & STATUS BAR */}
            {isDesktop ? (
              <FakeChatDesktopHeader
                contact={state.contact}
                header={state.header}
                theme={state.theme}
              />
            ) : (
              <div
                className={`w-full ${
                  isDark
                    ? 'bg-[#1f2c34]'
                    : state.platform === 'ios'
                    ? 'bg-[#f6f6f6]'
                    : 'bg-[#008069]'
                }`}
              >
                <FakeChatMobileStatusBar
                  config={state.mobileStatus}
                  platform={state.platform}
                  theme={state.theme}
                />
                <FakeChatMobileHeader
                  contact={state.contact}
                  header={state.header}
                  platform={state.platform}
                  theme={state.theme}
                />
              </div>
            )}

            {/* 2. CHAT MESSAGES BODY */}
            <div
              className="flex-1 p-3 sm:p-4 flex flex-col justify-end space-y-1 relative min-h-[360px] overflow-y-auto"
              style={backgroundStyle}
            >
              {/* Optional Doodle Opacity Overlay */}
              {state.wallpaper.type === 'doodle' && state.wallpaper.doodleOpacity !== 10 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: isDark ? '#0b141a' : '#efeae2',
                    opacity: 1 - state.wallpaper.doodleOpacity / 100,
                  }}
                />
              )}

              {/* Chat Messages */}
              <div className="relative z-10 space-y-1">
                {state.messages.length === 0 ? (
                  <div className="text-center py-12 select-none opacity-60">
                    <p className="text-sm font-medium">Belum ada pesan.</p>
                    <p className="text-xs mt-1">Gunakan panel di samping untuk menambahkan pesan chat baru!</p>
                  </div>
                ) : (
                  state.messages.map((msg, index) => {
                    const prevMsg = state.messages[index - 1]
                    const nextMsg = state.messages[index + 1]
                    const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender
                    const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender

                    return (
                      <FakeChatMessageItem
                        key={msg.id}
                        message={msg}
                        platform={state.platform}
                        theme={state.theme}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        onEdit={onEditMessage}
                        onDelete={onDeleteMessage}
                      />
                    )
                  })
                )}
              </div>
            </div>

            {/* 3. BOTTOM INPUT BAR */}
            <FakeChatBottomBar
              platform={state.platform}
              theme={state.theme}
              placeholder={state.inputPlaceholder}
              showHomeIndicator={!isDesktop && state.mobileStatus.showHomeIndicator}
            />
          </div>
        </div>
      </div>
    )
  }
)

FakeChatPreview.displayName = 'FakeChatPreview'
