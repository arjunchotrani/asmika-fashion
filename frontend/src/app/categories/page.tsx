import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FAQSection } from '@/components/FAQSection';
import { getCategories } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categories | Asmika Fashion',
  description: 'Explore our curated categories of premium Indian ethnic textiles and luxury fashion — sarees, suits, kurtas and more, handcrafted by Ajanta Silk Mills.',
  openGraph: {
    title: 'Categories | Asmika Fashion',
    description: 'Explore our curated categories of premium Indian ethnic textiles and luxury fashion — sarees, suits, kurtas and more, handcrafted by Ajanta Silk Mills.',
    images: [{ url: "/images/fashion1.png", width: 1200, height: 630, alt: "Asmika Fashion Categories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Categories | Asmika Fashion',
    description: 'Explore our curated categories of premium Indian ethnic textiles and luxury fashion — sarees, suits, kurtas and more, handcrafted by Ajanta Silk Mills.',
    images: ["/images/fashion1.png"],
  },
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* ── Header ──────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 md:px-12 border-b border-[var(--border-color)]">
        <div className="max-w-[1800px] mx-auto">
          <p className="text-[9px] tracking-[0.6em] uppercase text-brand-gold/60 font-light mb-6">
            Shop by Category
          </p>
          <h1 className="text-5xl md:text-7xl font-serif leading-[0.95]">
            The Curated<br />
            <em>Categories</em>
          </h1>
        </div>
      </section>

      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="px-6 md:px-12 py-5">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3 text-[9px] tracking-[0.3em] uppercase text-[var(--text-secondary)] font-light">
          <Link href="/" className="hover:text-brand-gold transition-colors duration-300">Home</Link>
          <span className="text-brand-gold/30">/</span>
          <span className="text-brand-gold/60">Categories</span>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          {categories.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-[11px] tracking-[0.5em] uppercase text-[var(--text-secondary)] font-light mb-4">
                No categories available yet
              </p>
              <Link href="/" className="text-[9px] tracking-[0.4em] uppercase text-brand-gold hover:underline">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--card-bg)] mb-5">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="card-placeholder" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      {category.subcategories && category.subcategories.filter(s => s.status === 'published').length > 0 && (
                        <p className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/55 font-light mb-1">
                          {category.subcategories.filter(s => s.status === 'published').length} styles
                        </p>
                      )}
                      <h2 className="text-lg md:text-xl font-serif tracking-wide group-hover:text-brand-gold transition-colors duration-300">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-[11px] text-[var(--text-secondary)] font-light tracking-[0.08em] mt-1 leading-relaxed line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[9px] tracking-[0.3em] uppercase text-brand-gold/60 font-light shrink-0 ml-4 group-hover:text-brand-gold transition-colors duration-300">
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <FAQSection />
      <Footer />
    </main>
  );
}
