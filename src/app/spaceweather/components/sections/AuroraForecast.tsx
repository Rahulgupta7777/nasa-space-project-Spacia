import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Aurora } from "../types";

interface AuroraForecastProps {
    aurora?: Aurora;
}

export default function AuroraForecast({ aurora }: AuroraForecastProps) {
    if (!aurora) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/40 to-cyan-900/40 border border-green-500/50 p-5 rounded-xl"
        >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                Aurora Forecast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Visibility</p>
                    <p className="text-2xl font-bold text-green-400">{aurora.visibility}</p>
                    <p className="text-xs text-gray-500 mt-1">{aurora.intensity}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 mb-1">Latitude / Probability</p>
                    <p className="text-sm text-gray-300">{aurora.latitude}</p>
                    <p className="text-sm text-gray-300">High Lat: {aurora.probabilityHigh}</p>
                    <p className="text-sm text-gray-300">Mid Lat: {aurora.probabilityMid}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 mb-1">Expected Colors & Timing</p>
                    <p className="text-sm text-gray-300">
                        {aurora.colors.join(", ")}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                        Best viewing: {aurora.bestViewingTime}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
