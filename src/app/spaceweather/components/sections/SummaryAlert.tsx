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
            className={`rounded-2xl p-6 shadow-lg border ${summary.color === "red"
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
                    Data Quality: {dataQuality.score}%
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
                        {summary.alerts.map((alert, i) => (
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
                    {summary.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}
