# ClearStep

ClearStep is a privacy-first document assistant that turns dense letters, notices, and forms into understandable summaries, cited facts, and prioritized checklists. This repository is a complete job-demo MVP with a zero-setup sample flow.

## Features

- Browser-side selectable-text PDF extraction with `pdfjs-dist`
- Browser-side image OCR with Tesseract.js
- Editable extracted text and a 10 MB upload limit
- Structured, Zod-validated summaries, dates, items, fees, contacts, warnings, and cited actions
- Interactive checklist, clipboard export, follow-up questions, responsive and accessible UI
- Optional local Qwen model through Ollama, with automatic deterministic demo fallback
- One recent analysis saved to browser `localStorage`; no database or uploaded-file persistence

## Architecture and privacy

The browser extracts the file text. Only that extracted text is posted to the local Next.js API. The server either calls Ollama at the configured loopback URL or runs deterministic rules. No proprietary AI or third-party document service is used, uploaded files are never sent to the server, and full document text is never logged. Analysis input is capped at 30,000 characters. Recent structured analysis is stored only in the user's browser.

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000` and choose **Try a sample notice**. On PowerShell systems that block `npm.ps1`, use `npm.cmd` in the same commands.

Quality checks:

```bash
npm run lint
npm test
npm run build
npm start
```

## Demo mode

Demo mode is the default (`OLLAMA_ENABLED=false`). The bundled fictional Northbridge notice produces a rich deterministic result. Other documents receive conservative extraction of dates, currency amounts, email addresses, and US phone numbers. Every demo result is visibly labeled.

## Optional Ollama setup

1. Install Ollama from `https://ollama.com`.
2. Run `ollama pull qwen2.5:7b`.
3. Copy `.env.example` to `.env.local` and set `OLLAMA_ENABLED=true`.
4. Optionally change `OLLAMA_BASE_URL` or `OLLAMA_MODEL`, then restart the app.

Responses are validated with Zod and retried once with a repair prompt. If Ollama is unreachable or still returns invalid data, ClearStep automatically uses demo analysis. The model is instructed to treat documents as untrusted content and not invent facts.

## Known MVP limitations

- OCR currently supports English and downloads Tesseract language data when first used.
- PDF extraction handles text-based PDFs; scanned PDFs need a future page-to-image OCR path.
- The deterministic fallback understands the sample deeply but is intentionally conservative on arbitrary documents.
- Local storage is device/browser-specific, and there is no multi-document history UI.
- Follow-up answers in demo mode cover common date, fee, phone, and email questions.

## Production next steps

Add scanned-PDF OCR, more languages, encrypted on-device history controls, document-type-specific evaluation suites, rate limiting, hardened content-security headers, and an opt-in self-hosted model deployment. For a public demo, deploy the Next.js app with demo mode enabled; Ollama is deliberately local-only and should not be exposed publicly.
