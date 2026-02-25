import { NextResponse } from "next/server";
import { getSpaceWeatherData, CACHE_TTL } from "@/services/weatherService";

export async function GET() {
  try {
    const data = await getSpaceWeatherData();
    return NextResponse.json(data, {
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