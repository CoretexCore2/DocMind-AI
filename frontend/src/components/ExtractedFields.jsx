// ExtractedFields.jsx
// Responsible for: Displaying all extracted key-value fields from the document
// Used by: ResultsDashboard.jsx

import { useState } from "react";

function formatKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean")          return val ? "Yes" : "No";
  if (Array.isArray(val))               return val.join(", ") || "—";
  if (typeof val === "object")          return JSON.stringify(val, null, 2);
  return String(val) || "—";
}

export default function ExtractedFields({ fields }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);

  if (!fields || typeof fields !== "object") {
    return (
      <div className="card">
        <div className="card-title">Extracted Fields</div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No fields extracted.</p>
      </div>
    );
  }

  const entries = Object.entries(fields).filter(([k, v]) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      k.toLowerCase().includes(q) ||
      formatValue(v).toLowerCase().includes(q)
    );
  });

  return (
    <div className="card">
      <div className="ef-header">
        <div className="card-title" style={{ marginBottom: 0 }}>
          Extracted Fields
          <span className="ef-count">{Object.keys(fields).length}</span>
        </div>
        <button
          className="ef-toggle"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded && (
        <>
          {/* Search */}
          <input
            className="ef-search"
            placeholder="Search fields…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Fields table */}
          <div className="ef-table">
            {entries.length === 0 ? (
              <div className="ef-empty">No fields match "{search}"</div>
            ) : (
              entries.map(([key, val]) => {
                const formatted = formatValue(val);
                const isLong    = formatted.length > 80 || formatted.includes("\n");

                return (
                  <div key={key} className={`ef-row ${isLong ? "ef-row--long" : ""}`}>
                    <div className="ef-key">{formatKey(key)}</div>
                    <div className="ef-val">
                      {isLong
                        ? <pre className="ef-pre">{formatted}</pre>
                        : formatted === "—"
                        ? <span className="ef-null">—</span>
                        : formatted
                      }
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <style>{`
        .ef-header {
          display:         flex;
          align-items:     center;
          justify-content: space-between;
          margin-bottom:   1rem;
        }

        .ef-count {
          display:       inline-flex;
          align-items:   center;
          justify-content: center;
          min-width:     22px;
          height:        22px;
          padding:       0 6px;
          background:    var(--accent-glow);
          border:        1px solid rgba(108,99,255,0.3);
          border-radius: 20px;
          font-size:     11px;
          font-weight:   700;
          color:         #a78bfa;
          margin-left:   8px;
          vertical-align: middle;
        }

        .ef-toggle {
          background:  transparent;
          border:      1px solid var(--border-light);
          color:       var(--text-secondary);
          font-size:   12px;
          font-weight: 600;
          padding:     5px 14px;
          border-radius: var(--radius);
          cursor:      pointer;
          transition:  all 0.2s;
        }

        .ef-toggle:hover {
          border-color: var(--accent);
          color:        var(--text-primary);
        }

        .ef-search {
          width:         100%;
          background:    var(--bg-hover);
          border:        1px solid var(--border);
          border-radius: var(--radius);
          color:         var(--text-primary);
          font-size:     13px;
          padding:       8px 14px;
          margin-bottom: 1rem;
          outline:       none;
          transition:    border-color 0.2s;
        }

        .ef-search:focus { border-color: var(--accent); }
        .ef-search::placeholder { color: var(--text-muted); }

        .ef-table {
          display:  flex;
          flex-direction: column;
          gap:      1px;
          border:   1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .ef-row {
          display:    grid;
          grid-template-columns: 200px 1fr;
          min-height: 40px;
        }

        .ef-row--long {
          grid-template-columns: 1fr;
        }

        .ef-row:nth-child(odd) { background: var(--bg-hover); }
        .ef-row:hover          { background: rgba(108,99,255,0.06); }

        .ef-key {
          padding:     10px 14px;
          font-size:   12px;
          font-weight: 600;
          color:       var(--text-secondary);
          text-transform: capitalize;
          border-right: 1px solid var(--border);
          display:     flex;
          align-items: flex-start;
          word-break:  break-word;
        }

        .ef-row--long .ef-key {
          border-right:  none;
          border-bottom: 1px solid var(--border);
          background:    rgba(108,99,255,0.05);
        }

        .ef-val {
          padding:     10px 14px;
          font-size:   13px;
          color:       var(--text-primary);
          word-break:  break-word;
          line-height: 1.5;
        }

        .ef-null { color: var(--text-muted); }

        .ef-pre {
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size:   11px;
          color:       var(--text-secondary);
          white-space: pre-wrap;
          background:  var(--bg-secondary);
          border:      1px solid var(--border);
          border-radius: 6px;
          padding:     8px;
          overflow-x:  auto;
          margin:      0;
        }

        .ef-empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
