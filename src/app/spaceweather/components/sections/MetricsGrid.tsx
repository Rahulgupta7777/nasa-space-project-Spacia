import SolarFlareCard from "../cards/SolarFlareCard";
import KpIndexCard from "../cards/KpIndexCard";
import SolarWindCard from "../cards/SolarWindCard";
import ProtonEventsCard from "../cards/ProtonEventsCard";
import { SolarFlare, KpIndex, SolarWind, ProtonEvents } from "../types";

interface MetricsGridProps {
    solarFlare: SolarFlare;
    kpIndex: KpIndex;
    solarWind: SolarWind;
    protonEvents: ProtonEvents;
}

export default function MetricsGrid({
    solarFlare,
    kpIndex,
    solarWind,
    protonEvents,
}: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SolarFlareCard solarFlare={solarFlare} />
            <KpIndexCard kpIndex={kpIndex} />
            <SolarWindCard solarWind={solarWind} />
            <ProtonEventsCard protonEvents={protonEvents} />
        </div>
    );
}
