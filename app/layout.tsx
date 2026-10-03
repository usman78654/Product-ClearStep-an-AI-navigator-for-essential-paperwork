import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "ClearStep — Understand what comes next", description: "A private document-to-action assistant." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
