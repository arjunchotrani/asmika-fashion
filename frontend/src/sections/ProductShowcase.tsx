'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Image from 'next/image';

const products = [
  {
    name: "Golden Weaver Saree",
    category: "Signature Series",
    price: "Inquiry Only",
    image: "https://images.unsplash.com/photo-1610030469668-93510029ed47?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Crimson Silk Ensemble",
    category: "Collection Edit",
    price: "Inquiry Only",
    image: "/images/fashion1.png"
  },
  {
    name: "Emerald Heritage Wrap",
    category: "Heritage Weaves",
    price: "Inquiry Only",
    image: "/images/fashion3.png"
  },
  {
    name: "Ivory Muse Lehengha",
    category: "Bridal Couture",
    price: "Inquiry Only",
    image: "https://images.unsplash.com/photo-1611689225620-3e70248bc0f0?q=80&w=2070&auto=format&fit=crop"
  }
];

export function ProductShowcase() {
  return (
    <section className="py-32 px-6 md:px-12 bg-[var(--bg-primary)]">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            className="text-[10px] tracking-[0.6em] uppercase block mb-6 font-light"
          >
            The Gallery
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif mb-8"
          >
            Signature <span className="italic font-light">Archive</span>
          </motion.h2>
          <div className="w-24 h-[1px] bg-brand-gold/40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="group"
            >
              <div className="luxury-image-container aspect-[3/4] mb-10 bg-brand-black/5 cursor-pointer">
                <Image 
                  src={product.image} 
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-[2000ms] group-hover:scale-105"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  className="absolute bottom-10 right-10 w-16 h-16 bg-brand-black text-brand-gold flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 shadow-2xl z-20"
                >
                  <Plus size={24} strokeWidth={1} />
                </motion.button>
                <div className="absolute top-10 left-10">
                  <span className="text-[9px] tracking-[0.4em] uppercase bg-brand-black/90 text-brand-gold px-5 py-2 backdrop-blur-xl border border-white/5">
                    {product.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/10 transition-colors duration-1000" />
              </div>
              
              <div className="flex flex-col gap-3 px-2">
                <h3 className="text-sm tracking-[0.2em] uppercase font-light group-hover:text-brand-gold transition-colors duration-700">{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-serif italic text-brand-gold/70">{product.price}</span>
                  <div className="w-16 h-[1px] bg-[var(--border-color)] group-hover:bg-brand-gold/30 group-hover:w-24 transition-all duration-1000" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
