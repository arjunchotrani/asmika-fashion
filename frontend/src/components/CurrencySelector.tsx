'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Search } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase font-light hover:text-brand-gold transition-colors duration-300"
        aria-label="Select currency"
      >
        <Globe className="w-3.5 h-3.5 opacity-60" />
        <span>{currency.code}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-2xl z-[300] overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border-color)]">
            <Search className="w-3 h-3 shrink-0 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[9px] tracking-[0.2em] uppercase outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
              autoFocus
            />
          </div>

          {/* Currency list */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-[9px] text-[var(--text-muted)] text-center py-4 tracking-widest uppercase">No results</p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c); setOpen(false); setSearch('') }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150 hover:bg-brand-gold/5 ${
                    currency.code === c.code ? 'text-brand-gold' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-bold tracking-widest uppercase">{c.code}</p>
                    <p className="text-[9px] text-[var(--text-muted)] tracking-wide mt-0.5">{c.name}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-light">{c.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
