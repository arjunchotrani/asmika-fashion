'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, static column on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        md:relative md:z-auto md:translate-x-0 md:flex md:shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md flex items-center px-4 md:px-8 justify-between shrink-0">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 -ml-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-4 text-zinc-500 text-sm">
            <span className="text-white font-medium">Asmika Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="text-[10px] text-zinc-400 font-bold">AF</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>

    </div>
  )
}
