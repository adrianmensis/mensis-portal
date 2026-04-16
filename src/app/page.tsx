import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Vision } from "@/components/landing/vision";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Vision />
      </main>
      <Footer />
    </div>
  );
}
