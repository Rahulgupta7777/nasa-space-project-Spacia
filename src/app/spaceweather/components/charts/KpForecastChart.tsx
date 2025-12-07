import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";
import { Activity } from "lucide-react";

interface KpForecastChartProps {
    forecastData: number[];
}

export default function KpForecastChart({ forecastData }: KpForecastChartProps) {
    const chartData = forecastData.map((v: number, i: number) => ({
        hour: `${i}h`,
        value: v,
        threshold: 5,
        critical: 7,
    }));

    return (
        <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold">Kp Index Forecast (Next 24h)</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
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
    );
}
