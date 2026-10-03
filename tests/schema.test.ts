import { describe, expect, it } from "vitest";
import { analysisSchema } from "@/lib/schema";
import { mockAnalyze } from "@/lib/fallback";
import { SAMPLE_TEXT } from "@/lib/sample";

describe("analysis schema", () => {
  it("accepts a valid analysis", () => expect(analysisSchema.safeParse(mockAnalyze(SAMPLE_TEXT)).success).toBe(true));
  it("rejects invalid urgency and confidence", () => expect(analysisSchema.safeParse({ ...mockAnalyze(SAMPLE_TEXT), urgency: "critical", confidence: 3 }).success).toBe(false));
});
