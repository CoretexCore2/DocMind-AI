# validator.py
# Responsible for: Hard PDF validation (3 layers)
# Called by: main.py before anything else runs

import magic  # python-magic-bin (Windows)
from fastapi import HTTPException


ALLOWED_MIME_TYPES = {"application/pdf"}
PDF_MAGIC_BYTES = b"%PDF-"


def validate_pdf(filename: str, file_bytes: bytes) -> None:
    """
    Runs 3 hard validation checks on the uploaded file.
    Raises HTTP 400 immediately if any check fails.
    Pipeline never starts if this function raises.
    """

    # ── Check 1: File extension
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only .pdf files are accepted."
        )

    # ── Check 2: MIME type check (what the OS thinks the file is)
    mime = magic.from_buffer(file_bytes[:2048], mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{mime}'. Only PDF files are accepted."
        )

    # ── Check 3: Magic bytes (first 5 bytes of every real PDF = %PDF-)
    if not file_bytes.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=400,
            detail="File does not appear to be a valid PDF. Magic bytes check failed."
        )

    # ── Check 4: File must not be empty
    if len(file_bytes) < 100:
        raise HTTPException(
            status_code=400,
            detail="File is too small to be a valid PDF."
        )