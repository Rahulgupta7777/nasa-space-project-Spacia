import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Timeline } from "../types";

interface TimelineProps {
    timeline?: Timeline;
}

export default function TimeLine({ timeline }: TimelineProps) {
    if (!timeline) {
        return null;
    }

    return (
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
                            {timeline.recentEvents.map((event, i) => (
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
                                        <span className={`text-xs px-2 py-1 rounded ${event.status === "Observed"
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
    );
}
