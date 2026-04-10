# ⚡ PDF Intelligence Engine
### Agentic PDF Extraction & Intelligence System

> An AI-powered document analysis engine that accepts any PDF and runs it through a 9-stage intelligent pipeline — classifying the document, extracting structured fields, detecting risks, generating summaries, and enabling natural language conversation with the document.

---
## Team Members

- Akshat Bansal KU2407U251 (Leader)
- Kushal Shah 23BSAI03
- Het Manishkumar Soni 23BSDS10
- Harsh Panchal KU2407U069
- Rohit Maheshwari KU2407U449
- Ashutosh Kumar Shukla KU2507U0479


## 🚀 Live Demo Flow

```
Upload PDF → Pipeline runs (9 stages) → Get rich JSON intelligence → Chat with document
```

---

## ✨ Features

- ⚡ **Auto Document Classification** — Identifies 9 document types with sub-type detection
- 🧠 **Agentic Strategy Selection** — Different extraction schema automatically chosen per document type
- 🛡️ **Risk Flag Detection** — High / Medium / Low risk flags with actionable recommendations
- 📋 **3 Summary Types** — Professional, Simple, and Sweet summaries tailored per doc type
- 💬 **Chat with PDF** — Ask natural language questions about any analyzed document
- 📊 **Document Health Score** — Completeness and quality scoring with visual gauge
- 🔍 **Entity Extraction** — People, organizations, dates, amounts, locations
- ⚠️ **Anomaly Detection** — Flags inconsistencies, unusual patterns, and missing fields
- 🔐 **3-Layer PDF Validation** — Extension + MIME type + magic bytes check
- 💰 **Zero Cost** — Runs entirely on the free Groq API (no credit card needed)

---

## 🧠 Supported Document Types

| Type | Sub-types | Key Fields Extracted |
|---|---|---|
| Invoice | Tax invoice, receipt, bill | Vendor, buyer, line items, tax, totals |
| Contract | NDA, MOU, service agreement | Parties, obligations, dates, clauses |
| Resume | CV, job application | Skills, experience, education, contact |
| Research Paper | Journal, thesis, conference | Authors, abstract, findings, citations |
| Financial Report | Annual report, P&L, balance sheet | Revenue, profit, assets, liabilities |
| Medical Record | Prescription, lab report, discharge | Patient, diagnosis, medications |
| Bank Statement | Account statement, passbook | Transactions, balances, credits, debits |
| Legal Notice | Court order, summons, letter | Parties, demands, jurisdiction |
| General | Any unclassified document | Key points, entities, purpose |

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| AI Model | Groq API — llama-3.1-8b-instant | Classification, extraction, intelligence, chat |
| Backend | FastAPI (Python 3.12) | REST API, pipeline orchestration |
| Server | Uvicorn | ASGI server for FastAPI |
| PDF Parsing | PyMuPDF (fitz) | Native text extraction, font + layout analysis |
| PDF Validation | python-magic-bin | MIME type + magic bytes validation |
| Frontend | React.js | Upload UI, pipeline tracker, results dashboard |
| HTTP Client | Axios | Frontend to backend API communication |
| Drag & Drop | react-dropzone | PDF drag and drop upload interface |
| Animation | framer-motion | Pipeline stage animations |
| Environment | python-dotenv | Secure API key management |

---

## 📁 Project Structure

```
project/
├── README.md
│
├── backend/
│   ├── strategies/
│   │   ├── __init__.py              # Makes it a Python package
│   │   └── prompts.py               # 8 extraction strategy prompts + STRATEGY_MAP
│   ├── classifier.py                # Document type detection prompt
│   ├── intelligence.py              # Risk analysis + scoring prompt
│   ├── validator.py                 # 3-layer PDF validation
│   ├── preprocessor.py              # Text extraction + cleaning + language detection
│   ├── response_builder.py          # Final JSON assembly
│   ├── main.py                      # FastAPI app + /analyze + /chat endpoints
│   ├── requirements.txt             # All Python dependencies
│   └── .env                         # Groq API key (NEVER commit this)
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── UploadZone.jsx       # Drag-and-drop PDF upload
        │   ├── PipelineProgress.jsx # Animated 8-stage pipeline tracker
        │   ├── ResultsDashboard.jsx # Full results screen
        │   ├── ExtractedFields.jsx  # Searchable key-value field display
        │   ├── RiskFlags.jsx        # Risk flags with severity + recommendations
        │   ├── SummaryCards.jsx     # Tabbed summary display
        │   └── ChatBox.jsx          # Chat with PDF panel
        ├── services/
        │   └── api.js               # All backend API calls
        ├── App.jsx                  # Main app + screen state management
        ├── App.css                  # Global dark theme + design tokens
        └── index.js                 # React entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- Free Groq API key → [console.groq.com](https://console.groq.com) (no credit card needed)

---

### Backend Setup

**Step 1 — Navigate to backend folder**
```bash
cd project/backend
```

**Step 2 — Install all dependencies**
```bash
pip install -r requirements.txt
```

**Step 3 — Create `.env` file**

Create a file named `.env` inside the `backend/` folder:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

> Rules: No spaces around `=`. No quotes around the key value.

**Step 4 — Start the server**

Windows PowerShell:
```bash
$env:GROQ_API_KEY="gsk_your_actual_key_here"
python -m uvicorn main:app --reload --port 8000
```

**Step 5 — Verify it is running**

Open browser at `http://127.0.0.1:8000`

You should see:
```json
{
  "status": "running",
  "service": "PDF Intelligence Engine v2.0",
  "model": "llama-3.1-8b-instant",
  "features": ["classification", "extraction", "intelligence", "risk_flags", "chat", "sweet_summary"]
}
```

---

### Frontend Setup

**Step 1 — Navigate to frontend folder**
```bash
cd project/frontend
```

**Step 2 — Install dependencies**
```bash
npm install
```

**Step 3 — Start the app**
```bash
npm start
```

**Step 4 — Open in browser**
```
http://localhost:3000
```

> Make sure the backend is running on port 8000 before starting the frontend.

---

## 🔄 The 9-Stage AI Pipeline

Every PDF uploaded passes through exactly 9 stages in sequence:

```
Stage 1 → Read file bytes
          ↓
Stage 2 → Validate PDF
          Extension check + MIME type check + magic bytes check (%PDF-)
          ↓
Stage 3 → Preprocess
          PyMuPDF extracts text page by page, cleans it, detects language
          ↓
Stage 4 → Classify document type
          Groq AI identifies doc type, sub-type, confidence score
          ↓
Stage 5 → Select extraction strategy
          STRATEGY_MAP routes to correct prompt schema
          ↓
Stage 6 → Extract structured fields
          Groq AI pulls all relevant fields per document type
          ↓
Stage 7 → Run intelligence analysis
          Risk flags, entities, anomalies, health score, sentiment
          ↓
Stage 8 → Generate sweet summary
          Friendly human-readable summary tailored to doc type
          ↓
Stage 9 → Build final response
          All outputs merged into structured JSON
```

---

## 🤖 AI Calls Per Document

```
Call 1 → Classifier     → doc_type + sub_type + confidence + reasoning
Call 2 → Extractor      → all structured fields for that document type
Call 3 → Intelligence   → risks + entities + health score + anomalies
Call 4 → Sweet Summary  → friendly summary (research papers get science style)
```

---

## 🌐 API Reference

### `GET /`
Health check — returns service status

**Response:**
```json
{
  "status": "running",
  "service": "PDF Intelligence Engine v2.0",
  "model": "llama-3.1-8b-instant",
  "features": ["classification", "extraction", "intelligence", "risk_flags", "chat", "sweet_summary"]
}
```

---

### `POST /analyze`
Main endpoint — accepts a PDF file and runs the full pipeline

**Request (curl):**
```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -F "file=@your_document.pdf"
```

**Response:**
```json
{
  "status": "success",
  "processed_at": "2026-04-09T10:49:52Z",
  "filename": "invoice.pdf",

  "classification": {
    "doc_type": "invoice",
    "sub_type": "tax_invoice",
    "confidence": 0.95,
    "reasoning": "Document contains order and invoice details...",
    "strategy_used": "invoice_extraction"
  },

  "summaries": {
    "professional": "This is an invoice from S V Electronics...",
    "simple": "Invoice from S V Electronics to Rohit for INR 2151.47",
    "sweet": "S V Electronics is billing Rohit for INR 2151.47..."
  },

  "extracted_fields": {
    "vendor_name": "S V Electronics Private Limited",
    "buyer_name": "Rohit Maheshwari",
    "invoice_number": "BFF9825004969005",
    "invoice_date": "2025-01-14",
    "currency": "INR",
    "subtotal": 1999.00,
    "tax_amount": 152.47,
    "total_amount": 2151.47,
    "line_items": [...]
  },

  "intelligence": {
    "sentiment": "neutral",
    "tone": "formal",
    "document_health": "fair",
    "completeness_score": 0.91,
    "overall_confidence": 0.94,
    "estimated_value": 2151.47,
    "language": "en"
  },

  "risks": {
    "total": 2,
    "high_count": 0,
    "medium_count": 2,
    "low_count": 0,
    "flags": [
      {
        "level": "medium",
        "category": "compliance",
        "field": "due_date",
        "description": "Due date is missing from the invoice",
        "recommendation": "Add due date to avoid late payment penalties"
      }
    ]
  },

  "entities": {
    "people": ["Rohit Maheshwari"],
    "organizations": ["S V Electronics Private Limited"],
    "locations": ["GANDHIDHAM 370201 Gujarat"],
    "dates": ["2025-01-14"],
    "monetary_amounts": [2151.47]
  },

  "anomalies": [...],
  "missing_fields": ["due_date", "payment_terms"],
  "recommended_actions": [...],

  "metadata": {
    "page_count": 2,
    "has_tables": true,
    "has_images": false,
    "has_forms": false,
    "char_count": 3420,
    "language_hint": "en"
  }
}
```

---

### `POST /chat`
Chat with an already analyzed document

**Request:**
```json
{
  "question": "What is the total amount due?",
  "doc_type": "invoice",
  "extracted_fields": { ... },
  "intelligence": { ... },
  "raw_text": "..."
}
```

**Response:**
```json
{
  "status": "success",
  "question": "What is the total amount due?",
  "answer": "The total amount due is INR 2,151.47 which includes a subtotal of INR 1,999.00 and tax of INR 152.47."
}
```

---

## 🛡️ PDF Validation — 3 Layers

```
Layer 1 → File extension must end with .pdf
          Blocks renamed files

Layer 2 → MIME type must be application/pdf
          Blocks disguised files

Layer 3 → First 5 bytes must be %PDF-
          Confirms real PDF file structure

Bonus   → File size must be greater than 100 bytes
          Blocks empty files
```

If any layer fails — HTTP 400 is returned immediately and the pipeline never starts.

---

## 📊 Real Test Result

Tested with a real Indian tax invoice (OD333370338821732100.pdf):

```
✓ doc_type          → invoice (tax_invoice)
✓ confidence        → 0.95
✓ vendor_name       → S V Electronics Private Limited
✓ vendor_address    → Hillway industrial and logistic park, Gujarat
✓ buyer_name        → Rohit Maheshwari
✓ buyer_address     → Plot no. 391, Ganesh Nagar, GANDHIDHAM 370201 Gujarat
✓ invoice_number    → BFF9825004969005
✓ invoice_date      → 2025-01-14
✓ currency          → INR
✓ subtotal          → 1999.00
✓ tax_amount        → 152.47
✓ total_amount      → 2151.47
✓ line_items        → extracted perfectly
✓ risk_flags        → 2 medium risks detected
✓ entities          → people, organizations, locations all extracted
✓ processing        → under 15 seconds end to end
```

---

## 🎯 What Makes This Stand Out

Most PDF tools just extract raw text. This system:

| Feature | Basic Tool | PDF Intelligence Engine |
|---|---|---|
| Output | Raw text dump | Structured JSON with typed fields |
| Document awareness | None | Classifies 9 types with sub-types |
| Schema | Fixed | Dynamic per document type |
| Risk detection | None | High/Medium/Low flags with recommendations |
| Summaries | None | 3 types tailored to document |
| Conversation | None | Full natural language chat |
| Confidence | None | Per-field confidence scores |
| Cost | Paid APIs | 100% free with Groq |

---

## 🔮 Roadmap

- [ ] **OCR Support** — Tesseract integration for scanned PDFs
- [ ] **Batch Processing** — Upload multiple PDFs, get combined summary table
- [ ] **Document Comparison** — Diff two PDFs side by side
- [ ] **Export Options** — Download as CSV, JSON, or formatted PDF report
- [ ] **Multi-language Support** — Hindi, Gujarati, and other regional languages
- [ ] **Webhook Support** — Async processing for large documents
- [ ] **Browser Extension** — Analyze any PDF directly from browser

---

## ⚠️ Important Notes

- Never commit your `.env` file — add it to `.gitignore`
- The Groq free tier allows 30 requests/minute — more than enough for demos
- Each document analysis makes 4 Groq API calls
- Backend must be running on port 8000 before starting the frontend
- Windows users must use `python -m uvicorn` instead of just `uvicorn`
- If Groq API key is not loaded, set it manually in PowerShell before starting server

---

## 🐛 Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Could not import module "main"` | File not saved | Press CTRL+S in VS Code |
| `GROQ_API_KEY not set` | .env not loading | Set key manually in terminal |
| `Invalid JSON from model` | Model response format | Already handled by call_groq parser |
| `Connection refused` | Backend not running | Start uvicorn first |
| `Only .pdf files accepted` | Wrong file type | Upload a real .pdf file |
| `uvicorn not recognized` | PATH issue | Use `python -m uvicorn` |

---

## 📄 License

Built for Hackathon 2026. Open for educational and demonstration use.

---

<div align="center">

**⚡ PDF Intelligence Engine v2.0**

Built with FastAPI • Groq AI • React.js

*Drop any PDF. Get full intelligence.*

</div>
