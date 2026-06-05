import type { Metadata } from "next";
import { Inter, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import { SplashGate } from "@/components/SplashGate";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackButton } from "@/components/BackButton";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CurrencyProvider } from "@/context/CurrencyContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ['400', '700'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmikafashion.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Asmika Fashion | Luxury Indian Ethnic Wear & Textiles",
    template: "%s | Asmika Fashion",
  },
  description: "Experience the pinnacle of Indian elegance. Asmika Fashion offers premium handcrafted ethnic wear and luxury textiles by Ajanta Silk Mills.",
  keywords: ["luxury ethnic wear", "premium sarees", "handcrafted indian fashion", "ajanta silk mills", "indian ethnic textiles", "luxury kurta", "silk sarees india"],
  authors: [{ name: "Asmika Fashion" }],
  creator: "Asmika Fashion",
  publisher: "Asmika Fashion",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Asmika Fashion",
    title: "Asmika Fashion | Luxury Indian Ethnic Wear & Textiles",
    description: "Experience the pinnacle of Indian elegance. Asmika Fashion offers premium handcrafted ethnic wear and luxury textiles by Ajanta Silk Mills.",
    url: SITE_URL,
    images: [{ url: "/images/fashion1.png", width: 1200, height: 630, alt: "Asmika Fashion — Luxury Indian Ethnic Wear" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asmika Fashion | Luxury Indian Ethnic Wear & Textiles",
    description: "Experience the pinnacle of Indian elegance. Asmika Fashion offers premium handcrafted ethnic wear and luxury textiles by Ajanta Silk Mills.",
    images: ["/images/fashion1.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-J21JVBMETB" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J21JVBMETB');
        `}} />

        {/* Auto time-based theme: light 06:00–18:00, dark otherwise.
            Runs synchronously before paint so there is no flash.
            Skipped once the user manually toggles (asmika-theme-manual = true). */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              if (localStorage.getItem('asmika-theme-manual') !== 'true') {
                var h = new Date().getHours();
                var t = (h >= 6 && h < 18) ? 'light' : 'dark';
                localStorage.setItem('theme', t);
                document.documentElement.setAttribute('data-theme', t);
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${cinzel.variable} font-sans antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <CurrencyProvider>
          <div className="grain-overlay" />
          <SplashGate>
            <div id="cursor-main" className="custom-cursor hidden md:block" />
            <div id="cursor-follower" className="custom-cursor-follower hidden md:block" />
            {children}
            <BackButton />
            <WhatsAppFloat />
          </SplashGate>
          </CurrencyProvider>

          <script dangerouslySetInnerHTML={{ __html: `
            const cursor = document.getElementById('cursor-main');
            const follower = document.getElementById('cursor-follower');
            document.addEventListener('mousemove', (e) => {
              if(cursor && follower) {
                cursor.style.transform = \`translate3d(\${e.clientX - 3}px, \${e.clientY - 3}px, 0)\`;
                follower.style.transform = \`translate3d(\${e.clientX - 16}px, \${e.clientY - 16}px, 0)\`;
              }
            });
            document.querySelectorAll('a, button, [role="button"]').forEach(el => {
              el.addEventListener('mouseenter', () => follower?.classList.add('scale-150'));
              el.addEventListener('mouseleave', () => follower?.classList.remove('scale-150'));
            });
          `}} />
        </ThemeProvider>
      </body>
    </html>
  );
}
