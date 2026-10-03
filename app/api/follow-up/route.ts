import { NextResponse } from "next/server";
import { extractEmails, extractFees, extractPhones } from "@/lib/fallback";
import { askOllama } from "@/lib/ollama";
import { analysisSchema, followUpSchema } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const text = typeof body.text === "string" ? body.text.slice(0, 30_000) : "";
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 500) : "";
    const analysis = analysisSchema.parse(body.analysis);
    if (!text || !question) return NextResponse.json({ error: "A document and question are required." }, { status: 400 });
    if (process.env.OLLAMA_ENABLED === "true") {
      try { return NextResponse.json({ ...followUpSchema.parse(await askOllama(text, analysis, question)), mode: "local-ai" }); } catch { /* answer safely below */ }
    }
    const q = question.toLowerCase();
    let values: string[] = [];
    if (/fee|pay|cost|amount/.test(q)) values = extractFees(text);
    else if (/email|contact/.test(q)) values = [...extractEmails(text), ...extractPhones(text)];
    else if (/phone|call/.test(q)) values = extractPhones(text);
    else if (/deadline|date|when/.test(q)) values = analysis.importantDates.map((d) => d.date);
    const answer = values.length ? `The document mentions: ${values.join(", ")}. Please verify this in the cited text.` : "That answer is not clearly present in the document. Contact the issuing organization if you need confirmation.";
    const excerpts = values.map((value) => analysis.importantDates.find((d) => d.date === value)?.sourceExcerpt || text.split("\n").find((line) => line.includes(value)) || value).slice(0, 3);
    return NextResponse.json({ answer, excerpts, mode: "demo" });
  } catch { return NextResponse.json({ error: "I couldn’t answer that question safely." }, { status: 400 }); }
}
