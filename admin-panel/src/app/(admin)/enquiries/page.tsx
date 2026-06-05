'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Calendar, Phone, Mail, Archive, RefreshCw } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'closed'

interface Enquiry {
  id: string
  name: string
  email?: string
  phone: string
  message?: string
  status: EnquiryStatus
  archived: boolean
  created_at: string
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  converted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  closed: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20',
}

const STATUS_OPTIONS: EnquiryStatus[] = ['new', 'contacted', 'converted', 'closed']

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<EnquiryStatus | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  async function fetchEnquiries() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/enquiries')
      const data = await res.json()
      if (data.success) setEnquiries(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: EnquiryStatus) {
    setUpdating(id)
    try {
      const res = await apiFetch(`/api/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setEnquiries(prev =>
          prev.map(e => (e.id === id ? { ...e, status } : e))
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  async function archiveEnquiry(id: string) {
    setUpdating(id)
    try {
      const res = await apiFetch(`/api/enquiries/${id}/archive`, { method: 'POST' })
      if (res.ok) {
        setEnquiries(prev => prev.filter(e => e.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const visible = filterStatus === 'all'
    ? enquiries
    : enquiries.filter(e => e.status === filterStatus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Enquiries</h2>
          <p className="text-zinc-500 text-sm">Customer messages and product inquiries.</p>
        </div>
        <button
          onClick={fetchEnquiries}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...STATUS_OPTIONS] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors ${
              filterStatus === s
                ? 'bg-white text-black border-white'
                : 'text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {s === 'all' ? `All (${enquiries.length})` : `${s} (${enquiries.filter(e => e.status === s).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl animate-pulse h-32" />
          ))
        ) : visible.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-xl text-center text-zinc-500 italic">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
            No enquiries found.
          </div>
        ) : (
          visible.map(enq => (
            <div
              key={enq.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all"
            >
              <div className="p-6">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-white">{enq.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${STATUS_STYLES[enq.status]}`}>
                        {enq.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${enq.phone}`} className="hover:text-zinc-300 transition-colors">{enq.phone}</a>
                      </div>
                      {enq.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${enq.email}`} className="hover:text-zinc-300 transition-colors">{enq.email}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={enq.status}
                      disabled={updating === enq.id}
                      onChange={e => updateStatus(enq.id, e.target.value as EnquiryStatus)}
                      className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50 capitalize"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => archiveEnquiry(enq.id)}
                      disabled={updating === enq.id}
                      title="Archive"
                      className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message */}
                {enq.message && (
                  <div className="mt-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-sm text-zinc-400 italic">
                    &ldquo;{enq.message}&rdquo;
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
