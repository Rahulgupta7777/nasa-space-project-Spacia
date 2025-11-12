import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const layer = searchParams.get("layer");
    const time = searchParams.get("time") ?? new Date().toISOString().slice(0, 10);
    const wms = searchParams.get("wms");
    const tileMatrixSet = searchParams.get("tileMatrixSet") ?? "2km";
    const tileMatrix = searchParams.get("tileMatrix") ?? "0";
    const tileRow = searchParams.get("tileRow") ?? "0";
    const tileCol = searchParams.get("tileCol") ?? "0";

    if (!layer)
      return NextResponse.json({ error: "Missing layer" }, { status: 400 });

    let gibsUrl: string;

    if (wms) {
      const width = parseInt(searchParams.get("width") || "1024", 10);
      const height = parseInt(searchParams.get("height") || "512", 10);
      const bbox = searchParams.get("bbox") || "-180,-90,180,90";

      // ✅ Added required 'SRS=EPSG:4326' to make WMS work correctly
      gibsUrl = `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG:4326&LAYERS=${encodeURIComponent(
        layer
      )}&STYLES=&FORMAT=image/jpeg&BBOX=${encodeURIComponent(
        bbox
      )}&WIDTH=${width}&HEIGHT=${height}&TIME=${encodeURIComponent(time)}`;
    } else {
      gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${encodeURIComponent(
        layer
      )}&STYLE=default&FORMAT=image/jpeg&TILEMATRIXSET=${encodeURIComponent(
        tileMatrixSet
      )}&TILEMATRIX=${encodeURIComponent(tileMatrix)}&TILEROW=${encodeURIComponent(
        tileRow
      )}&TILECOL=${encodeURIComponent(tileCol)}&TIME=${encodeURIComponent(time)}`;
    }

    const res = await fetch(gibsUrl, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: `GIBS upstream error: ${res.status}` },
        { status: 502 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Proxy Error:", e);
    return NextResponse.json(
      { error: "Failed to proxy GIBS tile" },
      { status: 500 }
    );
  }
}
