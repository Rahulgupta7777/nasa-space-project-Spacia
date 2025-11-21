"use client";
import AnimatedHero from "@/components/AnimatedHero";
import PillarsSection from "@/components/PillarsSection";
import CTASection from "@/components/CTASection";
import WorldviewShowcase from "@/components/WorldviewShowcase";
import MiniDashboardPreview from "@/components/MiniDashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">

      {/* Top layout: hero + live preview */}
      <header className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <AnimatedHero />
          </div>

          <aside className="lg:col-span-5 hidden lg:block">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">
                Live Debris Worldview Preview
              </h3>
              <MiniDashboardPreview />
            </div>
          </aside>
        </div>
      </header>

      {/* Features */}
      <main className="mx-auto max-w-7xl px-6 pb-16 mt-10 md:mt-20">
        <PillarsSection />

        <section className="mt-6 rounded-xl border border-slate-800/60 bg-[#071018] p-6 md:mt-25">
          <WorldviewShowcase />
        </section>

        <div className="mt-8">
          <CTASection />
        </div>
      </main>
    </div>
  );
}
