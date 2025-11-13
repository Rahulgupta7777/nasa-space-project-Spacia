import { NextResponse } from "next/server";

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const NOAA_BASE_URL = "https://services.swpc.noaa.gov";

// Cache configuration
const CACHE_TTL = 900; // 15 minutes

async function safeFetchJSON(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, { 
      next: { revalidate: CACHE_TTL },
      ...options 
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const now = new Date();
    const startDate = new Date(Date.now() - 7 * 24 * 3600 * 1000)
      .toISOString()
      .split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    // Fetch all space weather data in parallel
    const [
      donkiData,
      cmeData,
      kpData,
      windData,
      protonData,
      auroraData,
      sunspotData,
      xrayFluxData,
      magnetometerData
    ] = await Promise.all([
      // Solar Flares
      safeFetchJSON(
        `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
      ),
      // CMEs
      safeFetchJSON(
        `https://api.nasa.gov/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`
      ),
      // Geomagnetic indices
      safeFetchJSON(`${NOAA_BASE_URL}/products/noaa-planetary-k-index.json`),
      // Solar wind parameters
      safeFetchJSON(`${NOAA_BASE_URL}/products/solar-wind/plasma-7-day.json`),
      // Solar proton events
      safeFetchJSON(`${NOAA_BASE_URL}/json/goes/primary/integral-protons-7-day.json`),
      // Aurora forecast
      safeFetchJSON(`${NOAA_BASE_URL}/products/aurora-forecast.json`),
      // Sunspot data
      safeFetchJSON(`${NOAA_BASE_URL}/products/solar-cycle/sunspot-numbers.json`),
      // X-ray flux
      safeFetchJSON(`${NOAA_BASE_URL}/products/solar-cycle/xray-flux-7-day.json`),
      // Magnetometer data
      safeFetchJSON(`${NOAA_BASE_URL}/products/solar-wind/mag-7-day.json`)
    ]);

    // --- Solar Flare Analysis (Enhanced) ---
    const flareAnalysis = analyzeFlares(donkiData, now);

    // --- CME Analysis (New) ---
    const cmeAnalysis = analyzeCMEs(cmeData, now);
    
    // --- Kp Index Analysis (Enhanced) ---
    const kpAnalysis = analyzeKpIndex(kpData, now);
    
    // --- Solar Wind Analysis (Enhanced with Magnetometer) ---
    const solarWindAnalysis = analyzeSolarWind(windData, magnetometerData, now);
    
    // --- Proton Event Analysis (Enhanced) ---
    const protonAnalysis = analyzeProtons(protonData, now);
    
    // --- Aurora Forecast (Enhanced) ---
    const auroraAnalysis = analyzeAurora(auroraData, kpAnalysis.current, solarWindAnalysis);
    
    // --- Sunspot Analysis (New) ---
    const sunspotAnalysis = analyzeSunspots(sunspotData);
    
    // --- X-ray Flux Analysis (New) ---
    const xrayAnalysis = analyzeXRayFlux(xrayFluxData);
    
    // --- Space Weather Indices (New) ---
    const weatherIndices = calculateWeatherIndices(
      solarWindAnalysis,
      kpAnalysis.current,
      flareAnalysis.latestFlare.class
    );
    
    // --- Impact Analysis (New) ---
    const impactAnalysis = analyzeImpacts(
      flareAnalysis,
      cmeAnalysis,
      kpAnalysis,
      solarWindAnalysis,
      protonAnalysis
    );
    
    // --- Timeline & Predictions (New) ---
    const timeline = generateTimeline(
      flareAnalysis,
      cmeAnalysis,
      kpAnalysis,
      now
    );

    const { status, riskLevel, color, message } = assessSpaceWeather(
      flareAnalysis.latestFlare.class,
      kpAnalysis.current,
      solarWindAnalysis.speed_km_s,
      protonAnalysis.hasEvent,
      cmeAnalysis.earthDirectedCount
    );

    const response = {
      timestamp: now.toISOString(),
      dataSources: ["NASA DONKI", "NOAA SWPC", "NOAA DSCOVR", "NOAA GOES"],
      
      solarFlare: flareAnalysis,
      
      coronalMassEjection: cmeAnalysis,
      
      kpIndex: kpAnalysis,
      
      solarWind: solarWindAnalysis,
      
      protonEvents: protonAnalysis,
      
      aurora: auroraAnalysis,
      
      sunspots: sunspotAnalysis,
      
      xrayFlux: xrayAnalysis,
      
      weatherIndices,
      
      impacts: impactAnalysis,
      
      timeline,
      
      summary: {
        status,
        riskLevel,
        color,
        message,
        recommendations: getRecommendations(riskLevel),
        alerts: generateAlerts(flareAnalysis, cmeAnalysis, kpAnalysis, protonAnalysis)
      },
      
      metadata: {
        cache: CACHE_TTL,
        nextUpdate: new Date(now.getTime() + CACHE_TTL * 1000).toISOString(),
        dataQuality: assessDataQuality([
          donkiData, cmeData, kpData, windData, protonData, 
          auroraData, sunspotData, xrayFluxData, magnetometerData
        ])
      }
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=600`
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { 
        error: "Space weather data unavailable",
        message: "Please try again shortly",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

// Enhanced Analysis Functions

function analyzeFlares(donkiData: any, now: Date) {
  // Validate and handle FLR data structure
  // DONKI FLR API returns an array of flare objects with:
  // - flrID, beginTime, peakTime, endTime, classType, sourceLocation, activeRegionNum, link
  if (!donkiData || !Array.isArray(donkiData) || donkiData.length === 0) {
    return {
      latestFlare: {
        class: "Quiet",
        source: "NASA DONKI",
        peakTime: "N/A",
        activeRegion: "None",
        link: "#",
        location: "N/A"
      },
      statistics: {
        last24h: 0,
        last72h: 0,
        strongestRecent: "Quiet",
        byClass: { A: 0, B: 0, C: 0, M: 0, X: 0 },
        frequency: "Low"
      },
      trend: "Stable",
      riskScore: 0
    };
  }

  // Sort flares by peakTime (most recent first) if available
  const sortedFlares = [...donkiData].sort((a: any, b: any) => {
    const timeA = a.peakTime ? new Date(a.peakTime).getTime() : 0;
    const timeB = b.peakTime ? new Date(b.peakTime).getTime() : 0;
    return timeB - timeA;
  });

  const latestFlareData = sortedFlares[0];
  
  // Calculate duration if both beginTime and endTime are available
  let duration = null;
  if (latestFlareData?.beginTime && latestFlareData?.endTime) {
    try {
      const begin = new Date(latestFlareData.beginTime).getTime();
      const end = new Date(latestFlareData.endTime).getTime();
      if (!isNaN(begin) && !isNaN(end) && end > begin) {
        const durationMs = end - begin;
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        duration = `${durationMinutes} minutes`;
      }
    } catch {
      // Duration calculation failed, leave as null
    }
  }

  const latestFlare = {
    class: latestFlareData?.classType || "Quiet",
    source: "NASA DONKI",
    flrID: latestFlareData?.flrID || null,
    beginTime: latestFlareData?.beginTime || null,
    peakTime: latestFlareData?.peakTime || latestFlareData?.beginTime || "N/A",
    endTime: latestFlareData?.endTime || null,
    duration: duration,
    activeRegion: latestFlareData?.activeRegionNum?.toString() || "Unknown",
    link: latestFlareData?.link || "#",
    location: latestFlareData?.sourceLocation || "Unknown",
    instruments: latestFlareData?.instruments?.map((inst: any) => inst.displayName || inst) || [],
    note: latestFlareData?.note || null,
    linkedEvents: latestFlareData?.linkedEvents || null
  };

  // Calculate time-based statistics
  const flares24h = sortedFlares.filter((flare: any) => {
    if (!flare.peakTime) return false;
    try {
      const flareTime = new Date(flare.peakTime);
      return !isNaN(flareTime.getTime()) && (now.getTime() - flareTime.getTime()) < 24 * 3600 * 1000;
    } catch {
      return false;
    }
  });

  const flares7d = sortedFlares.filter((flare: any) => {
    if (!flare.peakTime) return false;
    try {
      const flareTime = new Date(flare.peakTime);
      return !isNaN(flareTime.getTime()) && (now.getTime() - flareTime.getTime()) < 7 * 24 * 3600 * 1000;
    } catch {
      return false;
    }
  });

  const strongestFlare = sortedFlares.reduce((strongest: any, current: any) => {
    return getFlareStrength(current?.classType) > getFlareStrength(strongest?.classType) ? current : strongest;
  }, { classType: "Quiet" });

  const flareStats = {
    last24h: flares24h.length,
    last72h: sortedFlares.filter((flare: any) => {
      if (!flare.peakTime) return false;
      try {
        const flareTime = new Date(flare.peakTime);
        return !isNaN(flareTime.getTime()) && (now.getTime() - flareTime.getTime()) < 72 * 3600 * 1000;
      } catch {
        return false;
      }
    }).length,
    last7d: flares7d.length,
    total: sortedFlares.length,
    strongestRecent: strongestFlare?.classType || "Quiet",
    strongestFlareDetails: strongestFlare?.classType !== "Quiet" ? {
      class: strongestFlare.classType,
      peakTime: strongestFlare.peakTime,
      activeRegion: strongestFlare.activeRegionNum?.toString() || "Unknown",
      location: strongestFlare.sourceLocation || "Unknown"
    } : null,
    byClass: countFlaresByClass(sortedFlares),
    frequency: calculateFlareFrequency(sortedFlares, now),
    averagePerDay: flares7d.length > 0 ? parseFloat((flares7d.length / 7).toFixed(1)) : 0
  };

  return {
    latestFlare,
    statistics: flareStats,
    trend: determineFlareActivity(sortedFlares, now),
    riskScore: calculateFlareRisk(latestFlare.class, flareStats)
  };
}

function analyzeCMEs(cmeData: any, now: Date) {
  if (!cmeData || cmeData.length === 0) {
    return {
      totalCount: 0,
      earthDirectedCount: 0,
      latest: null,
      estimatedArrival: null,
      speed: { min: 0, max: 0, avg: 0 },
      source: "NASA DONKI"
    };
  }

  const earthDirected = cmeData.filter((cme: any) => 
    cme.cmeAnalyses?.some((analysis: any) => 
      analysis.isMostAccurate && analysis.latitude !== null
    )
  );

  const speeds = cmeData
    .map((cme: any) => parseFloat(cme.cmeAnalyses?.[0]?.speed) || 0)
    .filter((s: number) => s > 0);

  const latest = cmeData[0] ? {
    activityID: cmeData[0].activityID || null,
    startTime: cmeData[0].startTime,
    speed: cmeData[0].cmeAnalyses?.[0]?.speed || "Unknown",
    type: cmeData[0].cmeAnalyses?.[0]?.type || "Unknown",
    halfAngle: cmeData[0].cmeAnalyses?.[0]?.halfAngle || 0,
    latitude: cmeData[0].cmeAnalyses?.[0]?.latitude || null,
    longitude: cmeData[0].cmeAnalyses?.[0]?.longitude || null,
    instruments: cmeData[0].instruments?.map((inst: any) => inst.displayName || inst) || [],
    note: cmeData[0].note || null,
    link: cmeData[0].link || "#"
  } : null;

  return {
    totalCount: cmeData.length,
    earthDirectedCount: earthDirected.length,
    latest,
    estimatedArrival: estimateCMEArrival(latest, now),
    speed: {
      min: Math.min(...speeds),
      max: Math.max(...speeds),
      avg: Math.round(speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length)
    },
    source: "NASA DONKI"
  };
}

function analyzeKpIndex(kpData: any, now: Date) {
  let current = 0;
  let forecast: number[] = [];
  let trend: "rising" | "falling" | "stable" = "stable";
  let max24h = 0;
  let avg24h = 0;
  let volatility = "Low";
  
  if (kpData && Array.isArray(kpData)) {
    const numericValues = kpData
      .slice(1)
      .map((r: any) => Number(r[1]))
      .filter((v: number) => !isNaN(v));
    
    current = numericValues[numericValues.length - 1] || 0;
    forecast = numericValues.slice(-8);
    max24h = Math.max(...forecast);
    avg24h = parseFloat((forecast.reduce((a, b) => a + b, 0) / forecast.length).toFixed(1));
    
    // Determine trend
    if (numericValues.length >= 3) {
      const recent = numericValues.slice(-3);
      const avgEarly = (recent[0] + recent[1]) / 2;
      const avgLate = (recent[1] + recent[2]) / 2;
      trend = avgLate > avgEarly + 0.3 ? "rising" : 
             avgLate < avgEarly - 0.3 ? "falling" : "stable";
    }
    
    // Calculate volatility
    volatility = calculateVolatility(forecast);
  }

  return {
    current,
    max24h,
    avg24h,
    forecastNext24h: forecast,
    trend,
    volatility,
    stormLevel: getStormLevel(current),
    stormProbability: estimateStormProbability(current, trend, forecast),
    source: "NOAA SWPC"
  };
}

function analyzeSolarWind(windData: any, magData: any, now: Date) {
  let solarWind = {
    speed_km_s: 0,
    density_p_cm3: 0,
    temperature_k: 0,
    bz_nT: 0,
    bt_nT: 0,
    pressure_nPa: 0,
    source: "NOAA DSCOVR",
    lastUpdated: now.toISOString(),
    conditions: "Unknown" as string,
    geoeffectiveness: "Low" as string
  };

  if (windData && Array.isArray(windData) && windData.length > 0) {
    const validReadings = windData
      .slice(-10)
      .filter((reading: any) => reading && reading.length >= 4)
      .map((reading: any) => ({
        density: parseFloat(reading[1]) || 0,
        speed: parseFloat(reading[2]) || 0,
        temperature: parseFloat(reading[3]) || 0
      }))
      .filter(reading => reading.speed > 0);

    if (validReadings.length > 0) {
      const latest = validReadings[validReadings.length - 1];
      solarWind.speed_km_s = Math.round(latest.speed);
      solarWind.density_p_cm3 = parseFloat(latest.density.toFixed(1));
      solarWind.temperature_k = Math.round(latest.temperature);
    }
  }

  // Add magnetometer data
  if (magData && Array.isArray(magData) && magData.length > 0) {
    const validMagReadings = magData
      .slice(-10)
      .filter((reading: any) => reading && reading.length >= 4)
      .map((reading: any) => ({
        bz: parseFloat(reading[3]) || 0,
        bt: parseFloat(reading[4]) || 0
      }));

    if (validMagReadings.length > 0) {
      const latest = validMagReadings[validMagReadings.length - 1];
      solarWind.bz_nT = parseFloat(latest.bz.toFixed(1));
      solarWind.bt_nT = parseFloat(latest.bt.toFixed(1));
    }
  }

  // Calculate dynamic pressure
  solarWind.pressure_nPa = calculateDynamicPressure(
    solarWind.density_p_cm3, 
    solarWind.speed_km_s
  );

  // Assess conditions
  solarWind.conditions = assessSolarWindConditions(solarWind.speed_km_s);
  solarWind.geoeffectiveness = assessGeoeffectiveness(solarWind.bz_nT, solarWind.speed_km_s);

  return solarWind;
}

function analyzeProtons(protonData: any, now: Date) {
  if (!protonData || protonData.length === 0) {
    return {
      hasEvent: false,
      currentFlux: 0,
      maxFlux: 0,
      threshold: 10,
      level: "Background",
      trend: "stable",
      source: "NOAA GOES"
    };
  }

  const fluxValues = protonData.map((e: any) => e.flux || 0);
  const currentFlux = fluxValues[fluxValues.length - 1] || 0;
  const maxFlux = Math.max(...fluxValues);
  const recentFlux = fluxValues.slice(-5);
  
  return {
    hasEvent: maxFlux > 10,
    currentFlux: parseFloat(currentFlux.toFixed(2)),
    maxFlux: parseFloat(maxFlux.toFixed(2)),
    threshold: 10,
    level: getProtonLevel(maxFlux),
    trend: determineProtonTrend(recentFlux),
    radiationRisk: assessRadiationRisk(maxFlux),
    source: "NOAA GOES"
  };
}

function analyzeAurora(auroraData: any, kpIndex: number, solarWind: any) {
  const baseLatitude = calculateAuroraLatitude(kpIndex);
  const visibility = determineAuroraVisibility(kpIndex, solarWind.bz_nT);
  
  return {
    visibility,
    latitude: baseLatitude,
    probabilityHigh: kpIndex >= 7 ? "Very High" : kpIndex >= 5 ? "High" : kpIndex >= 3 ? "Moderate" : "Low",
    probabilityMid: kpIndex >= 8 ? "High" : kpIndex >= 6 ? "Moderate" : "Low",
    colors: predictAuroraColors(solarWind.speed_km_s, solarWind.density_p_cm3),
    intensity: kpIndex >= 7 ? "Very Bright" : kpIndex >= 5 ? "Bright" : kpIndex >= 3 ? "Moderate" : "Faint",
    bestViewingTime: "10 PM - 2 AM local time",
    source: "NOAA SWPC"
  };
}

function analyzeSunspots(sunspotData: any) {
  if (!sunspotData || sunspotData.length === 0) {
    return {
      currentNumber: 0,
      trend: "Unknown",
      solarCyclePhase: "Unknown",
      source: "NOAA SWPC"
    };
  }

  const recentData = sunspotData.slice(-30);
  const current = recentData[recentData.length - 1]?.[1] || 0;
  const previous = recentData[recentData.length - 8]?.[1] || 0;
  
  return {
    currentNumber: Math.round(current),
    weeklyAverage: Math.round(recentData.slice(-7).reduce((a: number, b: any) => a + (b[1] || 0), 0) / 7),
    monthlyAverage: Math.round(recentData.reduce((a: number, b: any) => a + (b[1] || 0), 0) / recentData.length),
    trend: current > previous * 1.1 ? "Increasing" : current < previous * 0.9 ? "Decreasing" : "Stable",
    solarCyclePhase: determineSolarCyclePhase(current),
    activityLevel: current > 100 ? "High" : current > 50 ? "Moderate" : "Low",
    source: "NOAA SWPC"
  };
}

function analyzeXRayFlux(xrayData: any) {
  if (!xrayData || xrayData.length === 0) {
    return {
      currentLevel: "A",
      backgroundLevel: "Quiet",
      source: "NOAA GOES"
    };
  }

  return {
    currentLevel: "B",
    backgroundLevel: "Quiet",
    trend: "Stable",
    source: "NOAA GOES"
  };
}

function calculateWeatherIndices(solarWind: any, kpIndex: number, flareClass: string) {
  // DST Index estimation
  const dst = estimateDst(kpIndex, solarWind.bz_nT);
  
  // Radiation Belt Index
  const radiationBelt = estimateRadiationBelt(solarWind.speed_km_s, kpIndex);
  
  // Ionospheric disturbance
  const ionospheric = estimateIonosphericDisturbance(flareClass, solarWind.speed_km_s);
  
  return {
    dst: {
      value: dst,
      level: dst < -100 ? "Intense Storm" : dst < -50 ? "Moderate Storm" : dst < -30 ? "Minor Storm" : "Quiet"
    },
    radiationBelt: {
      level: radiationBelt,
      electronFlux: radiationBelt === "Enhanced" ? "High" : "Moderate"
    },
    ionospheric: {
      disturbance: ionospheric,
      hfPropagation: ionospheric === "Severe" ? "Blackout" : ionospheric === "Moderate" ? "Degraded" : "Normal"
    },
    scintillation: {
      risk: kpIndex >= 6 ? "High" : kpIndex >= 4 ? "Moderate" : "Low",
      affectedRegions: kpIndex >= 6 ? "High and Mid Latitudes" : "High Latitudes"
    }
  };
}

function analyzeImpacts(flare: any, cme: any, kp: any, wind: any, proton: any) {
  return {
    satellites: {
      risk: calculateSatelliteRisk(wind.speed_km_s, kp.current, proton.maxFlux),
      surfaceCharging: wind.speed_km_s > 600 ? "High" : "Low",
      dragIncrease: kp.current >= 5 ? "Significant" : "Minimal",
      recommendation: wind.speed_km_s > 700 ? "Delay critical maneuvers" : "Normal operations"
    },
    aviation: {
      radiationLevel: proton.level,
      polarRoutesAffected: proton.hasEvent || kp.current >= 5,
      communicationImpact: flare.latestFlare.class.startsWith("M") || flare.latestFlare.class.startsWith("X") ? "Moderate to High" : "Low",
      recommendation: proton.hasEvent ? "Monitor crew exposure" : "Normal operations"
    },
    powerGrids: {
      risk: kp.current >= 6 ? "High" : kp.current >= 5 ? "Moderate" : "Low",
      gicLevel: estimateGIC(kp.current, wind.bz_nT),
      affectedRegions: kp.current >= 6 ? "High and mid latitudes" : "High latitudes",
      recommendation: kp.current >= 7 ? "Prepare for voltage irregularities" : "Normal operations"
    },
    communications: {
      hfRadio: flare.latestFlare.class.startsWith("X") ? "Blackout" : flare.latestFlare.class.startsWith("M") ? "Degraded" : "Normal",
      gps: kp.current >= 6 ? "Degraded accuracy" : "Normal",
      satelliteComms: wind.speed_km_s > 650 ? "Possible disruptions" : "Normal"
    },
    technology: {
      pipelines: kp.current >= 7 ? "Monitor for corrosion" : "Normal",
      railways: kp.current >= 6 ? "Possible signaling issues" : "Normal",
      electronics: proton.hasEvent ? "Increased SEU risk" : "Normal"
    }
  };
}

function generateTimeline(flare: any, cme: any, kp: any, now: Date) {
  const events = [];

  if (flare.latestFlare.class !== "Quiet") {
    events.push({
      time: flare.latestFlare.peakTime,
      type: "Solar Flare",
      severity: flare.latestFlare.class,
      status: "Observed"
    });
  }

  if (cme.latest) {
    events.push({
      time: cme.latest.startTime,
      type: "CME",
      severity: cme.latest.speed > 1000 ? "Fast" : "Moderate",
      status: "Observed"
    });

    if (cme.estimatedArrival) {
      events.push({
        time: cme.estimatedArrival,
        type: "CME Arrival",
        severity: "TBD",
        status: "Predicted"
      });
    }
  }

  return {
    recentEvents: events.slice(0, 5),
    predictions: {
      next24h: kp.stormProbability,
      next48h: cme.earthDirectedCount > 0 ? "Possible geomagnetic storm" : "Quiet conditions expected",
      next72h: flare.trend === "Increasing" ? "Continued solar activity" : "Quiet to unsettled"
    }
  };
}

function generateAlerts(flare: any, cme: any, kp: any, proton: any) {
  const alerts = [];

  if (flare.latestFlare.class.startsWith("X")) {
    alerts.push({
      level: "Critical",
      type: "X-Class Flare",
      message: "Major solar flare detected - expect HF radio blackouts"
    });
  }

  if (cme.earthDirectedCount > 0 && cme.latest?.speed > 1000) {
    alerts.push({
      level: "Warning",
      type: "Fast CME",
      message: "Earth-directed CME detected - geomagnetic storm possible in 2-3 days"
    });
  }

  if (kp.current >= 7) {
    alerts.push({
      level: "Warning",
      type: "Geomagnetic Storm",
      message: "Strong geomagnetic storm in progress"
    });
  }

  if (proton.hasEvent) {
    alerts.push({
      level: "Watch",
      type: "Radiation Storm",
      message: "Solar radiation storm - increased radiation levels detected"
    });
  }

  return alerts.length > 0 ? alerts : [{ level: "Info", type: "Normal", message: "No significant alerts" }];
}

// Helper Functions

function getFlareStrength(flareClass: string | undefined | null): number {
  if (!flareClass || typeof flareClass !== 'string') return 0;
  
  const strengths: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'M': 4, 'X': 5
  };
  
  // Extract first character and convert to uppercase (handles "M2.3", "X1.5", etc.)
  const firstChar = flareClass.trim()[0]?.toUpperCase();
  return strengths[firstChar] || 0;
}

function countFlaresByClass(flares: any[]) {
  const counts = { A: 0, B: 0, C: 0, M: 0, X: 0 };
  if (!flares || !Array.isArray(flares)) return counts;
  
  flares.forEach((flare: any) => {
    const classType = flare?.classType;
    if (!classType || typeof classType !== 'string') return;
    
    // Extract first character (A, B, C, M, or X)
    const cls = classType.trim()[0]?.toUpperCase();
    if (cls && cls in counts) {
      counts[cls as keyof typeof counts]++;
    }
  });
  return counts;
}

function calculateFlareFrequency(flares: any[], now: Date): string {
  if (!flares || !Array.isArray(flares) || flares.length === 0) return "Low";
  
  const last24h = flares.filter((f: any) => {
    if (!f?.peakTime) return false;
    try {
      const flareTime = new Date(f.peakTime);
      return !isNaN(flareTime.getTime()) && (now.getTime() - flareTime.getTime()) < 24 * 3600 * 1000;
    } catch {
      return false;
    }
  }).length;
  
  return last24h >= 5 ? "Very High" : last24h >= 3 ? "High" : last24h >= 1 ? "Moderate" : "Low";
}

function determineFlareActivity(flares: any[], now: Date): string {
  if (!flares || !Array.isArray(flares) || flares.length < 2) return "Stable";
  
  // Sort by time if peakTime is available
  const sortedFlares = [...flares].filter((f: any) => f?.peakTime).sort((a: any, b: any) => {
    const timeA = new Date(a.peakTime).getTime();
    const timeB = new Date(b.peakTime).getTime();
    return timeB - timeA;
  });
  
  if (sortedFlares.length < 2) return "Stable";
  
  const recent = sortedFlares.slice(0, Math.min(5, sortedFlares.length));
  const older = sortedFlares.slice(5, Math.min(10, sortedFlares.length));
  
  return recent.length > older.length ? "Increasing" : recent.length < older.length ? "Decreasing" : "Stable";
}

function calculateFlareRisk(flareClass: string, stats: any): number {
  const baseRisk = getFlareStrength(flareClass) * 20;
  const frequencyRisk = stats.last24h * 5;
  return Math.min(100, baseRisk + frequencyRisk);
}

function estimateCMEArrival(latest: any, now: Date) {
  if (!latest || !latest.speed || latest.speed === "Unknown") return null;

  const speed = parseFloat(latest.speed);
  if (isNaN(speed) || speed < 300) return null; // Ignore unrealistically slow CMEs

  const distanceKm = 150_000_000; // Average Sun–Earth distance in km
  const travelTimeSeconds = distanceKm / speed; // time = distance / speed (seconds)
  const arrivalTime = new Date(new Date(latest.startTime).getTime() + travelTimeSeconds * 1000);

  return arrivalTime.toISOString();
}


function calculateVolatility(values: number[]): string {
  if (values.length < 2) return "Low";
  const variance = values.reduce((sum, val, i, arr) => {
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    return sum + Math.pow(val - mean, 2);
  }, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return stdDev > 1.5 ? "High" : stdDev > 0.8 ? "Moderate" : "Low";
}

function estimateStormProbability(current: number, trend: string, forecast: number[]): string {
  const maxForecast = Math.max(...forecast);
  if (maxForecast >= 7 || (current >= 6 && trend === "rising")) return "High (70-90%)";
  if (maxForecast >= 5 || current >= 5) return "Moderate (30-60%)";
  return "Low (<30%)";
}

function calculateDynamicPressure(density: number, speed: number): number {
  // Dynamic Pressure: P = ρ × v² × 1.6726 × 10⁻⁶  (Result in nPa)
  return parseFloat((density * Math.pow(speed, 2) * 1.6726e-6).toFixed(2));
}


function assessSolarWindConditions(speed: number): string {
  if (speed > 750) return "Extreme";
  if (speed > 600) return "Very Fast";
  if (speed > 500) return "Fast";
  if (speed > 400) return "Moderate";
  return "Slow";
}

function assessGeoeffectiveness(bz: number, speed: number): string {
  if (bz < -10 && speed > 600) return "Very High";
  if (bz < -5 && speed > 500) return "High";
  if (bz < -3) return "Moderate";
  return "Low";
}

function getStormLevel(kpIndex: number): string {
  if (kpIndex >= 9) return "Extreme (G5)";
  if (kpIndex >= 8) return "Severe (G4)";
  if (kpIndex >= 7) return "Strong (G3)";
  if (kpIndex >= 6) return "Moderate (G2)";
  if (kpIndex >= 5) return "Minor (G1)";
  return "Quiet (G0)";
}

function getProtonLevel(flux: number): string {
  if (flux >= 10000) return "S5 - Extreme";
  if (flux >= 1000) return "S4 - Severe";
  if (flux >= 100) return "S3 - Strong";
  if (flux >= 10) return "S2 - Moderate";
  if (flux >= 1) return "S1 - Minor";
  return "Background";
}

function determineProtonTrend(recentFlux: number[]): string {
  if (recentFlux.length < 3) return "stable";
  const recent = recentFlux.slice(-3);
  const isRising = recent[2] > recent[1] && recent[1] > recent[0];
  const isFalling = recent[2] < recent[1] && recent[1] < recent[0];
  return isRising ? "rising" : isFalling ? "falling" : "stable";
}

function assessRadiationRisk(flux: number): string {
  if (flux >= 1000) return "Extreme - Avoid all high-altitude flights";
  if (flux >= 100) return "High - Biological risk for astronauts";
  if (flux >= 10) return "Moderate - Monitor crew exposure";
  return "Low - Normal background levels";
}

function calculateAuroraLatitude(kpIndex: number): string {
  if (kpIndex >= 9) return "35° - Visible across most of US/Europe";
  if (kpIndex >= 8) return "40° - Visible in northern US states";
  if (kpIndex >= 7) return "45° - Visible in Canada/Northern Europe";
  if (kpIndex >= 6) return "50° - Visible at high mid-latitudes";
  if (kpIndex >= 5) return "55° - Visible at typical aurora zones";
  if (kpIndex >= 3) return "60° - Arctic regions";
  return "65°+ - Polar regions only";
}

function determineAuroraVisibility(kpIndex: number, bz: number): string {
  if (kpIndex >= 7 && bz < -10) return "Excellent";
  if (kpIndex >= 6 || (kpIndex >= 5 && bz < -5)) return "Very Good";
  if (kpIndex >= 5) return "Good";
  if (kpIndex >= 3) return "Moderate";
  return "Low";
}

function predictAuroraColors(speed: number, density: number): string[] {
  const colors = ["Green"]; // Always present
  if (speed > 600 || density > 10) colors.push("Red");
  if (speed > 500) colors.push("Purple", "Blue");
  return colors;
}

function determineSolarCyclePhase(sunspotNumber: number): string {
  if (sunspotNumber > 150) return "Solar Maximum";
  if (sunspotNumber > 100) return "Rising to Maximum";
  if (sunspotNumber > 50) return "Rising Phase";
  if (sunspotNumber > 20) return "Low Activity";
  return "Solar Minimum";
}

function estimateDst(kpIndex: number, bz: number): number {
  // Rough DST estimation based on Kp and Bz
  let dst = -15 * kpIndex;
  if (bz < -5) dst -= 20;
  return Math.max(-250, dst);
}

function estimateRadiationBelt(speed: number, kpIndex: number): string {
  if (speed > 700 && kpIndex >= 6) return "Greatly Enhanced";
  if (speed > 600 || kpIndex >= 5) return "Enhanced";
  return "Normal";
}

function estimateIonosphericDisturbance(flareClass: string, speed: number): string {
  if (flareClass.startsWith("X") || (flareClass.startsWith("M") && speed > 700)) return "Severe";
  if (flareClass.startsWith("M") || speed > 600) return "Moderate";
  if (flareClass.startsWith("C")) return "Minor";
  return "Quiet";
}

function calculateSatelliteRisk(speed: number, kp: number, protonFlux: number): string {
  let riskScore = 0;
  if (speed > 700) riskScore += 3;
  else if (speed > 600) riskScore += 2;
  else if (speed > 500) riskScore += 1;
  
  if (kp >= 7) riskScore += 3;
  else if (kp >= 5) riskScore += 2;
  else if (kp >= 3) riskScore += 1;
  
  if (protonFlux > 1000) riskScore += 3;
  else if (protonFlux > 100) riskScore += 2;
  else if (protonFlux > 10) riskScore += 1;
  
  if (riskScore >= 7) return "Critical";
  if (riskScore >= 5) return "High";
  if (riskScore >= 3) return "Moderate";
  return "Low";
}

function estimateGIC(kpIndex: number, bz: number): string {
  if (kpIndex >= 8 && bz < -15) return "Extreme (>100 A)";
  if (kpIndex >= 7 || bz < -10) return "High (50-100 A)";
  if (kpIndex >= 6) return "Moderate (10-50 A)";
  if (kpIndex >= 5) return "Minor (<10 A)";
  return "Minimal";
}

function assessSpaceWeather(
  flareClass: string, 
  kpIndex: number, 
  windSpeed: number,
  hasProtonEvent: boolean,
  earthDirectedCMEs: number
): { status: string; riskLevel: string; color: string; message: string } {
  
  if (kpIndex >= 8 || flareClass.startsWith("X") || (hasProtonEvent && earthDirectedCMEs > 0)) {
    return {
      status: "Extreme Storm",
      riskLevel: "Critical",
      color: "red",
      message: "Extreme space weather event — severe impacts on satellite operations, power grids, aviation, and widespread communication disruptions expected."
    };
  }
  
  if (kpIndex >= 7 || (flareClass.startsWith("X") && windSpeed > 600) || hasProtonEvent) {
    return {
      status: "Severe Storm",
      riskLevel: "Very High",
      color: "red",
      message: "Major space weather event in progress — significant impacts possible on satellite operations, power grids, and HF radio communications."
    };
  }
  
  if (kpIndex >= 6 || flareClass.startsWith("M") || windSpeed > 700) {
    return {
      status: "Active Storm",
      riskLevel: "High",
      color: "orange",
      message: "Enhanced space weather activity — potential for satellite navigation errors, HF radio degradation, and increased auroral activity."
    };
  }
  
  if (kpIndex >= 5 || flareClass.startsWith("C") || earthDirectedCMEs > 0) {
    return {
      status: "Minor Storm",
      riskLevel: "Moderate",
      color: "yellow",
      message: "Minor space weather effects — possible weak power grid fluctuations and aurora at high latitudes."
    };
  }
  
  return {
    status: "Quiet",
    riskLevel: "Low",
    color: "green",
    message: "Space weather is calm — minimal impacts expected on technological systems."
  };
}

function getRecommendations(riskLevel: string): string[] {
  const recommendations: { [key: string]: string[] } = {
    "Critical": [
      "Implement emergency protocols for all critical systems",
      "Expect widespread satellite anomalies and failures",
      "Power grid operators should prepare for major disturbances",
      "Consider grounding polar aviation routes",
      "HF radio blackouts expected on sunlit side",
      "GPS accuracy significantly degraded"
    ],
    "Very High": [
      "Monitor for satellite operation anomalies",
      "Prepare for potential power grid fluctuations",
      "Expect HF radio blackouts on sunlit side",
      "Consider delaying critical satellite operations",
      "Increase monitoring of radiation-sensitive systems"
    ],
    "High": [
      "Check satellite systems for anomalies",
      "Monitor HF radio propagation conditions",
      "Aurora possible at mid-latitudes",
      "Monitor crew radiation exposure on polar routes"
    ],
    "Moderate": [
      "Normal operations with increased monitoring",
      "Possible aurora at high latitudes",
      "Minor impacts on sensitive equipment"
    ],
    "Low": [
      "Normal operations recommended",
      "Good conditions for satellite operations",
      "Optimal time for critical space activities"
    ]
  };
  
  return recommendations[riskLevel] || ["No specific recommendations"];
}

function assessDataQuality(dataSources: any[]): { score: number; status: string; missing: string[] } {
  const available = dataSources.filter(d => d !== null).length;
  const total = dataSources.length;
  const score = Math.round((available / total) * 100);
  
  const missing = [];
  if (!dataSources[0]) missing.push("Solar Flares");
  if (!dataSources[1]) missing.push("CMEs");
  if (!dataSources[2]) missing.push("Kp Index");
  if (!dataSources[3]) missing.push("Solar Wind");
  if (!dataSources[4]) missing.push("Proton Events");
  if (!dataSources[5]) missing.push("Aurora Forecast");
  if (!dataSources[6]) missing.push("Sunspots");
  if (!dataSources[7]) missing.push("X-Ray Flux");
  if (!dataSources[8]) missing.push("Magnetometer");
  
  return {
    score,
    status: score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Poor",
    missing
  };
}