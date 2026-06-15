'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  MessageSquare,
  Archive,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getAdminFromToken(): { email: string; initials: string } {
  try {
    const token = localStorage.getItem('asmika_admin_token')
    if (!token) return { email: 'admin@asmika.com', initials: 'AD' }
    const payload = JSON.parse(atob(token.split('.')[1]))
    const email: string = payload.email ?? 'admin@asmika.com'
    const initials = email.slice(0, 2).toUpperCase()
    return { email, initials }
  } catch {
    return { email: 'admin@asmika.com', initials: 'AD' }
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Layers },
  { name: 'Subcategories', href: '/subcategories', icon: Tag },
  { name: 'Enquiries', href: '/enquiries', icon: MessageSquare },
  { name: 'Archived', href: '/archived', icon: Archive },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [admin, setAdmin] = useState({ email: 'admin@asmika.com', initials: 'AD' })

  useEffect(() => {
    setAdmin(getAdminFromToken())
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('asmika_admin_token')
    document.cookie = 'asmika_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full bg-black border-r border-white/5 w-64 shadow-[20px_0_40px_rgba(0,0,0,0.4)]">

      {/* Header */}
      <div className="p-6 md:p-8 pb-8 md:pb-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Image src="/asmika-logo.png" alt="Asmika Fashion" width={32} height={32} className="object-contain" />
            <h1 className="text-xl font-black text-white tracking-[0.3em] uppercase">
              Asmika
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-4 bg-zinc-800" />
            <p className="text-[9px] text-zinc-500 font-black tracking-[0.4em] uppercase">
              Studio Admin
            </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all duration-300",
                isActive
                  ? "bg-zinc-900 text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-white/5"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40"
              )}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={cn(
                  "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"
                )} />
                <span className="tracking-widest uppercase">{item.name}</span>
              </div>
              {isActive ? (
                <div className="w-1 h-4 bg-white rounded-full" />
              ) : (
                <ChevronRight className="w-3 h-3 text-zinc-800 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
              )}

              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white blur-[2px] opacity-50" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-6 mt-auto">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
              {admin.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white uppercase tracking-wider">Admin</p>
              <p className="text-[9px] text-zinc-500 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black text-zinc-500 hover:text-white hover:bg-zinc-800 w-full rounded-lg transition-all border border-transparent hover:border-white/5 uppercase tracking-widest"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

    </div>
  )
}
