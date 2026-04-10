# response_builder.py
# Advanced response builder with full metadata and scoring

from datetime import datetime


def build_response(
    filename:               str,
    doc_type:               str,
    sub_type:               str,
    classifier_confidence:  float,
    classifier_reasoning:   str,
    strategy_used:          str,
    extracted_fields:       dict,
    intelligence:           dict,
    metadata:               dict,
    sweet_summary:          str = "",
    raw_text:               str = ""
) -> dict:

    # Count risk levels
    risk_flags    = intelligence.get("risk_flags", [])
    high_risks    = [r for r in risk_flags if r.get("level") == "high"]
    medium_risks  = [r for r in risk_flags if r.get("level") == "medium"]
    low_risks     = [r for r in risk_flags if r.get("level") == "low"]

    return {
        "status":                 "success",
        "processed_at":           datetime.utcnow().isoformat() + "Z",
        "filename":               filename,

        "classification": {
            "doc_type":           doc_type,
            "sub_type":           sub_type,
            "confidence":         round(classifier_confidence, 4),
            "reasoning":          classifier_reasoning,
            "strategy_used":      strategy_used,
        },

        "summaries": {
            "professional":       intelligence.get("summary", ""),
            "simple":             intelligence.get("simple_summary", ""),
            "sweet":              sweet_summary,
        },

        "extracted_fields":       extracted_fields,

        "intelligence": {
            "sentiment":          intelligence.get("sentiment", "neutral"),
            "tone":               intelligence.get("tone", "standard"),
            "document_health":    intelligence.get("document_health", "fair"),
            "completeness_score": round(intelligence.get("completeness_score", 0.0), 4),
            "overall_confidence": round(intelligence.get("overall_confidence", 0.0), 4),
            "estimated_value":    intelligence.get("estimated_value", None),
            "language":           intelligence.get("language", "en"),
            "tags":               intelligence.get("tags", []),
        },

        "risks": {
            "total":              len(risk_flags),
            "high_count":         len(high_risks),
            "medium_count":       len(medium_risks),
            "low_count":          len(low_risks),
            "flags":              risk_flags,
        },

        "entities":               intelligence.get("key_entities", {}),
        "anomalies":              intelligence.get("anomalies", []),
        "missing_fields":         intelligence.get("missing_fields", []),
        "recommended_actions":    intelligence.get("recommended_actions", []),
        "field_confidence":       intelligence.get("field_confidence", {}),

        "metadata": {
            "page_count":       metadata.get("page_count", 0),
            "has_tables":       metadata.get("has_tables", False),
            "has_images":       metadata.get("has_images", False),
            "has_forms":        metadata.get("has_forms", False),
            "avg_font_size":    metadata.get("avg_font_size", 0),
            "char_count":       metadata.get("char_count", 0),
            "language_hint":    metadata.get("language_hint", "unknown"),
            "ocr_used":         metadata.get("ocr_used", False),
            "scanned_pages":    metadata.get("scanned_pages", []),
            "is_fully_scanned": metadata.get("is_fully_scanned", False),
        },

        "raw_text_preview":       raw_text[:500] if raw_text else ""
    }


def build_error_response(
    filename:      str,
    error_message: str,
    stage:         str
) -> dict:

    return {
        "status":           "error",
        "processed_at":     datetime.utcnow().isoformat() + "Z",
        "filename":         filename,
        "failed_at_stage":  stage,
        "error":            error_message,
        "classification":   None,
        "summaries":        None,
        "extracted_fields": None,
        "intelligence":     None,
        "risks":            None,
        "entities":         None,
        "metadata":         None
    }