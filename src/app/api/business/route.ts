import { NextResponse } from "next/server";
import { generateBusinessProposal, BusinessProposalRequest } from "@/services/businessService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { projectName, projectType, description } = body as BusinessProposalRequest;
    if (!projectName || !projectType || !description) {
      return NextResponse.json(
        { error: "projectName, projectType, and description are required." },
        { status: 400 }
      );
    }

    const result = await generateBusinessProposal(body as BusinessProposalRequest);

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("[/api/business] Unexpected error:", err);
    const status = err.message.includes("OPENAI_API_KEY") ? 500 : 400;
    return NextResponse.json(
      { error: err.message || "Unexpected server error while generating proposal." },
      { status }
    );
  }
}
