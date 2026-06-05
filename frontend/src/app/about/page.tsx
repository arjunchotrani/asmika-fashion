import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandStory } from "@/sections/BrandStory";
import { Contact } from "@/sections/Contact";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Asmika Fashion | Heritage, Craft & Indian Elegance",
  description: "Founded on timeless elegance and masterful craftsmanship, Asmika Fashion is a premium Indian ethnic wear brand rooted in the textile legacy of Ajanta Silk Mills since 1972.",
  openGraph: {
    title: "About Asmika Fashion | Heritage, Craft & Indian Elegance",
    description: "Founded on timeless elegance and masterful craftsmanship, Asmika Fashion is a premium Indian ethnic wear brand rooted in the textile legacy of Ajanta Silk Mills since 1972.",
    images: [{ url: "/images/fashion2.png", width: 1200, height: 630, alt: "Asmika Fashion Heritage" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Asmika Fashion | Heritage, Craft & Indian Elegance",
    description: "Founded on timeless elegance and masterful craftsmanship, Asmika Fashion is a premium Indian ethnic wear brand rooted in the textile legacy of Ajanta Silk Mills since 1972.",
    images: ["/images/fashion2.png"],
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      
      {/* Page Header */}
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden flex flex-col items-center text-center">
        <span className="text-[10px] tracking-[0.6em] uppercase text-brand-gold mb-6 font-light">
          Our Heritage
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif mb-8">
          The Story of <br />
          <span className="italic font-light">Asmika</span>
        </h1>
        <div className="w-24 h-[1px] bg-brand-gold/40 mb-12" />
        <p className="max-w-2xl text-sm md:text-base text-[var(--text-secondary)] font-light leading-relaxed">
          Founded on the principles of timeless elegance and masterful craftsmanship, Asmika Fashion represents the pinnacle of Indian ethnic wear. Our journey is woven with the threads of tradition and modern editorial sophistication.
        </p>
      </section>

      {/* Featured Image */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto mb-32">
        <div className="relative aspect-video md:aspect-[21/9] w-full bg-brand-black/5 overflow-hidden">
          <Image 
            src="/images/fashion1.png" 
            alt="Asmika Fashion"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-brand-black/20" />
        </div>
      </section>

      {/* Reusing Brand Story Section for detailed narrative */}
      <BrandStory />

      <div className="editorial-sep" />
      <Contact />
      <Footer />
    </main>
  );
}
