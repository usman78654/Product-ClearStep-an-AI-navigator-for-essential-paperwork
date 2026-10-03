"use client";
import { useRef, useState } from "react";
import { FileText, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";

export function UploadPanel({ onFile, onSample }: { onFile: (file: File) => void; onSample: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const accept = (files: FileList | null) => files?.[0] && onFile(files[0]);
  return <section className="welcome">
    <div className="hero-copy">
      <div className="eyebrow"><Sparkles size={15}/> From paperwork to a clear next step</div>
      <h1>Understand the letter.<br/><em>Know what to do.</em></h1>
      <p className="lede">ClearStep turns complicated notices and forms into a calm, prioritized action plan—without sending your files to the cloud.</p>
      <div className="trust-row"><span><LockKeyhole/> Private by design</span><span><FileText/> Facts stay cited</span></div>
    </div>
    <div className="upload-card">
      <button className={`dropzone ${dragging ? "dragging" : ""}`} onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files); }}>
        <span className="upload-icon"><UploadCloud/></span><strong>Drop your document here</strong><span>or click to choose a file</span><small>PDF, PNG, JPG · up to 10 MB</small>
      </button>
      <input ref={input} hidden type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => accept(e.target.files)} aria-label="Choose a document"/>
      <div className="or"><span/>or<span/></div>
      <button className="sample-btn" onClick={onSample}><Sparkles size={17}/> Try a sample notice <span>30 sec →</span></button>
      <p className="micro"><LockKeyhole size={13}/> Files are read in your browser and never permanently stored.</p>
    </div>
  </section>;
}
