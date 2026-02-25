import { NextResponse } from "next/server";
import { PlannerRequest, analyzeMissionPlanner } from "@/services/plannerService";

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

    const response = analyzeMissionPlanner(body);
    return NextResponse.json(response);

  } catch (err: any) {
    return NextResponse.json(
      { error: "Planner error", detail: String(err) },
      { status: 500 }
    );
  }
}
