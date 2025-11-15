"use client";

import { useState } from "react";

interface FormState {
  projectName: string;
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
  partners: string[];
}

export default function BusinessPage() {
  const [formData, setFormData] = useState<FormState>({
    projectName: "",
    projectType: "",
    description: "",
    budget: "",
    timeline: "",
    partners: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // -------------------------------------------
  // Offerings
  // -------------------------------------------

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

  // -------------------------------------------
  // Project Types
  // -------------------------------------------

  const projectTypes = [
    "Communication Constellation",
    "Earth Observation",
    "Navigation / PNT",
    "Space Manufacturing",
    "Orbital Debris Removal",
    "In-Orbit Servicing",
    "Space Tourism & Hospitality",
    "R&D Missions",
    "Technology Demonstration",
    "Other",
  ];

  // -------------------------------------------
  // Partner Ecosystem
  // -------------------------------------------

  const partnerCategories = [
    { category: "PNT / Navigation", companies: "Xona, Aerodome, VyomIC" },
    { category: "Earth Observation", companies: "Planet, Pixxel, Satellogic, Umbra" },
    { category: "Ground Stations", companies: "KSAT, AWS Ground Station, Azure Space" },
    { category: "Comms / Optical / RF", companies: "Mynaric, Viasat, Iridium" },
    { category: "Launch / Rideshare", companies: "SpaceX Transporter, Rocket Lab" },
    { category: "Analytics Platforms", companies: "SkyServe, Orbital Insight" },
  ];

  // -------------------------------------------
  // Example Missions
  // -------------------------------------------

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

  // -------------------------------------------
  // Handlers
  // -------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePartner = (partner: string) => {
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.includes(partner)
        ? prev.partners.filter((p) => p !== partner)
        : [...prev.partners, partner],
    }));
  };

  // -------------------------------------------
  // PDF Generator (Mock)
  // -------------------------------------------

  const generatePDF = async () => {
    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 2500));
    setIsGenerating(false);
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-space-text-main">
      {/* --------------------------------------- */}
      {/* Page Header */}
      {/* --------------------------------------- */}

      <h1 className="text-4xl font-bold text-space-text-heading">Business</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-space-text-main">
        Spacia enables mission teams to visualize orbital activity, assess conjunction risks,
        and design sustainable LEO operations. Use our AI-powered tools to generate complete
        commercial mission proposals tailored to your objectives.
      </p>

      {/* --------------------------------------- */}
      {/* AI Generator Section */}
      {/* --------------------------------------- */}

      <div className="mt-10 rounded-lg border border-space-border bg-space-section p-8">
        <h2 className="text-2xl font-semibold text-space-text-heading">
          AI-Powered LEO Project Proposal Generator
        </h2>
        <p className="text-sm text-space-text-muted mt-1">
          Generate a detailed commercial mission blueprint using our AI engine.
        </p>

        {/* Form */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Project Name */}
          <div>
            <label className="text-sm text-space-text-muted mb-2 block">Project Name *</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g., IndiaComm Constellation"
              className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white focus:border-space-border-hover outline-none"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="text-sm text-space-text-muted mb-2 block">Project Type *</label>
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white focus:border-space-border-hover outline-none"
            >
              <option value="">Select project type…</option>
              {projectTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm text-space-text-muted mb-2 block">Budget (USD)</label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="$50M – $100M"
              className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white focus:border-space-border-hover outline-none"
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="text-sm text-space-text-muted mb-2 block">Timeline</label>
            <input
              type="text"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              placeholder="24–36 months"
              className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white focus:border-space-border-hover outline-none"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-sm text-space-text-muted mb-2 block">Mission Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe mission objectives, target market, constellation design, operational goals..."
              className="w-full px-4 py-2.5 bg-space-card border border-space-border rounded text-white focus:border-space-border-hover outline-none resize-none"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePDF}
          disabled={isGenerating || !formData.projectName || !formData.projectType || !formData.description}
          className="mt-6 px-6 py-2.5 bg-white text-black font-medium rounded hover:bg-gray-200 transition disabled:bg-space-border disabled:text-space-text-muted disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating Proposal…" : "Generate Proposal"}
        </button>
      </div>

      {/* --------------------------------------- */}
      {/* Example Missions */}
      {/* --------------------------------------- */}

      <div className="mt-14">
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
                  <div className="text-lg font-semibold text-white">{project.name}</div>
                  <div className="text-sm text-space-text-muted">{project.type}</div>
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

      {/* --------------------------------------- */}
      {/* Services */}
      {/* --------------------------------------- */}

      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-space-text-heading">Our Services</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {offerings.map((o) => (
            <div key={o.title} className="p-6 rounded-lg border border-space-border bg-space-section hover:border-space-border-hover transition-all">
              <div className="text-lg font-semibold text-white">{o.title}</div>
              <div className="text-sm text-space-text-main mt-2">{o.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------------------- */}
      {/* Partner Ecosystem */}
      {/* --------------------------------------- */}

      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-space-text-heading">Partner Ecosystem</h2>
        <p className="mt-2 text-space-text-main max-w-3xl">
          Representative organizations operating in LEO. Availability and mission compatibility may vary.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {partnerCategories.map((item) => {
            const selected = formData.partners.includes(item.category);
            return (
              <div
                key={item.category}
                onClick={() => togglePartner(item.category)}
                className={`cursor-pointer p-6 rounded-lg border transition-all ${
                  selected
                    ? "border-space-border-hover bg-space-card"
                    : "border-space-border bg-space-section hover:border-space-border-hover"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-lg font-semibold text-white">{item.category}</div>
                  {selected && (
                    <svg className="w-5 h-5 text-space-text-main" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.7 5.3a1 1 0 00-1.4 0L8 12.6 4.7 9.3a1 1 0 10-1.4 1.4l4 4a1 1 0 001.4 0l8-8a1 1 0 000-1.4z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-space-text-main mt-2">{item.companies}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------- */}
      {/* CTA */}
      {/* --------------------------------------- */}

      <div className="mt-16 p-8 rounded-lg border border-space-border bg-space-section text-center">
        <h2 className="text-xl font-semibold text-white">Work With Us</h2>
        <p className="text-space-text-main mt-2">
          Ready to explore how Spacia can support your mission? Let’s connect.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <a
            href="/dashboard"
            className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-gray-200 transition"
          >
            View Dashboard
          </a>
          <a
            href="mailto:hello@example.com"
            className="px-6 py-2.5 border border-space-border bg-space-card text-white rounded font-medium hover:border-space-border-hover transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
