import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://celestrak.org/NORAD/elements/gp.php?group=active&format=tle", { next: { revalidate: 300 } });
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    const tle: { name: string; line1: string; line2: string }[] = [];
    for (let i = 0; i < lines.length; i += 3) {
      const name = (lines[i] || "").trim();
      const line1 = (lines[i + 1] || "").trim();
      const line2 = (lines[i + 2] || "").trim();
      if (name && line1.startsWith("1 ") && line2.startsWith("2 ")) tle.push({ name, line1, line2 });
    }
    // Limit to keep compute small for hackathon
    const N = 20;
    const subset = tle.slice(0, N);
    const satellite = await import('satellite.js');
    const now = new Date();
    const gmst = satellite.gstime(now);
    const recs = subset.map((s) => ({ name: s.name, rec: satellite.twoline2satrec(s.line1, s.line2) }));
    type Vec3 = { x: number; y: number; z: number };
    const ecf = recs
      .map((r) => {
        const pv = satellite.propagate(r.rec, now);
        if (!pv || !pv.position) return { name: r.name, ecf: null } as { name: string; ecf: Vec3 | null };
        const e = satellite.eciToEcf(pv.position, gmst) as Vec3;
        return { name: r.name, ecf: e } as { name: string; ecf: Vec3 };
      })
      .filter((e) => e.ecf);

    const alerts: { a: string; b: string; distance_km: number }[] = [];
    for (let i = 0; i < ecf.length; i++) {
      for (let j = i + 1; j < ecf.length; j++) {
        const A = ecf[i].ecf as Vec3; const B = ecf[j].ecf as Vec3;
        const dx = A.x - B.x, dy = A.y - B.y, dz = A.z - B.z;
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < 10) {
          alerts.push({ a: ecf[i].name, b: ecf[j].name, distance_km: Number(d.toFixed(3)) });
        }
      }
    }
    return NextResponse.json({ count: alerts.length, alerts });
  }catch (e) {
  console.error("TLE route error:", e);
  return NextResponse.json({ error: "Failed to compute alerts" }, { status: 500 });
}

}