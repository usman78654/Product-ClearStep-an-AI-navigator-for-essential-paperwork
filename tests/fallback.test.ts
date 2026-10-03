import { describe, expect, it } from "vitest";
import { extractDates, extractEmails, extractFees, extractPhones, mockAnalyze } from "@/lib/fallback";
import { SAMPLE_TEXT } from "@/lib/sample";

describe("fallback utilities", () => {
  it("extracts dates, fees, email and phone", () => { expect(extractDates(SAMPLE_TEXT)).toContain("October 16, 2026"); expect(extractFees(SAMPLE_TEXT)).toContain("$35.00"); expect(extractEmails(SAMPLE_TEXT)).toContain("support@northbridge.example"); expect(extractPhones(SAMPLE_TEXT)).toContain("(555) 014-7283"); });
  it("creates the complete sample analysis", () => { const result=mockAnalyze(SAMPLE_TEXT); expect(result.documentTitle).toBe("Document Verification Notice"); expect(result.requestedItems).toHaveLength(3); expect(result.checklist.length).toBeGreaterThan(4); });
});
