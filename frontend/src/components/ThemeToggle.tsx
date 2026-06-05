'use client';

import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch — render a fixed-size placeholder until mounted
  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = theme === 'dark';

  function handleToggle() {
    try { localStorage.setItem('asmika-theme-manual', 'true'); } catch (_) {}
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-10 h-10 flex items-center justify-center group"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Icon morph */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -45, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 45, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="absolute"
          >
            <Moon
              size={16}
              strokeWidth={1.5}
              className="text-[var(--text-primary)] group-hover:text-brand-gold transition-colors duration-300"
            />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 45, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -45, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="absolute"
          >
            <Sun
              size={16}
              strokeWidth={1.5}
              className="text-[var(--text-primary)] group-hover:text-brand-gold transition-colors duration-300"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover ring — luxury microinteraction */}
      <span className="absolute inset-0 rounded-full border border-brand-gold/0 group-hover:border-brand-gold/35 transition-all duration-500 scale-75 group-hover:scale-100" />
    </button>
  );
}
