import { motion } from "framer-motion";
import { Sun, Clock, ExternalLink, Info } from "lucide-react";
import { SolarFlare } from "../types";

interface SolarFlareCardProps {
    solarFlare: SolarFlare;
}

export default function SolarFlareCard({ solarFlare }: SolarFlareCardProps) {
    return (
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
    );
}
