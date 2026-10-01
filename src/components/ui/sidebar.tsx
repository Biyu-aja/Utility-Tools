/**
 * Folder: src/components/ui/
 * Description: Stores global UI components.
 * This file: sidebar.tsx (Side navigation menu).
 */

import { NavLink } from 'react-router-dom'
import { sidemenuItems } from '../../constants/sidemenuItems'

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border-main bg-bg-card/30 hidden md:block p-4 space-y-2">
      <div className="text-[10px] font-bold text-text-muted px-3 uppercase tracking-wider mb-4">
        Navigation
      </div>
      {sidemenuItems.map((item) => (
        <NavLink
          key={item.name}
          to={`/${item.href}`}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-main hover:bg-bg-hover'
            }`
          }
        >
          {item.icons}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </aside>
  )
}

export default Sidebar
export const Sidemenu = Sidebar
