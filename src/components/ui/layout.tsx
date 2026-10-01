/**
 * Folder: src/components/ui/
 * Description: Stores global UI components, layouts, or reusable components.
 * This file: layout.tsx (Main layout integrating Header, Sidebar, and Page Content).
 */

import { Outlet } from 'react-router-dom'
import Header from './header'
import Sidebar from './sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg-background text-text-main flex flex-col font-sans">
      {/* Header Component */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Layout Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>


    </div>
  )
}
