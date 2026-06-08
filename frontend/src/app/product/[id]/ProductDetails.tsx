'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ChevronDown, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { type Product, type ProductVariant, whatsappUrl, sortedImages, trackWhatsAppClick } from '@/lib/api';
import { PriceDisplay } from '@/components/PriceDisplay';
import { RelatedProducts } from '@/components/RelatedProducts';
import { FAQSection } from '@/components/FAQSection';
import { RecentlyViewed, saveRecentlyViewed } from '@/components/RecentlyViewed';

const STATIC_ACCORDION_ITEMS = [
  {
    title: 'Delivery & Returns',
    content:
      'Delivery timelines vary by piece — our team will confirm once your enquiry is processed. Due to the bespoke nature of each garment, returns are only accepted for sizing issues.',
  },
  {
    title: 'Customization',
    content:
      'We offer bespoke customization for fit and minor design alterations. Connect with our styling team via WhatsApp to discuss your requirements.',
  },
];

interface Props {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetails({ product, relatedProducts = [] }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  // Save to recently viewed on mount
  useEffect(() => {
    const images = sortedImages(product.images);
    saveRecentlyViewed({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      imageUrl: images[0]?.url ?? null,
      categoryName: product.category?.name,
    });
  }, [product]);

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const variant: ProductVariant | null = selectedVariant !== null ? (product.variants?.[selectedVariant] ?? null) : null;

  const images = variant?.images?.length
    ? variant.images.map((url, i) => ({ url, display_order: i }))
    : sortedImages(product.images);

  const displayDescription = variant?.description || product.description;
  const needsColor = !!(product.color_required && hasVariants && selectedVariant === null);

  const activeImg = images[activeImage]?.url;

  function selectVariant(idx: number | null) {
    setSelectedVariant(idx);
    setActiveImage(0);
  }

  function prevImage() {
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  }
  function nextImage() {
    setActiveImage((i) => (i + 1) % images.length);
  }

  return (
    <>
      <section className="min-h-screen bg-[var(--bg-primary)]">

        {/* ── Main Grid ─────────────────────────────────────── */}
        <div className="px-6 md:px-12 pt-12 pb-24">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px] gap-12 lg:gap-20 xl:gap-32 items-start">

            {/* ── Left: Image Gallery ─────────────────────────── */}
            <div>
              {images.length === 0 ? (
                <div className="relative h-[520px] md:h-[700px] w-full overflow-hidden bg-[var(--card-bg)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-[var(--text-secondary)] font-light">No image available</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4">

                  {/* Thumbnail strip — desktop left */}
                  {images.length > 1 && (
                    <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`relative aspect-[3/4] overflow-hidden transition-all duration-300 ${
                            activeImage === i
                              ? 'ring-1 ring-brand-gold/60 opacity-100'
                              : 'opacity-40 hover:opacity-70'
                          }`}
                        >
                          <Image src={img.url} alt="" fill className="object-contain" sizes="72px" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main image */}
                  <div className="flex-1">
                    <div className="relative overflow-hidden bg-[var(--card-bg)] group">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeImage}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          onClick={() => setLightboxOpen(true)}
                          className="cursor-pointer"
                        >
                          {activeImg && (
                            <Image
                              src={activeImg}
                              alt={`${product.title} — view ${activeImage + 1}`}
                              width={900}
                              height={1200}
                              priority={activeImage === 0}
                              className="w-full h-auto"
                              sizes="(max-width: 1024px) 100vw, 55vw"
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Nav arrows — only if multiple images */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-brand-gold hover:text-brand-black"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-brand-gold hover:text-brand-black"
                          >
                            <ChevronRight size={16} />
                          </button>

                          {/* Counter */}
                          <div className="absolute bottom-4 right-5 text-[8px] tracking-[0.35em] text-[var(--text-secondary)] font-light">
                            {activeImage + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mobile thumbnail strip */}
                    {images.length > 1 && (
                      <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`relative aspect-square w-16 shrink-0 overflow-hidden transition-all duration-300 ${
                              activeImage === i
                                ? 'ring-1 ring-brand-gold/60 opacity-100'
                                : 'opacity-40 hover:opacity-70'
                            }`}
                          >
                            <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Product Info ─────────────────────────── */}
            <div className="lg:sticky lg:top-28 h-fit pt-2">

              {/* Category tag */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center gap-3 mb-6"
              >
                {product.category && (
                  <span className="text-[9px] tracking-[0.5em] uppercase text-brand-gold font-light">
                    {product.category.name}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                className="text-2xl md:text-5xl leading-[1.08] mb-6 font-normal"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                {product.title}
              </motion.h1>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
                className="h-[1px] bg-[var(--border-color)] mb-6 origin-left"
              />

              {/* Price */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                {product.price != null ? (
                  <span className="text-2xl font-light text-brand-gold/90 tracking-wide">
                    <PriceDisplay price={product.price} />
                  </span>
                ) : (
                  <span className="text-sm font-light italic text-brand-gold/70 tracking-[0.15em]">
                    Price on Enquiry
                  </span>
                )}
              </motion.div>

              {/* Color Swatches */}
              {hasVariants && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-[var(--text-secondary)] font-light">Color</span>
                    {selectedVariant !== null && (
                      <span className="text-[9px] tracking-[0.3em] uppercase text-brand-gold font-light">
                        — {product.variants![selectedVariant].color}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!product.color_required && (
                      <button
                        onClick={() => selectVariant(null)}
                        className={`px-4 py-2 text-[9px] tracking-[0.3em] uppercase font-light border transition-all duration-300 ${
                          selectedVariant === null
                            ? 'border-brand-gold/60 text-[var(--text-primary)] bg-brand-gold/5'
                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-gold/30'
                        }`}
                      >
                        Default
                      </button>
                    )}
                    {product.variants!.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => selectVariant(i)}
                        className={`px-4 py-2 text-[9px] tracking-[0.3em] uppercase font-light border transition-all duration-300 ${
                          selectedVariant === i
                            ? 'border-brand-gold/60 text-[var(--text-primary)] bg-brand-gold/5'
                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-gold/30'
                        }`}
                      >
                        {v.color}
                      </button>
                    ))}
                  </div>
                  {needsColor && (
                    <p className="mt-3 text-[8px] tracking-[0.3em] uppercase text-amber-500/70 font-light">
                      Please select a color to continue
                    </p>
                  )}
                </motion.div>
              )}

              {/* Description */}
              {displayDescription && (
                <motion.p
                  key={selectedVariant ?? 'default'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-sm font-light text-[var(--text-secondary)] leading-[2] mb-10 border-l-2 border-brand-gold/20 pl-4"
                >
                  {displayDescription}
                </motion.p>
              )}

              {/* WhatsApp CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mb-12"
              >
                {needsColor ? (
                  <div className="w-full flex items-center justify-center gap-3 bg-zinc-800/40 border border-zinc-700/40 px-6 py-4 sm:px-10 sm:py-5 text-[10px] tracking-[0.35em] uppercase text-[var(--text-secondary)] font-light">
                    Select a color to enquire
                  </div>
                ) : (
                  <a
                    href={whatsappUrl(product.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(product.slug)}
                    className="group w-full flex items-center justify-center gap-3 bg-brand-gold text-brand-black px-6 py-4 sm:px-10 sm:py-5 text-[10px] tracking-[0.35em] uppercase font-medium transition-all duration-500 hover:bg-brand-gold/85 hover:tracking-[0.45em]"
                  >
                    <MessageCircle size={15} className="transition-transform duration-300 group-hover:scale-110" />
                    Enquire on WhatsApp
                  </a>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[8px] tracking-[0.35em] uppercase text-[var(--text-muted)] font-light">
                    We typically respond within minutes
                  </p>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = encodeURIComponent(`${product.title} — ${url}`);
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="flex items-center gap-1.5 text-[8px] tracking-[0.3em] uppercase text-[var(--text-muted)] hover:text-brand-gold transition-colors duration-300 font-light"
                  >
                    <Share2 size={11} />
                    Share
                  </button>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="h-[1px] bg-[var(--border-color)] mb-0" />

              {/* Accordion */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {/* Fabric & Care — dynamic */}
                {(product.fabric || product.size) && (() => {
                  return (
                    <div className="border-b border-[var(--border-color)]">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === -1 ? null : -1)}
                        className="w-full flex items-center justify-between py-5 text-left group"
                      >
                        <span className="text-[10px] tracking-[0.3em] uppercase font-light group-hover:text-brand-gold transition-colors duration-300">
                          Fabric & Care
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-500 text-brand-gold/50 shrink-0 ${
                            openAccordion === -1 ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {openAccordion === -1 && (
                          <motion.div
                            key="fabric-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-6 pr-4 space-y-1">
                              {product.fabric && (
                                <p className="text-[13px] text-[var(--text-secondary)] font-light leading-[2]">
                                  <span className="text-[var(--text-primary)] font-normal">Fabric:</span> {product.fabric}
                                </p>
                              )}
                              {product.size && (
                                <p className="text-[13px] text-[var(--text-secondary)] font-light leading-[2]">
                                  <span className="text-[var(--text-primary)] font-normal">Available Sizes:</span> {product.size}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {STATIC_ACCORDION_ITEMS.map((item, index) => (
                  <div key={index} className="border-b border-[var(--border-color)]">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                      className="w-full flex items-center justify-between py-5 text-left group"
                    >
                      <span className="text-[10px] tracking-[0.3em] uppercase font-light group-hover:text-brand-gold transition-colors duration-300">
                        {item.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-500 text-brand-gold/50 shrink-0 ${
                          openAccordion === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openAccordion === index && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 text-[13px] text-[var(--text-secondary)] font-light leading-[2] pr-4">
                            {item.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && activeImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[500] flex items-center justify-center cursor-zoom-out"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors z-10"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/40 hover:text-white transition-colors z-10"
                >
                  <ChevronLeft size={28} strokeWidth={1} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/40 hover:text-white transition-colors z-10"
                >
                  <ChevronRight size={28} strokeWidth={1} />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="relative w-[88vw] h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImg}
                    alt={product.title}
                    fill
                    className="object-contain"
                    sizes="88vw"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] tracking-[0.5em] uppercase text-white/30">
                {activeImage + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <RecentlyViewed currentId={product.id} />
      <RelatedProducts products={relatedProducts} title="More Like This" subtitle="From the Same Category" />
      <FAQSection />
    </>
  );
}
