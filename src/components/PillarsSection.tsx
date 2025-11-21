"use client";
import { useEffect, useRef } from "react";
import { animate, stagger, cubicBezier } from "animejs";
import Link from "next/link";
import { Rocket, Sun, Globe, Database,Building2 } from "lucide-react";



const features = [
  {
    title: "Dashboard",
    desc: "Interactive 3D Earth with real-time satellite tracking, debris monitoring, and orbital data.",
    href: "/dashboard",
    icon: Globe,
    accent: "from-slate-700/30 to-slate-900/30",
    border: "border-slate-600/40",
  },
  {
    title: "Launch Planner",
    desc: "Plan launches with lifetime & debris risk estimates and optimized schedules.",
    href: "/planner",
    icon: Rocket,
    accent: "from-blue-600/20 to-indigo-700/20",
    border: "border-blue-500/40",
  },
  {
    title: "Space Weather",
    desc: "Solar flare tracking, Kp forecasts, and impact assessments for satellites and aviation.",
    href: "/spaceweather",
    icon: Sun,
    accent: "from-amber-600/20 to-orange-700/20",
    border: "border-amber-500/40",
  },
  {
    title: "Business Advisor",
    desc: "AI-powered feasibility analysis, commercial mission blueprints, sustainability scoring, and the full partner ecosystem.",
    href: "/business",
    icon: Building2,
    accent: "from-green-600/20 to-teal-700/20",
    border: "border-green-500/40",
  },

];

export default function PillarsSection() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll(".pillar-card");
    animate(cards, {
      opacity: [0, 1],
      translateY: [14, 0],
      delay: stagger(120),
      duration: 650,
      easing: cubicBezier(0.22, 0.9, 0.28, 0.99),
    });
  }, []);

  return (
    <section className="mt-8" aria-labelledby="features-heading" ref={ref}>
      <div className="text-center mb-8">
        <h2 id="features-heading" className="text-3xl font-extrabold text-slate-100">
          Core Capabilities
        </h2>
        <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
          Tools for situational awareness, mission planning and sustainable commercialization in LEO.
        </p>
      </div>

      {/* CENTERED GRID */}
      <div
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center"
      >
        {features.map((f) => {
          const Icon = f.icon;

          return (
            <Link
              key={f.title}
              href={f.href}
              className={`pillar-card group relative block overflow-hidden rounded-2xl border ${f.border} bg-gradient-to-br ${f.accent} backdrop-blur-sm p-6 transition-transform hover:scale-[1.03] hover:-translate-y-1 shadow-md hover:shadow-xl max-w-[280px] text-center`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-50 blur-3xl transition-all" />

              <div className="relative z-10 flex flex-col items-center h-full min-h-[160px]">

                {/* ICON */}
                <div
                  aria-hidden
                  className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-white/8 to-white/2 border border-white/10 shadow-[0_8px_22px_rgba(0,0,0,0.5)] mb-4"
                >
                  <Icon className="w-7 h-7 text-slate-100" />
                </div>

                {/* TITLE & DESC */}
                <h3 className="text-lg font-semibold text-slate-100">{f.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-3 px-2">
                  {f.desc}
                </p>

                {/* BOTTOM ACTION */}
                <div className="mt-auto flex flex-col items-center text-xs text-slate-300 pt-4">
                  <span>Learn more</span>
                  <span className="mt-1 text-[11px] px-2 py-1 rounded-full bg-white/6 border border-white/4 text-slate-200">
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
