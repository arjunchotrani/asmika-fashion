'use client';

import { motion } from 'framer-motion';
import { Search, MessageCircle, Package } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    Icon: Search,
    title: 'Browse Collection',
    description: 'Explore our curated ethnic wear',
  },
  {
    number: '02',
    Icon: MessageCircle,
    title: 'WhatsApp Us',
    description: 'Share what caught your eye',
  },
  {
    number: '03',
    Icon: Package,
    title: 'Receive at Your Door',
    description: 'We handle the rest',
  },
];

export function HowToOrder() {
  return (
    <section
      className="relative py-12 md:py-36 px-6 md:px-12 overflow-hidden"
      style={{ background: 'var(--how-to-order-bg)' }}
    >
      {/* Ghost watermark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="text-[18vw] font-serif italic leading-none whitespace-nowrap"
          style={{ color: 'var(--border-color)', opacity: 0.45 }}
        >
          Process
        </span>
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10">

        {/* Header */}
        <div className="mb-20 md:mb-28">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.6em] uppercase font-light block mb-4"
          >
            Simple Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-2xl md:text-6xl font-serif leading-[1.1]"
          >
            How to{' '}
            <span className="italic font-light">Order</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop horizontal connector line */}
          <div
            className="hidden md:block absolute pointer-events-none"
            style={{
              top: '172px',
              left: 'calc(16.667% + 24px)',
              right: 'calc(16.667% + 24px)',
              borderTop: '1px dashed rgba(201, 168, 76, 0.5)',
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {STEPS.map((step, i) => (
              <div key={step.number}>
                {/* Mobile vertical connector (between steps) */}
                {i > 0 && (
                  <div className="md:hidden flex justify-center py-1">
                    <div
                      className="h-10 w-px"
                      style={{ borderLeft: '1px dashed rgba(201, 168, 76, 0.5)' }}
                    />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.2, ease: [0.19, 1, 0.22, 1] }}
                  className="flex flex-col items-center text-center px-8 md:px-14 py-6 md:py-0"
                >
                  {/* Step number */}
                  <span
                    className="font-serif font-light leading-none mb-4 select-none"
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--brand-gold)', opacity: 0.7 }}
                  >
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-6 relative z-10"
                    style={{ background: 'var(--how-to-order-bg)', border: '1px solid rgba(201, 168, 76, 0.35)' }}
                  >
                    <step.Icon size={18} style={{ color: 'var(--brand-gold)' }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="font-serif mb-3 leading-snug"
                    style={{ fontSize: '1.2rem' }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="font-light uppercase tracking-widest"
                    style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', letterSpacing: '0.12em' }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
