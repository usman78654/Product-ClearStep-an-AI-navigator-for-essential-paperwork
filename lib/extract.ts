export async function extractDocument(file: File, onProgress: (message: string) => void): Promise<string> {
  if (file.type === "application/pdf") {
    onProgress("Reading PDF pages");
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress(`Reading page ${i} of ${pdf.numPages}`);
      const content = await (await pdf.getPage(i)).getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }
    return pages.join("\n\n").trim();
  }
  onProgress("Running private, in-browser OCR");
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try { return (await worker.recognize(file)).data.text.trim(); }
  finally { await worker.terminate(); }
}
