import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getCategory, getProducts, sortedImages } from '@/lib/api';
import { PriceDisplay } from '@/components/PriceDisplay';
import { RelatedProducts } from '@/components/RelatedProducts';
import { FAQSection } from '@/components/FAQSection';
import { WhatsAppEnquireButton } from '@/components/WhatsAppEnquireButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Category Not Found | Asmika Fashion' };

  const title = `${category.name} | Asmika Fashion`;
  const description = category.description
    ?? `Shop premium handcrafted ${category.name} at Asmika Fashion — luxury Indian ethnic wear by Ajanta Silk Mills.`;
  const ogImage = category.image_url
    ? { url: category.image_url, width: 1200, height: 630, alt: `${category.name} — Asmika Fashion` }
    : { url: "/images/fashion1.png", width: 1200, height: 630, alt: "Asmika Fashion" };

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url: `/categories/${slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [category, products, featuredProducts] = await Promise.all([
    getCategory(slug),
    getCategory(slug).then((cat) =>
      cat ? getProducts({ categoryId: cat.id, status: 'published' }) : []
    ),
    getProducts({ featured: true, status: 'published' }),
  ]);

  if (!category) notFound();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* ── Cinematic Banner ──────────────────────────────── */}
      <section className="relative h-[55vh] sm:h-[65vh] md:h-[80vh] w-full overflow-hidden flex items-end pb-12 md:pb-24 px-6 md:px-12">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="card-placeholder" style={{ position: 'absolute', inset: 0 }} />
        )}

        <div className="absolute inset-0 banner-fade-overlay" />
        <div className="absolute inset-x-0 top-0 h-32 banner-top-fade" />

        <div className="relative z-10 max-w-[1800px] mx-auto w-full">
          <p className="text-[9px] md:text-[10px] tracking-[0.6em] uppercase text-brand-gold/70 font-light mb-4">
            Category
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-[0.95] mb-6">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs md:text-sm text-[var(--text-secondary)] font-light tracking-[0.12em] max-w-lg leading-[2]">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* ── Breadcrumb ────────────────────────────────────── */}
      <div className="px-6 md:px-12 py-6 border-b border-[var(--border-color)]">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3 text-[9px] tracking-[0.3em] uppercase text-[var(--text-secondary)] font-light">
          <Link href="/" className="hover:text-brand-gold transition-colors duration-300">Home</Link>
          <span className="text-brand-gold/30">/</span>
          <Link href="/categories" className="hover:text-brand-gold transition-colors duration-300">Categories</Link>
          <span className="text-brand-gold/30">/</span>
          <span className="text-brand-gold/60">{category.name}</span>
        </div>
      </div>

      {/* ── Subcategories ─────────────────────────────────── */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="px-6 md:px-12 py-8 border-b border-[var(--border-color)]">
          <div className="max-w-[1800px] mx-auto flex flex-wrap gap-3">
            {category.subcategories
              .filter((s) => s.status === 'published')
              .map((sub) => (
                <span
                  key={sub.id}
                  className="text-[9px] tracking-[0.3em] uppercase px-5 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] font-light"
                >
                  {sub.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* ── Product Grid ──────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:gap-x-8 md:gap-y-16">
              {products.map((product) => {
                const images = sortedImages(product.images);
                const thumb = images[0]?.url;
                const hover = images[1]?.url;
                return (
                  <div key={product.id} className="group">
                    <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[var(--card-bg)]">
                      {thumb ? (
                        <>
                          <Image
                            src={thumb}
                            alt={product.title}
                            fill
                            className="object-cover transition-opacity duration-700 group-hover:opacity-0"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          {hover && (
                            <Image
                              src={hover}
                              alt={product.title}
                              fill
                              className="object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          )}
                        </>
                      ) : (
                        <div className="card-placeholder" />
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="w-full bg-black/85 backdrop-blur-sm text-[#FDFCF8] py-3 text-[9px] tracking-widest uppercase text-center hover:bg-brand-gold hover:text-black transition-colors duration-300"
                        >
                          View Details
                        </Link>
                        <WhatsAppEnquireButton
                          productTitle={product.title}
                          productSlug={product.slug}
                        />
                      </div>
                    </div>

                    <Link href={`/product/${product.slug}`} className="block">
                      {product.subcategory && (
                        <span className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/55 font-light block mb-1">
                          {product.subcategory.name}
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
        products={featuredProducts.filter((p) => !products.find((cp) => cp.id === p.id))}
        title="You Might Also Like"
        subtitle="Featured Pieces"
      />
      <FAQSection />
      <Footer />
    </main>
  );
}
