/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: Dashboard.tsx (Main dashboard page with tools showcase).
 */

import { Link } from 'react-router-dom'
import { FileImage, Scissors, ArrowRight, ShieldCheck, Zap, Sparkles, MessageSquare } from 'lucide-react'
import { AppRoutes } from '../constants/listed'

export function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-border-main p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document & Media Converter Tools</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Selamat Datang di Converter Studio
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Alat konversi dokumen, file media, dan generator kreatif berkecepatan tinggi yang berjalan 100% langsung
            di browser Anda. Privasi aman, tanpa kuota upload server.
          </p>
        </div>
      </div>

      {/* Available Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">Alat Konversi & Generator Tersedia</h2>
          <span className="text-xs text-text-muted">4 Tools Aktif</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Fake WhatsApp Chat Card */}
          <Link
            to={`/${AppRoutes.FakeChat}`}
            className="group relative bg-bg-card hover:bg-bg-hover/80 border border-border-main hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-bold text-emerald-600 tracking-wider uppercase mb-1">
                  Desktop & Mobile Mode
                </div>
                <h3 className="text-lg font-bold text-text-main group-hover:text-emerald-600 transition-colors">
                  Fake WhatsApp Chat
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Buat tiruan screenshot chat WhatsApp untuk Desktop (Web) & HP (Android/iOS). Dukung quote balasan, voice note, foto, centang biru, dan pesan disematkan.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-main/60 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span className="flex items-center space-x-1.5 text-text-muted font-normal">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Web & Mobile 1:1</span>
              </span>
              <span className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Tool</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
          {/* Image Converter Card */}
          <Link
            to={`/${AppRoutes.ImageConverter}`}
            className="group relative bg-bg-card hover:bg-bg-hover/80 border border-border-main hover:border-primary/50 rounded-3xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-bold text-amber-500 tracking-wider uppercase mb-1">
                  Format, Kompresi & Remove BG
                </div>
                <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                  Image Converter & Remove BG
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Konversi PNG, JPG, WebP, hapus latar belakang (fake PNG kotak-kotak & warna polos), atur kejelasan, serta lihat ukuran akhirnya secara real-time.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-main/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center space-x-1.5 text-text-muted font-normal">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Copy-Paste & Slider Kualitas</span>
              </span>
              <span className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Tool</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Photo to PDF Card */}
          <Link
            to={`/${AppRoutes.PhotoToPDF}`}
            className="group relative bg-bg-card hover:bg-bg-hover/80 border border-border-main hover:border-primary/50 rounded-3xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-bold text-primary tracking-wider uppercase mb-1">
                  Gambar ke PDF
                </div>
                <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                  Photo to PDF Converter
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Gabungkan banyak foto (JPG, PNG, WebP) ke dalam satu file dokumen PDF dengan
                  pilihan ukuran kertas A4, margin, dan orientasi.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-main/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center space-x-1.5 text-text-muted font-normal">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instan & Offline</span>
              </span>
              <span className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Tool</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Split / Separated PDF Card */}
          <Link
            to={`/${AppRoutes.SplitPDF}`}
            className="group relative bg-bg-card hover:bg-bg-hover/80 border border-border-main hover:border-primary/50 rounded-3xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block text-[11px] font-bold text-emerald-600 tracking-wider uppercase mb-1">
                  Pemisah PDF
                </div>
                <h3 className="text-lg font-bold text-text-main group-hover:text-emerald-600 transition-colors">
                  Separated / Split PDF
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Pisahkan PDF multi-halaman per jumlah halaman tertentu, beri nama kustom dengan
                  auto-looping, dan unduh arsip ZIP.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-main/60 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span className="flex items-center space-x-1.5 text-text-muted font-normal">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-Looping & ZIP</span>
              </span>
              <span className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Tool</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Security & Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-bg-card border border-border-main space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h4 className="text-sm font-bold text-text-main">Privasi Terjaga</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Semua proses gambar dan kompilasi PDF terjadi lokal di perangkat Anda, tidak ada yang
            dikirim ke server eksternal.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-bg-card border border-border-main space-y-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h4 className="text-sm font-bold text-text-main">Tanpa Batas Ukuran</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Konversi gambar sebanyak yang Anda butuhkan tanpa batasan kuota file atau antrean.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-bg-card border border-border-main space-y-2">
          <FileImage className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-bold text-text-main">Fleksibel & Presisi</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Atur urutan halaman, putar foto 90°, sesuaikan ukuran A4/Letter, dan pratinjau sebelum
            mengunduh.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
