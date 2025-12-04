import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { SolarWind } from "../types";
import InfoTooltip from "../ui/InfoTooltip";

interface SolarWindCardProps {
    solarWind: SolarWind;
}

export default function SolarWindCard({ solarWind }: SolarWindCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/70 border border-gray-800 p-5 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-400">Solar Wind</h3>
                </div>
                {solarWind.geoeffectiveness && (
                    <InfoTooltip title="Solar Wind Parameters:">
                        <p className="text-gray-400 mb-1">
                            <span className="text-gray-500">Bz:</span> Interplanetary magnetic field component. Negative values enhance geomagnetic activity.
                        </p>
                        <p className="text-gray-400 mb-1">
                            <span className="text-gray-500">Bt:</span> Total magnetic field strength.
                        </p>
                        <p className="text-gray-400 mb-1">
                            <span className="text-gray-500">Geoeffectiveness:</span> {solarWind.geoeffectiveness}
                        </p>
                        <p className="text-gray-400">
                            <span className="text-gray-500">Pressure:</span> {solarWind.pressure_nPa} nPa
                        </p>
                    </InfoTooltip>
                )}
            </div>
            <p className="text-3xl font-bold text-cyan-400 mb-3">{solarWind.speed_km_s} km/s</p>
            <div className="space-y-1.5 text-xs">
                <p className="text-gray-500">
                    <span className="text-gray-400">Density:</span> {solarWind.density_p_cm3} p/cm³
                </p>
                <p className="text-gray-500">
                    <span className="text-gray-400">Temp:</span> {solarWind.temperature_k.toLocaleString()} K
                </p>
                <p className="text-gray-500">
                    <span className="text-gray-400">Bz:</span> {solarWind.bz_nT} nT
                </p>
                {solarWind.bt_nT > 0 && (
                    <p className="text-gray-500">
                        <span className="text-gray-400">Bt:</span> {solarWind.bt_nT} nT
                    </p>
                )}
                <p className="text-gray-600 mt-1">
                    <span className="text-gray-400">Condition:</span> {solarWind.conditions}
                </p>
                {solarWind.geoeffectiveness && (
                    <p className="text-gray-600">
                        <span className="text-gray-400">Geoeffectiveness:</span> {solarWind.geoeffectiveness}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
