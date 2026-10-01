/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatEditor.tsx (Comprehensive sidebar editor and controls panel).
 */

import React, { useState } from 'react'
import type {
  FakeChatState,
  ChatMessage,
  MessageType,
  MessageStatus,
} from '../../types/fakeChat'
import { DEFAULT_AVATARS, PRESET_CHATS } from '../../utils/fakeChatPresets'
import { downloadJsonTemplate, validateAndParseChatJson } from '../../utils/fakeChatJsonHelper'
import { FakeChatJsonModal } from './FakeChatJsonModal'
import {
  MessageSquare,
  User,
  Palette,
  Smartphone,
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Upload,
  Download,
  Copy,
  Check,
  Pin,
  FileCode,
} from 'lucide-react'

interface Props {
  state: FakeChatState
  onChange: (newState: FakeChatState) => void
  onExportImage: () => void
  onCopyImage: () => void
  onToastMessage: (msg: string) => void
  isExporting: boolean
  isCopied: boolean
}

export const FakeChatEditor: React.FC<Props> = ({
  state,
  onChange,
  onExportImage,
  onCopyImage,
  onToastMessage,
  isExporting,
  isCopied,
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'contact' | 'appearance' | 'statusbar' | 'presets'>('messages')
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false)

  // New Message Form State
  const [msgSender, setMsgSender] = useState<'me' | 'them'>('them')
  const [msgType, setMsgType] = useState<MessageType>('text')
  const [msgText, setMsgText] = useState('')
  const [msgTime, setMsgTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [msgStatus, setMsgStatus] = useState<MessageStatus>('double_blue')
  const [msgReaction, setMsgReaction] = useState<string>('')
  const [msgReplyId, setMsgReplyId] = useState<string>('')
  const [msgImageUrl, setMsgImageUrl] = useState<string>('')
  const [msgImageCaption, setMsgImageCaption] = useState<string>('')
  const [msgAudioDuration, setMsgAudioDuration] = useState<string>('0:34')
  const [msgDocName, setMsgDocName] = useState<string>('Laporan_Projek.pdf')
  const [msgDocSize, setMsgDocSize] = useState<string>('2.4 MB')
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)

  // Quick Emoji reactions list
  const quickReactions = ['🙂', '❤️', '😂', '🔥', '👍', '🙏', '😮', '😢', '👏', '🎉']

  // Handle Add or Update Message
  const handleSaveMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (msgType === 'text' && !msgText.trim()) return
    if (msgType === 'date_divider' && !msgText.trim()) return

    // Find quoted message if selected
    let replyObj = undefined
    if (msgReplyId) {
      const targetMsg = state.messages.find((m) => m.id === msgReplyId)
      if (targetMsg) {
        replyObj = {
          id: targetMsg.id,
          senderName: targetMsg.sender === 'me' ? 'Anda' : state.contact.name,
          text: targetMsg.type === 'text' ? targetMsg.text : targetMsg.imageCaption || `[${targetMsg.type}]`,
        }
      }
    }

    const newMessage: ChatMessage = {
      id: editingMsgId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: msgType,
      sender: msgSender,
      text: msgText,
      time: msgTime,
      status: msgSender === 'me' ? msgStatus : undefined,
      imageUrl: msgType === 'image' ? msgImageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80' : undefined,
      imageCaption: msgType === 'image' ? msgImageCaption : undefined,
      audioDuration: msgType === 'audio' ? msgAudioDuration : undefined,
      audioProgress: msgType === 'audio' ? 65 : undefined,
      audioSpeed: msgType === 'audio' ? '1.5x' : undefined,
      docName: msgType === 'document' ? msgDocName : undefined,
      docSize: msgType === 'document' ? msgDocSize : undefined,
      docExt: msgType === 'document' ? (msgDocName.split('.').pop()?.toUpperCase() || 'PDF') : undefined,
      replyTo: replyObj,
      reactions: msgReaction ? [{ emoji: msgReaction, count: 1 }] : undefined,
    }

    if (editingMsgId) {
      // Update existing
      onChange({
        ...state,
        messages: state.messages.map((m) => (m.id === editingMsgId ? newMessage : m)),
      })
      setEditingMsgId(null)
      onToastMessage('Pesan berhasil diperbarui!')
    } else {
      // Add new
      onChange({
        ...state,
        messages: [...state.messages, newMessage],
      })
    }

    // Reset input text & reactions
    setMsgText('')
    setMsgImageCaption('')
    setMsgReaction('')
    setMsgReplyId('')
  }

  // Load message into form for editing
  const handleEditClick = (msg: ChatMessage) => {
    setEditingMsgId(msg.id)
    setMsgSender(msg.sender)
    setMsgType(msg.type)
    setMsgText(msg.text || '')
    setMsgTime(msg.time || '')
    setMsgStatus(msg.status || 'double_blue')
    setMsgReaction(msg.reactions?.[0]?.emoji || '')
    setMsgReplyId(msg.replyTo?.id || '')
    setMsgImageUrl(msg.imageUrl || '')
    setMsgImageCaption(msg.imageCaption || '')
    setMsgAudioDuration(msg.audioDuration || '0:34')
    setMsgDocName(msg.docName || 'Dokumen.pdf')
    setMsgDocSize(msg.docSize || '2.4 MB')
    setActiveTab('messages')
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMsgId(null)
    setMsgText('')
    setMsgReaction('')
    setMsgReplyId('')
  }

  // Delete message
  const handleDeleteMessage = (id: string) => {
    onChange({
      ...state,
      messages: state.messages.filter((m) => m.id !== id),
    })
    if (editingMsgId === id) handleCancelEdit()
    onToastMessage('Pesan dihapus.')
  }

  // Move message position
  const handleMoveMessage = (index: number, direction: 'up' | 'down') => {
    const newMessages = [...state.messages]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newMessages.length) return
    const temp = newMessages[index]
    newMessages[index] = newMessages[targetIndex]
    newMessages[targetIndex] = temp
    onChange({ ...state, messages: newMessages })
  }

  // Handle Custom Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange({
          ...state,
          contact: { ...state.contact, avatarUrl: event.target.result as string },
        })
        onToastMessage('Foto profil kontak berhasil diperbarui!')
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle Custom Media Upload for Image Messages
  const handleImageMsgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setMsgImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle Wallpaper Upload
  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange({
          ...state,
          wallpaper: {
            ...state.wallpaper,
            type: 'custom',
            customImageUrl: event.target.result as string,
          },
        })
        onToastMessage('Wallpaper kustom berhasil diterapkan!')
      }
    }
    reader.readAsDataURL(file)
  }

  // Direct File JSON Import with validation
  const handleDirectJsonFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const result = validateAndParseChatJson(text)
      if (result.success && result.data) {
        onChange(result.data)
        onToastMessage(`Berhasil import file JSON! (${result.messageCount} pesan dimuat otomatis).`)
      } else {
        alert(`Format file JSON tidak sesuai:\n${result.error}`)
      }
    }
    reader.readAsText(file)
    // Reset file input value
    e.target.value = ''
  }

  return (
    <div className="bg-bg-card border border-border-main rounded-3xl p-5 shadow-xs space-y-6">
      {/* JSON Import & Schema Modal */}
      <FakeChatJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onApplyJson={(newState) => {
          onChange(newState)
          onToastMessage('Data JSON berhasil diterapkan secara otomatis!')
        }}
      />

      {/* Quick Controls Header: Platform, Theme, Import JSON & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-main">
        {/* Platform Selector */}
        <div className="flex items-center p-1 bg-bg-hover rounded-2xl border border-border-main text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...state, platform: 'desktop' })}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              state.platform === 'desktop'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Desktop (Web)
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, platform: 'android' })}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              state.platform === 'android'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, platform: 'ios' })}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              state.platform === 'ios'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            iPhone (iOS)
          </button>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center p-1 bg-bg-hover rounded-2xl border border-border-main text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...state, theme: 'dark' })}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              state.theme === 'dark'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            🌙 Dark Mode
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, theme: 'light' })}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              state.theme === 'light'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            ☀️ Light Mode
          </button>
        </div>

        {/* Import JSON & Export Buttons */}
        <div className="flex items-center space-x-2">
          {/* Prominent Import JSON button */}
          <button
            type="button"
            onClick={() => setIsJsonModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Import data chat dari format JSON"
          >
            <FileCode className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={onCopyImage}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-bg-hover hover:bg-border-main text-text-main border border-border-main rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Salin screenshot ke clipboard"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Tersalin!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={onExportImage}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Merender...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-border-main overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          data-tab="messages"
          onClick={() => setActiveTab('messages')}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'messages'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Kelola Pesan ({state.messages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Kontak & Header</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Wallpaper & Tampilan</span>
        </button>

        {state.platform !== 'desktop' && (
          <button
            type="button"
            onClick={() => setActiveTab('statusbar')}
            className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'statusbar'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Status Bar HP</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'presets'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Presets & JSON</span>
        </button>
      </div>

      {/* TAB 1: KELOLA PESAN */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Add / Edit Message Form */}
          <div className="p-4 rounded-2xl bg-bg-hover/70 border border-border-main space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {editingMsgId ? '✏️ Edit Pesan' : '➕ Tambah Pesan Baru'}
              </span>
              {editingMsgId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {/* Sender & Type Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sender Toggle */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Pengirim:</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-bg-card rounded-xl border border-border-main text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMsgSender('them')}
                    className={`py-1.5 px-2 rounded-lg transition-all ${
                      msgSender === 'them'
                        ? 'bg-zinc-700 text-white shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    👤 Kontak ({state.contact.name.split(' ')[0]})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgSender('me')}
                    className={`py-1.5 px-2 rounded-lg transition-all ${
                      msgSender === 'me'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    🟢 Saya (Anda)
                  </button>
                </div>
              </div>

              {/* Message Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Tipe Pesan:</label>
                <select
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value as MessageType)}
                  aria-label="Tipe Pesan"
                  className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs font-medium text-text-main focus:outline-primary"
                >
                  <option value="text">💬 Pesan Teks</option>
                  <option value="image">🖼️ Foto / Gambar</option>
                  <option value="audio">🎙️ Voice Note (VN)</option>
                  <option value="document">📄 Dokumen / PDF</option>
                  <option value="date_divider">📅 Pemisah Tanggal</option>
                  <option value="system">🔒 Pesan Sistem (Enkripsi)</option>
                </select>
              </div>
            </div>

            {/* Content Input depending on Message Type */}
            {msgType === 'text' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-muted">Isi Pesan:</label>
                  {/* Quick WhatsApp Markdown helpers */}
                  <div className="flex items-center space-x-1 text-[11px] text-text-muted">
                    <button
                      type="button"
                      onClick={() => setMsgText((prev) => `${prev}*tebal*`)}
                      className="px-1.5 py-0.5 bg-bg-card hover:bg-border-main rounded border border-border-main font-bold"
                      title="Tebal: *teks*"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgText((prev) => `${prev}_miring_`)}
                      className="px-1.5 py-0.5 bg-bg-card hover:bg-border-main rounded border border-border-main italic"
                      title="Miring: _teks_"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgText((prev) => `${prev}~coret~`)}
                      className="px-1.5 py-0.5 bg-bg-card hover:bg-border-main rounded border border-border-main line-through"
                      title="Coret: ~teks~"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgText((prev) => `${prev}\`\`\`kode\`\`\``)}
                      className="px-1.5 py-0.5 bg-bg-card hover:bg-border-main rounded border border-border-main font-mono"
                      title="Monospace: ```teks```"
                    >
                      Mono
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Ketik isi pesan di sini... (mendukung *bold*, _italic_, ~strike~, ```mono```)"
                  className="w-full p-3 bg-bg-card border border-border-main rounded-xl text-sm text-text-main placeholder:text-text-muted/60 focus:outline-primary resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSaveMessage()
                    }
                  }}
                />
              </div>
            )}

            {msgType === 'image' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Upload Gambar / Foto:</label>
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-bg-card border border-dashed border-border-main hover:border-primary rounded-xl cursor-pointer transition-colors text-xs font-medium text-text-main">
                      <Upload className="w-4 h-4 text-primary" />
                      <span>Pilih File Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageMsgUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Atau URL Gambar:</label>
                  <input
                    type="url"
                    value={msgImageUrl}
                    onChange={(e) => setMsgImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Keterangan / Caption (Opsional):</label>
                  <input
                    type="text"
                    value={msgImageCaption}
                    onChange={(e) => setMsgImageCaption(e.target.value)}
                    placeholder="Tulis caption foto..."
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                  />
                </div>
              </div>
            )}

            {msgType === 'audio' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted">Durasi VN (e.g. 0:42):</label>
                  <input
                    type="text"
                    value={msgAudioDuration}
                    onChange={(e) => setMsgAudioDuration(e.target.value)}
                    placeholder="0:42"
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Status VN:</label>
                  <div className="text-xs p-2 text-text-muted bg-bg-card rounded-xl border border-border-main">
                    🎙️ Voice Note Visual
                  </div>
                </div>
              </div>
            )}

            {msgType === 'document' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted">Nama File Dokumen:</label>
                  <input
                    type="text"
                    value={msgDocName}
                    onChange={(e) => setMsgDocName(e.target.value)}
                    placeholder="Tugas_Final.pdf"
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Ukuran File:</label>
                  <input
                    type="text"
                    value={msgDocSize}
                    onChange={(e) => setMsgDocSize(e.target.value)}
                    placeholder="2.4 MB"
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                  />
                </div>
              </div>
            )}

            {msgType === 'date_divider' && (
              <div>
                <label className="text-xs font-semibold text-text-muted">Teks Tanggal:</label>
                <input
                  type="text"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Kemarin / Hari ini / 28 September 2026"
                  className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                />
              </div>
            )}

            {msgType === 'system' && (
              <div>
                <label className="text-xs font-semibold text-text-muted">Teks Notifikasi Sistem:</label>
                <input
                  type="text"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="🔒 Pesan dan panggilan terenkripsi secara end-to-end..."
                  className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                />
              </div>
            )}

            {/* Additional Meta: Time, Status, Reply & Reactions */}
            {msgType !== 'date_divider' && msgType !== 'system' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-main/60">
                {/* Time */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Jam Kirim:</label>
                  <input
                    type="text"
                    value={msgTime}
                    onChange={(e) => setMsgTime(e.target.value)}
                    placeholder="19.34"
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                  />
                </div>

                {/* Status Ticks (If sent by me) */}
                {msgSender === 'me' ? (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Status Centang:</label>
                    <select
                      value={msgStatus}
                      onChange={(e) => setMsgStatus(e.target.value as MessageStatus)}
                      aria-label="Status Centang"
                      className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs font-medium text-text-main focus:outline-primary"
                    >
                      <option value="double_blue">🔵 Centang 2 Biru (Dibaca)</option>
                      <option value="double_gray">✔️✔️ Centang 2 Abu (Terkirim)</option>
                      <option value="single">✔️ Centang 1 (Terkirim server)</option>
                      <option value="clock">⏳ Jam (Tertunda)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Reaksi Emoji:</label>
                    <div className="flex items-center space-x-1">
                      {quickReactions.slice(0, 5).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setMsgReaction(msgReaction === emoji ? '' : emoji)}
                          className={`p-1.5 rounded-lg text-sm transition-all ${
                            msgReaction === emoji
                              ? 'bg-primary/20 border border-primary scale-110'
                              : 'bg-bg-card border border-border-main hover:bg-border-main'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quoted Reply Selection */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Balas Pesan (Reply):</label>
                  <select
                    value={msgReplyId}
                    onChange={(e) => setMsgReplyId(e.target.value)}
                    aria-label="Balas Pesan"
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary truncate"
                  >
                    <option value="">-- Tidak Membalas --</option>
                    {state.messages
                      .filter((m) => m.type === 'text' || m.type === 'image')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.sender === 'me' ? 'Anda' : state.contact.name}: {m.text || m.imageCaption || '[Foto]'}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleSaveMessage()}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingMsgId ? 'Simpan Perubahan' : 'Tambahkan Pesan ke Chat'}</span>
            </button>
          </div>

          {/* Messages Reorder & Delete List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Daftar Pesan ({state.messages.length})
              </span>
              {state.messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...state, messages: [] })
                    onToastMessage('Semua pesan telah dikosongkan.')
                  }}
                  className="text-xs text-red-500 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {state.messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                    msg.id === editingMsgId
                      ? 'border-primary bg-primary/5'
                      : 'border-border-main bg-bg-card hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        msg.sender === 'me'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {msg.sender === 'me' ? 'Anda' : 'Kontak'}
                    </span>
                    <span className="text-text-muted text-[11px] shrink-0">{msg.time}</span>
                    <p className="truncate font-medium text-text-main flex-1">
                      {msg.type === 'text'
                        ? msg.text
                        : msg.type === 'image'
                        ? `[Foto] ${msg.imageCaption || ''}`
                        : msg.type === 'audio'
                        ? `[Voice Note ${msg.audioDuration}]`
                        : msg.type === 'document'
                        ? `[Dokumen] ${msg.docName}`
                        : `[${msg.type}] ${msg.text}`}
                    </p>
                    {msg.replyTo && (
                      <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded shrink-0">
                        ↩️ Reply
                      </span>
                    )}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <span className="text-sm shrink-0">{msg.reactions[0].emoji}</span>
                    )}
                  </div>

                  {/* Actions: Move Up, Move Down, Edit, Delete */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveMessage(idx, 'up')}
                      className="p-1 text-text-muted hover:text-text-main disabled:opacity-20 cursor-pointer"
                      title="Geser ke atas"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === state.messages.length - 1}
                      onClick={() => handleMoveMessage(idx, 'down')}
                      className="p-1 text-text-muted hover:text-text-main disabled:opacity-20 cursor-pointer"
                      title="Geser ke bawah"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditClick(msg)}
                      className="p-1 text-primary hover:text-primary-hover cursor-pointer"
                      title="Edit pesan"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1 text-red-500 hover:text-red-600 cursor-pointer"
                      title="Hapus pesan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KONTAK & HEADER */}
      {activeTab === 'contact' && (
        <div className="space-y-5">
          {/* Contact Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Nama Kontak / Grup:</label>
              <input
                type="text"
                value={state.contact.name}
                onChange={(e) =>
                  onChange({
                    ...state,
                    contact: { ...state.contact, name: e.target.value },
                  })
                }
                placeholder="Rpl Keisya[1]"
                className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-sm font-semibold text-text-main focus:outline-primary"
              />
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-muted">Foto Profil Kontak:</label>
              <div className="flex items-center space-x-3">
                <img
                  src={state.contact.avatarUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-border-main"
                />
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-bg-hover hover:bg-border-main border border-border-main rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>Upload Foto Sendiri</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                    {DEFAULT_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...state,
                            contact: { ...state.contact, avatarUrl: av.url },
                          })
                        }
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${
                          state.contact.avatarUrl === av.url
                            ? 'border-primary scale-110'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Text & Online Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Status Subtitle:</label>
                <input
                  type="text"
                  value={state.contact.status}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      contact: { ...state.contact, status: e.target.value },
                    })
                  }
                  placeholder="online / sedang mengetik... / terakhir dilihat..."
                  className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.contact.isOnline}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        contact: { ...state.contact, isOnline: e.target.checked },
                      })
                    }
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>🟢 Sedang Online</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.contact.isVerified}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        contact: { ...state.contact, isVerified: e.target.checked },
                      })
                    }
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>✅ Akun Verified</span>
                </label>
              </div>
            </div>

            {/* Pinned Message Settings (As in user screenshot) */}
            <div className="p-4 rounded-2xl bg-bg-hover/70 border border-border-main space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer text-text-main">
                  <Pin className="w-4 h-4 text-emerald-500" />
                  <span>Sematkan Pesan di Atas (Pinned Message)</span>
                </label>
                <input
                  type="checkbox"
                  checked={state.header.pinnedMessage?.enabled || false}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      header: {
                        ...state.header,
                        pinnedMessage: {
                          enabled: e.target.checked,
                          text: state.header.pinnedMessage?.text || '45.58.47.49 3TEtyff7CcvM2nzY',
                        },
                      },
                    })
                  }
                  className="rounded text-primary focus:ring-primary"
                />
              </div>

              {state.header.pinnedMessage?.enabled && (
                <div>
                  <input
                    type="text"
                    value={state.header.pinnedMessage.text}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        header: {
                          ...state.header,
                          pinnedMessage: {
                            ...state.header.pinnedMessage!,
                            text: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="45.58.47.49 3TEtyff7CcvM2nzY"
                    className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs font-mono text-text-main focus:outline-primary"
                  />
                </div>
              )}
            </div>

            {/* Header Action Icons Toggle */}
            <div className="p-3 bg-bg-card rounded-2xl border border-border-main space-y-2">
              <span className="text-xs font-bold text-text-muted">Tombol Header:</span>
              <div className="flex flex-wrap gap-4 text-xs font-medium">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.header.showCallButtons}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        header: { ...state.header, showCallButtons: e.target.checked },
                      })
                    }
                  />
                  <span>Panggilan Suara & Video</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.header.showSearchButton}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        header: { ...state.header, showSearchButton: e.target.checked },
                      })
                    }
                  />
                  <span>Tombol Cari</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WALLPAPER & TAMPILAN */}
      {activeTab === 'appearance' && (
        <div className="space-y-5">
          {/* Frame Mockup Toggle */}
          {state.platform !== 'desktop' && (
            <div className="p-4 rounded-2xl bg-bg-hover/70 border border-border-main flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main">Bingkai Smartphone (Mockup Frame)</span>
                <p className="text-[11px] text-text-muted">Tampilkan bodi HP di sekitar chat</p>
              </div>
              <input
                type="checkbox"
                checked={state.showMockupFrame}
                onChange={(e) => onChange({ ...state, showMockupFrame: e.target.checked })}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
            </div>
          )}

          {/* Wallpaper Type */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-text-muted">Latar Belakang (Wallpaper):</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => onChange({ ...state, wallpaper: { ...state.wallpaper, type: 'doodle' } })}
                className={`py-2.5 px-3 rounded-xl border transition-all ${
                  state.wallpaper.type === 'doodle'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-main bg-bg-card text-text-muted hover:text-text-main'
                }`}
              >
                ✨ WhatsApp Doodle
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...state, wallpaper: { ...state.wallpaper, type: 'solid' } })}
                className={`py-2.5 px-3 rounded-xl border transition-all ${
                  state.wallpaper.type === 'solid'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-main bg-bg-card text-text-muted hover:text-text-main'
                }`}
              >
                🎨 Warna Polos
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...state, wallpaper: { ...state.wallpaper, type: 'custom' } })}
                className={`py-2.5 px-3 rounded-xl border transition-all ${
                  state.wallpaper.type === 'custom'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-main bg-bg-card text-text-muted hover:text-text-main'
                }`}
              >
                🖼️ Upload Foto
              </button>
            </div>

            {/* Doodle Opacity Slider */}
            {state.wallpaper.type === 'doodle' && (
              <div className="p-3 bg-bg-card rounded-2xl border border-border-main space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
                  <span>Kejelasan Doodle Pattern:</span>
                  <span>{state.wallpaper.doodleOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.wallpaper.doodleOpacity}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      wallpaper: { ...state.wallpaper, doodleOpacity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>
            )}

            {/* Solid Color Picker */}
            {state.wallpaper.type === 'solid' && (
              <div className="flex items-center space-x-3 p-3 bg-bg-card rounded-2xl border border-border-main">
                <input
                  type="color"
                  value={state.wallpaper.solidColor}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      wallpaper: { ...state.wallpaper, solidColor: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-xl cursor-pointer"
                />
                <span className="text-xs font-mono">{state.wallpaper.solidColor}</span>
              </div>
            )}

            {/* Custom Photo Upload */}
            {state.wallpaper.type === 'custom' && (
              <label className="flex items-center justify-center space-x-2 px-4 py-4 bg-bg-card border border-dashed border-border-main hover:border-primary rounded-xl cursor-pointer transition-colors text-xs font-medium text-text-main">
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload Foto Background Chat</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWallpaperUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Placeholder Input Field */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Teks Kotak Ketik Pesan:</label>
            <input
              type="text"
              value={state.inputPlaceholder}
              onChange={(e) => onChange({ ...state, inputPlaceholder: e.target.value })}
              placeholder="Ketik pesan"
              className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
            />
          </div>
        </div>
      )}

      {/* TAB 4: STATUS BAR (KHUSUS MOBILE) */}
      {activeTab === 'statusbar' && state.platform !== 'desktop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-bg-hover/70 rounded-2xl border border-border-main">
            <span className="text-xs font-bold text-text-main">Tampilkan Status Bar HP</span>
            <input
              type="checkbox"
              checked={state.mobileStatus.showStatusBar}
              onChange={(e) =>
                onChange({
                  ...state,
                  mobileStatus: { ...state.mobileStatus, showStatusBar: e.target.checked },
                })
              }
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Jam di Status Bar:</label>
              <input
                type="text"
                value={state.mobileStatus.time}
                onChange={(e) =>
                  onChange({
                    ...state,
                    mobileStatus: { ...state.mobileStatus, time: e.target.value },
                  })
                }
                placeholder="20:56"
                className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-xs text-text-main focus:outline-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Baterai: {state.mobileStatus.batteryPercentage}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={state.mobileStatus.batteryPercentage}
                onChange={(e) =>
                  onChange({
                    ...state,
                    mobileStatus: {
                      ...state.mobileStatus,
                      batteryPercentage: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium pt-2">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={state.mobileStatus.isCharging}
                onChange={(e) =>
                  onChange({
                    ...state,
                    mobileStatus: { ...state.mobileStatus, isCharging: e.target.checked },
                  })
                }
              />
              <span>⚡ Sedang Dicas</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={state.mobileStatus.showWifi}
                onChange={(e) =>
                  onChange({
                    ...state,
                    mobileStatus: { ...state.mobileStatus, showWifi: e.target.checked },
                  })
                }
              />
              <span>📶 WiFi Aktif</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={state.mobileStatus.showNotch}
                onChange={(e) =>
                  onChange({
                    ...state,
                    mobileStatus: { ...state.mobileStatus, showNotch: e.target.checked },
                  })
                }
              />
              <span>📱 Dynamic Island / Notch</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: PRESETS & TEMPLATES */}
      {activeTab === 'presets' && (
        <div className="space-y-5">
          {/* Dedicated JSON Format & Auto Fill Box */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-text-main">
                  Otomatis Isi Chat dari Format JSON
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Fitur Baru
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Anda dapat mengunduh format template JSON, mengisi pesan chat yang diinginkan, dan
              mengimpor file atau paste teks JSON untuk mengisi semua obrolan secara instan!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => downloadJsonTemplate('full')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-bg-card hover:bg-border-main border border-border-main rounded-xl text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Download Format Lengkap</span>
              </button>

              <button
                type="button"
                onClick={() => downloadJsonTemplate('minimal')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-bg-card hover:bg-border-main border border-border-main rounded-xl text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Download Format Minimal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(true)}
                className="flex items-center justify-center space-x-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>Buka Editor & Paste JSON</span>
              </button>

              <label className="flex items-center justify-center space-x-2 p-2.5 bg-bg-hover hover:bg-border-main text-text-main border border-border-main rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer">
                <Upload className="w-4 h-4 text-primary" />
                <span>Pilih File .JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleDirectJsonFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
            Atau Pilih Template Siap Pakai:
          </span>

          <div className="space-y-3">
            {PRESET_CHATS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-2xl bg-bg-hover hover:bg-border-main/50 border border-border-main flex items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-text-main">{preset.name}</div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{preset.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onChange(JSON.parse(JSON.stringify(preset.state)))
                    onToastMessage(`Template "${preset.name}" berhasil dimuat!`)
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  Gunakan
                </button>
              </div>
            ))}
          </div>

          {/* Export current state to JSON */}
          <div className="pt-4 border-t border-border-main flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(state, null, 2)
                )}`
                const downloadAnchor = document.createElement('a')
                downloadAnchor.setAttribute('href', jsonStr)
                downloadAnchor.setAttribute('download', `fake-chat-${Date.now()}.json`)
                document.body.appendChild(downloadAnchor)
                downloadAnchor.click()
                downloadAnchor.remove()
                onToastMessage('File JSON percakapan saat ini berhasil disimpan!')
              }}
              className="text-xs font-semibold text-text-muted hover:text-text-main flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan Chat Saat Ini ke JSON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
