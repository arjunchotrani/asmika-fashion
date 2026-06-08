'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CurrencySelector } from './CurrencySelector';
import { SearchOverlay } from './SearchOverlay';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Categories', href: '/categories' },
  { name: 'About Us', href: '/about' },
  { name: 'Terms & Conditions', href: '/terms' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 transition-all duration-[400ms] ease text-[var(--text-primary)]",
          isScrolled ? "glass-nav py-4" : "bg-transparent"
        )}
      >
        <div className="max-w-[1800px] mx-auto flex items-center justify-between w-full">

          {/* Left: Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10" />

          {/* Center: Logo */}
          <Link href="/" className="relative md:absolute md:left-1/2 md:-translate-x-1/2">
            <motion.div
              animate={{ scale: isScrolled ? 0.8 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src="/images/asmika-logo.png"
                alt="Asmika Fashion"
                width={0}
                height={0}
                sizes="(max-width: 768px) 120px, 160px"
                className="w-[100px] sm:w-[120px] md:w-[160px] h-auto object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Right: Search, ThemeToggle, Menu */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-[var(--text-secondary)] hover:text-brand-gold transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={16} strokeWidth={1.5} />
            </button>
            <CurrencySelector />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col gap-1.5 items-end group"
              aria-label="Open menu"
            >
              <div className="w-6 h-[1px] bg-current transition-all duration-500 group-hover:w-8" />
              <div className="w-4 h-[1px] bg-current transition-all duration-500 group-hover:w-8" />
            </button>
          </div>

        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* ── Full-Screen Menu Overlay ─────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 bg-[var(--bg-primary)] z-[200] flex flex-col items-center justify-center gap-10"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-2 hover:text-brand-gold transition-colors z-[210]"
              aria-label="Close menu"
            >
              <X size={32} strokeWidth={1} />
            </button>

            {/* Home link */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.2em] uppercase hover:text-brand-gold transition-all duration-500 hover:italic"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Home
              </motion.span>
            </Link>

            {NAV_LINKS.map((item, idx) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.2em] uppercase hover:text-brand-gold transition-all duration-500 hover:italic"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  {item.name}
                </motion.span>
              </Link>
            ))}

            <div className="mt-12 text-[9px] tracking-[0.5em] uppercase opacity-40">
              Powered by Ajanta Silk Mills
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
