// Type definitions for Space Weather data structures

export interface SolarFlare {
    latestFlare: {
        class: string;
        activeRegion: string;
        location: string;
        duration?: string;
        instruments?: string[];
        note?: string;
        beginTime?: string;
        peakTime: string;
        endTime?: string;
        link: string;
    };
    statistics: {
        last24h: number;
        last72h: number;
        last7d?: number;
        averagePerDay: number;
        byClass: {
            X: number;
            M: number;
            C: number;
        };
        strongestRecent: string;
        strongestFlareDetails?: {
            class: string;
            activeRegion: string;
            location: string;
            peakTime: string;
        };
        total?: number;
    };
}

export interface KpIndex {
    current: number;
    max24h: number;
    trend: "Increasing" | "Decreasing" | "Stable";
    stormLevel: string;
    stormProbability: string;
    forecastNext24h: number[];
}

export interface SolarWind {
    speed_km_s: number;
    density_p_cm3: number;
    temperature_k: number;
    bz_nT: number;
    bt_nT: number;
    pressure_nPa: number;
    conditions: string;
    geoeffectiveness?: string;
}

export interface ProtonEvents {
    hasEvent: boolean;
    currentFlux: number;
    maxFlux: number;
    level: string;
    radiationRisk: string;
}

export interface CoronalMassEjection {
    latest: {
        speed: number;
        startTime: string;
        type?: string;
        halfAngle?: number;
        latitude?: number | null;
        longitude?: number | null;
        instruments?: string[];
        note?: string;
        activityID?: string;
        link: string;
    };
    speed: {
        min: number;
        max: number;
        avg: number;
    };
    totalCount: number;
    earthDirectedCount: number;
    estimatedArrival?: string;
}

export interface Aurora {
    visibility: string;
    intensity: string;
    latitude: string;
    probabilityHigh: string;
    probabilityMid: string;
    colors: string[];
    bestViewingTime: string;
}

export interface TimelineEvent {
    type: string;
    time: string;
    severity: string;
    status: string;
}

export interface Timeline {
    recentEvents?: TimelineEvent[];
    predictions?: {
        next24h: string;
        next48h: string;
        next72h: string;
    };
}

export interface Impacts {
    satellites: {
        risk: string;
        surfaceCharging: string;
        dragIncrease: string;
    };
    aviation: {
        radiationLevel: string;
        polarRoutesAffected: boolean;
        communicationImpact: string;
    };
    powerGrids: {
        risk: string;
        gicLevel: string;
        affectedRegions: string;
    };
    communications: {
        hfRadio: string;
        gps: string;
        satelliteComms: string;
    };
    technology: {
        pipelines: string;
        railways: string;
        electronics: string;
    };
}

export interface WeatherIndices {
    dst: {
        value: number;
        level: string;
    };
    radiationBelt: {
        level: string;
    };
    ionospheric: {
        disturbance: string;
    };
    scintillation?: {
        risk: string;
    };
}

export interface Summary {
    status: string;
    riskLevel: string;
    message: string;
    color: "red" | "orange" | "green";
    alerts?: Array<{
        level: string;
        type: string;
        message: string;
    }>;
    recommendations: string[];
}

export interface DataQuality {
    score: number;
    status: string;
    missing: string[];
}

export interface Metadata {
    dataQuality: DataQuality;
    nextUpdate: string;
}

export interface SpaceWeatherData {
    solarFlare: SolarFlare;
    coronalMassEjection?: CoronalMassEjection;
    kpIndex: KpIndex;
    solarWind: SolarWind;
    protonEvents: ProtonEvents;
    aurora?: Aurora;
    sunspots: any; // Not used in current UI
    xrayFlux: any; // Not used in current UI
    timeline?: Timeline;
    impacts: Impacts;
    summary: Summary;
    weatherIndices: WeatherIndices;
    timestamp: string;
    dataSources: string[];
    metadata: Metadata;
}

export interface SolarWindChartData {
    name: string;
    value: number;
    normalized: number;
    unit: string;
    color: string;
}
