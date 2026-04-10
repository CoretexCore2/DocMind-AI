// UploadZone.jsx
// Responsible for: Drag-and-drop PDF upload, file validation, animated UI
// Used by: App.jsx (Screen 1)

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FEATURES = [
  { icon: "🔍", label: "Document Classification", desc: "Auto-detects 12+ doc types" },
  { icon: "⚡", label: "Field Extraction",         desc: "Smart field parsing per type" },
  { icon: "🧠", label: "AI Intelligence",           desc: "Risk flags & entity detection" },
  { icon: "💬", label: "Chat with PDF",             desc: "Ask anything about the doc" },
];

export default function UploadZone({ onFileAccepted, error }) {
  const [dragActive, setDragActive] = useState(false);
  const [hoverFile,  setHoverFile]  = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    setHoverFile(null);

    if (rejectedFiles.length > 0) {
      alert("Only PDF files are accepted.");
      return;
    }
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const onDragEnter = useCallback((e) => {
    setDragActive(true);
    const files = e.dataTransfer?.items;
    if (files && files.length > 0) {
      setHoverFile(files[0].type === "application/pdf" ? "pdf" : "invalid");
    }
  }, []);

  const onDragLeave = useCallback(() => {
    setDragActive(false);
    setHoverFile(null);
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const zoneState = isDragReject || hoverFile === "invalid"
    ? "reject"
    : isDragAccept || hoverFile === "pdf"
    ? "accept"
    : dragActive
    ? "active"
    : "idle";

  return (
    <div className="upload-page fade-in">

      {/* ── Hero text */}
      <div className="upload-hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI-Powered Document Engine
        </div>
        <h1 className="hero-title">
          Drop any PDF.<br />
          <span className="hero-gradient">Get full intelligence.</span>
        </h1>
        <p className="hero-sub">
          Upload a PDF and our 8-stage AI pipeline classifies, extracts,
          analyzes risk, detects entities, and summarizes — in seconds.
        </p>
      </div>

      {/* ── Drop zone */}
      <div
        {...getRootProps()}
        className={`dropzone dropzone--${zoneState}`}
      >
        <input {...getInputProps()} />

        <div className="dropzone-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
        </div>

        <div className="dropzone-inner">
          <div className="drop-icon-wrap">
            {zoneState === "reject"  && <span className="drop-icon drop-icon--reject">✕</span>}
            {zoneState === "accept"  && <span className="drop-icon drop-icon--accept">✓</span>}
            {zoneState === "idle"    && <span className="drop-icon drop-icon--idle">📄</span>}
            {zoneState === "active"  && <span className="drop-icon drop-icon--idle">📂</span>}
          </div>

          {zoneState === "reject" ? (
            <>
              <p className="drop-title drop-title--reject">Not a PDF</p>
              <p className="drop-sub">Only .pdf files are accepted</p>
            </>
          ) : zoneState === "accept" ? (
            <>
              <p className="drop-title drop-title--accept">Release to analyze!</p>
              <p className="drop-sub">PDF detected — ready to process</p>
            </>
          ) : (
            <>
              <p className="drop-title">Drag & drop your PDF here</p>
              <p className="drop-sub">or click to browse files</p>
              <div className="drop-pill">
                <span className="drop-pill-dot" />
                PDF only · any size
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Error */}
      {error && (
        <div className="upload-error">
          <span>⚠</span> {error}
        </div>
      )}

      {/* ── Feature grid */}
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.label}>
            <div className="feature-icon">{f.icon}</div>
            <div>
              <div className="feature-label">{f.label}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Inline styles */}
      <style>{`
        .upload-page {
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            2rem;
          padding:        2rem 0 4rem;
        }

        /* Hero */
        .upload-hero { text-align: center; max-width: 600px; }

        .hero-badge {
          display:       inline-flex;
          align-items:   center;
          gap:           8px;
          padding:       6px 16px;
          background:    rgba(108,99,255,0.12);
          border:        1px solid rgba(108,99,255,0.3);
          border-radius: 20px;
          font-size:     12px;
          font-weight:   600;
          color:         #a78bfa;
          margin-bottom: 1.2rem;
          letter-spacing: 0.04em;
        }

        .hero-badge-dot {
          width:         7px;
          height:        7px;
          border-radius: 50%;
          background:    #a78bfa;
          animation:     pulse 1.8s ease-in-out infinite;
        }

        .hero-title {
          font-size:   2.6rem;
          font-weight: 800;
          line-height: 1.18;
          color:       var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .hero-gradient {
          background:              linear-gradient(135deg, #6c63ff 0%, #a78bfa 50%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip:         text;
        }

        .hero-sub {
          font-size:   1rem;
          color:       var(--text-secondary);
          line-height: 1.7;
        }

        /* Drop zone */
        .dropzone {
          position:      relative;
          width:         100%;
          max-width:     580px;
          min-height:    260px;
          border-radius: var(--radius-xl);
          border:        2px dashed var(--border-light);
          cursor:        pointer;
          overflow:      hidden;
          display:       flex;
          align-items:   center;
          justify-content: center;
          background:    var(--bg-card);
          transition:    all 0.3s ease;
        }

        .dropzone--active {
          border-color: var(--accent);
          background:   var(--accent-glow);
        }

        .dropzone--accept {
          border-color: var(--success);
          background:   rgba(34,197,94,0.08);
        }

        .dropzone--reject {
          border-color: var(--danger);
          background:   rgba(239,68,68,0.08);
        }

        .dropzone--idle:hover {
          border-color: var(--accent);
          background:   var(--bg-hover);
        }

        /* Animated rings */
        .dropzone-rings {
          position: absolute;
          inset:    0;
          pointer-events: none;
        }

        .ring {
          position:      absolute;
          border-radius: 50%;
          border:        1px solid rgba(108,99,255,0.08);
          top:  50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        .ring-1 { width: 160px; height: 160px; }
        .ring-2 { width: 260px; height: 260px; border-color: rgba(108,99,255,0.05); }
        .ring-3 { width: 380px; height: 380px; border-color: rgba(108,99,255,0.03); }

        .dropzone--active .ring,
        .dropzone--accept .ring,
        .dropzone--reject .ring { display: none; }

        /* Inner content */
        .dropzone-inner {
          position:       relative;
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            10px;
          padding:        2.5rem;
          text-align:     center;
          z-index:        1;
        }

        .drop-icon-wrap {
          margin-bottom: 0.5rem;
        }

        .drop-icon {
          font-size: 3rem;
          display:   block;
          transition: transform 0.3s ease;
        }

        .drop-icon--accept { animation: bounce 0.5s ease; }
        .drop-icon--reject { filter: grayscale(1); }

        @keyframes bounce {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.25); }
        }

        .drop-title {
          font-size:   1.25rem;
          font-weight: 700;
          color:       var(--text-primary);
        }

        .drop-title--accept { color: var(--success); }
        .drop-title--reject { color: var(--danger); }

        .drop-sub {
          font-size: 0.9rem;
          color:     var(--text-secondary);
        }

        .drop-pill {
          display:       inline-flex;
          align-items:   center;
          gap:           6px;
          margin-top:    6px;
          padding:       5px 14px;
          background:    var(--bg-hover);
          border:        1px solid var(--border);
          border-radius: 20px;
          font-size:     12px;
          color:         var(--text-muted);
          font-weight:   500;
        }

        .drop-pill-dot {
          width:         6px;
          height:        6px;
          border-radius: 50%;
          background:    var(--accent);
        }

        /* Error */
        .upload-error {
          display:       flex;
          align-items:   center;
          gap:           8px;
          padding:       12px 20px;
          background:    rgba(239,68,68,0.1);
          border:        1px solid rgba(239,68,68,0.25);
          border-radius: var(--radius);
          color:         #f87171;
          font-size:     14px;
          font-weight:   500;
          max-width:     580px;
          width:         100%;
        }

        /* Feature grid */
        .feature-grid {
          display:               grid;
          grid-template-columns: repeat(4, 1fr);
          gap:                   1rem;
          width:                 100%;
          max-width:             700px;
        }

        @media (max-width: 700px) {
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-title   { font-size: 1.9rem; }
        }

        .feature-card {
          background:    var(--bg-card);
          border:        1px solid var(--border);
          border-radius: var(--radius);
          padding:       1rem;
          display:       flex;
          flex-direction: column;
          gap:           8px;
          transition:    border-color 0.2s, transform 0.2s;
        }

        .feature-card:hover {
          border-color: var(--border-light);
          transform:    translateY(-2px);
        }

        .feature-icon  { font-size: 1.4rem; }
        .feature-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .feature-desc  { font-size: 11px; color: var(--text-muted); margin-top: 2px; line-height: 1.4; }
      `}</style>
    </div>
  );
}
