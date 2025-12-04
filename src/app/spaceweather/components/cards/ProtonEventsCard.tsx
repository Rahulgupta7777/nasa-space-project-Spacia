import { motion } from "framer-motion";
import { Zap, CheckCircle2, XCircle } from "lucide-react";
import { ProtonEvents } from "../types";

interface ProtonEventsCardProps {
    protonEvents: ProtonEvents;
}

export default function ProtonEventsCard({ protonEvents }: ProtonEventsCardProps) {
    return (
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
                    className={`text-3xl font-bold ${protonEvents.hasEvent ? "text-red-400" : "text-green-400"
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
    );
}
