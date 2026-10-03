import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeWithOllama } from "@/lib/ollama";
describe("Ollama resilience", () => { afterEach(()=>vi.unstubAllGlobals()); it("handles an unavailable server without exposing content", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline"))); await expect(analyzeWithOllama("private document contents")).rejects.toThrow("offline"); }); });
