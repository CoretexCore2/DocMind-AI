// api.js
// Responsible for: All backend API calls
// Used by: All components that need data

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 120000, // 2 minutes timeout for large PDFs
});


// ────────────────────────────────────────────────
// Analyze PDF
// ────────────────────────────────────────────────

export const analyzePDF = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
            const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onUploadProgress) onUploadProgress(percent);
        },
    });

    return response.data;
};


// ────────────────────────────────────────────────
// Chat with PDF
// ────────────────────────────────────────────────

export const chatWithPDF = async (question, docContext) => {
    const response = await api.post("/chat", {
        question,
        doc_type: docContext.doc_type,
        extracted_fields: docContext.extracted_fields,
        intelligence: docContext.intelligence,
        raw_text: docContext.raw_text_preview || "",
    });

    return response.data;
};


// ────────────────────────────────────────────────
// Health check
// ────────────────────────────────────────────────

export const checkHealth = async () => {
    const response = await api.get("/");
    return response.data;
};