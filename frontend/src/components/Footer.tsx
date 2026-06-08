'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BrandIcons } from './BrandIcons';

export function Footer() {
  return (
    <footer className="bg-[var(--bg-subtle)] pt-16 pb-16 px-6 md:px-12 border-t border-[var(--border-color)] overflow-hidden">
      <div className="max-w-[1800px] mx-auto">

        {/* ── Three-column grid ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">

          {/* Column 1: Brand Identity */}
          <div className="space-y-10 md:pr-12 lg:pr-20 md:border-r border-[var(--border-color)]">
            <Link href="/">
              <Image
                src="/images/asmika-logo.png"
                alt="Asmika Fashion"
                width={0}
                height={0}
                sizes="(max-width: 768px) 140px, 180px"
                className="w-[140px] md:w-[180px] h-auto object-contain"
              />
            </Link>

            <div className="flex gap-8">
              {[
                { Icon: BrandIcons.Instagram, href: "#" },
                { Icon: BrandIcons.Facebook, href: "#" },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ y: -4, color: 'var(--brand-gold)' }}
                  className="text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-all duration-500"
                >
                  <social.Icon size={20} />
                </motion.a>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] tracking-[0.2em] uppercase font-light text-[var(--text-secondary)]">
                Powered by Ajanta Silk Mills
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase font-light text-[var(--text-secondary)]">
                Since 1972
              </p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-8 md:px-12 lg:px-20 md:border-r border-[var(--border-color)] mt-4 md:mt-0">
            <h4 className="text-xs tracking-[0.4em] uppercase font-light text-[var(--text-secondary)]">Navigate</h4>
            <ul className="space-y-5">
              {[
                { name: 'New Arrivals', href: '/new-arrivals' },
                { name: 'About Us', href: '/about' },
                { name: 'Terms & Conditions', href: '/terms' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs tracking-[0.15em] uppercase font-light text-[var(--text-secondary)] hover:text-brand-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Enquiries */}
          <div className="space-y-8 md:pl-12 lg:pl-20 mt-4 md:mt-0">
            <h4 className="text-xs tracking-[0.4em] uppercase font-light text-[var(--text-secondary)]">Enquiries</h4>

            <div className="space-y-2">
              <h5 className="text-[10px] tracking-[0.2em] font-medium uppercase text-[var(--text-primary)]">Address</h5>
              <a
                href="https://www.google.com/maps/search/?api=1&query=4020+Sangini+Trade+Centre+Opp+Kumbhariya+Gaam+Highway+Surat+Kadodara+Road+Gujarat+395010"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-light text-[var(--text-secondary)] leading-relaxed max-w-xs block hover:text-brand-gold transition-colors duration-300"
              >
                4020, Sangini Trade Centre,<br />
                Opp Kumbhariya Gaam Highway,<br />
                Surat – Kadodara Rd,<br />
                Surat, Gujarat 395010
              </a>
            </div>

            <div className="space-y-2">
              <h5 className="text-[10px] tracking-[0.2em] font-medium uppercase text-[var(--text-primary)]">Contact</h5>
              <div className="flex flex-col gap-1">
                <a
                  href="tel:+918200112608"
                  className="text-sm font-light text-[var(--text-secondary)] hover:text-brand-gold transition-colors duration-300"
                >
                  +91 820 011 2608
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-[10px] tracking-[0.2em] font-medium uppercase text-[var(--text-primary)]">E-mail</h5>
              <p className="text-sm font-light text-[var(--text-secondary)]">Ajanta6092@gmail.com</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
