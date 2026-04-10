# preprocessor.py
# Advanced PDF text extraction with OCR fallback for scanned documents

import re
import fitz        # pymupdf
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes
import io

# Path to tesseract executable on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Minimum characters per page to consider it a text PDF
# If below this threshold we treat the page as scanned
MIN_CHARS_PER_PAGE = 50


def is_scanned_page(text: str) -> bool:
    """
    Returns True if the page has too little text to be a real text PDF.
    This means it is likely a scanned image.
    """
    cleaned = text.strip()
    return len(cleaned) < MIN_CHARS_PER_PAGE


def extract_text_native(file_bytes: bytes) -> dict:
    """
    Try to extract text natively using PyMuPDF.
    Returns text + metadata + list of which pages are scanned.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    full_text    = ""
    page_texts   = []
    scanned_pages = []
    page_count   = doc.page_count
    has_tables   = False
    has_images   = False
    has_forms    = False
    font_sizes   = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        page_texts.append({
            "page":       page_num + 1,
            "text":       text,
            "char_count": len(text),
            "is_scanned": is_scanned_page(text)
        })

        if is_scanned_page(text):
            scanned_pages.append(page_num)
        else:
            full_text += text + "\n"

        if "\t" in text or re.search(r"\d+\s{3,}\d+", text):
            has_tables = True
        if page.get_images():
            has_images = True
        if page.widgets():
            has_forms = True

        blocks = page.get_text("dict").get("blocks", [])
        for block in blocks:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    font_sizes.append(span.get("size", 0))

    doc.close()

    avg_font_size = sum(font_sizes) / len(font_sizes) if font_sizes else 0

    return {
        "raw_text":      full_text,
        "page_texts":    page_texts,
        "page_count":    page_count,
        "scanned_pages": scanned_pages,
        "has_tables":    has_tables,
        "has_images":    has_images,
        "has_forms":     has_forms,
        "avg_font_size": round(avg_font_size, 2),
        "char_count":    len(full_text)
    }


def extract_text_ocr(file_bytes: bytes, scanned_pages: list) -> str:
    """
    Runs OCR on scanned pages using Tesseract.
    Returns extracted text from all scanned pages combined.
    """
    ocr_text = ""

    try:
        # Convert PDF pages to images
        images = convert_from_bytes(
            file_bytes,
            dpi=300,            # high DPI for better OCR accuracy
            fmt="PNG"
        )

        for page_num in scanned_pages:
            if page_num < len(images):
                image = images[page_num]

                # Preprocess image for better OCR
                image = image.convert("L")  # convert to grayscale

                # Run Tesseract OCR
                page_text = pytesseract.image_to_string(
                    image,
                    lang="eng",
                    config="--psm 6 --oem 3"
                )

                ocr_text += f"\n[Page {page_num + 1} - OCR]\n"
                ocr_text += page_text + "\n"

    except Exception as e:
        ocr_text += f"\n[OCR Error: {str(e)}]\n"

    return ocr_text


def clean_text(raw_text: str) -> str:
    text = raw_text.replace("\x00", "")
    text = re.sub(r"[^\x09\x0A\x0D\x20-\x7E]", " ", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    lines = [line.strip() for line in text.splitlines()]
    text  = "\n".join(lines).strip()
    return text


def detect_language_hint(text: str) -> str:
    sample = text[:500].lower()
    if any(w in sample for w in ["the", "and", "for", "this", "with"]):
        return "en"
    if any(w in sample for w in ["der", "die", "das", "und", "für"]):
        return "de"
    if any(w in sample for w in ["le", "la", "les", "et", "pour"]):
        return "fr"
    return "unknown"


def preprocess(file_bytes: bytes) -> dict:
    """
    Master preprocessing function.
    Automatically detects scanned pages and runs OCR on them.
    """

    # Step 1 — Try native text extraction
    extracted = extract_text_native(file_bytes)

    native_text   = extracted["raw_text"]
    scanned_pages = extracted["scanned_pages"]
    ocr_used      = False
    ocr_text      = ""

    # Step 2 — If any pages are scanned run OCR on them
    if scanned_pages:
        print(f"[Preprocessor] Detected {len(scanned_pages)} scanned page(s): {scanned_pages}")
        print("[Preprocessor] Running OCR...")
        ocr_text = extract_text_ocr(file_bytes, scanned_pages)
        ocr_used = True
        print("[Preprocessor] OCR complete.")

    # Step 3 — Combine native + OCR text
    full_text = native_text + "\n" + ocr_text

    # Step 4 — Check if entire document is scanned
    # (when ALL pages are scanned native text is empty)
    is_fully_scanned = len(scanned_pages) == extracted["page_count"]

    # Step 5 — Clean combined text
    cleaned  = clean_text(full_text)
    language = detect_language_hint(cleaned)

    return {
        "cleaned_text":      cleaned,
        "snippet":           cleaned[:3000],
        "full_text":         cleaned[:12000],
        "page_count":        extracted["page_count"],
        "has_tables":        extracted["has_tables"],
        "has_images":        extracted["has_images"],
        "has_forms":         extracted["has_forms"],
        "avg_font_size":     extracted["avg_font_size"],
        "char_count":        extracted["char_count"],
        "language_hint":     language,
        "page_texts":        extracted["page_texts"],
        "scanned_pages":     scanned_pages,
        "ocr_used":          ocr_used,
        "is_fully_scanned":  is_fully_scanned,
    }