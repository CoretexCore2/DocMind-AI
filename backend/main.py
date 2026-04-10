# main.py
# Advanced FastAPI pipeline with chat, sweet summaries, and full intelligence

import os
import re
import json
import json

from groq import Groq
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from validator import validate_pdf
from preprocessor import preprocess
from strategies.prompts import STRATEGY_MAP
from response_builder import build_response, build_error_response
from classifier import CLASSIFIER_SYSTEM_PROMPT, CLASSIFIER_USER_PROMPT
from intelligence import INTELLIGENCE_SYSTEM_PROMPT, INTELLIGENCE_USER_PROMPT

# ── Load .env
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

# ── App
app = FastAPI(
    title="Agentic PDF Extraction & Intelligence Engine",
    version="2.0.0",
    description="Advanced AI-powered document analysis engine"
)

# ── CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL  = "llama-3.1-8b-instant"


# ────────────────────────────────────────────────
# Pydantic models
# ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question:         str
    doc_type:         str
    extracted_fields: dict
    intelligence:     dict
    raw_text:         str


# ────────────────────────────────────────────────
# Core Groq caller
# ────────────────────────────────────────────────

def call_groq(system_prompt: str, user_prompt: str, temperature: float = 0.1, max_tokens: int = 2048) -> dict:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )

    raw = response.choices[0].message.content.strip()

    # Clean markdown fences
    raw = raw.replace("```json", "").replace("```", "")

    # Remove all control characters except newline
    raw = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", raw)

    # Collapse whitespace
    raw = " ".join(raw.split()).strip()

    # Extract JSON object
    start = raw.find("{")
    end   = raw.rfind("}") + 1

    if start == -1 or end == 0:
        raise HTTPException(status_code=500, detail="No JSON found in model response")

    json_str = raw[start:end]

    # Attempt 1 — direct parse
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    # Attempt 2 — fix single quotes
    try:
        return json.loads(json_str.replace("'", '"'))
    except json.JSONDecodeError:
        pass

    # Attempt 3 — use regex to extract only valid JSON fields
    try:
        import ast
        return ast.literal_eval(json_str)
    except Exception:
        pass

    # Attempt 4 — return partial safe dict
    try:
        safe = {}
        pairs = re.findall(r'"([^"]+)"\s*:\s*"([^"]*)"', json_str)
        for key, val in pairs:
            safe[key] = val
        num_pairs = re.findall(r'"([^"]+)"\s*:\s*(-?\d+\.?\d*)', json_str)
        for key, val in num_pairs:
            safe[key] = float(val) if "." in val else int(val)
        if safe:
            return safe
    except Exception:
        pass

    raise HTTPException(
        status_code=500,
        detail=f"Could not parse model response as JSON"
    )

def call_groq_text(system_prompt: str, user_prompt: str, temperature: float = 0.7, max_tokens: int = 400) -> str:
    """For non-JSON text responses like sweet summaries and chat."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


# ────────────────────────────────────────────────
# Sweet summary generator
# ────────────────────────────────────────────────

def generate_sweet_summary(doc_type: str, extracted_fields: dict, raw_text: str) -> str:

    if doc_type == "research_paper":
        system = "You are an enthusiastic science communicator who makes research exciting and accessible to everyone."
        prompt = f"""
Read this research paper data and write a captivating 4-5 sentence summary that:
- Opens with what problem this research solves
- Explains the key finding in simple words
- Mentions why this matters to real people
- Uses friendly, engaging language
- Avoids all technical jargon

Paper data:
{json.dumps(extracted_fields, indent=2)}

Original text snippet:
{raw_text[:2000]}

Write only the summary. Nothing else.
"""

    elif doc_type == "medical_record":
        system = "You are a compassionate medical assistant who explains health documents clearly and reassuringly."
        prompt = f"""
Write a clear, reassuring 3 sentence summary of this medical document.
Focus on: what the visit was for, key findings, and next steps.
Use simple, calm language.

Medical data:
{json.dumps(extracted_fields, indent=2)}

Write only the summary. Nothing else.
"""

    elif doc_type == "contract":
        system = "You are a plain-language legal expert who explains contracts in simple terms."
        prompt = f"""
Write a clear 3 sentence summary of this contract that explains:
- Who the parties are and what they are agreeing to
- The most important obligation or commitment
- Key dates or financial terms

Contract data:
{json.dumps(extracted_fields, indent=2)}

Write only the summary. Nothing else.
"""

    elif doc_type in ["invoice", "purchase_order"]:
        system = "You are a friendly financial assistant."
        prompt = f"""
Write a clear 2 sentence summary of this {doc_type} covering:
- Who is billing whom for what
- The total amount and due date

Data:
{json.dumps(extracted_fields, indent=2)}

Write only the summary. Nothing else.
"""

    else:
        system = "You are a helpful document summarizer."
        prompt = f"""
Write a clear friendly 3 sentence summary of this {doc_type} document.
Mention the most important details.

Data:
{json.dumps(extracted_fields, indent=2)}

Write only the summary. Nothing else.
"""

    try:
        return call_groq_text(system, prompt)
    except Exception:
        return ""


# ────────────────────────────────────────────────
# Health check
# ────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "status":  "running",
        "service": "PDF Intelligence Engine v2.0",
        "model":   MODEL,
        "features": ["classification", "extraction", "intelligence", "risk_flags", "chat", "sweet_summary"]
    }


# ────────────────────────────────────────────────
# Main analyze endpoint
# ────────────────────────────────────────────────

@app.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):

    filename = file.filename

    # Stage 1 — Read
    try:
        file_bytes = await file.read()
    except Exception as e:
        return build_error_response(filename, str(e), "file_read")

    # Stage 2 — Validate
    try:
        validate_pdf(filename, file_bytes)
    except HTTPException as e:
        return build_error_response(filename, e.detail, "validation")

    # Stage 3 — Preprocess
    try:
        processed = preprocess(file_bytes)
    except Exception as e:
        return build_error_response(filename, str(e), "preprocessing")

    snippet   = processed["snippet"]
    full_text = processed["full_text"]
    metadata  = {
        "page_count":       processed["page_count"],
        "has_tables":       processed["has_tables"],
        "has_images":       processed["has_images"],
        "has_forms":        processed["has_forms"],
        "avg_font_size":    processed["avg_font_size"],
        "char_count":       processed["char_count"],
        "language_hint":    processed["language_hint"],
        "ocr_used":         processed["ocr_used"],
        "scanned_pages":    processed["scanned_pages"],
        "is_fully_scanned": processed["is_fully_scanned"],
    }

    # Stage 4 — Classify
    try:
        classification        = call_groq(CLASSIFIER_SYSTEM_PROMPT, CLASSIFIER_USER_PROMPT.format(raw_text=snippet))
        doc_type              = classification.get("doc_type", "general")
        sub_type              = classification.get("sub_type", "")
        classifier_confidence = classification.get("confidence", 0.0)
        classifier_reasoning  = classification.get("reasoning", "")
    except Exception as e:
        return build_error_response(filename, str(e), "classification")

    # Stage 5 — Select strategy
    strategy_prompt = STRATEGY_MAP.get(doc_type, STRATEGY_MAP["general"])
    strategy_used   = f"{doc_type}_extraction"

    # Stage 6 — Extract fields
    try:
        extracted_fields = call_groq(
            system_prompt="You are an expert data extraction agent. Respond only with valid JSON. No explanation. No preamble.",
            user_prompt=strategy_prompt.format(raw_text=full_text)
        )
    except Exception as e:
        return build_error_response(filename, str(e), "extraction")

    # Stage 7 — Intelligence
    try:
        intelligence = call_groq(
            system_prompt=INTELLIGENCE_SYSTEM_PROMPT,
            user_prompt=INTELLIGENCE_USER_PROMPT.format(
                doc_type=doc_type,
                extracted_json=json.dumps(extracted_fields, indent=2),
                raw_text=full_text[:4000]
            )
        )
    except Exception as e:
        return build_error_response(filename, str(e), "intelligence")

    # Stage 8 — Sweet summary
    try:
        sweet_summary = generate_sweet_summary(doc_type, extracted_fields, full_text)
    except Exception:
        sweet_summary = ""

    # Stage 9 — Build response
    return build_response(
        filename=filename,
        doc_type=doc_type,
        sub_type=sub_type,
        classifier_confidence=classifier_confidence,
        classifier_reasoning=classifier_reasoning,
        strategy_used=strategy_used,
        extracted_fields=extracted_fields,
        intelligence=intelligence,
        metadata=metadata,
        sweet_summary=sweet_summary,
        raw_text=full_text
    )


# ────────────────────────────────────────────────
# Chat endpoint
# ────────────────────────────────────────────────

@app.post("/chat")
async def chat_with_pdf(request: ChatRequest):

    system_prompt = """
You are an intelligent document assistant with deep expertise in analyzing documents.
You have full access to the extracted data and intelligence analysis of a document.
Answer questions accurately, concisely and helpfully.
If the answer is not in the document data, say so clearly.
Never make up information. Always base answers on the provided document context.
Format answers in a clear, friendly way.
"""

    user_prompt = f"""
Document type: {request.doc_type}

Extracted fields:
{json.dumps(request.extracted_fields, indent=2)}

Intelligence analysis:
{json.dumps(request.intelligence, indent=2)}

Document text (first 3000 chars):
{request.raw_text[:3000]}

User question: {request.question}

Answer based only on the document content above.
"""

    try:
        answer = call_groq_text(system_prompt, user_prompt, temperature=0.3, max_tokens=512)
        return {
            "status":   "success",
            "question": request.question,
            "answer":   answer
        }
    except Exception as e:
        return {
            "status":   "error",
            "question": request.question,
            "answer":   f"Sorry, could not process your question: {str(e)}"
        }
    

