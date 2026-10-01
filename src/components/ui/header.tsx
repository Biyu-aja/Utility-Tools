/**
 * Folder: src/components/ui/
 * Description: Stores global UI components.
 * This file: header.tsx (Application top navigation bar with theme toggle).
 */

import { useApp } from '../../context/AppContext'
import ThemeToogle from '../themeToogle'

export function Header() {
  const { user } = useApp()

  return (
    <header className="border-b border-border-main bg-bg-card/80 backdrop-blur-md sticky top-0 z-40 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-xs">
          C
        </div>
        <span className="text-base font-bold text-text-main tracking-tight">Converter Studio</span>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToogle />
        <div className="flex items-center space-x-2.5 p-1 px-3 bg-bg-card border border-border-main rounded-full">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-semibold text-text-main">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
