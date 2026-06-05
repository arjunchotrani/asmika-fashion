'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PriceDisplay } from '@/components/PriceDisplay';

const STORAGE_KEY = 'asmika_recently_viewed';
const MAX_STORED = 8;

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  price?: number | null;
  imageUrl?: string | null;
  categoryName?: string;
}

export function saveRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === 'undefined') return;
  try {
    const existing: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((p) => p.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored.filter((p) => p.id !== currentId).slice(0, 4));
    } catch {}
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 border-t border-[var(--border-color)]">
      <div className="max-w-[1800px] mx-auto">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[9px] tracking-[0.55em] uppercase text-brand-gold font-light mb-3">
              Your History
            </p>
            <h2
              className="text-3xl md:text-4xl font-serif leading-[1.1]"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Recently Viewed
            </h2>
          </div>
          <div className="hidden md:block h-[1px] flex-1 mx-12" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)' }} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {items.map((item) => (
            <Link key={item.id} href={`/product/${item.slug}`} className="group block">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[var(--card-bg)]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="card-placeholder" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              {item.categoryName && (
                <span className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/55 font-light block mb-1">
                  {item.categoryName}
                </span>
              )}
              <h3 className="text-sm tracking-wide font-medium mb-1 group-hover:text-brand-gold transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-sm font-light text-brand-gold/80">
                <PriceDisplay price={item.price} />
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
