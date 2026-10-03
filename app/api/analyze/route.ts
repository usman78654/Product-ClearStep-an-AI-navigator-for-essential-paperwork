import { NextResponse } from "next/server";
import { mockAnalyze } from "@/lib/fallback";
import { analyzeWithOllama } from "@/lib/ollama";

export const runtime = "nodejs";
const MAX_CHARS = 30_000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { text?: unknown; forceDemo?: boolean };
    if (typeof body.text !== "string" || !body.text.trim()) return NextResponse.json({ error: "No readable text was provided." }, { status: 400 });
    const truncated = body.text.length > MAX_CHARS;
    const text = body.text.slice(0, MAX_CHARS);
    const enabled = process.env.OLLAMA_ENABLED === "true" && !body.forceDemo;
    if (enabled) {
      try { return NextResponse.json({ analysis: await analyzeWithOllama(text), mode: "local-ai", truncated }); }
      catch { /* The local-only fallback is intentional when Ollama is unavailable or invalid. */ }
    }
    return NextResponse.json({ analysis: mockAnalyze(text), mode: "demo", truncated, fallback: enabled });
  } catch { return NextResponse.json({ error: "The document could not be analyzed safely." }, { status: 500 }); }
}
