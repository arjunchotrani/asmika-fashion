'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Layers,
  MessageSquare,
  Eye,
  CheckCircle,
  FileEdit,
  Plus,
  ArrowRight,
  Inbox,
  Tag,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  totalCategories: number
  totalSubcategories: number
  openEnquiries: number
  totalEnquiries: number
}

interface Enquiry {
  id: string
  name: string
  phone: string
  email?: string
  product_slug?: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  converted: 'bg-green-500/10 text-green-400 border border-green-500/20',
  closed: 'bg-zinc-500/10 text-zinc-500 border border-zinc-700',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent,
  loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  sub?: string
  accent?: 'green' | 'amber'
  loading: boolean
}) {
  const accentBorder =
    accent === 'green'
      ? 'border-green-500/20 hover:border-green-500/40'
      : accent === 'amber'
      ? 'border-amber-500/20 hover:border-amber-500/40'
      : 'border-zinc-800 hover:border-zinc-700'

  const iconColor =
    accent === 'green'
      ? 'text-green-400'
      : accent === 'amber'
      ? 'text-amber-400'
      : 'text-zinc-400'

  return (
    <div
      className={`bg-zinc-900 border ${accentBorder} rounded-xl p-5 transition-colors duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-zinc-950 rounded-lg group-hover:bg-zinc-800 transition-colors">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16 mt-1" />
      ) : (
        <p className="text-3xl font-black text-white">{value.toLocaleString()}</p>
      )}
      {sub && (
        <p className="text-zinc-600 text-[10px] mt-1.5 tracking-wide">{sub}</p>
      )}
    </div>
  )
}

function LiveViewersCard({ loading }: { loading: boolean }) {
  return (
    <a
      href="https://analytics.google.com/analytics/web/#/p538651667/realtime/overview"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-zinc-900 border border-green-500/20 hover:border-green-500/40 rounded-xl p-5 transition-colors duration-300 relative overflow-hidden group block"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-zinc-950 rounded-lg group-hover:bg-green-500/10 transition-colors">
          <Eye className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Live Viewers</p>
      {loading ? (
        <Skeleton className="h-7 w-10 mt-1" />
      ) : (
        <p className="text-sm font-black text-white mt-1">View in GA4 →</p>
      )}
      <p className="text-zinc-600 text-[10px] mt-1.5 tracking-wide">Click to open Realtime report</p>
    </a>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [allRes, pubRes, draftRes, catRes, subRes, allEnqRes, newEnqRes] = await Promise.all([
          apiFetch('/api/products'),
          apiFetch('/api/products?status=published'),
          apiFetch('/api/products?status=draft'),
          apiFetch('/api/categories'),
          apiFetch('/api/subcategories'),
          apiFetch('/api/enquiries'),
          apiFetch('/api/enquiries?status=new'),
        ])

        const [all, pub, draft, cats, subs, allEnq, newEnq] = await Promise.all([
          allRes.json(),
          pubRes.json(),
          draftRes.json(),
          catRes.json(),
          subRes.json(),
          allEnqRes.json(),
          newEnqRes.json(),
        ])

        setStats({
          totalProducts: all.data?.length ?? 0,
          publishedProducts: pub.data?.length ?? 0,
          draftProducts: draft.data?.length ?? 0,
          totalCategories: cats.data?.length ?? 0,
          totalSubcategories: subs.data?.length ?? 0,
          openEnquiries: newEnq.data?.length ?? 0,
          totalEnquiries: allEnq.data?.length ?? 0,
        })
        setRecentEnquiries((allEnq.data ?? []).slice(0, 6))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const [dateStr, setDateStr] = useState('')
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')
    setDateStr(new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }))
  }, [])

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-zinc-600 text-[10px] tracking-widest uppercase mb-1.5">{dateStr}</p>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{greeting}, Admin</h2>
          <p className="text-zinc-600 text-sm mt-1">Here's what's happening at Asmika today.</p>
        </div>
        <Link
          href="/products/create"
          className="flex items-center gap-2 bg-white text-black text-[10px] font-black tracking-widest uppercase px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Product
        </Link>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <LiveViewersCard loading={loading} />
        <StatCard
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          sub={`${stats?.draftProducts ?? 0} in draft`}
          loading={loading}
        />
        <StatCard
          label="Published"
          value={stats?.publishedProducts ?? 0}
          icon={CheckCircle}
          sub="Live on storefront"
          accent="green"
          loading={loading}
        />
        <StatCard
          label="Draft Products"
          value={stats?.draftProducts ?? 0}
          icon={FileEdit}
          sub="Awaiting publish"
          accent={stats?.draftProducts ? 'amber' : undefined}
          loading={loading}
        />
        <StatCard
          label="Categories"
          value={stats?.totalCategories ?? 0}
          icon={Layers}
          sub={`${stats?.totalSubcategories ?? 0} subcategories`}
          loading={loading}
        />
        <StatCard
          label="Subcategories"
          value={stats?.totalSubcategories ?? 0}
          icon={Tag}
          sub="Across all categories"
          loading={loading}
        />
        <StatCard
          label="Open Enquiries"
          value={stats?.openEnquiries ?? 0}
          icon={MessageSquare}
          sub="Status: new · need action"
          accent={stats?.openEnquiries ? 'amber' : undefined}
          loading={loading}
        />
        <StatCard
          label="Total Enquiries"
          value={stats?.totalEnquiries ?? 0}
          icon={Inbox}
          sub="All time, non-archived"
          loading={loading}
        />
      </div>

      {/* ── Bottom Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Enquiries */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Enquiries</h3>
            <Link
              href="/enquiries"
              className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentEnquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-zinc-600 text-xs tracking-widest uppercase">No enquiries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/30 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-300 shrink-0">
                    {enq.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{enq.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {enq.phone}
                      {enq.product_slug && (
                        <> · <span className="text-zinc-400">{enq.product_slug}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLES[enq.status] ?? STATUS_STYLES.new}`}>
                      {enq.status}
                    </span>
                    <span className="text-[10px] text-zinc-600">{timeAgo(enq.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Add New Product', href: '/products/create', primary: true },
              { label: 'View Products', href: '/products', primary: false },
              { label: 'Manage Categories', href: '/categories', primary: false },
              { label: 'Subcategories', href: '/subcategories', primary: false },
              { label: 'All Enquiries', href: '/enquiries', primary: false },
              { label: 'Archived Items', href: '/archived', primary: false },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  action.primary
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {action.label}
                <ArrowRight className="w-3 h-3 opacity-50" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
