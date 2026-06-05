'use client';

import { trackWhatsAppClick } from '@/lib/api';

const WHATSAPP_HREF =
  'https://wa.me/918200112608?text=' +
  encodeURIComponent("Hi! I'd love to know more about your collection.");

export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick()}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-[90] flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#20ba5a] transition-colors duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="white"
        aria-hidden="true"
      >
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.738 5.47 2.027 7.77L0 32l8.489-2.002A15.94 15.94 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.3 13.3 0 0 1-6.789-1.854l-.487-.29-5.041 1.188 1.212-4.913-.319-.503A13.286 13.286 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.293-9.906c-.4-.2-2.366-1.168-2.732-1.3-.366-.134-.633-.2-.9.2-.267.4-1.033 1.3-1.267 1.567-.233.267-.467.3-.867.1-.4-.2-1.688-.622-3.215-1.983-1.188-1.06-1.99-2.368-2.222-2.768-.233-.4-.025-.616.175-.816.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.78-.655-.673-.9-.686l-.767-.013c-.267 0-.7.1-1.067.5s-1.4 1.367-1.4 3.334 1.433 3.867 1.633 4.134c.2.267 2.82 4.306 6.832 6.036.955.412 1.7.658 2.281.843.958.305 1.831.262 2.52.159.769-.115 2.366-.967 2.7-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z" />
      </svg>
    </a>
  );
}
