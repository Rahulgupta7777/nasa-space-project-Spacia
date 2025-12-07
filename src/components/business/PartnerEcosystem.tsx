import React from "react";

interface PartnerEcosystemProps {
    selectedPartners: string[];
    onToggle: (partner: string) => void;
}

export default function PartnerEcosystem({
    selectedPartners,
    onToggle,
}: PartnerEcosystemProps) {
    const partnerCategories = [
        { category: "PNT / Navigation", companies: "Xona, Aerodome, VyomIC" },
        { category: "Earth Observation", companies: "Planet, Pixxel, Satellogic, Umbra" },
        { category: "Ground Stations", companies: "KSAT, AWS Ground Station, Azure Space" },
        { category: "Comms / Optical / RF", companies: "Mynaric, Viasat, Iridium" },
        { category: "Launch / Rideshare", companies: "SpaceX Transporter, Rocket Lab" },
        { category: "Analytics Platforms", companies: "SkyServe, Orbital Insight" },
    ];

    return (
        <div className="mt-14 mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold text-space-text-heading">
                Partner Ecosystem
            </h2>
            <p className="mt-2 text-space-text-main max-w-3xl">
                Representative organizations operating in LEO. Availability and mission
                compatibility may vary.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {partnerCategories.map((item) => {
                    const selected = selectedPartners.includes(item.category);
                    return (
                        <div
                            key={item.category}
                            onClick={() => onToggle(item.category)}
                            className={`cursor-pointer p-6 rounded-lg border transition-all ${selected
                                    ? "border-space-border-hover bg-space-card"
                                    : "border-space-border bg-space-section hover:border-space-border-hover"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="text-lg font-semibold text-white">
                                    {item.category}
                                </div>
                                {selected && (
                                    <svg
                                        className="w-5 h-5 text-space-text-main"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M16.7 5.3a1 1 0 00-1.4 0L8 12.6 4.7 9.3a1 1 0 10-1.4 1.4l4 4a1 1 0 001.4 0l8-8a1 1 0 000-1.4z" />
                                    </svg>
                                )}
                            </div>
                            <p className="text-sm text-space-text-main mt-2">
                                {item.companies}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
