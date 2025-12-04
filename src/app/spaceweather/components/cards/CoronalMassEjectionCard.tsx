import { motion } from "framer-motion";
import { Waves, ExternalLink, Info } from "lucide-react";
import { CoronalMassEjection } from "../types";

interface CoronalMassEjectionCardProps {
    coronalMassEjection?: CoronalMassEjection;
}

export default function CoronalMassEjectionCard({ coronalMassEjection }: CoronalMassEjectionCardProps) {
    if (!coronalMassEjection || !coronalMassEjection.latest) {
        return null;
    }

    return (
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
                    {coronalMassEjection.latest.halfAngle && coronalMassEjection.latest.halfAngle > 0 && (
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
    );
}
