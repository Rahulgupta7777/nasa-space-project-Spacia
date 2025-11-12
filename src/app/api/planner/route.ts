import { NextResponse } from "next/server";

/**
 * PlannerRequest - Enhanced with eccentricity and improved parameters
 */
type PlannerRequest = {
  siteLat: number;
  siteLon: number;
  altitudeKm: number;
  inclinationDeg: number;
  massKg: number;
  areaM2: number;
  Cd?: number;
  solarFlux81?: number;
  epoch?: string;
  eccentricity?: number; // 0 = circular orbit
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

/* --- Launch site feasibility and azimuth analysis --- */
function analyzeLaunchSite(inclinationDeg: number, siteLat: number, siteLon: number) {
  const knownSites = [
    { name: "Vandenberg SFB", lat: 34.732, lon: -120.572, azimuthRange: [180, 260] },
    { name: "Cape Canaveral SFS", lat: 28.572, lon: -80.649, azimuthRange: [35, 120] },
    { name: "Kourou (Guiana)", lat: 5.236, lon: -52.768, azimuthRange: [5, 100] },
    { name: "Wallops Flight Facility", lat: 37.94, lon: -75.466, azimuthRange: [38, 60] },
    { name: "Satish Dhawan Centre", lat: 13.719, lon: 80.23, azimuthRange: [30, 140] },
    { name: "Baikonur Cosmodrome", lat: 45.965, lon: 63.305, azimuthRange: [45, 120] },
    { name: "Jiuquan Satellite LC", lat: 40.958, lon: 100.291, azimuthRange: [90, 180] },
    { name: "Tanegashima Space Center", lat: 30.391, lon: 130.975, azimuthRange: [90, 180] },
    { name: "Rocket Lab (Mahia)", lat: -39.262, lon: 177.864, azimuthRange: [30, 150] },
  ];

  let userSite = null;
  for (const site of knownSites) {
    const latDiff = Math.abs(site.lat - siteLat);
    const lonDiff = Math.abs(site.lon - siteLon);
    if (latDiff < 0.5 && lonDiff < 0.5) {
      userSite = site;
      break;
    }
  }

  const userLatAbs = Math.abs(siteLat);
  const minInclinationFromSite = userLatAbs;
  const userSiteFeasible = inclinationDeg >= minInclinationFromSite - 0.1;

  const alternatives = knownSites.map((s) => {
    const minIncl = Math.abs(s.lat);
    const feasible = inclinationDeg >= minIncl - 0.1;
    const inclDiff = Math.abs(inclinationDeg - minIncl);
    return { ...s, minIncl, feasible, inclDiff };
  });

  alternatives.sort((a, b) => {
    if (a.feasible !== b.feasible) return a.feasible ? -1 : 1;
    return a.inclDiff - b.inclDiff;
  });

  const bestAlternative = alternatives[0];

  return {
    userSite: userSite ? userSite.name : `Custom Site (${siteLat.toFixed(3)}°, ${siteLon.toFixed(3)}°)`,
    userSiteLat: siteLat,
    userSiteLon: siteLon,
    minInclinationRequired: minInclinationFromSite,
    requestedInclination: inclinationDeg,
    feasible: userSiteFeasible,
    azimuthRange: userSite?.azimuthRange || [30, 150],
    bestAlternative: {
      name: bestAlternative.name,
      lat: bestAlternative.lat,
      lon: bestAlternative.lon,
      minIncl: bestAlternative.minIncl,
      feasible: bestAlternative.feasible,
      azimuthRange: bestAlternative.azimuthRange,
    },
  };
}

/* --- Debris environment and congestion model --- */
function debrisRiskImproved(altitudeKm: number, inclinationDeg: number) {
  let altScore = 0;
  if (altitudeKm < 300) altScore = 2;
  else if (altitudeKm < 450) altScore = 4;
  else if (altitudeKm < 600) altScore = 6;
  else if (altitudeKm < 900) altScore = 9;
  else if (altitudeKm < 1200) altScore = 7;
  else altScore = 5;

  let incScore = 0;
  const d98 = Math.abs(inclinationDeg - 98);
  const d52 = Math.abs(inclinationDeg - 51.6);
  const d82 = Math.abs(inclinationDeg - 82);

  if (d98 < 3) incScore = 4;
  else if (d52 < 5) incScore = 3;
  else if (d82 < 5) incScore = 3;
  else if (inclinationDeg > 80) incScore = 2;
  else incScore = 1;

  const catalogDensityProxy = clamp((altScore * 12 + incScore * 25) / 4, 1, 100);
  const baseConjunctionRate = (catalogDensityProxy / 100) * 15;
  const altitudeFactor = altitudeKm < 600 ? 1.5 : altitudeKm < 900 ? 2.5 : 1.2;
  const nominalConjunctionsPerYear = baseConjunctionRate * altitudeFactor;

  const score = clamp(Math.round((altScore + incScore) / 1.3), 1, 10);
  const level = score <= 3 ? "low" : score <= 6 ? "moderate" : "high";

  const notes: string[] = [];
  if (level === "high") notes.push("High catalog object density in this altitude and inclination range. Frequent conjunction screening required.");
  if (d98 < 3) notes.push("Orbit near Sun-synchronous band (~98°) which contains many Earth observation satellites and debris fragments.");
  if (d52 < 5) notes.push("Orbit near ISS inclination (~51.6°) with Starlink and legacy debris presence.");
  if (altitudeKm >= 600 && altitudeKm <= 900) notes.push("This altitude range (700–900 km) is highly populated due to debris from past collisions and ASAT tests.");
  if (altitudeKm < 400) notes.push("Low altitudes experience stronger drag and shorter lifetimes, reducing long-term debris risk.");
  if (nominalConjunctionsPerYear > 20) notes.push("Expected over 20 close approaches per year. Active collision avoidance capability recommended.");

  return {
    score,
    level: level as "low" | "moderate" | "high",
    catalogDensityProxy: Number(catalogDensityProxy.toFixed(2)),
    estimatedConjunctionsPerYear: Number(nominalConjunctionsPerYear.toFixed(1)),
    notes,
  };
}

/* --- Orbital lifetime estimation with eccentricity and atmospheric model --- */
function estimateLifetimeImproved(
  altitudeKm: number,
  massKg: number,
  areaM2: number,
  Cd = 2.2,
  solarFlux81 = 120,
  eccentricity = 0
) {
  const B = massKg / (Cd * areaM2);
  const RE = 6371;
  const semiMajorAxis = RE + altitudeKm;
  const perigeeAlt = semiMajorAxis * (1 - eccentricity) - RE;
  const effectiveAlt = eccentricity > 0.01 ? perigeeAlt : altitudeKm;

  const H =
    effectiveAlt < 200 ? 40 :
    effectiveAlt < 400 ? 55 :
    effectiveAlt < 700 ? 65 : 70;

  const K_base = 0.0012;

  const solarNominal = 120;
  const densityRatio = Math.pow(solarFlux81 / solarNominal, 0.4);

  const lifetimeBase = K_base * B * Math.exp((effectiveAlt - 200) / H);
  const median = Math.max(0.01, lifetimeBase * densityRatio);
  const solarMinLifetime = Math.max(0.01, lifetimeBase * 1.3);
  const solarMaxLifetime = Math.max(0.01, lifetimeBase * 0.7);

  const complies25yrRule = solarMinLifetime <= 25;

  const eccentricityWarning =
    eccentricity > 0.05
      ? `High eccentricity (${eccentricity.toFixed(3)}) increases lifetime uncertainty. Drag effects are dominated by perigee altitude.`
      : null;

  return {
    B: Number(B.toFixed(4)),
    effectiveAltitude: Number(effectiveAlt.toFixed(1)),
    scaleHeight: H,
    median: Number(median.toFixed(3)),
    solarMin: Number(solarMinLifetime.toFixed(3)),
    solarMax: Number(solarMaxLifetime.toFixed(3)),
    complies25yrRule,
    eccentricityWarning,
  };
}

/* --- Main API Handler --- */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlannerRequest;
    const {
      siteLat,
      siteLon,
      altitudeKm,
      inclinationDeg,
      massKg,
      areaM2,
      Cd = 2.2,
      solarFlux81 = 120,
      eccentricity = 0,
    } = body;

    if ([siteLat, siteLon, altitudeKm, inclinationDeg, massKg, areaM2].some(
      (v) => typeof v !== "number" || Number.isNaN(v)
    )) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (eccentricity < 0 || eccentricity >= 1) {
      return NextResponse.json(
        { error: "Eccentricity must be between 0 and less than 1" },
        { status: 400 }
      );
    }

    const site = analyzeLaunchSite(inclinationDeg, siteLat, siteLon);
    const risk = debrisRiskImproved(altitudeKm, inclinationDeg);
    const lifetime = estimateLifetimeImproved(
      altitudeKm,
      massKg,
      areaM2,
      Cd,
      solarFlux81,
      eccentricity
    );

    let siteAlert: string;
    if (!site.feasible) {
      const deltaV = 2 * 7.8 * Math.sin((site.minInclinationRequired - inclinationDeg) * Math.PI / 360);
      siteAlert = `Launch site at ${site.userSiteLat.toFixed(2)}° latitude cannot directly achieve ${inclinationDeg}° inclination.
Minimum possible inclination: ${site.minInclinationRequired.toFixed(1)}°
Plane change delta-V required: approximately ${Math.abs(deltaV * 1000).toFixed(0)} m/s.
Recommended alternative: ${site.bestAlternative.name} (${site.bestAlternative.lat.toFixed(2)}°, ${site.bestAlternative.lon.toFixed(2)}°), minimum inclination ${site.bestAlternative.minIncl.toFixed(1)}°.`;
    } else {
      const inclinationMargin = inclinationDeg - site.minInclinationRequired;
      siteAlert = `Launch site at ${site.userSiteLat.toFixed(2)}° latitude can achieve ${inclinationDeg}° inclination.
Margin: ${inclinationMargin.toFixed(1)}° above minimum.
Direct ascent is possible with azimuth range ${site.azimuthRange[0]}°–${site.azimuthRange[1]}°.`;
    }

    const recommendations: string[] = [];

    if (risk.level === "high")
      recommendations.push(
        "High collision risk region. Consider changing altitude or inclination, or include active collision avoidance systems."
      );
    else if (risk.level === "moderate")
      recommendations.push(
        "Moderate debris environment. Regular conjunction monitoring and maneuver capability are advised."
      );

    if (!lifetime.complies25yrRule)
      recommendations.push(
        `Does not meet the 25-year post-mission disposal guideline (worst-case lifetime: ${lifetime.solarMin} years). Consider lowering altitude or using a deorbit device.`
      );
    else
      recommendations.push("Complies with the 25-year deorbit guideline under worst-case conditions.");

    if (!site.feasible)
      recommendations.push(
        `The launch site (${site.userSite}) cannot achieve ${inclinationDeg}° inclination directly. Plane change maneuvers are costly. Consider using ${site.bestAlternative.name} or adjusting mission inclination to ${site.minInclinationRequired.toFixed(1)}° or higher.`
      );

    if (eccentricity > 0.1)
      recommendations.push(
        `High eccentricity (e=${eccentricity.toFixed(3)}). Lifetime prediction uncertainty increases significantly.`
      );

    if (risk.estimatedConjunctionsPerYear > 20)
      recommendations.push(
        `Expected more than ${risk.estimatedConjunctionsPerYear} close approaches per year. Plan for collision avoidance maneuvers and sufficient propellant reserves.`
      );
    else if (risk.estimatedConjunctionsPerYear > 5)
      recommendations.push(
        `Expected approximately ${risk.estimatedConjunctionsPerYear.toFixed(0)} close approaches per year. Regularly monitor conjunction data messages (CDMs).`
      );

    recommendations.push(
      "Perform detailed analysis using numerical propagation tools such as STK or GMAT and atmospheric models like NRLMSISE-00 or JB2008."
    );
    recommendations.push(
      "Integrate catalog-based screening from Space-Track or CelesTrak for accurate conjunction assessment."
    );

    return NextResponse.json({
      launchSiteAnalysis: site,
      debrisRisk: risk,
      lifetimeYears: lifetime,
      siteAlert,
      inputs: { Cd, solarFlux81, eccentricity },
      recommendations,
      modelAccuracy: {
        level: "preliminary",
        description: "This model provides semi-analytical estimates for feasibility and mission planning.",
        limitations: [
          "Atmospheric density uses a simplified exponential model. For accurate results, use NRLMSISE-00 or JB2008.",
          "Collision risk estimates are statistical approximations based on catalog density.",
          "Lifetime accuracy typically ranges within ±30–50% for LEO due to solar and eccentricity variations.",
          "Launch constraints are simplified and should be verified with the launch provider."
        ],
        citations: [
          "ESA Space Debris Office Annual Reports",
          "King-Hele analytical lifetime models, NASA DAS",
          "Vallado, Fundamentals of Astrodynamics and Applications",
          "NASA-STD-8719.14 (Orbital Debris Mitigation Standard Practices)"
        ]
      },
      notes: "This planner includes eccentricity effects, altitude-dependent scale height, solar activity influence, and catalog-based conjunction estimation. For mission approval, full numerical simulation and catalog-based risk analysis are required."
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Planner error", detail: String(err) },
      { status: 500 }
    );
  }
}
