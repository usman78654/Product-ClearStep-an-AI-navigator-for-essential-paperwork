"use client";
import { useEffect, useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { UploadPanel } from "@/components/UploadPanel";
import { Results } from "@/components/Results";
import { extractDocument } from "@/lib/extract";
import { validateFile } from "@/lib/files";
import { SAMPLE_TEXT } from "@/lib/sample";
import type { Analysis } from "@/lib/schema";

type State = "welcome"|"review"|"processing"|"results";
export default function Home() {
  const [state,setState]=useState<State>("welcome"),[text,setText]=useState(""),[fileName,setFileName]=useState(""),[error,setError]=useState(""),[stage,setStage]=useState(""),[result,setResult]=useState<{analysis:Analysis;mode:string;truncated:boolean}|null>(null);
  useEffect(() => { try { const saved=localStorage.getItem("clearstep-recent"); if(saved) JSON.parse(saved); } catch { localStorage.removeItem("clearstep-recent"); } },[]);
  async function file(file:File){setError("");const issue=validateFile(file);if(issue){setError(issue);return}setState("processing");setStage("Reading document");try{const value=await extractDocument(file,setStage);if(!value.trim())throw new Error("No readable text was found. Try a clearer image or a text-based PDF.");setText(value);setFileName(file.name);setState("review")}catch(e){setError(e instanceof Error?e.message:"The document could not be read.");setState("welcome")}}
  function sample(){setText(SAMPLE_TEXT);setFileName("Northbridge sample notice.txt");setState("review");setError("")}
  async function analyze(){if(!text.trim()){setError("Add some document text before analyzing.");return}setState("processing");setStage("Identifying important information");try{const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});const data=await r.json();if(!r.ok)throw new Error(data.error);setStage("Building your action plan");setResult(data);localStorage.setItem("clearstep-recent",JSON.stringify({title:data.analysis.documentTitle,at:Date.now(),analysis:data.analysis}));setState("results")}catch(e){setError(e instanceof Error?e.message:"Analysis failed.");setState("review")}}
  function reset(){setState("welcome");setText("");setResult(null);setError("")}
  return <><header><a className="brand" href="#" onClick={(e)=>{e.preventDefault();reset()}}><span>CS</span>ClearStep</a><div className="private-pill"><LockKeyhole/>Your documents stay private</div></header>
    {error&&<div className="error" role="alert">{error}</div>}
    {state==="welcome"&&<UploadPanel onFile={file} onSample={sample}/>} 
    {state==="review"&&<main className="review"><p className="kicker">Check the extraction</p><h1>Does this text look right?</h1><p>Edit anything the document reader missed before creating your plan.</p><div className="editor-head"><strong>{fileName}</strong><span>{text.length.toLocaleString()} characters</span></div><textarea value={text} onChange={(e)=>setText(e.target.value)} aria-label="Extracted document text"/><div className="review-actions"><button className="ghost" onClick={reset}>Cancel</button><button className="primary" onClick={analyze}>Create my action plan →</button></div></main>}
    {state==="processing"&&<main className="processing"><div className="loader"><LoaderCircle/></div><p className="kicker">Working privately</p><h1>{stage}</h1><p>This usually takes less than a minute. Your original file is not uploaded or stored.</p><div className="progress"><i/></div></main>}
    {state==="results"&&result&&<Results {...result} text={text} onReset={reset}/>}<footer><span>ClearStep</span><p>Private document guidance · Not legal, medical, financial, or official advice</p></footer></>;
}
