import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { Wind } from "lucide-react";
import { SolarWind, SolarWindChartData } from "../types";

interface SolarWindChartProps {
    solarWind: SolarWind;
}

export default function SolarWindChart({ solarWind }: SolarWindChartProps) {
    const chartData: SolarWindChartData[] = [
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
        <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Solar Wind Conditions</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
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
                        {chartData.map((entry, index) => (
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
    );
}
