"use client";
import { useEffect, useRef } from "react";
import { animate, stagger, cubicBezier } from "animejs";
import Link from "next/link";
import { Rocket, Sun, Globe, ArrowRight } from "lucide-react";

const features = [
  { 
    title: "Dashboard", 
    desc: "Interactive 3D Earth visualization with real-time satellite tracking, debris monitoring, and orbital data visualization.",
    href: "/dashboard",
    icon: Globe,
    gradient: "from-slate-700/30 to-slate-900/30",
    borderColor: "border-slate-600/40",
    hoverShadow: "hover:shadow-slate-500/20",
    iconColor: "text-slate-300"
  },
  { 
    title: "Launch Planner Dashboard", 
    desc: "Plan responsible LEO missions with lifetime estimates, debris risk assessment, and optimal launch site recommendations.",
    href: "/planner",
    icon: Rocket,
    gradient: "from-blue-600/20 to-indigo-700/20",
    borderColor: "border-blue-500/40",
    hoverShadow: "hover:shadow-blue-500/20",
    iconColor: "text-blue-300"
  },
  { 
    title: "Space Weather", 
    desc: "Real-time space weather monitoring with solar flare tracking, Kp index forecasts, and impact assessments for satellites and aviation.",
    href: "/spaceweather",
    icon: Sun,
    gradient: "from-amber-600/20 to-orange-700/20",
    borderColor: "border-amber-500/40",
    hoverShadow: "hover:shadow-amber-500/20",
    iconColor: "text-amber-300"
  },
];


export default function PillarsSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll(".pillar-card");
    animate(cards as NodeListOf<Element>, { opacity: [0, 1], translateY: [12, 0], delay: stagger(120), duration: 600, ease: cubicBezier(0.25, 0.46, 0.45, 0.94) });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 mb-20" ref={ref}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Key Features</h2>
        <p className="text-slate-400 text-sm">Explore our powerful tools for space mission planning and monitoring</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Link 
              key={f.title} 
              href={f.href} 
              className={`pillar-card group relative rounded-xl border ${f.borderColor} bg-gradient-to-br ${f.gradient} backdrop-blur-sm p-6 transition-all duration-300 ${f.hoverShadow} hover:scale-[1.02] hover:-translate-y-1 overflow-hidden`}
            >
              {/* Background glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-slate-900/40 border border-slate-700/50 transition-colors ${
                    f.iconColor.includes('cyan') ? 'group-hover:border-cyan-500/50' :
                    f.iconColor.includes('yellow') ? 'group-hover:border-yellow-500/50' :
                    'group-hover:border-purple-500/50'
                  }`}>
                    <Icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <ArrowRight className={`w-5 h-5 ${f.iconColor} opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {f.desc}
                </p>
                
                {/* Bottom accent line */}
                <div className={`mt-4 h-0.5 w-0 bg-gradient-to-r ${f.gradient} group-hover:w-full transition-all duration-300`} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}