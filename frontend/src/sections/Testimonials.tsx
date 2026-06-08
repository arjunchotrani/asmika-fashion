'use client';

import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "The quality of the silk dupatta I ordered is beyond what I expected. The colors are rich and the fabric drapes beautifully.",
    name: "Priya M.",
    city: "Mumbai",
  },
  {
    quote: "Ordered a lehenga fabric for my daughter's wedding. The team guided us perfectly on WhatsApp. Will order again.",
    name: "Sunita K.",
    city: "Ahmedabad",
  },
  {
    quote: "Direct from Surat means the price was much better than local shops. Genuine Ajanta Silk quality.",
    name: "Rekha S.",
    city: "Delhi",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-12 bg-[var(--bg-primary)]">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.6em] uppercase font-light block mb-4"
          >
            What They Say
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-2xl md:text-6xl font-serif leading-[1.1]"
          >
            Loved by{' '}
            <span className="italic font-light">Customers</span>
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.18, ease: [0.19, 1, 0.22, 1] }}
              className="testimonial-card group flex flex-col p-6 md:p-10 transition-all duration-500"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(201,168,76,0.15)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(201,168,76,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Opening quote mark */}
              <span
                className="font-serif leading-none mb-4 block select-none"
                style={{ fontSize: '3.5rem', color: 'var(--brand-gold)', lineHeight: 1, opacity: 0.8 }}
              >
                &ldquo;
              </span>

              {/* Quote */}
              <p
                className="font-serif italic leading-relaxed flex-1 mb-6"
                style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.75 }}
              >
                {t.quote}
              </p>

              {/* Gold divider */}
              <div
                className="mb-5"
                style={{ height: '1px', background: 'rgba(201,168,76,0.3)' }}
              />

              {/* Attribution */}
              <div>
                <p
                  className="uppercase tracking-widest font-light"
                  style={{ fontSize: '0.78rem', color: 'var(--text-primary)', letterSpacing: '0.15em' }}
                >
                  {t.name}
                </p>
                <p
                  className="font-light mt-1"
                  style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}
                >
                  {t.city}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
