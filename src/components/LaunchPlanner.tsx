"use client";
import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

import EarthView from "./EarthViwlanlog";

type PlannerRequest = {
  siteLat: number;
  siteLon: number;
  altitudeKm: number;
  inclinationDeg: number;
  massKg: number;
  areaM2: number;
};

type PlannerResponse = {
  launchSiteAnalysis: {
    userSite: string;
    userSiteLat: number;
    userSiteLon: number;
    minInclinationRequired: number;
    requestedInclination: number;
    feasible: boolean;
    azimuthRange: [number, number];
    bestAlternative: {
      name: string;
      lat: number;
      lon: number;
      minIncl: number;
      feasible: boolean;
      azimuthRange: [number, number];
    };
  };
  debrisRisk: {
    score: number;
    level: "low" | "moderate" | "high";
    catalogDensityProxy: number;
    estimatedConjunctionsPerYear: number;
    notes: string[];
  };
  lifetimeYears: {
    B: number;
    effectiveAltitude: number;
    scaleHeight: number;
    median: number;
    solarMin: number;
    solarMax: number;
    complies25yrRule: boolean;
    eccentricityWarning: string | null;
  };
  inputs: {
    Cd: number;
    solarFlux81: number;
    eccentricity: number;
  };
  recommendations: string[];
  notes?: string;
  siteAlert?: string;
  modelAccuracy: {
    level: string;
    description: string;
    limitations: string[];
    citations: string[];
  };
};

export default function LaunchPlanner() {
  const [form, setForm] = useState<PlannerRequest>({
    siteLat: 28.573255, // KSC default
    siteLon: -80.646895,
    altitudeKm: 500,
    inclinationDeg: 53,
    massKg: 200,
    areaM2: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visualizerExpanded, setVisualizerExpanded] = useState(false);
  const [viewingAlternative, setViewingAlternative] = useState(false);

  useEffect(() => {
    if (!visualizerExpanded) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visualizerExpanded]);

  const update = (key: keyof PlannerRequest, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Reusable planner runner so we can invoke from submit and alternative button
  const runPlanner = async (payload?: PlannerRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setViewingAlternative(false);
    try {
      const body = JSON.stringify(payload ?? form);
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as PlannerResponse;
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runPlanner();
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold">Launch Planner</h1>
      <p className="mt-2 text-slate-300">Plan a responsible LEO mission: estimate lifetime, assess debris risk, and get site suggestions.</p>

      <form onSubmit={submit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-lg border border-slate-800/60 p-5">
          <div className="text-lg font-semibold mb-4">Launch Site</div>
          <label className="block text-sm mb-2">Latitude (deg)
            <input type="number" step="0.0001" className="mt-1 w-full rounded bg-slate-900/40 border border-slate-700 p-2" value={form.siteLat} onChange={(e) => update("siteLat", parseFloat(e.target.value))} />
          </label>
          <label className="block text-sm mb-2">Longitude (deg)
            <input type="number" step="0.0001" className="mt-1 w-full rounded bg-slate-900/40 border border-slate-700 p-2" value={form.siteLon} onChange={(e) => update("siteLon", parseFloat(e.target.value))} />
          </label>
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/60 p-5">
          <div className="text-lg font-semibold mb-4">Orbit</div>
          <label className="block text-sm mb-2">Altitude (km)
            <input type="number" min={160} max={2000} className="mt-1 w-full rounded bg-slate-900/40 border border-slate-700 p-2" value={form.altitudeKm} onChange={(e) => update("altitudeKm", parseFloat(e.target.value))} />
          </label>
          <label className="block text-sm mb-2">Inclination (deg)
            <input type="number" min={0} max={180} className="mt-1 w-full rounded bg-slate-900/40 border border-slate-700 p-2" value={form.inclinationDeg} onChange={(e) => update("inclinationDeg", parseFloat(e.target.value))} />
          </label>
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/60 p-5">
          <div className="text-lg font-semibold mb-4">Spacecraft</div>
          <label className="block text-sm mb-2">Mass (kg)
            <input type="number" min={1} className="mt-1 w-full rounded bg-slate-900/40 border border-slate-700 p-2" value={form.massKg} onChange={(e) => update("massKg", parseFloat(e.target.value))} />
          </label>
          <label className="block text-sm mb-2">Cross-section Area (m²)
            <input type="number" step="0.01" min={0.01} className="mt-1 w-full rounded bg-slate-900/40 border border-slate-700 p-2" value={form.areaM2} onChange={(e) => update("areaM2", parseFloat(e.target.value))} />
          </label>
        </div>

        <div className="rounded-lg border border-slate-800/60 p-5 flex items-end justify-start">
          <button type="submit" disabled={loading} className="button-primary">
            {loading ? "Calculating…" : "Calculate Plan"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 text-red-400">{error}</div>
      )}

      {result && (
        <>
          {result.siteAlert && (
            <div className={`mt-8 p-4 rounded-lg border ${
              result.launchSiteAnalysis.feasible
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            }`}>
              <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">
  {result.launchSiteAnalysis.feasible ? (
    <CheckCircle className="text-green-500 w-5 h-5" />
  ) : (
    <AlertTriangle className="text-yellow-500 w-5 h-5" />
  )}
</span>

                <div className="flex-1">
                  {result.siteAlert
                    .split('\n')
                    .filter(line => line.trim())
                    .map((line, idx) => (
                      <p key={idx} className="text-sm leading-relaxed mb-1 last:mb-0">
                        {line.trim()}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          )}
          <div className={`${result.siteAlert ? 'mt-6' : 'mt-8'} grid grid-cols-1 lg:grid-cols-2 gap-6`}>
            {/* Launch Site Analysis Card */}
            <div className="glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-100">Launch Site Analysis</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.launchSiteAnalysis.feasible
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                }`}>
                  {result.launchSiteAnalysis.feasible ? 'Feasible' : 'Not Feasible'}
                </span>
              </div>
              <div className="space-y-4">
                {/* User Site */}
                <div>
                  <div className="text-sm text-slate-400 mb-2">Selected Site</div>
                  <div className="text-lg font-bold text-cyan-400 mb-1">{result.launchSiteAnalysis.userSite}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {result.launchSiteAnalysis.userSiteLat.toFixed(3)}°N, {Math.abs(result.launchSiteAnalysis.userSiteLon).toFixed(3)}°{result.launchSiteAnalysis.userSiteLon < 0 ? 'W' : 'E'}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-2">Launch Parameters</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Requested Inclination</div>
                      <div className="text-slate-200 font-semibold">{result.launchSiteAnalysis.requestedInclination.toFixed(1)}°</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Min Required</div>
                      <div className="text-slate-200 font-semibold">{result.launchSiteAnalysis.minInclinationRequired.toFixed(1)}°</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-slate-500">Azimuth Range</div>
                      <div className="text-slate-200 font-semibold">
                        {result.launchSiteAnalysis.azimuthRange[0]}° - {result.launchSiteAnalysis.azimuthRange[1]}°
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Alternative */}
                {!result.launchSiteAnalysis.feasible && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-slate-400">Recommended Alternative</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="text-base font-bold text-purple-400 mb-1">{result.launchSiteAnalysis.bestAlternative.name}</div>
                      <div className="text-xs text-slate-400 font-mono mb-2">
                        {result.launchSiteAnalysis.bestAlternative.lat.toFixed(3)}°N, {Math.abs(result.launchSiteAnalysis.bestAlternative.lon).toFixed(3)}°{result.launchSiteAnalysis.bestAlternative.lon < 0 ? 'W' : 'E'}
                      </div>
                      <div className="text-xs text-slate-500 mb-3">
                        Min Inclination: {result.launchSiteAnalysis.bestAlternative.minIncl.toFixed(1)}° | 
                        Azimuth: {result.launchSiteAnalysis.bestAlternative.azimuthRange[0]}°-{result.launchSiteAnalysis.bestAlternative.azimuthRange[1]}°
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingAlternative(true);
                            setVisualizerExpanded(true);
                          }}
                          className="flex-1 rounded-md border border-purple-500/40 bg-purple-500/20 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/30 hover:text-purple-200"
                        >
                          View on Map
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newForm: PlannerRequest = {
                              ...form,
                              siteLat: result.launchSiteAnalysis.bestAlternative.lat,
                              siteLon: result.launchSiteAnalysis.bestAlternative.lon,
                            };
                            setForm(newForm);
                            // Immediately re-run planner with the updated site
                            runPlanner(newForm);
                          }}
                          className="flex-1 rounded-md border border-cyan-500/40 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/30 hover:text-cyan-200"
                        >
                          Use This Site
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Debris Risk Card */}
            <div className="glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-100">Debris Risk Assessment</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  result.debrisRisk.level === 'high' ? 'bg-red-500/20 border border-red-500/40 text-red-400' :
                  result.debrisRisk.level === 'moderate' ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400' :
                  'bg-green-500/20 border border-green-500/40 text-green-400'
                }`}>
                  {result.debrisRisk.level}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Risk Score</span>
                    <span className="text-2xl font-bold text-slate-100">{result.debrisRisk.score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        result.debrisRisk.score >= 7 ? 'bg-red-500' :
                        result.debrisRisk.score >= 4 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(result.debrisRisk.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Catalog Density</div>
                    <div className="text-lg font-semibold text-slate-200">{result.debrisRisk.catalogDensityProxy}</div>
                    <div className="text-xs text-slate-500">objects/km³</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Est. Conjunctions</div>
                    <div className="text-lg font-semibold text-slate-200">{result.debrisRisk.estimatedConjunctionsPerYear.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">per year</div>
                  </div>
                </div>
                {result.debrisRisk.notes.length > 0 && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="text-sm text-slate-400 mb-2">Risk Notes</div>
                    <ul className="space-y-1.5">
                      {result.debrisRisk.notes.map((n, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start">
                          <span className="text-cyan-400 mr-2">•</span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Lifetime Card */}
            <div className="glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-100">Orbital Lifetime</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.lifetimeYears.complies25yrRule 
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
                    : 'bg-red-500/20 border border-red-500/40 text-red-400'
                }`}>
                  {result.lifetimeYears.complies25yrRule ? '25yr Compliant' : 'Non-Compliant'}
                </span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">Median Lifetime</div>
                    <div className="text-xl font-bold text-cyan-400">{result.lifetimeYears.median.toFixed(1)}</div>
                    <div className="text-xs text-slate-500">years</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">Ballistic Coeff.</div>
                    <div className="text-xl font-bold text-purple-400">{result.lifetimeYears.B.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">kg/m²</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-3">Solar Activity Scenarios</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Solar Minimum</div>
                      <div className="text-lg font-semibold text-slate-200">{result.lifetimeYears.solarMin.toFixed(1)} years</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Solar Maximum</div>
                      <div className="text-lg font-semibold text-slate-200">{result.lifetimeYears.solarMax.toFixed(1)} years</div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-2">Orbital Parameters</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Effective Altitude</div>
                      <div className="text-sm font-semibold text-slate-200">{result.lifetimeYears.effectiveAltitude.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Scale Height</div>
                      <div className="text-sm font-semibold text-slate-200">{result.lifetimeYears.scaleHeight} km</div>
                    </div>
                  </div>
                </div>
                {result.lifetimeYears.eccentricityWarning && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="text-xs text-yellow-300 font-semibold mb-1">⚠️ Eccentricity Warning</div>
                      <div className="text-xs text-yellow-200">{result.lifetimeYears.eccentricityWarning}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs & Technical Details Card */}
            <div className="glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Technical Parameters</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">Drag Coefficient</div>
                    <div className="text-lg font-bold text-slate-200">{result.inputs.Cd}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">Solar Flux (F10.7)</div>
                    <div className="text-lg font-bold text-slate-200">{result.inputs.solarFlux81}</div>
                    <div className="text-xs text-slate-500">SFU</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-1">Eccentricity</div>
                    <div className="text-lg font-bold text-slate-200">{result.inputs.eccentricity.toFixed(4)}</div>
                  </div>
                </div>
                {result.notes && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="text-xs text-slate-400 italic leading-relaxed">{result.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations Card */}
            <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Recommendations & Next Steps</h3>
              <div className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-cyan-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed flex-1">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Accuracy Card */}
            <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-100">Model Accuracy & Limitations</h3>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-semibold capitalize">
                  {result.modelAccuracy.level}
                </span>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed">{result.modelAccuracy.description}</p>
                
                <div>
                  <div className="text-sm font-semibold text-slate-400 mb-2">Limitations</div>
                  <ul className="space-y-2">
                    {result.modelAccuracy.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start text-xs text-slate-300">
                        <span className="text-slate-500 mr-2">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-700/50">
                  <div className="text-sm font-semibold text-slate-400 mb-2">References</div>
                  <ul className="space-y-1.5">
                    {result.modelAccuracy.citations.map((citation, i) => (
                      <li key={i} className="text-xs text-slate-400 italic">
                        {citation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Launch Corridor Visualizer</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {viewingAlternative && !result.launchSiteAnalysis.feasible
                    ? `Viewing: ${result.launchSiteAnalysis.bestAlternative.name}`
                    : `Viewing: ${result.launchSiteAnalysis.userSite}`}
                </p>
              </div>
              {!visualizerExpanded && (
                <div className="flex gap-2 justify-end">
                  {!result.launchSiteAnalysis.feasible && (
                    <button
                      type="button"
                      onClick={() => {
                        setViewingAlternative(!viewingAlternative);
                      }}
                      className="rounded-md border border-purple-500/40 bg-purple-500/20 px-3 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30 hover:text-purple-200"
                    >
                      {viewingAlternative ? "View User Site" : "View Alternative"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setVisualizerExpanded(true)}
                    className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/80 hover:text-white"
                  >
                    Expand Visualizer
                  </button>
                </div>
              )}
            </div>

            {!visualizerExpanded && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/60">
                <EarthView
                  key={`embedded-${viewingAlternative}`}
                  layout="embedded"
                  launchLatitude={viewingAlternative && !result.launchSiteAnalysis.feasible 
                    ? result.launchSiteAnalysis.bestAlternative.lat 
                    : result.launchSiteAnalysis.userSiteLat}
                  launchLongitude={viewingAlternative && !result.launchSiteAnalysis.feasible 
                    ? result.launchSiteAnalysis.bestAlternative.lon 
                    : result.launchSiteAnalysis.userSiteLon}
                  launchAltitudeKm={form.altitudeKm}
                  launchName={viewingAlternative && !result.launchSiteAnalysis.feasible 
                    ? result.launchSiteAnalysis.bestAlternative.name 
                    : result.launchSiteAnalysis.userSite || "Launch Site"}
                />
              </div>
            )}
          </div>
        </>
      )}

      {visualizerExpanded && result && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/70 to-slate-950/95 pointer-events-none" />
          <div className="relative flex-1">
            <div className="absolute top-6 right-6 flex gap-3 z-10">
              {viewingAlternative && !result.launchSiteAnalysis.feasible && (
                <button
                  type="button"
                  onClick={() => setViewingAlternative(false)}
                  className="rounded-md border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/30 hover:text-cyan-200"
                >
                  View User Site
                </button>
              )}
              {!viewingAlternative && !result.launchSiteAnalysis.feasible && (
                <button
                  type="button"
                  onClick={() => setViewingAlternative(true)}
                  className="rounded-md border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30 hover:text-purple-200"
                >
                  View Alternative
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setVisualizerExpanded(false);
                  setViewingAlternative(false);
                }}
                className="rounded-md border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-50 transition hover:bg-slate-800 hover:text-white"
              >
                Exit Fullscreen
              </button>
            </div>
            <EarthView
              key={`fullscreen-${viewingAlternative}`}
              layout="fullscreen"
              launchLatitude={viewingAlternative && !result.launchSiteAnalysis.feasible 
                ? result.launchSiteAnalysis.bestAlternative.lat 
                : result.launchSiteAnalysis.userSiteLat}
              launchLongitude={viewingAlternative && !result.launchSiteAnalysis.feasible 
                ? result.launchSiteAnalysis.bestAlternative.lon 
                : result.launchSiteAnalysis.userSiteLon}
              launchAltitudeKm={form.altitudeKm}
              launchName={viewingAlternative && !result.launchSiteAnalysis.feasible 
                ? result.launchSiteAnalysis.bestAlternative.name 
                : result.launchSiteAnalysis.userSite || "Launch Site"}
            />
          </div>
        </div>
      )}
    </section>
  );
}