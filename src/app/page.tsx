import AISection from "@/components/landing/aisection";
import Clients from "@/components/landing/clients";
import CTA from "@/components/landing/cta";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import LayoutPos from "@/components/landing/layoutpos";
import Modules from "@/components/landing/modules";
import Navbar from "@/components/landing/navbar";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Clients />
        <Features />
        <Modules />
        <AISection />
        <LayoutPos />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
