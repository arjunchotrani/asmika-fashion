import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { type Product, sortedImages, whatsappUrl } from '@/lib/api';
import { PriceDisplay } from '@/components/PriceDisplay';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function RelatedProducts({
  products,
  title = 'More Like This',
  subtitle = 'Curated For You',
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 border-t border-[var(--border-color)]">
      <div className="max-w-[1800px] mx-auto">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[9px] tracking-[0.55em] uppercase text-brand-gold font-light mb-3">
              {subtitle}
            </p>
            <h2
              className="text-3xl md:text-4xl font-serif leading-[1.1]"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              {title}
            </h2>
          </div>
          <div className="hidden md:block h-[1px] flex-1 mx-12" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:gap-x-8 md:gap-y-16">
          {products.slice(0, 8).map((product) => {
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
                    <a
                      href={whatsappUrl(product.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366]/90 backdrop-blur-sm text-white py-3 text-[9px] tracking-widest uppercase text-center flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={12} /> Enquire
                    </a>
                  </div>
                </div>

                <Link href={`/product/${product.slug}`} className="block">
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

      </div>
    </section>
  );
}
