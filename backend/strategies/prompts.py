# strategies/prompts.py

BASE_EXTRACTOR_INSTRUCTION = """
You are an expert data extraction agent.
Read the document text carefully and extract all relevant fields.
Respond ONLY with a valid JSON object. No explanation. No extra text.
If a field is not found, set its value to null.
All dates must be in YYYY-MM-DD format.
All amounts must be numeric (no currency symbols).
"""

INVOICE_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this invoice document.
Return a single complete JSON object with these exact fields:

{{
  "vendor_name": "",
  "vendor_address": "",
  "buyer_name": "",
  "buyer_address": "",
  "invoice_number": "",
  "invoice_date": "",
  "due_date": "",
  "currency": "",
  "subtotal": null,
  "tax_amount": null,
  "total_amount": null,
  "payment_terms": "",
  "line_items": []
}}

Document text:
{raw_text}
"""

CONTRACT_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this contract document.
Return a single complete JSON object with these exact fields:

{{
  "contract_title": "",
  "parties": [],
  "effective_date": "",
  "expiry_date": "",
  "jurisdiction": "",
  "contract_value": null,
  "currency": "",
  "key_obligations": [],
  "termination_clauses": [],
  "penalty_clauses": [],
  "renewal_terms": "",
  "governing_law": ""
}}

Document text:
{raw_text}
"""

RESUME_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this resume document.
Return a single complete JSON object with these exact fields:

{{
  "full_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "summary": "",
  "skills": [],
  "experience": [],
  "education": [],
  "certifications": [],
  "languages": []
}}

Document text:
{raw_text}
"""

RESEARCH_PAPER_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this research paper document.
Return a single complete JSON object with these exact fields:

{{
  "title": "",
  "authors": [],
  "published_date": "",
  "journal_or_conference": "",
  "doi": "",
  "abstract": "",
  "keywords": [],
  "methodology": "",
  "key_findings": [],
  "limitations": [],
  "future_work": "",
  "references_count": null
}}

Document text:
{raw_text}
"""

FINANCIAL_REPORT_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this financial report document.
Return a single complete JSON object with these exact fields:

{{
  "company_name": "",
  "report_period": "",
  "report_type": "",
  "currency": "",
  "revenue": null,
  "net_profit": null,
  "total_assets": null,
  "total_liabilities": null,
  "earnings_per_share": null,
  "key_highlights": [],
  "risks_mentioned": [],
  "outlook": ""
}}

Document text:
{raw_text}
"""

MEDICAL_RECORD_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this medical record document.
Return a single complete JSON object with these exact fields:

{{
  "patient_name": "",
  "patient_id": "",
  "date_of_birth": "",
  "visit_date": "",
  "doctor_name": "",
  "hospital_or_clinic": "",
  "diagnosis": [],
  "medications": [],
  "lab_results": [],
  "allergies": [],
  "follow_up_date": "",
  "notes": ""
}}

Document text:
{raw_text}
"""

BANK_STATEMENT_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
Extract the following fields from this bank statement document.
Return a single complete JSON object with these exact fields:

{{
  "bank_name": "",
  "account_holder": "",
  "account_number": "",
  "statement_period": "",
  "opening_balance": null,
  "closing_balance": null,
  "currency": "",
  "total_credits": null,
  "total_debits": null,
  "transactions": []
}}

Document text:
{raw_text}
"""

GENERAL_PROMPT = BASE_EXTRACTOR_INSTRUCTION + """
This is a general document. Extract whatever meaningful structured
information you can find.
Return a single complete JSON object with these exact fields:

{{
  "title": "",
  "author": "",
  "date": "",
  "organization": "",
  "main_topic": "",
  "key_points": [],
  "mentioned_entities": [],
  "document_purpose": ""
}}

Document text:
{raw_text}
"""

STRATEGY_MAP = {
    "invoice":          INVOICE_PROMPT,
    "contract":         CONTRACT_PROMPT,
    "resume":           RESUME_PROMPT,
    "research_paper":   RESEARCH_PAPER_PROMPT,
    "financial_report": FINANCIAL_REPORT_PROMPT,
    "medical_record":   MEDICAL_RECORD_PROMPT,
    "bank_statement":   BANK_STATEMENT_PROMPT,
    "legal_notice":     GENERAL_PROMPT,
    "purchase_order":   INVOICE_PROMPT,
    "general":          GENERAL_PROMPT,
}