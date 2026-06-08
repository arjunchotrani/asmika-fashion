'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Simply enquire via WhatsApp on any product page. Our team will guide you through fabric selection, sizing, and customization before confirming your order.',
  },
  {
    q: 'What fabrics do you specialize in?',
    a: 'We specialize in premium Indian silk textiles including Banarasi, Kanjivaram, Chanderi, and pure silk georgette. Each piece is sourced directly from master weavers.',
  },
  {
    q: 'Do you offer customization?',
    a: 'Yes — we offer bespoke tailoring, blouse stitching, and minor design alterations. Reach out via WhatsApp to discuss your requirements with our styling team.',
  },
  {
    q: 'What are your delivery timelines?',
    a: 'Ready-to-ship pieces typically dispatch within 2–5 business days. Custom or made-to-order pieces take 10–21 business days. Our team confirms the timeline when your order is placed.',
  },
  {
    q: 'What is your return policy?',
    a: 'Due to the bespoke nature of our garments, returns are accepted only for manufacturing defects or sizing issues confirmed within 48 hours of delivery.',
  },
  {
    q: 'How do I care for my silk garment?',
    a: 'Dry clean only. Store wrapped in muslin cloth in a cool, dry place away from direct sunlight. Avoid contact with perfume or deodorant on the fabric surface.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes, we ship worldwide. International delivery timelines and charges are confirmed at the time of order based on your location.',
  },
];

interface FAQSectionProps {
  title?: string;
}

export function FAQSection({ title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 md:px-12 border-t border-[var(--border-color)]">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-32">

          {/* Left — heading */}
          <div className="lg:pt-2">
            <p className="text-[9px] tracking-[0.55em] uppercase text-brand-gold font-light mb-4">Support</p>
            <h2
              className="text-3xl md:text-4xl font-serif leading-[1.15] mb-6"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              {title}
            </h2>
            <p className="text-sm font-light text-[var(--text-secondary)] leading-[2]">
              Can't find what you're looking for? Connect with us directly on WhatsApp — we typically respond within minutes.
            </p>
          </div>

          {/* Right — accordion */}
          <div className="divide-y divide-[var(--border-color)]">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between py-6 text-left group gap-6"
                >
                  <span className="text-sm font-light tracking-[0.04em] group-hover:text-brand-gold transition-colors duration-300">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`shrink-0 mt-1 transition-transform duration-500 text-brand-gold/50 ${open === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-sm text-[var(--text-secondary)] font-light leading-[2] max-w-2xl border-l-2 border-brand-gold/20 pl-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
