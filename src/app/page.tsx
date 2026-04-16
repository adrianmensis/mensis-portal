import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Legacy } from "@/components/landing/legacy";
import { Origin } from "@/components/landing/origin";
import { Pillars } from "@/components/landing/pillars";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Hero />
      <Pillars />
      <Legacy />
      <Origin />
      <Footer />
    </div>
  );
}
