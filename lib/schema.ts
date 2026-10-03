import { z } from "zod";

const cited = { sourceExcerpt: z.string().min(1) };
export const analysisSchema = z.object({
  documentTitle: z.string().min(1),
  documentType: z.string().min(1),
  plainLanguageSummary: z.string().min(1),
  urgency: z.enum(["low", "medium", "high"]),
  importantDates: z.array(z.object({ label: z.string(), date: z.string(), explanation: z.string(), ...cited })),
  requestedItems: z.array(z.object({ item: z.string(), required: z.boolean(), ...cited })),
  fees: z.array(z.object({ amount: z.string(), reason: z.string(), ...cited })),
  contacts: z.array(z.object({ name: z.string(), method: z.string(), value: z.string() })),
  checklist: z.array(z.object({ id: z.string(), action: z.string(), priority: z.enum(["now", "soon", "later"]), reason: z.string(), ...cited })),
  warnings: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type Analysis = z.infer<typeof analysisSchema>;

export const followUpSchema = z.object({
  answer: z.string().min(1),
  excerpts: z.array(z.string()),
});
