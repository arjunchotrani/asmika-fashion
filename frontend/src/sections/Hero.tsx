'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], ["0%", "10%"]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden flex items-end"
    >

      {/* ── Gradient Background (adapts via CSS class) ──────── */}
      <div aria-hidden="true" className="absolute inset-0 z-0 hero-bg-gradient" />

      {/* Ambient glow — lower left */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none z-[1]"
        style={{
          bottom: '22%',
          left: '25%',
          transform: 'translateX(-50%)',
          width: '50%',
          height: '200px',
          borderRadius: '50%',
          background: 'var(--hero-ambient-1)',
          filter: 'blur(100px)',
        }}
      />

      {/* Ambient glow — upper right */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none z-[1]"
        style={{
          top: '15%',
          right: '12%',
          width: '32%',
          height: '260px',
          borderRadius: '50%',
          background: 'var(--hero-ambient-2)',
          filter: 'blur(130px)',
        }}
      />

      {/* ── Right-side atmospheric texture ─────────────────── */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 w-full md:w-1/2 h-full overflow-hidden z-[2] pointer-events-none"
      >
        <Image
          src="/images/fashion3.png"
          alt=""
          fill
          className="object-cover opacity-[0.08] md:opacity-[0.15] animate-ken-burns"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 hero-texture-overlay" />
      </div>

      {/* Film grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          opacity: 0.055,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='280' height='280' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '220px 220px',
        }}
      />

      {/* Vignette edges (adapts via CSS class) */}
      <div aria-hidden="true" className="absolute inset-0 z-[4] pointer-events-none hero-vignette" />

      {/* ── Editorial Content — bottom-left aligned ──────────── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 w-full px-6 md:px-12 pb-32 md:pb-28"
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.4, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
              className="text-[9px] tracking-[0.65em] uppercase font-light mb-8"
              style={{ color: 'var(--hero-gold-accent)' }}
            >
              Est. 1972 &nbsp;·&nbsp; Premium Ethnic Textiles
            </motion.p>

            {/* Headline */}
            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1], delay: 0.95 }}
                className="text-[var(--text-primary)] hero-headline"
                style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '-0.01em', fontWeight: 400 }}
              >
                The Art of<br />
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300 }}>
                  Ethnic Luxury
                </span>
              </motion.h1>
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 1.75, ease: [0.19, 1, 0.22, 1] }}
              className="text-[10px] md:text-[11px] uppercase font-light leading-[2.4] mb-12 max-w-xs"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.22em' }}
            >
              A cinematic exploration of premium ethnic textiles and editorial fashion storytelling.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 2.0, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 md:gap-6"
            >
              <Link href="/new-arrivals" className="luxury-button cta-filled group w-full sm:w-auto text-center">
                <span className="relative z-10">New Arrivals</span>
              </Link>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator — right side ────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0, duration: 1.6 }}
        className="absolute bottom-10 right-8 md:right-12 flex flex-col items-center gap-3 z-20"
      >
        <motion.div
          animate={{ height: [14, 44, 14], opacity: [0.18, 0.62, 0.18] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px]"
          style={{ background: 'linear-gradient(to bottom, var(--brand-gold), rgba(212,175,55,0.12), transparent)' }}
        />
        <span
          className="text-[7px] uppercase font-light"
          style={{ letterSpacing: '0.55em', color: 'var(--text-ghost)' }}
        >
          Scroll
        </span>
      </motion.div>

    </section>
  );
}
