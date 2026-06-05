'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') return null;

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className="fixed top-24 left-6 z-[90] flex items-center gap-3 px-5 py-3 bg-[var(--bg-primary)] border border-brand-gold/40 hover:border-brand-gold hover:bg-brand-gold/10 transition-all duration-300 group shadow-lg"
    >
      <ArrowLeft size={13} strokeWidth={1.5} className="text-brand-gold" />
      <span className="text-[9px] tracking-[0.35em] uppercase font-light text-[var(--text-primary)] group-hover:text-brand-gold transition-colors duration-300">
        Back
      </span>
    </button>
  );
}
