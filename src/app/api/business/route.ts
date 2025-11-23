import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_API_KEY) {
  console.warn("[/api/business] Missing OPENAI_API_KEY env variable.");
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: OPENAI_API_KEY is not set." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      projectName,
      projectType,
      description,
      budget,
      timeline,
      partners = [],
    } = body as {
      projectName: string;
      projectType: string;
      description: string;
      budget?: string;
      timeline?: string;
      partners?: string[];
    };

    if (!projectName || !projectType || !description) {
      return NextResponse.json(
        { error: "projectName, projectType, and description are required." },
        { status: 400 }
      );
    }

    // Build a structured prompt for OpenAI
    const prompt = `
You are a commercial LEO (Low Earth Orbit) mission strategist and space business analyst.

Generate a clear, investor-ready business proposal for the following mission:

- Project Name: ${projectName}
- Project Type: ${projectType}
- Mission Description: ${description}
- Budget: ${budget || "Not specified"}
- Timeline: ${timeline || "Not specified"}
- Target Partners / Ecosystem Categories: ${
      partners.length ? partners.join(", ") : "Not specified"
    }

The proposal should be structured with headings and bullet points, covering at least:

1. Executive Summary
2. Problem & Opportunity
3. Mission Concept & Architecture (orbit regime, constellation approach, payload concept if relevant)
4. Target Market & Customers
5. Revenue Model & Pricing Considerations
6. Technical Risks & Mitigations (including debris, lifetime, licensing, and regulatory notes)
7. Partner & Ecosystem Fit (how the mentioned categories/partners might fit in)
8. Phased Roadmap (near-term, mid-term, long-term)
9. Sustainability & Compliance (debris, deorbit, safety, etc.)

Use concise, business-ready language suitable for slides or a PDF proposal.
Do NOT include any markdown syntax, just plain text paragraphs and bullet-like lines.
    `.trim();

    // Call OpenAI chat completions API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert in commercial space, LEO constellations, and satellite mission design. You write clear, structured business proposals.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      }),
    });

    if (!openaiRes.ok) {
      const errJson = await openaiRes.json().catch(() => null);
      console.error("[/api/business] OpenAI error:", openaiRes.status, errJson);
      return NextResponse.json(
        {
          error:
            errJson?.error?.message ||
            `OpenAI API request failed with status ${openaiRes.status}`,
        },
        { status: 500 }
      );
    }

    const json = await openaiRes.json();
    const result: string =
      json.choices?.[0]?.message?.content?.trim() ||
      "No proposal text was generated.";

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/business] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error while generating proposal." },
      { status: 500 }
    );
  }
}
