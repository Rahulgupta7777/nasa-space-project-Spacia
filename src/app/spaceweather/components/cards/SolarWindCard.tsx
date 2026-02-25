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
            className="bg-space-card border border-space-border p-5 rounded-xl"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-space-text-muted">Solar Wind</h3>
                </div>
                {solarWind.geoeffectiveness && (
                    <InfoTooltip title="Solar Wind Parameters:">
                        <p className="text-space-text-muted mb-1">
                            <span className="text-space-text-soft">Bz:</span> Interplanetary magnetic field component. Negative values enhance geomagnetic activity.
                        </p>
                        <p className="text-space-text-muted mb-1">
                            <span className="text-space-text-soft">Bt:</span> Total magnetic field strength.
                        </p>
                        <p className="text-space-text-muted mb-1">
                            <span className="text-space-text-soft">Geoeffectiveness:</span> {solarWind.geoeffectiveness}
                        </p>
                        <p className="text-space-text-muted">
                            <span className="text-space-text-soft">Pressure:</span> {solarWind.pressure_nPa} nPa
                        </p>
                    </InfoTooltip>
                )}
            </div>
            <p className="text-3xl font-bold text-cyan-400 mb-3">{solarWind.speed_km_s} km/s</p>
            <div className="space-y-1.5 text-xs">
                <p className="text-space-text-soft">
                    <span className="text-space-text-muted">Density:</span> {solarWind.density_p_cm3} p/cm³
                </p>
                <p className="text-space-text-soft">
                    <span className="text-space-text-muted">Temp:</span> {solarWind.temperature_k.toLocaleString()} K
                </p>
                <p className="text-space-text-soft">
                    <span className="text-space-text-muted">Bz:</span> {solarWind.bz_nT} nT
                </p>
                {solarWind.bt_nT > 0 && (
                    <p className="text-space-text-soft">
                        <span className="text-space-text-muted">Bt:</span> {solarWind.bt_nT} nT
                    </p>
                )}
                <p className="text-gray-600 mt-1">
                    <span className="text-space-text-muted">Condition:</span> {solarWind.conditions}
                </p>
                {solarWind.geoeffectiveness && (
                    <p className="text-gray-600">
                        <span className="text-space-text-muted">Geoeffectiveness:</span> {solarWind.geoeffectiveness}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
