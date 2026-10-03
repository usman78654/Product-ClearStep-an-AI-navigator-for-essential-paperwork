# ClearStep Mermaid Diagrams

These diagrams document the MVP architecture, user journey, processing behavior, privacy boundaries, and deployment model. GitHub renders Mermaid blocks directly.

## 1. System architecture

```mermaid
flowchart LR
    U[User] --> UI[Next.js App Router UI]

    subgraph Browser[Browser — trusted processing boundary]
        UI --> FV[File validation]
        FV -->|PDF| PDF[pdfjs-dist text extraction]
        FV -->|PNG or JPG| OCR[Tesseract.js OCR]
        PDF --> EDIT[Editable extracted text]
        OCR --> EDIT
        UI <--> LS[(localStorage<br/>recent analysis)]
    end

    EDIT -->|Extracted text only| API[Next.js analysis route]

    subgraph Server[Next.js server]
        API --> LIMIT[Input length limit]
        LIMIT --> MODE{Ollama enabled?}
        MODE -->|No| MOCK[Deterministic demo analyzer]
        MODE -->|Yes| OLLAMA[Local Ollama<br/>Qwen instruct model]
        OLLAMA --> VALIDATE[Zod validation]
        VALIDATE -->|Invalid| REPAIR[One repair attempt]
        REPAIR --> VALIDATE
        VALIDATE -->|Valid| RESULT[Structured analysis]
        OLLAMA -->|Unavailable| MOCK
        MOCK --> RESULT
    end

    RESULT --> UI
    UI --> VIEW[Summary, cited facts,<br/>checklist and follow-up]
```

## 2. Document processing flow

```mermaid
flowchart TD
    START([Start]) --> CHOOSE{Choose input}
    CHOOSE -->|Try sample| SAMPLE[Load fictional sample notice]
    CHOOSE -->|Upload file| CHECK{Supported type<br/>and under 10 MB?}
    CHECK -->|No| FILE_ERROR[Show safe validation error]
    FILE_ERROR --> CHOOSE
    CHECK -->|Yes, PDF| READ_PDF[Extract selectable PDF text]
    CHECK -->|Yes, image| READ_IMAGE[Run browser OCR]
    READ_PDF --> HAS_TEXT{Readable text found?}
    READ_IMAGE --> HAS_TEXT
    HAS_TEXT -->|No| TEXT_ERROR[Ask for a clearer image<br/>or text-based PDF]
    TEXT_ERROR --> CHOOSE
    HAS_TEXT -->|Yes| REVIEW[Review and edit extracted text]
    SAMPLE --> REVIEW
    REVIEW --> ANALYZE[Send extracted text to local API]
    ANALYZE --> ENGINE{Analysis engine}
    ENGINE -->|Local AI available| AI[Ollama analysis]
    ENGINE -->|Disabled or unavailable| DEMO[Demo analysis]
    AI --> SCHEMA{Valid schema?}
    SCHEMA -->|No| RETRY[Repair prompt — once]
    RETRY --> SCHEMA
    SCHEMA -->|Still invalid| DEMO
    SCHEMA -->|Yes| RESULTS[Display results]
    DEMO --> RESULTS
    RESULTS --> ACTIONS[Complete checklist,<br/>copy actions or ask questions]
    ACTIONS --> RESET{Start over?}
    RESET -->|Yes| CHOOSE
    RESET -->|No| RESULTS
```

## 3. Analysis request sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser as ClearStep browser
    participant Extractor as PDF.js / Tesseract.js
    participant API as Next.js API
    participant Ollama as Local Ollama
    participant Demo as Demo analyzer

    User->>Browser: Select document
    Browser->>Extractor: Read file locally
    Extractor-->>Browser: Extracted text
    Browser-->>User: Show editable text
    User->>Browser: Confirm analysis
    Browser->>API: POST extracted text
    Note over Browser,API: Original file is never uploaded

    alt Ollama enabled and available
        API->>Ollama: Request JSON-only analysis
        Ollama-->>API: Structured candidate
        API->>API: Validate with Zod
        alt Candidate invalid
            API->>Ollama: One repair request
            Ollama-->>API: Repaired candidate
            API->>API: Validate again
        end
    else Demo mode or Ollama unavailable
        API->>Demo: Run deterministic analysis
        Demo-->>API: Structured result
    end

    API-->>Browser: Analysis, mode and truncation status
    Browser->>Browser: Save recent structured result locally
    Browser-->>User: Show cited action plan
```

## 4. Follow-up question sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Results interface
    participant API as Follow-up API route
    participant Engine as Ollama or demo rules

    User->>UI: Ask a document question
    UI->>API: Question + extracted text + analysis
    API->>API: Validate analysis and limit input
    API->>Engine: Answer only from document context
    Engine-->>API: Answer with short excerpts
    API-->>UI: Grounded answer and evidence

    alt Information is absent
        UI-->>User: Say it is not present in the document
    else Information is present
        UI-->>User: Show answer with supporting excerpts
    end
```

## 5. User-interface state machine

```mermaid
stateDiagram-v2
    [*] --> Welcome
    Welcome --> Processing: Upload supported file
    Welcome --> Review: Try sample notice
    Welcome --> Welcome: Reject unsupported or oversized file

    Processing --> Review: Text extracted
    Processing --> Welcome: Extraction failed
    Review --> Processing: Create action plan
    Review --> Welcome: Cancel
    Processing --> Results: Analysis succeeds
    Processing --> Review: Analysis fails

    Results --> Results: Toggle checklist item
    Results --> Results: Ask follow-up question
    Results --> Results: Copy checklist
    Results --> Welcome: Start over
```

## 6. Privacy and data boundaries

```mermaid
flowchart LR
    subgraph Device[User device]
        FILE[(Original PDF or image)]
        EXTRACT[Browser extraction]
        STORE[(Browser localStorage)]
        LOCAL_AI[Optional local Ollama]
    end

    subgraph App[ClearStep application]
        ROUTES[Next.js API routes]
        RULES[Deterministic demo rules]
    end

    FILE -->|Never leaves browser| EXTRACT
    EXTRACT -->|Extracted text only| ROUTES
    ROUTES --> RULES
    ROUTES -.->|Only when locally configured| LOCAL_AI
    RULES -->|Structured analysis| STORE
    LOCAL_AI -->|Structured analysis| STORE

    THIRD_PARTY[Third-party AI services]
    DATABASE[(Permanent database)]
    FILE_UPLOAD[(Server file storage)]

    EXTRACT -.->|Not used| THIRD_PARTY
    ROUTES -.->|Not used| DATABASE
    FILE -.->|Not used| FILE_UPLOAD

    classDef excluded fill:#f8dddd,stroke:#a33,color:#611;
    class THIRD_PARTY,DATABASE,FILE_UPLOAD excluded;
```

## 7. Structured analysis model

```mermaid
classDiagram
    class Analysis {
        +string documentTitle
        +string documentType
        +string plainLanguageSummary
        +Urgency urgency
        +ImportantDate[] importantDates
        +RequestedItem[] requestedItems
        +Fee[] fees
        +Contact[] contacts
        +ChecklistItem[] checklist
        +string[] warnings
        +number confidence
    }

    class ImportantDate {
        +string label
        +string date
        +string explanation
        +string sourceExcerpt
    }

    class RequestedItem {
        +string item
        +boolean required
        +string sourceExcerpt
    }

    class Fee {
        +string amount
        +string reason
        +string sourceExcerpt
    }

    class Contact {
        +string name
        +string method
        +string value
    }

    class ChecklistItem {
        +string id
        +string action
        +Priority priority
        +string reason
        +string sourceExcerpt
    }

    Analysis "1" *-- "0..*" ImportantDate
    Analysis "1" *-- "0..*" RequestedItem
    Analysis "1" *-- "0..*" Fee
    Analysis "1" *-- "0..*" Contact
    Analysis "1" *-- "1..*" ChecklistItem
```

## 8. Deployment topology

```mermaid
flowchart LR
    DEV[Developer workspace] -->|git push| GH[GitHub repository]
    DEV -->|Vercel CLI deploy| DEPLOY[Vercel deployment]
    GH -.->|Optional automatic deployment| DEPLOY

    subgraph PROD[Vercel production]
        CDN[Static UI and assets]
        FUNCTIONS[Serverless API routes]
        DEMO[Demo analysis engine]
        CDN --> FUNCTIONS
        FUNCTIONS --> DEMO
    end

    DEPLOY --> CDN

    VISITOR[Evaluator] -->|HTTPS| CDN
    FUNCTIONS -.->|OLLAMA_ENABLED=false| NO_OLLAMA[No external AI dependency]
    CDN --> URL[clearstep-tan.vercel.app]
```

## 9. MVP component map

```mermaid
flowchart TD
    PAGE[app/page.tsx] --> UPLOAD[UploadPanel]
    PAGE --> RESULTS[Results]
    PAGE --> EXTRACT[lib/extract.ts]
    PAGE --> FILES[lib/files.ts]
    PAGE --> SAMPLE[lib/sample.ts]

    RESULTS --> FOLLOWUP[/api/follow-up]
    PAGE --> ANALYZE[/api/analyze]

    ANALYZE --> FALLBACK[lib/fallback.ts]
    ANALYZE --> OLLAMA[lib/ollama.ts]
    ANALYZE --> SCHEMA[lib/schema.ts]
    FOLLOWUP --> FALLBACK
    FOLLOWUP --> OLLAMA
    FOLLOWUP --> SCHEMA

    TESTS[Vitest suites] -.-> FILES
    TESTS -.-> FALLBACK
    TESTS -.-> OLLAMA
    TESTS -.-> SCHEMA
```
