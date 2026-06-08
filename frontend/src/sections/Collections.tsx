'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories, type Category } from '@/lib/api';

function CategorySkeleton() {
  return (
    <div className="group animate-pulse">
      <div className="aspect-[3/4] mb-10 bg-[var(--skeleton-base)] border border-[var(--border-color)]" />
      <div className="px-2 space-y-3">
        <div className="h-3 bg-[var(--skeleton-base)] rounded w-3/4" />
        <div className="h-2 bg-[var(--skeleton-base)] rounded w-full" />
        <div className="h-2 bg-[var(--skeleton-base)] rounded w-2/3" />
      </div>
    </div>
  );
}

export function Collections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 md:py-32 px-6 md:px-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-24 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 0.5, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.5em] uppercase block mb-6 font-light"
            >
              Shop By Category
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="text-2xl md:text-6xl font-serif leading-[1.1]"
            >
              The Curated <br />
              <span className="italic font-light opacity-80">Categories</span>
            </motion.h2>
          </div>

          <motion.div whileHover={{ x: 10 }}>
            <Link
              href="/categories"
              className="text-[10px] tracking-[0.4em] uppercase border-b border-brand-gold/30 pb-2 flex items-center gap-6 group transition-colors duration-500 hover:border-brand-gold hover:text-brand-gold"
            >
              Explore All Categories
              <div className="w-12 h-[1px] bg-brand-gold/30 group-hover:w-20 group-hover:bg-brand-gold transition-all duration-700" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 md:gap-16">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[var(--text-secondary)] font-light">
              Categories coming soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 md:gap-16">
            {categories.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.5, delay: index * 0.15, ease: [0.19, 1, 0.22, 1] }}
                className="group"
              >
                <Link href={`/categories/${item.slug}`}>
                  <div className="luxury-image-container aspect-[3/4] mb-10 bg-[var(--card-bg)] cursor-pointer">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                      />
                    ) : (
                      <div className="card-placeholder" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                    <div className="absolute inset-0 border border-brand-gold/0 group-hover:border-brand-gold/20 transition-all duration-1000 m-6" />

                    {item.subcategories && item.subcategories.length > 0 && (
                      <div className="absolute top-8 left-8 overflow-hidden">
                        <motion.span
                          initial={{ y: '100%' }}
                          whileInView={{ y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="text-[8px] tracking-[0.4em] uppercase backdrop-blur-md px-4 py-2 block border border-[var(--border-color)]"
                          style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                        >
                          {item.subcategories.length} Styles
                        </motion.span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="px-2">
                  <Link href={`/categories/${item.slug}`}>
                    <h3 className="text-2xl font-serif mb-4 tracking-wide group-hover:text-brand-gold transition-colors duration-700">
                      {item.name}
                    </h3>
                  </Link>
                  {item.description && (
                    <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed mb-8 max-w-xs line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <Link
                    href={`/categories/${item.slug}`}
                    className="inline-flex items-center gap-4 text-[9px] tracking-[0.4em] uppercase text-brand-gold hover:gap-7 transition-all duration-500"
                  >
                    Shop Now <div className="w-6 h-[1px] bg-brand-gold/40" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
