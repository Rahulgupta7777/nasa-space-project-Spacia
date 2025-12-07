import React from "react";

export default function ReferenceMissions() {
    const exampleProjects = [
        {
            name: "VyomIC",
            type: "Navigation / PNT",
            desc: "Regional navigation constellation enabling precision PNT services for autonomous systems.",
            region: "India / Asia",
            impact: "Regional Coverage",
        },
        {
            name: "GLONASS",
            type: "Navigation / PNT",
            desc: "Global navigation system delivering worldwide coverage with a 24-satellite MEO constellation.",
            region: "Global",
            impact: "Global Infrastructure",
        },
        {
            name: "Pixxel",
            type: "Earth Observation",
            desc: "Hyperspectral constellation enabling climate analytics, agriculture insights, and environmental monitoring.",
            region: "Global",
            impact: "Climate & Agriculture",
        },
        {
            name: "Astroscale",
            type: "Orbital Services",
            desc: "Active debris-removal and satellite-servicing missions supporting sustainable space operations.",
            region: "Global",
            impact: "Space Sustainability",
        },
    ];

    return (
        <div className="mt-14 mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold text-space-text-heading">
                Reference Missions
            </h2>
            <p className="mt-2 text-space-text-main max-w-3xl">
                Explore proven commercial LEO missions to guide your strategy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {exampleProjects.map((project) => (
                    <div
                        key={project.name}
                        className="p-6 rounded-lg border border-space-border bg-space-section hover:border-space-border-hover transition-all"
                    >
                        <div className="flex justify-between">
                            <div>
                                <div className="text-lg font-semibold text-white">
                                    {project.name}
                                </div>
                                <div className="text-sm text-space-text-muted">
                                    {project.type}
                                </div>
                            </div>
                            <div className="text-xs text-space-text-soft text-right">
                                <div className="border border-space-border px-2 py-1 rounded bg-space-card">
                                    {project.region}
                                </div>
                                <div className="border border-space-border px-2 py-1 rounded bg-space-card mt-1">
                                    {project.impact}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-space-text-main mt-3 leading-relaxed">
                            {project.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
