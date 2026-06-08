'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

export function BrandStory() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section ref={containerRef} className="py-12 md:py-32 px-6 md:px-12 bg-[var(--bg-subtle)] relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-24 items-center">
        {/* Visual Layer */}
        <div className="relative order-2 lg:order-1 group">
          <motion.div
            style={{ y: imageY, border: '1px solid rgba(201, 168, 76, 0.4)' }}
            className="relative aspect-[4/5] md:aspect-square max-h-[50vh] md:max-h-none bg-[var(--card-bg)] overflow-hidden"
          >
            <Image
              src="/images/fashion2.png"
              alt="Brand Heritage"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-80 transition-transform duration-[600ms] ease-in-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 image-overlay-tr-subtle" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 0.1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, ease: [0.19, 1, 0.22, 1] }}
            className="absolute -top-32 -left-40 text-[200px] md:text-[350px] font-serif italic text-brand-gold pointer-events-none z-0 opacity-5 select-none whitespace-nowrap hidden lg:block"
          >
            Heritage
          </motion.div>

          {/* Accent Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute -bottom-10 -right-10 w-40 h-40 border border-brand-gold/20 hidden md:flex items-center justify-center p-8"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'var(--brand-story-badge-bg)',
            }}
          >
            <div className="text-[8px] tracking-[0.5em] uppercase text-brand-gold text-center font-light leading-relaxed">
              Crafted in <br /> Ajanta Silk Mills
            </div>
          </motion.div>
        </div>

        {/* Narrative Layer */}
        <motion.div
          style={{ y: textY }}
          className="order-1 lg:order-2 flex flex-col items-start gap-12"
        >
          <div className="space-y-6">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              className="text-[10px] tracking-[0.6em] uppercase block font-light"
            >
              The Asmika Legacy
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="text-3xl md:text-7xl font-serif leading-[1.1]"
            >
              Where Silk Meets <br />
              <span className="italic font-light">Cinema</span>
            </motion.h2>
          </div>

          <div className="space-y-8 max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-sm md:text-base text-[var(--text-secondary)] font-light leading-[1.8]"
            >
              Born from the legendary looms of Ajanta Silk Mills, Asmika Fashion is a tribute to the cinematic grandeur of Indian ethnic wear. We don&apos;t just create garments; we weave stories of timeless elegance and modern heritage.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-sm md:text-base text-[var(--text-secondary)] font-light leading-[1.8]"
            >
              Every collection is an editorial exploration, curated for the modern individual who carries the weight of history with the grace of the future.
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="luxury-button"
          >
            Discover Our Story
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
