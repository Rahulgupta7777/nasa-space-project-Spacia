import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { SolarFlare } from "../types";

interface FlareStatisticsProps {
    solarFlare: SolarFlare;
}

export default function FlareStatistics({ solarFlare }: FlareStatisticsProps) {
    const { statistics } = solarFlare;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/70 border border-gray-800 p-6 rounded-xl"
        >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Solar Flare Statistics
                {statistics.averagePerDay > 0 && (
                    <span className="text-xs font-normal text-gray-500">
                        (Avg: {statistics.averagePerDay}/day)
                    </span>
                )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                        {statistics.last24h}
                    </p>
                    <p className="text-xs text-gray-500">Last 24h</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">
                        {statistics.last72h}
                    </p>
                    <p className="text-xs text-gray-500">Last 72h</p>
                </div>
                {statistics.last7d !== undefined && (
                    <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">
                            {statistics.last7d}
                        </p>
                        <p className="text-xs text-gray-500">Last 7d</p>
                    </div>
                )}
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">
                        {statistics.byClass.X}
                    </p>
                    <p className="text-xs text-gray-500">X-Class</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">
                        {statistics.byClass.M}
                    </p>
                    <p className="text-xs text-gray-500">M-Class</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                        {statistics.byClass.C}
                    </p>
                    <p className="text-xs text-gray-500">C-Class</p>
                </div>
                <div className="text-center group relative">
                    <p className="text-2xl font-bold text-yellow-400">
                        {statistics.strongestRecent}
                    </p>
                    <p className="text-xs text-gray-500">Strongest</p>
                    {statistics.strongestFlareDetails && (
                        <>
                            <Info className="w-3 h-3 text-gray-600 absolute top-0 right-0 group-hover:text-yellow-400 transition-colors cursor-help" />
                            <div className="absolute right-0 top-8 w-56 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-gray-300">
                                <p className="font-semibold text-yellow-400 mb-2">Strongest Flare Details:</p>
                                <p className="text-gray-400 mb-1">
                                    <span className="text-gray-500">Class:</span> {statistics.strongestFlareDetails.class}
                                </p>
                                <p className="text-gray-400 mb-1">
                                    <span className="text-gray-500">Region:</span> {statistics.strongestFlareDetails.activeRegion}
                                </p>
                                <p className="text-gray-400 mb-1">
                                    <span className="text-gray-500">Location:</span> {statistics.strongestFlareDetails.location}
                                </p>
                                <p className="text-gray-400">
                                    <span className="text-gray-500">Peak:</span> {new Date(statistics.strongestFlareDetails.peakTime).toLocaleString()}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {statistics.total !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400 text-center">
                        Total flares in dataset: <span className="text-yellow-400 font-semibold">{statistics.total}</span>
                    </p>
                </div>
            )}
        </motion.div>
    );
}
