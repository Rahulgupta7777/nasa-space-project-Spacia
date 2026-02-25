import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KpIndex } from "../types";
import InfoTooltip from "../ui/InfoTooltip";

interface KpIndexCardProps {
    kpIndex: KpIndex;
}

export default function KpIndexCard({ kpIndex }: KpIndexCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-space-card/70 border border-space-border p-5 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-space-text-muted">Kp Index</h3>
                </div>
                <InfoTooltip title="Kp Index Explained:">
                    <p className="text-space-text-muted mb-1">
                        The Kp index measures geomagnetic activity on a scale of 0-9. Higher values indicate stronger geomagnetic storms.
                    </p>
                    <p className="text-space-text-muted mb-1">
                        <span className="text-space-text-soft">Kp 0-2:</span> Quiet
                    </p>
                    <p className="text-space-text-muted mb-1">
                        <span className="text-space-text-soft">Kp 3-4:</span> Unsettled
                    </p>
                    <p className="text-space-text-muted mb-1">
                        <span className="text-space-text-soft">Kp 5:</span> Minor Storm (G1)
                    </p>
                    <p className="text-space-text-muted mb-1">
                        <span className="text-space-text-soft">Kp 6:</span> Moderate Storm (G2)
                    </p>
                    <p className="text-space-text-muted mb-1">
                        <span className="text-space-text-soft">Kp 7:</span> Strong Storm (G3)
                    </p>
                    <p className="text-space-text-muted">
                        <span className="text-space-text-soft">Kp 8-9:</span> Severe/Extreme (G4-G5)
                    </p>
                </InfoTooltip>
            </div>
            <p
                className={`text-3xl font-bold mb-3 ${kpIndex.current >= 7
                        ? "text-red-400"
                        : kpIndex.current >= 5
                            ? "text-orange-400"
                            : "text-green-400"
                    }`}
            >
                {kpIndex.current.toFixed(2)}
            </p>
            <div className="space-y-1.5 text-xs">
                <p className="text-space-text-soft">
                    <span className="text-space-text-muted">Max 24h:</span> {kpIndex.max24h.toFixed(2)}
                </p>
                <p className="text-space-text-soft flex items-center gap-1">
                    <span className="text-space-text-muted">Trend:</span>{" "}
                    {kpIndex.trend === "Increasing" ? (
                        <TrendingUp className="w-3 h-3 text-orange-400" />
                    ) : kpIndex.trend === "Decreasing" ? (
                        <TrendingDown className="w-3 h-3 text-green-400" />
                    ) : (
                        <Minus className="w-3 h-3 text-space-text-soft" />
                    )}
                    {kpIndex.trend}
                </p>
                <p className="text-gray-600">{kpIndex.stormLevel}</p>
                <p className="text-gray-600 mt-1">
                    <span className="text-space-text-muted">Storm Prob:</span> {kpIndex.stormProbability}
                </p>
            </div>
        </motion.div>
    );
}
