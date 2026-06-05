'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/api';

export function WhatsAppCTA() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to enquire about Asmika Fashion products.")}`;

  return (
    <section className="py-32 px-6 md:px-12 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="text-[18vw] font-serif italic leading-none whitespace-nowrap"
          style={{ color: 'var(--border-color)', opacity: 0.5 }}
        >
          Connect
        </span>
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.6em] uppercase font-light block mb-6"
          >
            Get in Touch
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-5xl md:text-7xl font-serif leading-[1.05] mb-8"
          >
            Talk to Us on <br />
            <span className="italic font-light">WhatsApp</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xs md:text-sm font-light text-[var(--text-secondary)] leading-[2] mb-12 max-w-md"
          >
            Have a question about a fabric, need styling advice, or want to place a bulk order?
            Our team responds instantly on WhatsApp.
          </motion.p>

          <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.35 }}
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-4 bg-[#25D366] text-white px-10 py-5 text-[10px] tracking-[0.3em] uppercase font-medium transition-all duration-500 hover:bg-[#20b859]"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </motion.a>
        </div>
      </div>
    </section>
  );
}
