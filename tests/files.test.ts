import { describe, expect, it } from "vitest";
import { validateFile } from "@/lib/files";
describe("file validation", () => { it("rejects unsupported files", () => expect(validateFile({ type: "text/plain", size: 10 })).toMatch(/PDF/)); it("accepts PDFs", () => expect(validateFile({ type: "application/pdf", size: 10 })).toBeNull()); });
