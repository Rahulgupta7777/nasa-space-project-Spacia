import AnimatedHero from "@/components/AnimatedHero";
import PillarsSection from "@/components/PillarsSection";
import CTASection from "@/components/CTASection";
import OrbitalGlobe from "@/components/OrbitalGlobe";
import WorldviewShowcase from "@/components/WorldviewShowcase";

export default function Home() {
  return (
    <div>
      <AnimatedHero />
      <PillarsSection />
      
      <WorldviewShowcase />
      <CTASection />
    </div>
  );
}
