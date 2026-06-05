import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getProducts, sortedImages } from '@/lib/api';
import { PriceDisplay } from '@/components/PriceDisplay';
import { RelatedProducts } from '@/components/RelatedProducts';
import { FAQSection } from '@/components/FAQSection';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'New Arrivals | Asmika Fashion',
  description: 'Discover the latest handcrafted additions to Asmika Fashion — new Indian ethnic wear, luxury sarees, suits, and couture pieces from Ajanta Silk Mills.',
  openGraph: {
    title: 'New Arrivals | Asmika Fashion',
    description: 'Discover the latest handcrafted additions to Asmika Fashion — new Indian ethnic wear, luxury sarees, suits, and couture pieces from Ajanta Silk Mills.',
    images: [{ url: "/images/fashion1.png", width: 1200, height: 630, alt: "Asmika Fashion New Arrivals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: 'New Arrivals | Asmika Fashion',
    description: 'Discover the latest handcrafted additions to Asmika Fashion — new Indian ethnic wear, luxury sarees, suits, and couture pieces from Ajanta Silk Mills.',
    images: ["/images/fashion1.png"],
  },
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage() {
  const [products, featuredProducts] = await Promise.all([
    getProducts({ status: 'published', sort: 'newest' }),
    getProducts({ featured: true, status: 'published' }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* ── Header ────────────────────────────────────── */}
      <section className="pt-48 pb-20 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto flex flex-col items-center text-center">
          <p className="text-[10px] tracking-[0.6em] uppercase block mb-6 font-light text-[var(--text-secondary)]">
            The Latest from Our Collection
          </p>
          <h1 className="text-5xl md:text-7xl font-serif mb-12">
            New <span className="italic font-light">Arrivals</span>
          </h1>
          <div className="w-32 h-[1px] bg-brand-gold/40" />
        </div>
      </section>

      {/* ── Product Grid ──────────────────────────────── */}
      <section className="pb-32 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">

          <div className="flex items-center justify-between mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--text-secondary)] font-light">
              {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
            </p>
            <div className="h-[1px] flex-1 mx-8" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)' }} />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-[11px] tracking-[0.5em] uppercase text-[var(--text-secondary)] font-light mb-4">
                New pieces arriving soon
              </p>
              <Link href="/" className="text-[9px] tracking-[0.4em] uppercase text-brand-gold hover:underline">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((product) => {
                const images = sortedImages(product.images);
                const thumb = images[0]?.url;
                return (
                  <div key={product.id} className="group">
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[var(--card-bg)]">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="card-placeholder" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
                      </div>

                      {product.subcategory && (
                        <span className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/55 font-light block mb-1">
                          {product.subcategory.name}
                        </span>
                      )}
                      {product.category && !product.subcategory && (
                        <span className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/55 font-light block mb-1">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="text-sm md:text-base tracking-wide font-medium mb-1 group-hover:text-brand-gold transition-colors duration-300">
                        {product.title}
                      </h3>
                      <p className="text-sm font-light text-brand-gold/80">
                        <PriceDisplay price={product.price} />
                      </p>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <RelatedProducts
        products={featuredProducts.filter((p) => !products.find((np) => np.id === p.id))}
        title="You Might Also Like"
        subtitle="Featured Pieces"
      />
      <FAQSection />
      <Footer />
    </main>
  );
}
