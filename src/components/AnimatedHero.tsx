"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, createTimeline, stagger, cubicBezier } from "animejs";

export default function AnimatedHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const el = heroRef.current;
    const title = el.querySelector(".hero-title");
    const subtitle = el.querySelector(".hero-subtitle");
    const buttons = el.querySelectorAll(".hero-cta");

    const easing = cubicBezier(0.25, 0.46, 0.45, 0.94);
    const tl = createTimeline({ defaults: { ease: easing } });
    tl.add(title as Element, { opacity: [0, 1], translateY: [12, 0], duration: 700 })
      .add(subtitle as Element, { opacity: [0, 1], translateY: [10, 0], duration: 600 }, "-=300")
      .add(buttons as NodeListOf<Element>, { opacity: [0, 1], translateY: [8, 0], delay: stagger(80), duration: 500 }, "-=200");

    const glow = el.querySelector(".hero-glow");
    if (glow) {
      animate(glow as Element, { opacity: [0.0, 0.15], duration: 1200, ease: easing });
      animate(glow as Element, { translateX: [-40, 40], alternate: true, loop: 9999, ease: cubicBezier(0.445, 0.05, 0.55, 0.95), duration: 3000 });
    }
  }, []);

  return (
    <section ref={heroRef} className="relative mx-auto max-w-6xl px-4 pt-20 pb-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-glow -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/20 to-pink-400/20 blur-3xl" />
      </div>
      <h1 className="hero-title relative z-10 text-center sm:text-left text-4xl sm:text-6xl font-extrabold tracking-tight">
        <span className="neon-text">Spacia</span> · Commercializing LEO Responsibly
      </h1>
      <p className="hero-subtitle relative z-10 mt-4 text-center sm:text-left text-slate-300 max-w-2xl">
      A single LEO platform that helps teams plan missions, track satellites, monitor space weather, and make smarter business decisions with an integrated planning LLM.
</p>
      <div className="mt-8 flex justify-center sm:justify-start gap-4">
        <Link href="/dashboard" className="hero-cta button-primary">Open Dashboard</Link>
        <Link href="/business" className="hero-cta button-secondary">Explore Business</Link>
      </div>
    </section>
  );
}