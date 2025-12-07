import { motion } from "framer-motion";
import { Satellite, Plane, Power, RadioIcon, Cpu, Activity } from "lucide-react";
import { Impacts, WeatherIndices } from "../types";
import InfoTooltip from "../ui/InfoTooltip";

interface ImpactAssessmentProps {
    impacts: Impacts;
    weatherIndices: WeatherIndices;
}

export default function ImpactAssessment({ impacts, weatherIndices }: ImpactAssessmentProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/70 border border-gray-800 p-6 rounded-xl"
        >
            <h3 className="text-lg font-semibold mb-4">Impact Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Satellites */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <Satellite className="w-4 h-4 text-blue-400" />
                        Satellites
                    </h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="text-gray-400">Risk:</span>{" "}
                            <span
                                className={
                                    impacts.satellites.risk === "Critical"
                                        ? "text-red-400 font-bold"
                                        : "text-orange-400"
                                }
                            >
                                {impacts.satellites.risk}
                            </span>
                        </p>
                        <p>
                            <span className="text-gray-400">Surface Charging:</span>{" "}
                            <span className="text-gray-300">{impacts.satellites.surfaceCharging}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Drag:</span>{" "}
                            <span className="text-gray-300">{impacts.satellites.dragIncrease}</span>
                        </p>
                    </div>
                </div>

                {/* Aviation */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-sky-400" />
                        Aviation
                    </h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="text-gray-400">Radiation:</span>{" "}
                            <span className="text-red-400 font-bold">{impacts.aviation.radiationLevel}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Polar Routes:</span>{" "}
                            <span className={impacts.aviation.polarRoutesAffected ? "text-red-400" : "text-green-400"}>
                                {impacts.aviation.polarRoutesAffected ? "Affected" : "Normal"}
                            </span>
                        </p>
                        <p>
                            <span className="text-gray-400">Communication:</span>{" "}
                            <span className="text-gray-300">{impacts.aviation.communicationImpact}</span>
                        </p>
                    </div>
                </div>

                {/* Power Grids */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <Power className="w-4 h-4 text-yellow-400" />
                        Power Grids
                    </h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="text-gray-400">Risk:</span>{" "}
                            <span className="text-orange-400">{impacts.powerGrids.risk}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">GIC Level:</span>{" "}
                            <span className="text-gray-300">{impacts.powerGrids.gicLevel}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Regions:</span>{" "}
                            <span className="text-gray-300">{impacts.powerGrids.affectedRegions}</span>
                        </p>
                    </div>
                </div>

                {/* Communications */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <RadioIcon className="w-4 h-4 text-green-400" />
                        Communications
                    </h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="text-gray-400">HF Radio:</span>{" "}
                            <span className="text-orange-400 font-semibold">
                                {impacts.communications.hfRadio}
                            </span>
                        </p>
                        <p>
                            <span className="text-gray-400">GPS:</span>{" "}
                            <span className="text-green-400">{impacts.communications.gps}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Satellite Comms:</span>{" "}
                            <span className="text-green-400">{impacts.communications.satelliteComms}</span>
                        </p>
                    </div>
                </div>

                {/* Technology */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        Technology
                    </h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="text-gray-400">Pipelines:</span>{" "}
                            <span className="text-green-400">{impacts.technology.pipelines}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Railways:</span>{" "}
                            <span className="text-green-400">{impacts.technology.railways}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Electronics:</span>{" "}
                            <span className="text-orange-400">{impacts.technology.electronics}</span>
                        </p>
                    </div>
                </div>

                {/* Weather Indices */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-200 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            Weather Indices
                        </h4>
                        <InfoTooltip title="Weather Indices Explained:" width="w-80">
                            <p className="text-gray-400 mb-1">
                                <span className="text-gray-500">Dst:</span> Disturbance Storm Time index. Negative values indicate geomagnetic storms.
                            </p>
                            <p className="text-gray-400 mb-1">
                                <span className="text-gray-500">Radiation Belt:</span> Electron flux levels in Earth's radiation belts.
                            </p>
                            <p className="text-gray-400 mb-1">
                                <span className="text-gray-500">Ionospheric:</span> Disturbance in the ionosphere affecting radio propagation.
                            </p>
                            <p className="text-gray-400">
                                <span className="text-gray-500">Scintillation:</span> Signal degradation risk for GPS and satellite communications.
                            </p>
                        </InfoTooltip>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="text-gray-400">Dst:</span>{" "}
                            <span className="text-orange-400">{weatherIndices.dst.value.toFixed(1)} nT</span>
                            <span className="text-gray-500 text-xs ml-2">({weatherIndices.dst.level})</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Radiation Belt:</span>{" "}
                            <span className="text-orange-400">{weatherIndices.radiationBelt.level}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Ionospheric:</span>{" "}
                            <span className="text-yellow-400">{weatherIndices.ionospheric.disturbance}</span>
                        </p>
                        {weatherIndices.scintillation && (
                            <p>
                                <span className="text-gray-400">Scintillation Risk:</span>{" "}
                                <span className="text-yellow-400">{weatherIndices.scintillation.risk}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
