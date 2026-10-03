import type { Analysis } from "./schema";

export const extractDates = (text: string) => text.match(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b/gi) ?? [];
export const extractFees = (text: string) => text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) ?? [];
export const extractEmails = (text: string) => text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? [];
export const extractPhones = (text: string) => text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g) ?? [];

const excerpt = (text: string, needle: string) => {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return needle;
  const start = Math.max(0, text.lastIndexOf("\n", index - 100) + 1);
  const endLine = text.indexOf("\n", index + needle.length);
  return text.slice(start, endLine < 0 ? Math.min(text.length, index + needle.length + 140) : endLine).trim();
};

export function mockAnalyze(text: string): Analysis {
  const dates = extractDates(text);
  const fees = extractFees(text);
  const emails = extractEmails(text);
  const phones = extractPhones(text);
  const isSample = /NB-2048-771|Northbridge Home Energy/i.test(text);
  if (isSample) {
    const deadline = "October 16, 2026";
    const items = ["Government-issued photo ID", "Two most recent pay stubs", "Current utility bill showing service address"];
    return {
      documentTitle: "Document Verification Notice",
      documentType: "Application document request",
      plainLanguageSummary: "Northbridge Community Services needs three documents and a $35 processing fee to continue reviewing the energy-support application. Everything must arrive by October 16, 2026.",
      urgency: "high",
      importantDates: [{ label: "Response deadline", date: deadline, explanation: "Documents and payment must be received by this date.", sourceExcerpt: excerpt(text, deadline) }],
      requestedItems: items.map((item, i) => ({ item, required: true, sourceExcerpt: excerpt(text, ["government-issued photo ID", "two most recent pay stubs", "current utility bill"][i]) })),
      fees: [{ amount: "$35.00", reason: "Non-refundable processing fee", sourceExcerpt: excerpt(text, "$35.00") }],
      contacts: [{ name: "Application Review Team", method: "Phone", value: "(555) 014-7283" }, { name: "Application Review Team", method: "Email", value: "support@northbridge.example" }],
      checklist: [
        { id: "confirm", action: "Confirm the October 16 deadline and reference number NB-2048-771", priority: "now", reason: "The application may be closed if the deadline is missed.", sourceExcerpt: excerpt(text, "If we do not receive") },
        ...items.map((item, i) => ({ id: `item-${i}`, action: `Gather: ${item}`, priority: "soon" as const, reason: "It is listed as required for review.", sourceExcerpt: excerpt(text, ["government-issued photo ID", "two most recent pay stubs", "current utility bill"][i]) })),
        { id: "pay", action: "Submit the $35 fee with the requested documents", priority: "soon", reason: "The notice requires the fee to continue the application.", sourceExcerpt: excerpt(text, "$35.00") },
        { id: "verify", action: "Keep copies and confirm receipt with Northbridge", priority: "later", reason: "A receipt provides a record of timely submission.", sourceExcerpt: excerpt(text, "may be submitted") },
      ],
      warnings: ["The application may be closed if the documents and fee are not received by the deadline.", "The notice calls the processing fee non-refundable."],
      confidence: 0.98,
    };
  }
  const firstLine = text.split(/\r?\n/).find((line) => line.trim())?.trim().slice(0, 100) || "Uploaded document";
  return {
    documentTitle: firstLine,
    documentType: "General document",
    plainLanguageSummary: "This demo analysis found basic dates, payment amounts, and contact details. Review the extracted text carefully because local AI is not enabled.",
    urgency: dates.length ? "medium" : "low",
    importantDates: dates.map((date, i) => ({ label: i ? "Mentioned date" : "Important date", date, explanation: "This date appears in the document; verify its purpose in context.", sourceExcerpt: excerpt(text, date) })),
    requestedItems: [],
    fees: fees.map((amount) => ({ amount, reason: "Payment mentioned; verify what it covers.", sourceExcerpt: excerpt(text, amount) })),
    contacts: [...emails.map((value) => ({ name: "Document contact", method: "Email", value })), ...phones.map((value) => ({ name: "Document contact", method: "Phone", value }))],
    checklist: [{ id: "review", action: "Review the extracted text and confirm important details", priority: "now", reason: "Demo analysis may miss context.", sourceExcerpt: text.slice(0, 180) }],
    warnings: ["Generic demo analysis cannot reliably infer every requested action."], confidence: 0.62,
  };
}
