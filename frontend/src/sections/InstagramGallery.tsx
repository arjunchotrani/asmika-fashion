'use client';

import { motion } from 'framer-motion';
import { BrandIcons } from '@/components/BrandIcons';
import Image from 'next/image';

const images = [
  "/images/fashion1.png",
  "/images/fashion2.png",
  "/images/fashion3.png",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611689225620-3e70248bc0f0?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop"
];

export function InstagramGallery() {
  return (
    <section className="py-20 md:py-32 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-10 md:mb-20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0">
        <div>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            className="text-[10px] tracking-[0.6em] uppercase block mb-4 font-light"
          >
            Digital Presence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-5xl font-serif"
          >
            Editorial <span className="italic font-light">Insights</span>
          </motion.h2>
        </div>
        
        <motion.a
          href="#"
          whileHover={{ scale: 1.05 }}
          className="w-12 h-12 border border-[var(--border-color)] rounded-full flex items-center justify-center text-brand-gold hover:border-brand-gold transition-all duration-500"
        >
          <BrandIcons.Instagram size={18} />
        </motion.a>
      </div>

      <div className="flex gap-8 overflow-hidden group">
        <motion.div 
          animate={{ x: [0, -1920] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...images, ...images].map((img, index) => (
            <div 
              key={index} 
              className="relative w-[220px] sm:w-[300px] md:w-[450px] aspect-[4/5] bg-[var(--card-bg)] luxury-image-container group/item"
            >
              <Image 
                src={img} 
                alt={`Instagram Gallery ${index}`}
                fill
                className="object-cover grayscale-[30%] group-hover/item:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/item:bg-transparent transition-colors duration-1000" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
