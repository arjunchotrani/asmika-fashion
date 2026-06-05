import { Navbar } from "@/components/Navbar";
import { Hero } from "@/sections/Hero";
import { MarqueeTicker } from "@/sections/MarqueeTicker";
import { NewArrivals } from "@/sections/NewArrivals";
import { Collections } from "@/sections/Collections";
import { BrandStory } from "@/sections/BrandStory";
import { Values } from "@/sections/Values";
import { HowToOrder } from "@/sections/HowToOrder";
import { Testimonials } from "@/sections/Testimonials";
import { WhatsAppCTA } from "@/sections/WhatsAppCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <MarqueeTicker />
      <NewArrivals />
      <div id="categories">
        <Collections />
      </div>
      <BrandStory />
      <Values />
      <HowToOrder />
      <Testimonials />
      <WhatsAppCTA />
      <Footer />
    </main>
  );
}
