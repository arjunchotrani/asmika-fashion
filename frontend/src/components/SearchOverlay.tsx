'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getProducts, sortedImages } from '@/lib/api';
import type { Product } from '@/lib/api';
import { PriceDisplay } from './PriceDisplay';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await getProducts({ search: q.trim(), status: 'published' });
        setResults(data.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[300] bg-[var(--bg-primary)]/95 backdrop-blur-sm flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Close */}
          <div className="flex justify-end px-6 md:px-12 pt-8">
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-secondary)] hover:text-brand-gold transition-colors duration-300"
              aria-label="Close search"
            >
              <X size={24} strokeWidth={1} />
            </button>
          </div>

          {/* Search input */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="px-6 md:px-12 mt-12 md:mt-16"
          >
            <div className="max-w-2xl mx-auto border-b border-[var(--border-color)] flex items-center gap-4 pb-4">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search pieces…"
                className="flex-1 bg-transparent text-2xl md:text-4xl font-serif font-light text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 outline-none tracking-wide"
              />
              {loading && (
                <div className="w-4 h-4 border border-brand-gold/40 border-t-brand-gold rounded-full animate-spin" />
              )}
            </div>
            <p className="max-w-2xl mx-auto mt-3 text-[9px] tracking-[0.4em] uppercase text-[var(--text-secondary)] font-light">
              {query.trim()
                ? results.length === 0 && !loading
                  ? 'No pieces found'
                  : `${results.length} result${results.length !== 1 ? 's' : ''}`
                : 'Start typing to search'}
            </p>
          </motion.div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 mt-10 pb-16">
            <div className="max-w-2xl mx-auto">
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="space-y-0 divide-y divide-[var(--border-color)]"
                >
                  {results.map((product) => {
                    const thumb = sortedImages(product.images ?? [])[0]?.url;
                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-6 py-5 group hover:pl-2 transition-all duration-300"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-14 h-18 flex-shrink-0 overflow-hidden bg-[var(--card-bg)]" style={{ height: '4.5rem' }}>
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="card-placeholder w-full h-full" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {(product.subcategory?.name || product.category?.name) && (
                            <span className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/55 font-light block mb-0.5">
                              {product.subcategory?.name ?? product.category?.name}
                            </span>
                          )}
                          <p className="text-sm tracking-wide font-medium text-[var(--text-primary)] group-hover:text-brand-gold transition-colors duration-300 truncate">
                            {product.title}
                          </p>
                          <p className="text-xs font-light text-brand-gold/70 mt-0.5">
                            <PriceDisplay price={product.price} />
                          </p>
                        </div>

                        <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          View
                        </span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
