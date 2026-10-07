/**
 * Folder: src/constants/
 * Description: Stores constants, router configurations, menu routes, and static route mappings.
 * This file: sidemenuItems.tsx (Defines the side menu navigation items and Lucide icons used).
 */

import { LayoutDashboard, Settings as SettingsIcon, FileImage, Scissors, Sparkles, MessageSquare, Smartphone } from 'lucide-react'
import { AppRoutes } from './listed'

export const sidemenuItems = [
  {
    name: 'Dashboard',
    href: AppRoutes.Dashboard,
    icons: <LayoutDashboard className="w-4.5 h-4.5" />,
  },
  {
    name: '3D Mockup Studio',
    href: AppRoutes.MockupGenerator,
    icons: <Smartphone className="w-4.5 h-4.5" />,
  },
  {
    name: 'Fake WA Chat',
    href: AppRoutes.FakeChat,
    icons: <MessageSquare className="w-4.5 h-4.5" />,
  },
  {
    name: 'Convert Gambar',
    href: AppRoutes.ImageConverter,
    icons: <Sparkles className="w-4.5 h-4.5" />,
  },
  {
    name: 'Photo to PDF',
    href: AppRoutes.PhotoToPDF,
    icons: <FileImage className="w-4.5 h-4.5" />,
  },
  {
    name: 'Split PDF',
    href: AppRoutes.SplitPDF,
    icons: <Scissors className="w-4.5 h-4.5" />,
  },
  {
    name: 'Settings',
    href: AppRoutes.Settings,
    icons: <SettingsIcon className="w-4.5 h-4.5" />,
  },
]
