import AnimatedHero from "@/components/AnimatedHero";
import PillarsSection from "@/components/PillarsSection";
import CTASection from "@/components/CTASection";
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
