import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getProduct, getProducts, sortedImages } from '@/lib/api';
import { ProductDetails } from './ProductDetails';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found | Asmika Fashion' };

  const images = sortedImages(product.images);
  const thumb = images[0]?.url;
  const title = `${product.title} | Asmika Fashion`;
  const description = product.seo_description
    ?? product.description
    ?? `Shop ${product.title} — premium handcrafted Indian ethnic wear by Asmika Fashion & Ajanta Silk Mills.`;
  const ogImage = thumb
    ? { url: thumb, width: 1200, height: 630, alt: `${product.title} — Asmika Fashion` }
    : { url: "/images/fashion1.png", width: 1200, height: 630, alt: "Asmika Fashion" };

  return {
    title,
    description,
    keywords: product.meta_keywords ? product.meta_keywords.split(',').map((k: string) => k.trim()) : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: `/product/${product.slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmikafashion.com';

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const allCategoryProducts = product.category_id
    ? await getProducts({ categoryId: product.category_id, status: 'published' })
    : [];
  const relatedProducts = allCategoryProducts.filter((p) => p.id !== product.id);

  const images = sortedImages(product.images);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...(product.category
        ? [{ '@type': 'ListItem', position: 2, name: product.category.name, item: `${SITE_URL}/categories/${product.category.slug}` }]
        : []),
      { '@type': 'ListItem', position: product.category ? 3 : 2, name: product.title, item: `${SITE_URL}/product/${product.slug}` },
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.map((img) => img.url),
    brand: { '@type': 'Brand', name: 'Asmika Fashion' },
    ...(product.price != null && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price,
        availability: (product.stock_quantity != null && product.stock_quantity <= 0)
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        url: `${SITE_URL}/product/${product.slug}`,
      },
    }),
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <Navbar />
      <ProductDetails product={product} relatedProducts={relatedProducts} />
      <Footer />
    </main>
  );
}
