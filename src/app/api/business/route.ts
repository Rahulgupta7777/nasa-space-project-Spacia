import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

type BodyShape = {
  projectName?: string;
  projectType?: string;
  description?: string;
  budget?: string;
  timeline?: string;
  partners?: string[];
  model?: string;
};

export async function POST(req: Request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use the business proposal generator." },
        { status: 401 }
      );
    }

    const body: BodyShape = (await req.json()) || {};
    const {
      projectName = "",
      projectType = "",
      description = "",
      budget = "",
      timeline = "",
      partners = [],
      model: modelOverride,
    } = body;

    // Build context
    const leoContext = `Low Earth Orbit (LEO) commercialization context:
- LEO altitude range: 160-2,000 km
- Key segments: Communications, Earth Observation, Navigation/PNT, Space Tourism, Manufacturing, Debris Removal
- Critical considerations: Orbital debris, collision avoidance, atmospheric drag, radiation environment
- Regulatory: FCC/ITU frequency coordination, orbital slot allocation, space traffic management
- Sustainability: 25-year deorbit rule, active debris removal, end-of-life planning`;

    const partnerEcosystem = `Partner ecosystem categories:
- PNT/Navigation: Xona, Aerodome/VyomIC, private GNSS augmentation
- Earth Observation: Planet, Pixxel, Satellogic, Umbra (SAR/optical/hyperspectral)
- Ground Stations: KSAT, AWS Ground Station, Azure Space, commercial networks
- Communications: Mynaric (optical), Viasat, Iridium, satellite internet providers
- Launch Services: SpaceX Transporter, Rocket Lab, Relativity Space, rideshare programs
- Analytics/Platforms: SkyServe, Orbital Insight, AI/ML analytics providers
- Manufacturing: In-space manufacturing, component suppliers
- Insurance: Space insurance providers, risk assessment
- Regulatory: Legal counsel, licensing support
Selected Partners: ${partners.join(", ") || "None specified"}`;

    const prompt = `You are an expert space commercialization consultant specializing in Low Earth Orbit (LEO) business ventures.
Generate a comprehensive business proposal for the following LEO commercial project:
PROJECT DETAILS:
- Project Name: ${projectName}
- Project Type: ${projectType}
- Mission Description: ${description}
- Budget: ${budget}
- Timeline: ${timeline}
CONTEXT:
${leoContext}
${partnerEcosystem}
REQUIRED OUTPUT STRUCTURE:
1. EXECUTIVE SUMMARY
   - Brief overview of the project value proposition
   - Target market and customers
   - Key differentiators
2. MARKET ANALYSIS
   - Market size and growth potential
   - Competitive landscape
   - Customer segments and demand drivers
3. TECHNICAL APPROACH
   - Constellation design (number of satellites, orbit parameters)
   - Payload specifications and capabilities
   - Ground segment architecture
   - Launch strategy and deployment plan
4. PARTNER ECOSYSTEM
   - Recommended partnerships for each category
   - Integration points and dependencies
   - Risk mitigation through partnerships
5. BUSINESS MODEL
   - Revenue streams and pricing strategy
   - Customer acquisition approach
   - Unit economics and margins
6. FINANCIAL PROJECTIONS
   - Capital requirements breakdown
   - Operating costs (launch, operations, ground)
   - Revenue projections (3-5 year outlook)
   - ROI estimate and payback period
7. REGULATORY & COMPLIANCE
   - Licensing requirements (FCC, ITU, national authorities)
   - Frequency coordination
   - Orbital slot allocation
   - Space debris mitigation plan (25-year rule)
8. RISK ANALYSIS
   - Technical risks and mitigation strategies
   - Market risks and competitive threats
   - Regulatory and policy risks
   - Financial risks and contingency planning
9. IMPLEMENTATION TIMELINE
   - Phase 1: Design and development
   - Phase 2: Manufacturing and testing
   - Phase 3: Launch and deployment
   - Phase 4: Operations and scaling
   - Key milestones and go/no-go decision points
10. SUCCESS METRICS
    - Technical KPIs (uptime, performance)
    - Business KPIs (revenue, customer acquisition)
    - Operational KPIs (cost efficiency)
Provide specific, actionable recommendations based on the project type and current LEO market conditions. Include realistic timelines, cost estimates, and partner recommendations. Focus on near-term feasibility (12-36 months) and sustainable business models.`;

    // Ollama settings
    const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const model = (modelOverride && String(modelOverride)) || process.env.OLLAMA_MODEL || "llama3";

    const resp = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "LLM request failed", details: text }, { status: 502 });
    }

    // Robust extraction of model output (handles several possible shapes)
    const data = await resp.json().catch(() => null);
    let result = "";

    if (!data) {
      // fallback to plain text if parsing failed
      try {
        result = await resp.text();
      } catch {
        result = "";
      }
    } else if (typeof data === "string") {
      result = data;
    } else if (typeof data.text === "string") {
      result = data.text;
    } else if (typeof data.response === "string") {
      result = data.response;
    } else if (Array.isArray(data.output) && data.output.length) {
      result = data.output
        .map((o: any) => (typeof o === "string" ? o : o.content ?? o.text ?? JSON.stringify(o)))
        .join("\n\n");
    } else {
      result = JSON.stringify(data);
    }

    return NextResponse.json(
      {
        result,
        projectName,
        projectType,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    const details = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Bad request or LLM error", details }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/business",
    description: "Generate LEO commercialization business proposals using LLM",
  });
}