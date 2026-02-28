import React from "react";

export default function BusinessOfferings() {
    const offerings = [
        {
            title: "Orbit Monitoring",
            desc: "Realtime orbital visualization, satellite tracking, and situational context for mission operations.",
        },
        {
            title: "Conjunction Intelligence",
            desc: "Predictive conjunction screening, thresholds, and automated collision-risk guidance.",
        },
        {
            title: "Earth Observation Products",
            desc: "Curated imagery layers (NASA GIBS, MODIS/VIIRS) with AOI workflows for analytics.",
        },
        {
            title: "Integration & Support",
            desc: "API access, onboarding, and mission-tailored UX for your operational teams.",
        },
    ];

    return (
        <div className="mt-14 mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold text-space-text-heading">Our Services</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {offerings.map((o) => (
                    <div
                        key={o.title}
                        className="p-6 rounded-lg border border-space-border bg-space-section hover:border-space-border-hover transition-all"
                    >
                        <div className="text-lg font-semibold text-white">{o.title}</div>
                        <div className="text-sm text-space-text-main mt-2">{o.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
