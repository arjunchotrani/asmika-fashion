'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          message: form.message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Something went wrong. Please try again.');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">

        {/* Left column — info */}
        <div className="flex flex-col justify-between py-4">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              className="text-[10px] tracking-[0.6em] uppercase block mb-8 font-light"
            >
              Private Enquiry
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif mb-12"
            >
              Connect with <br />
              <span className="italic font-light">Asmika Fashion</span>
            </motion.h2>
            <p className="max-w-md text-sm text-[var(--text-secondary)] font-light leading-relaxed tracking-wide uppercase">
              Reach out for fabric enquiries, wholesale orders, or bridal collections. We will get back to you promptly.
            </p>
          </div>

          <div className="mt-10 md:mt-20 space-y-8 md:space-y-10">
            <div>
              <span className="text-[8px] tracking-[0.4em] uppercase opacity-40 block mb-4">Sales Office</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=6092+Radha+Krishna+Textile+Market+Nawabwadi+Road+Begampura+Ring+Road+Surat+Gujarat+395002"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-light text-[var(--text-secondary)] leading-relaxed block hover:text-brand-gold transition-colors duration-300"
              >
                6092, Radha Krishna Textile Market (RKT),<br />
                Nawabwadi Road, Begampura,<br />
                Ring Road, Surat, Gujarat 395002
              </a>
            </div>
            <div>
              <span className="text-[8px] tracking-[0.4em] uppercase opacity-40 block mb-4">Studio Office</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=4020+Sangini+Trade+Centre+Opp+Kumbhariya+Gaam+Highway+Surat+Kadodara+Road+Gujarat+395010"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-light text-[var(--text-secondary)] leading-relaxed block hover:text-brand-gold transition-colors duration-300"
              >
                4020, Sangini Trade Centre,<br />
                Opp Kumbhariya Gaam Highway,<br />
                Surat – Kadodara Rd,<br />
                Surat, Gujarat 395010
              </a>
            </div>
            <div>
              <span className="text-[8px] tracking-[0.4em] uppercase opacity-40 block mb-4">Store Hours</span>
              <p className="text-sm font-light">Mon — Sat: 11:00 AM to 08:00 PM</p>
            </div>
          </div>
        </div>

        {/* Right column — form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[var(--bg-primary)] p-5 sm:p-8 md:p-16 border border-[var(--border-color)] relative"
        >
          <div className="absolute inset-0 bg-brand-gold/5 pointer-events-none" />

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative z-10 flex flex-col items-center justify-center h-full min-h-[320px] text-center gap-6"
              >
                <CheckCircle className="w-12 h-12 text-brand-gold opacity-80" strokeWidth={1.2} />
                <div>
                  <p className="font-serif text-2xl mb-3">Enquiry Received</p>
                  <p className="text-sm font-light text-[var(--text-secondary)] leading-relaxed max-w-xs">
                    Thank you, {form.name.split(' ')[0]}. We will reach out to you on {form.phone} shortly.
                  </p>
                </div>
                <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-light">
                  Prefer faster replies? WhatsApp us — +91 820 011 2608
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="relative z-10 space-y-10"
              >
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-3">
                    <label className="text-[9px] tracking-[0.4em] uppercase opacity-50 block">Full Name *</label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-[var(--border-color)] py-3 outline-none focus:border-brand-gold transition-colors duration-300 font-light text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] tracking-[0.4em] uppercase opacity-50 block">WhatsApp / Phone *</label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-[var(--border-color)] py-3 outline-none focus:border-brand-gold transition-colors duration-300 font-light text-sm"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="text-[9px] tracking-[0.4em] uppercase opacity-50 block">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[var(--border-color)] py-3 outline-none focus:border-brand-gold transition-colors duration-300 font-light text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Message */}
                <div className="space-y-3">
                  <label className="text-[9px] tracking-[0.4em] uppercase opacity-50 block">Your Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[var(--border-color)] py-3 outline-none focus:border-brand-gold transition-colors duration-300 font-light text-sm resize-none"
                    placeholder="Tell us what you're looking for — fabric type, occasion, quantity, or any specific requirements..."
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-400 font-light tracking-wide">{error}</p>
                )}

                {/* WhatsApp nudge */}
                <p className="text-[10px] tracking-[0.15em] uppercase opacity-35 font-light">
                  Prefer instant replies? WhatsApp us directly — +91 820 011 2608
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="luxury-button w-full group border-brand-gold/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {submitting ? 'Sending...' : 'Submit Enquiry'}
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
