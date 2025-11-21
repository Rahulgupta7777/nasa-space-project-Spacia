"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, createTimeline, stagger, cubicBezier } from "animejs";

export default function AnimatedHero() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const el = heroRef.current;
    const title = el.querySelector(".hero-title");
    const subtitle = el.querySelector(".hero-subtitle");
    const buttons = el.querySelectorAll(".hero-cta");

    const easing = cubicBezier(0.22, 0.9, 0.28, 0.99);
    const tl = createTimeline();

    if (title) {
      tl.add(title, { opacity: [0, 1], translateY: [14, 0], duration: 700, easing });
    }

    if (subtitle) {
      tl.add(subtitle, { opacity: [0, 1], translateY: [10, 0], duration: 600, easing }, "-=420");
    }

    if (buttons && buttons.length) {
      // cast to any to satisfy animejs target typing for NodeList/array
      tl.add(buttons as any, { opacity: [0, 1], translateY: [8, 0], delay: stagger(90), duration: 500, easing }, "-=320");
    }

    const glow = el.querySelector(".hero-glow");
    if (glow) {
      animate(glow, { opacity: [0.0, 0.14], duration: 1200, easing });
      animate(glow, { translateX: [-34, 34], direction: "alternate", loop: Infinity, easing: cubicBezier(0.445, 0.05, 0.55, 0.95), duration: 3500 });
    }
  }, []);

  return (
    <section ref={heroRef} className="relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-glow -top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/12 to-pink-400/16 blur-3xl" />
      </div>

      <div className="relative z-10">
        <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-center sm:text-left">
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-indigo-400">Spacia</span>
          <span className="ml-3 text-slate-300 font-semibold">· Commercializing LEO Responsibly</span>
        </h1>

        <p className="hero-subtitle mt-4 text-center sm:text-left text-slate-300 max-w-3xl">
          One platform to visualize orbits, track satellites and conjunctions, predict space weather impacts, and plan sustainable
          LEO operations powered by integrated mission planning tools and data.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-center sm:justify-start">
          <Link href="/dashboard" className="hero-cta inline-flex items-center justify-center rounded-md px-5 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-900 font-medium shadow hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400">
            Open Dashboard
          </Link>
          <Link href="/business" className="hero-cta inline-flex items-center justify-center rounded-md px-4 py-3 border border-slate-700 text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600">
            Explore Business
          </Link>
        </div>

        <div className="mt-6 text-sm text-slate-400 max-w-xl">
          <ul className="flex flex-wrap gap-3">
            <li className="flex items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cyan-400 shadow-sm" />
              <span>Real-time orbit visualization</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-fuchsia-400 shadow-sm" />
              <span>Debris &amp; conjunction awareness</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-400 shadow-sm" />
              <span>Launch planning &amp; sustainability</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}