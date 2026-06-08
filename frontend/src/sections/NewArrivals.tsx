'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts, whatsappUrl, sortedImages, type Product } from '@/lib/api';
import { PriceDisplay } from '@/components/PriceDisplay';

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] mb-6 bg-[var(--skeleton-base)] border border-[var(--border-color)]" />
      <div className="space-y-2">
        <div className="h-2.5 bg-[var(--skeleton-base)] rounded w-3/4" />
        <div className="h-2 bg-[var(--skeleton-base)] rounded w-1/2" />
      </div>
    </div>
  );
}

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: true, status: 'published' })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-4 md:gap-8">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.6em] uppercase block mb-4 font-light text-brand-gold"
            >
              Featured Pieces
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="text-2xl md:text-5xl font-serif"
            >
              New <span className="italic font-light">Arrivals</span>
            </motion.h2>
          </div>

          <motion.div whileHover={{ x: 10 }}>
            <Link
              href="/new-arrivals"
              className="flex items-center gap-3 text-sm uppercase tracking-widest border-b border-brand-gold/30 pb-1 hover:border-brand-gold hover:text-brand-gold transition-colors duration-300"
            >
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[var(--text-secondary)] font-light">
              New arrivals coming soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {products.slice(0, 8).map((product, index) => {
              const images = sortedImages(product.images);
              const thumb = images[0]?.url;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                  className="group cursor-pointer transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-[3/4] mb-6 overflow-hidden bg-[var(--card-bg)] transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={product.title}
                        fill
                        className="object-contain transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="card-placeholder" />
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-[400ms]" />

                    {/* Hover actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] flex flex-col gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="w-full bg-black/85 backdrop-blur-sm text-[#FDFCF8] py-3 min-h-[44px] text-[9px] tracking-widest uppercase text-center hover:bg-brand-gold hover:text-black transition-colors duration-300 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                      <a
                        href={whatsappUrl(product.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366]/90 backdrop-blur-sm text-white py-3 min-h-[44px] text-[9px] tracking-widest uppercase text-center flex items-center justify-center gap-2 hover:bg-[#25D366] transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle size={12} /> Enquire on WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Info */}
                  <Link href={`/product/${product.slug}`} className="flex flex-col gap-1.5">
                    {product.category && (
                      <span className="text-[9px] tracking-[0.3em] uppercase text-brand-gold/60 font-light">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="text-sm tracking-wider uppercase font-medium group-hover:text-brand-gold transition-colors duration-300">
                      {product.title}
                    </h3>
                    <span className="text-sm font-light text-brand-gold/80">
                      <PriceDisplay price={product.price} />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
