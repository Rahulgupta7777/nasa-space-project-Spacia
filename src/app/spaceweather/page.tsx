"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  Sun,
  AlertTriangle,
  Activity,
  Wind,
  Radio,
  Zap,
  Waves,
  Sparkles,
  Satellite,
  Plane,
  Power,
  RadioIcon,
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  MapPin,
} from "lucide-react";

export default function SpaceWeatherPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-cyan-400" />
        <p className="text-lg">Loading Space Weather Data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-red-400">
        <XCircle className="w-8 h-8 mb-4" />
        <p className="text-lg">Failed to load data.</p>
      </div>
    );
  }

  const {
    solarFlare,
    coronalMassEjection,
    kpIndex,
    solarWind,
    protonEvents,
    aurora,
    sunspots,
    xrayFlux,
    timeline,
    impacts,
    summary,
  } = data;

  const solarWindChartData = [
    { 
      name: "Speed", 
      value: solarWind.speed_km_s,
      normalized: Math.min(100, (solarWind.speed_km_s / 800) * 100),
      unit: "km/s",
      color: "#facc15"
    },
    { 
      name: "Density", 
      value: solarWind.density_p_cm3,
      normalized: Math.min(100, (solarWind.density_p_cm3 / 10) * 100),
      unit: "p/cm³",
      color: "#38bdf8"
    },
    { 
      name: "Temperature", 
      value: solarWind.temperature_k,
      normalized: Math.min(100, (solarWind.temperature_k / 100000) * 100),
      unit: "K",
      color: "#f97316"
    },
    { 
      name: "Bz", 
      value: solarWind.bz_nT,
      normalized: Math.min(100, Math.abs(solarWind.bz_nT) / 20 * 100),
      unit: "nT",
      color: "#a855f7"
    },
    { 
      name: "Bt", 
      value: solarWind.bt_nT,
      normalized: Math.min(100, (solarWind.bt_nT / 100) * 100),
      unit: "nT",
      color: "#ec4899"
    },
    { 
      name: "Pressure", 
      value: solarWind.pressure_nPa,
      normalized: Math.min(100, (solarWind.pressure_nPa / 5) * 100),
      unit: "nPa",
      color: "#10b981"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-white">Space Weather Dashboard</h1>
          </div>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            Real-time data from {data.dataSources.join(", ")} — updated{" "}
            {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Critical Alert Summary */}
        <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className={`rounded-2xl p-6 shadow-lg border ${
    summary.color === "red"
      ? "bg-gradient-to-br from-[#1a0002] via-[#2a0a0d] to-[#140001] border-[#4d0b0f]"
      : summary.color === "orange"
      ? "bg-gradient-to-br from-[#1b0d00] via-[#2b1505] to-[#120700] border-[#5a2a00]"
      : "bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#000000] border-[#1c1c1c]"
  } backdrop-blur-sm`}
>


          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-2xl font-bold">{summary.status}</h2>
              <p className="text-sm text-gray-300 mt-1">Risk Level: {summary.riskLevel}</p>
            </div>
            <span className="text-xs bg-black/40 px-3 py-1 rounded-full">
              Data Quality: {data.metadata.dataQuality.score}%
            </span>
          </div>
          <p className="text-gray-200 mb-4">{summary.message}</p>

          {summary.alerts && summary.alerts.length > 0 && (
            <div className="mb-4 p-3 bg-black/30 rounded-lg border border-red-400/50">
              <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Alerts
              </h4>
              <div className="space-y-2">
                {summary.alerts.map((alert: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 font-mono text-xs">[{alert.level}]</span>
                    <div>
                      <span className="font-medium">{alert.type}:</span> {alert.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-200">Recommendations:</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {summary.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Solar Flare Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/70 border border-gray-800 p-5 rounded-xl hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-semibold text-gray-400">Latest Solar Flare</h3>
              </div>
              {solarFlare.latestFlare.note && (
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-yellow-400 cursor-help transition-colors" />
                  <div className="absolute right-0 top-6 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                    <p className="font-semibold text-yellow-400 mb-1">Note:</p>
                    <p className="leading-relaxed">{solarFlare.latestFlare.note}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-3">
              {solarFlare.latestFlare.class}
            </p>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-500">
                <span className="text-gray-400">Region:</span> {solarFlare.latestFlare.activeRegion}
              </p>
              <p className="text-gray-500">
                <span className="text-gray-400">Location:</span> {solarFlare.latestFlare.location}
              </p>
              {solarFlare.latestFlare.duration && (
                <p className="text-gray-500">
                  <span className="text-gray-400">Duration:</span> {solarFlare.latestFlare.duration}
                </p>
              )}
              {solarFlare.latestFlare.instruments && solarFlare.latestFlare.instruments.length > 0 && (
                <p className="text-gray-500">
                  <span className="text-gray-400">Instruments:</span> {solarFlare.latestFlare.instruments.slice(0, 2).join(", ")}
                  {solarFlare.latestFlare.instruments.length > 2 && ` +${solarFlare.latestFlare.instruments.length - 2} more`}
                </p>
              )}
              <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-800">
                <Clock className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {solarFlare.latestFlare.beginTime && (
                    <p className="text-gray-600">
                      <span className="text-gray-500">Start:</span> {new Date(solarFlare.latestFlare.beginTime).toLocaleString()}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="text-gray-500">Peak:</span> {new Date(solarFlare.latestFlare.peakTime).toLocaleString()}
                  </p>
                  {solarFlare.latestFlare.endTime && (
                    <p className="text-gray-600">
                      <span className="text-gray-500">End:</span> {new Date(solarFlare.latestFlare.endTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <a
              href={solarFlare.latestFlare.link}
              target="_blank"
              className="text-blue-400 text-xs flex items-center gap-1 mt-3 hover:text-blue-300 transition-colors"
            >
              View Details <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>

          {/* Kp Index Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/70 border border-gray-800 p-5 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-gray-400">Kp Index</h3>
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-500 hover:text-cyan-400 cursor-help transition-colors" />
                <div className="absolute right-0 top-6 w-72 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                  <p className="font-semibold text-cyan-400 mb-2">Kp Index Explained:</p>
                  <p className="text-gray-400 mb-1">
                    The Kp index measures geomagnetic activity on a scale of 0-9. Higher values indicate stronger geomagnetic storms.
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="text-gray-500">Kp 0-2:</span> Quiet
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="text-gray-500">Kp 3-4:</span> Unsettled
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="text-gray-500">Kp 5:</span> Minor Storm (G1)
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="text-gray-500">Kp 6:</span> Moderate Storm (G2)
                  </p>
                  <p className="text-gray-400 mb-1">
                    <span className="text-gray-500">Kp 7:</span> Strong Storm (G3)
                  </p>
                  <p className="text-gray-400">
                    <span className="text-gray-500">Kp 8-9:</span> Severe/Extreme (G4-G5)
                  </p>
                </div>
              </div>
            </div>
            <p
              className={`text-3xl font-bold mb-3 ${
                kpIndex.current >= 7
                  ? "text-red-400"
                  : kpIndex.current >= 5
                  ? "text-orange-400"
                  : "text-green-400"
              }`}
            >
              {kpIndex.current.toFixed(2)}
            </p>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-500">
                <span className="text-gray-400">Max 24h:</span> {kpIndex.max24h.toFixed(2)}
              </p>
              <p className="text-gray-500 flex items-center gap-1">
                <span className="text-gray-400">Trend:</span>{" "}
                {kpIndex.trend === "Increasing" ? (
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                ) : kpIndex.trend === "Decreasing" ? (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-500" />
                )}
                {kpIndex.trend}
              </p>
              <p className="text-gray-600">{kpIndex.stormLevel}</p>
              <p className="text-gray-600 mt-1">
                <span className="text-gray-400">Storm Prob:</span> {kpIndex.stormProbability}
              </p>
            </div>
          </motion.div>

          {/* Solar Wind Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/70 border border-gray-800 p-5 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-gray-400">Solar Wind</h3>
              </div>
              {solarWind.geoeffectiveness && (
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-cyan-400 cursor-help transition-colors" />
                  <div className="absolute right-0 top-6 w-72 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                    <p className="font-semibold text-cyan-400 mb-2">Solar Wind Parameters:</p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Bz:</span> Interplanetary magnetic field component. Negative values enhance geomagnetic activity.
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Bt:</span> Total magnetic field strength.
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Geoeffectiveness:</span> {solarWind.geoeffectiveness}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Pressure:</span> {solarWind.pressure_nPa} nPa
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-cyan-400 mb-3">{solarWind.speed_km_s} km/s</p>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-500">
                <span className="text-gray-400">Density:</span> {solarWind.density_p_cm3} p/cm³
              </p>
              <p className="text-gray-500">
                <span className="text-gray-400">Temp:</span> {solarWind.temperature_k.toLocaleString()} K
              </p>
              <p className="text-gray-500">
                <span className="text-gray-400">Bz:</span> {solarWind.bz_nT} nT
              </p>
              {solarWind.bt_nT > 0 && (
                <p className="text-gray-500">
                  <span className="text-gray-400">Bt:</span> {solarWind.bt_nT} nT
                </p>
              )}
              <p className="text-gray-600 mt-1">
                <span className="text-gray-400">Condition:</span> {solarWind.conditions}
              </p>
              {solarWind.geoeffectiveness && (
                <p className="text-gray-600">
                  <span className="text-gray-400">Geoeffectiveness:</span> {solarWind.geoeffectiveness}
                </p>
              )}
            </div>
          </motion.div>

          {/* Proton Events Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/70 border border-gray-800 p-5 rounded-xl hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-semibold text-gray-400">Proton Events</h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {protonEvents.hasEvent ? (
                <XCircle className="w-6 h-6 text-red-400" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              )}
              <p
                className={`text-3xl font-bold ${
                  protonEvents.hasEvent ? "text-red-400" : "text-green-400"
                }`}
              >
                {protonEvents.hasEvent ? "Active" : "None"}
              </p>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-500">
                <span className="text-gray-400">Current:</span> {protonEvents.currentFlux.toFixed(2)} pfu
              </p>
              <p className="text-gray-500">
                <span className="text-gray-400">Max:</span> {protonEvents.maxFlux.toFixed(1)} pfu
              </p>
              <p className="text-gray-600">{protonEvents.level}</p>
              <p className="text-red-400 mt-1 font-semibold">{protonEvents.radiationRisk}</p>
            </div>
          </motion.div>
        </div>

        {/* Coronal Mass Ejection Card */}
        {coronalMassEjection && coronalMassEjection.latest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/50 p-5 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Waves className="w-5 h-5 text-purple-400" />
                Coronal Mass Ejection (CME)
              </h3>
              {coronalMassEjection.latest.note && (
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-purple-400 cursor-help transition-colors" />
                  <div className="absolute right-0 top-6 w-80 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                    <p className="font-semibold text-purple-400 mb-1">CME Note:</p>
                    <p className="leading-relaxed">{coronalMassEjection.latest.note}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Latest CME</p>
                <p className="text-2xl font-bold text-pink-400">{coronalMassEjection.latest.speed} km/s</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(coronalMassEjection.latest.startTime).toLocaleString()}
                </p>
                {coronalMassEjection.latest.type && (
                  <p className="text-xs text-gray-500 mt-1">
                    Type: {coronalMassEjection.latest.type}
                  </p>
                )}
                {coronalMassEjection.latest.halfAngle > 0 && (
                  <p className="text-xs text-gray-500">
                    Half Angle: {coronalMassEjection.latest.halfAngle}°
                  </p>
                )}
                {coronalMassEjection.latest.latitude !== null && coronalMassEjection.latest.longitude !== null && (
                  <p className="text-xs text-gray-500">
                    Location: {coronalMassEjection.latest.latitude}°, {coronalMassEjection.latest.longitude}°
                  </p>
                )}
                {coronalMassEjection.latest.instruments && coronalMassEjection.latest.instruments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Instruments: {coronalMassEjection.latest.instruments.slice(0, 2).join(", ")}
                    {coronalMassEjection.latest.instruments.length > 2 && ` +${coronalMassEjection.latest.instruments.length - 2} more`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Speed Range</p>
                <p className="text-sm text-gray-300">
                  Min: {coronalMassEjection.speed.min} km/s
                </p>
                <p className="text-sm text-gray-300">
                  Max: {coronalMassEjection.speed.max} km/s
                </p>
                <p className="text-sm text-gray-300">
                  Avg: {coronalMassEjection.speed.avg} km/s
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Statistics</p>
                <p className="text-sm text-gray-300">
                  Total: {coronalMassEjection.totalCount}
                </p>
                <p className="text-sm text-gray-300">
                  Earth-Directed: {coronalMassEjection.earthDirectedCount}
                </p>
                {coronalMassEjection.estimatedArrival && (
                  <p className="text-sm text-orange-400 font-semibold mt-1">
                    Est. Arrival: {new Date(coronalMassEjection.estimatedArrival).toLocaleString()}
                  </p>
                )}
                {coronalMassEjection.latest.activityID && (
                  <a
                    href={coronalMassEjection.latest.link}
                    target="_blank"
                    className="text-blue-400 text-xs flex items-center gap-1 mt-2 hover:text-blue-300 transition-colors"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Kp Forecast Chart */}
          <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">Kp Index Forecast (Next 24h)</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={kpIndex.forecastNext24h.map((v: number, i: number) => ({
                  hour: `${i}h`,
                  value: v,
                  threshold: 5,
                  critical: 7,
                }))}
              >
                <defs>
                  <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#888" 
                  tick={{ fill: "#888", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                />
                <YAxis 
                  domain={[0, 9]} 
                  stroke="#888"
                  tick={{ fill: "#888", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                />
                <ReferenceLine y={5} stroke="#f97316" strokeDasharray="5 5" opacity={0.5} />
                <ReferenceLine y={7} stroke="#ef4444" strokeDasharray="5 5" opacity={0.5} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#1a1a1a", 
                    border: "1px solid #444",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                  }}
                  labelStyle={{ color: "#ddd", fontWeight: 600 }}
                  itemStyle={{ color: "#38bdf8" }}
                  formatter={(value: any) => [`${value.toFixed(2)}`, "Kp Index"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#kpGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500/50 rounded"></div>
                <span>Moderate (5+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/50 rounded"></div>
                <span>High (7+)</span>
              </div>
            </div>
          </div>

          {/* Solar Wind Conditions */}
          <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold">Solar Wind Conditions</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={solarWindChartData}>
                <defs>
                  <linearGradient id="windBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888"
                  tick={{ fill: "#888", fontSize: 11 }}
                  axisLine={{ stroke: "#444" }}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="#888"
                  tick={{ fill: "#888", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                  label={{ value: "Normalized %", angle: -90, position: "insideLeft", style: { fill: "#888", fontSize: 12 } }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#ffffff", 
                    border: "1px solid #444",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                  }}
                  labelStyle={{ color: "#000", fontWeight: 600 }}
                  formatter={(value: any, name: string, props: any) => {
                    if (name === "normalized") {
                      return [`${props.payload.value.toLocaleString()} ${props.payload.unit}`, props.payload.name];
                    }
                    return value;
                  }}
                />
                <Bar
                  dataKey="normalized"
                  radius={[8, 8, 0, 0]}
                >
                  {solarWindChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Speed: {solarWind.speed_km_s} km/s</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                <span>Density: {solarWind.density_p_cm3} p/cm³</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Temp: {(solarWind.temperature_k / 1000).toFixed(0)}k K</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-400 rounded"></div>
                <span>Bz: {solarWind.bz_nT} nT</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-pink-400 rounded"></div>
                <span>Bt: {solarWind.bt_nT} nT</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Pressure: {solarWind.pressure_nPa} nPa</span>
              </div>
            </div>
          </div>
        </div>

\

        {/* Aurora Visibility */}
        {aurora && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/40 to-cyan-900/40 border border-green-500/50 p-5 rounded-xl"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              Aurora Forecast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Visibility</p>
                <p className="text-2xl font-bold text-green-400">{aurora.visibility}</p>
                <p className="text-xs text-gray-500 mt-1">{aurora.intensity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Latitude / Probability</p>
                <p className="text-sm text-gray-300">{aurora.latitude}</p>
                <p className="text-sm text-gray-300">High Lat: {aurora.probabilityHigh}</p>
                <p className="text-sm text-gray-300">Mid Lat: {aurora.probabilityMid}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Expected Colors & Timing</p>
                <p className="text-sm text-gray-300">
                  {aurora.colors.join(", ")}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Best viewing: {aurora.bestViewingTime}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Timeline Section */}
        {timeline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/70 border border-gray-800 p-6 rounded-xl"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Space Weather Timeline & Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Events */}
              {timeline.recentEvents && timeline.recentEvents.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Events</h4>
                  <div className="space-y-3">
                    {timeline.recentEvents.map((event: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-200">{event.type}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(event.time).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Severity: <span className="text-yellow-400">{event.severity}</span>
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            event.status === "Observed" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictions */}
              {timeline.predictions && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Predictions</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Next 24 Hours</p>
                      <p className="text-sm text-gray-200">{timeline.predictions.next24h}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Next 48 Hours</p>
                      <p className="text-sm text-gray-200">{timeline.predictions.next48h}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Next 72 Hours</p>
                      <p className="text-sm text-gray-200">{timeline.predictions.next72h}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Impact Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/70 border border-gray-800 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Impact Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Satellites */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Satellite className="w-4 h-4 text-blue-400" />
                Satellites
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Risk:</span>{" "}
                  <span
                    className={
                      impacts.satellites.risk === "Critical"
                        ? "text-red-400 font-bold"
                        : "text-orange-400"
                    }
                  >
                    {impacts.satellites.risk}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Surface Charging:</span>{" "}
                  <span className="text-gray-300">{impacts.satellites.surfaceCharging}</span>
                </p>
                <p>
                  <span className="text-gray-400">Drag:</span>{" "}
                  <span className="text-gray-300">{impacts.satellites.dragIncrease}</span>
                </p>
              </div>
            </div>

            {/* Aviation */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-400" />
                Aviation
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Radiation:</span>{" "}
                  <span className="text-red-400 font-bold">{impacts.aviation.radiationLevel}</span>
                </p>
                <p>
                  <span className="text-gray-400">Polar Routes:</span>{" "}
                  <span className={impacts.aviation.polarRoutesAffected ? "text-red-400" : "text-green-400"}>
                    {impacts.aviation.polarRoutesAffected ? "Affected" : "Normal"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Communication:</span>{" "}
                  <span className="text-gray-300">{impacts.aviation.communicationImpact}</span>
                </p>
              </div>
            </div>

            {/* Power Grids */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Power className="w-4 h-4 text-yellow-400" />
                Power Grids
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Risk:</span>{" "}
                  <span className="text-orange-400">{impacts.powerGrids.risk}</span>
                </p>
                <p>
                  <span className="text-gray-400">GIC Level:</span>{" "}
                  <span className="text-gray-300">{impacts.powerGrids.gicLevel}</span>
                </p>
                <p>
                  <span className="text-gray-400">Regions:</span>{" "}
                  <span className="text-gray-300">{impacts.powerGrids.affectedRegions}</span>
                </p>
              </div>
            </div>

            {/* Communications */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <RadioIcon className="w-4 h-4 text-green-400" />
                Communications
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">HF Radio:</span>{" "}
                  <span className="text-orange-400 font-semibold">
                    {impacts.communications.hfRadio}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">GPS:</span>{" "}
                  <span className="text-green-400">{impacts.communications.gps}</span>
                </p>
                <p>
                  <span className="text-gray-400">Satellite Comms:</span>{" "}
                  <span className="text-green-400">{impacts.communications.satelliteComms}</span>
                </p>
              </div>
            </div>

            {/* Technology */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Technology
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Pipelines:</span>{" "}
                  <span className="text-green-400">{impacts.technology.pipelines}</span>
                </p>
                <p>
                  <span className="text-gray-400">Railways:</span>{" "}
                  <span className="text-green-400">{impacts.technology.railways}</span>
                </p>
                <p>
                  <span className="text-gray-400">Electronics:</span>{" "}
                  <span className="text-orange-400">{impacts.technology.electronics}</span>
                </p>
              </div>
            </div>

            {/* Weather Indices */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Weather Indices
                </h4>
                <div className="group relative">
                  <Info className="w-3 h-3 text-gray-500 hover:text-cyan-400 cursor-help transition-colors" />
                  <div className="absolute right-0 top-6 w-80 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                    <p className="font-semibold text-cyan-400 mb-2">Weather Indices Explained:</p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Dst:</span> Disturbance Storm Time index. Negative values indicate geomagnetic storms.
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Radiation Belt:</span> Electron flux levels in Earth's radiation belts.
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Ionospheric:</span> Disturbance in the ionosphere affecting radio propagation.
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Scintillation:</span> Signal degradation risk for GPS and satellite communications.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Dst:</span>{" "}
                  <span className="text-orange-400">{data.weatherIndices.dst.value.toFixed(1)} nT</span>
                  <span className="text-gray-500 text-xs ml-2">({data.weatherIndices.dst.level})</span>
                </p>
                <p>
                  <span className="text-gray-400">Radiation Belt:</span>{" "}
                  <span className="text-orange-400">{data.weatherIndices.radiationBelt.level}</span>
                </p>
                <p>
                  <span className="text-gray-400">Ionospheric:</span>{" "}
                  <span className="text-yellow-400">{data.weatherIndices.ionospheric.disturbance}</span>
                </p>
                {data.weatherIndices.scintillation && (
                  <p>
                    <span className="text-gray-400">Scintillation Risk:</span>{" "}
                    <span className="text-yellow-400">{data.weatherIndices.scintillation.risk}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flare Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/70 border border-gray-800 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Solar Flare Statistics
            {solarFlare.statistics.averagePerDay > 0 && (
              <span className="text-xs font-normal text-gray-500">
                (Avg: {solarFlare.statistics.averagePerDay}/day)
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {solarFlare.statistics.last24h}
              </p>
              <p className="text-xs text-gray-500">Last 24h</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">
                {solarFlare.statistics.last72h}
              </p>
              <p className="text-xs text-gray-500">Last 72h</p>
            </div>
            {solarFlare.statistics.last7d !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">
                  {solarFlare.statistics.last7d}
                </p>
                <p className="text-xs text-gray-500">Last 7d</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {solarFlare.statistics.byClass.X}
              </p>
              <p className="text-xs text-gray-500">X-Class</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">
                {solarFlare.statistics.byClass.M}
              </p>
              <p className="text-xs text-gray-500">M-Class</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {solarFlare.statistics.byClass.C}
              </p>
              <p className="text-xs text-gray-500">C-Class</p>
            </div>
            <div className="text-center group relative">
              <p className="text-2xl font-bold text-yellow-400">
                {solarFlare.statistics.strongestRecent}
              </p>
              <p className="text-xs text-gray-500">Strongest</p>
              {solarFlare.statistics.strongestFlareDetails && (
                <>
                  <Info className="w-3 h-3 text-gray-600 absolute top-0 right-0 group-hover:text-yellow-400 transition-colors cursor-help" />
                  <div className="absolute right-0 top-8 w-56 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                    <p className="font-semibold text-yellow-400 mb-2">Strongest Flare Details:</p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Class:</span> {solarFlare.statistics.strongestFlareDetails.class}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Region:</span> {solarFlare.statistics.strongestFlareDetails.activeRegion}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="text-gray-500">Location:</span> {solarFlare.statistics.strongestFlareDetails.location}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Peak:</span> {new Date(solarFlare.statistics.strongestFlareDetails.peakTime).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          {solarFlare.statistics.total !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 text-center">
                Total flares in dataset: <span className="text-yellow-400 font-semibold">{solarFlare.statistics.total}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-8 py-4 border-t border-gray-800">
          <p>
            Data Sources: {data.dataSources.join(", ")} • Next update at{" "}
            {new Date(data.metadata.nextUpdate).toLocaleTimeString()}
          </p>
          <p className="mt-2">
            Data Quality: {data.metadata.dataQuality.status} (Score: {data.metadata.dataQuality.score}%)
            {data.metadata.dataQuality.missing.length > 0 &&
              ` • Missing: ${data.metadata.dataQuality.missing.join(", ")}`}
          </p>
        </div>
      </div>
    </div>
  );
}
