'use client';

import { MessageCircle } from 'lucide-react';
import { whatsappUrl, trackWhatsAppClick } from '@/lib/api';

interface Props {
  productTitle: string;
  productSlug: string;
}

export function WhatsAppEnquireButton({ productTitle, productSlug }: Props) {
  return (
    <a
      href={whatsappUrl(productTitle)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(productSlug)}
      className="w-full bg-[#25D366]/90 backdrop-blur-sm text-white py-3 text-[9px] tracking-widest uppercase text-center flex items-center justify-center gap-2"
    >
      <MessageCircle size={12} /> Enquire
    </a>
  );
}
