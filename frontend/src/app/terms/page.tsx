import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Asmika Fashion",
  description: "Read the terms and conditions governing use of the Asmika Fashion website, enquiries, and private sale services.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      
      {/* Page Header */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden flex flex-col items-center text-center">
        <span className="text-[10px] tracking-[0.6em] uppercase text-brand-gold mb-6 font-light">
          Legal
        </span>
        <h1 className="text-4xl md:text-6xl font-serif mb-8">
          Terms & <br />
          <span className="italic font-light">Conditions</span>
        </h1>
        <div className="w-24 h-[1px] bg-brand-gold/40 mb-12" />
      </section>

      {/* Content */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto mb-32">
        <div className="space-y-12 text-[var(--text-secondary)] font-light leading-relaxed">
          
          <div>
            <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4 tracking-wide">1. Acceptance of Terms</h2>
            <p className="text-sm">
              By accessing and using the Asmika Fashion website, you agree to comply with and be bound by these Terms and Conditions. These terms govern your use of our editorial showcase and services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4 tracking-wide">2. Intellectual Property</h2>
            <p className="text-sm">
              All content, including but not limited to photography, text, design, and graphics, is the exclusive property of Asmika Fashion and Ajanta Silk Mills. Unauthorized reproduction, distribution, or use of any materials is strictly prohibited and protected by international copyright laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4 tracking-wide">3. Enquiries & Private Sales</h2>
            <p className="text-sm">
              Asmika Fashion operates primarily as an editorial showcase and private label. Product availability, pricing, and bespoke services are provided strictly upon enquiry. We reserve the right to decline requests at our discretion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4 tracking-wide">4. Craftsmanship & Variations</h2>
            <p className="text-sm">
              Our textiles are hand-woven and crafted using traditional techniques. Slight variations in color, texture, and weave are intrinsic to the artisanal process and are not considered defects, but rather hallmarks of authentic luxury.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4 tracking-wide">5. Modifications</h2>
            <p className="text-sm">
              Asmika Fashion reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Continued use of the site constitutes acceptance of the modified terms.
            </p>
          </div>

          <div className="pt-12 mt-12 border-t border-[var(--border-color)]">
            <p className="text-xs uppercase tracking-[0.2em] opacity-60">
              Last Updated: May 2026
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
