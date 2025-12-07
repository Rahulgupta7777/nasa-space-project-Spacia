"use client";

import { useEffect, useState } from "react";

// Component imports
import LoadingState from "@/components/spaceweather/ui/LoadingState";
import ErrorState from "@/components/spaceweather/ui/ErrorState";
import Header from "@/components/spaceweather/sections/Header";
import SummaryAlert from "@/components/spaceweather/sections/SummaryAlert";
import MetricsGrid from "@/components/spaceweather/sections/MetricsGrid";
import CoronalMassEjectionCard from "@/components/spaceweather/cards/CoronalMassEjectionCard";
import KpForecastChart from "@/components/spaceweather/charts/KpForecastChart";
import SolarWindChart from "@/components/spaceweather/charts/SolarWindChart";
import AuroraForecast from "@/components/spaceweather/sections/AuroraForecast";
import TimeLine from "@/components/spaceweather/sections/TimeLine";
import ImpactAssessment from "@/components/spaceweather/sections/ImpactAssessment";
import FlareStatistics from "@/components/spaceweather/sections/FlareStatistics";
import Footer from "@/components/spaceweather/sections/Footer";

// Type imports
import { SpaceWeatherData } from "@/components/spaceweather/types";

export default function SpaceWeatherPage() {
  const [data, setData] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Header timestamp={data.timestamp} dataSources={data.dataSources} />

        {/* Critical Alert Summary */}
        <SummaryAlert
          summary={data.summary}
          dataQuality={data.metadata.dataQuality}
        />

        {/* Main Metrics Grid */}
        <MetricsGrid
          solarFlare={data.solarFlare}
          kpIndex={data.kpIndex}
          solarWind={data.solarWind}
          protonEvents={data.protonEvents}
        />

        {/* Coronal Mass Ejection Card */}
        <CoronalMassEjectionCard coronalMassEjection={data.coronalMassEjection} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <KpForecastChart forecastData={data.kpIndex.forecastNext24h} />
          <SolarWindChart solarWind={data.solarWind} />
        </div>

        {/* Aurora Visibility */}
        <AuroraForecast aurora={data.aurora} />

        {/* Timeline Section */}
        <TimeLine timeline={data.timeline} />

        {/* Impact Assessment */}
        <ImpactAssessment
          impacts={data.impacts}
          weatherIndices={data.weatherIndices}
        />

        {/* Flare Statistics */}
        <FlareStatistics solarFlare={data.solarFlare} />

        {/* Footer */}
        <Footer dataSources={data.dataSources} metadata={data.metadata} />
      </div>
    </div>
  );
}
