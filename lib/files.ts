export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export function validateFile(file: Pick<File, "type" | "size">): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Please choose a PDF, PNG, JPG, or JPEG file.";
  if (file.size > MAX_FILE_SIZE) return "That file is over the 10 MB limit.";
  return null;
}
