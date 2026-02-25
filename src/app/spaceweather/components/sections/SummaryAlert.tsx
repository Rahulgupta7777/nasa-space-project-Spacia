import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Summary, DataQuality } from "../types";

interface SummaryAlertProps {
    summary: Summary;
    dataQuality: DataQuality;
}

export default function SummaryAlert({ summary, dataQuality }: SummaryAlertProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-6 border ${summary.color === "red"
                ? "bg-red-950/20 border-red-900/50"
                : summary.color === "orange"
                    ? "bg-orange-950/20 border-orange-900/50"
                    : "bg-space-card border-space-border"
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h2 className="text-2xl font-bold">{summary.status}</h2>
                    <p className="text-sm text-space-text-main mt-1">Risk Level: {summary.riskLevel}</p>
                </div>
                <span className="text-xs bg-black/40 px-3 py-1 rounded-full">
                    Data Quality: {dataQuality.score}%
                </span>
            </div>
            <p className="text-gray-200 mb-4">{summary.message}</p>

            {summary.alerts && summary.alerts.length > 0 && (
                <div className="mb-4 p-3 bg-space-section rounded-lg border border-red-900/30">
                    <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Active Alerts
                    </h4>
                    <div className="space-y-2">
                        {summary.alerts.map((alert, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-space-text-main">
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
                <ul className="list-disc list-inside text-sm text-space-text-main space-y-1">
                    {summary.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}
