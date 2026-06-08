'use client';

import { motion } from 'framer-motion';

const VALUES = [
  {
    number: '01',
    title: 'Premium Quality',
    description: 'Every piece is woven from the finest fabrics sourced directly from Ajanta Silk Mills — a legacy of craftsmanship since 1972.',
  },
  {
    number: '02',
    title: 'Direct from Surat',
    description: 'Straight from the textile hub of India. No middlemen, no markups — authentic Surat craftsmanship at its purest.',
  },
  {
    number: '03',
    title: 'Personal Guidance',
    description: 'Our team is available to help you find the right fabric, style, and fit. Reach us directly on WhatsApp for expert assistance.',
  },
];

export function Values() {
  return (
    <section className="py-16 md:py-32 px-6 md:px-12 bg-[var(--bg-subtle)]">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.6em] uppercase font-light block mb-4"
          >
            Why Asmika
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-2xl md:text-6xl font-display font-normal leading-[1.1]"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Our Promise
          </motion.h2>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {VALUES.map((value, index) => (
            <motion.div
              key={value.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: index * 0.15, ease: [0.19, 1, 0.22, 1] }}
              className="relative p-6 sm:p-10 md:p-14 border-t border-[var(--border-color)] md:border-t-0 md:border-l first:border-l-0 first:border-t-0 group"
            >
              {/* Number */}
              <span className="text-[10px] tracking-[0.4em] uppercase text-brand-gold/40 font-light block mb-10">
                {value.number}
              </span>

              {/* Decorative line */}
              <div
                className="w-8 h-[1px] mb-10 transition-all duration-700 group-hover:w-16"
                style={{ background: 'var(--brand-gold)' }}
              />

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-serif mb-6 leading-snug">
                {value.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm font-light text-[var(--text-secondary)] leading-[2]">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
