// RiskFlags.jsx
// Responsible for: Displaying risk flags with severity coloring
// Used by: ResultsDashboard.jsx

const SEVERITY_MAP = {
  high: { color: "red", label: "High", icon: "🔴" },
  medium: { color: "yellow", label: "Medium", icon: "🟡" },
  low: { color: "green", label: "Low", icon: "🟢" },
};

function normalize(flag) {
  if (typeof flag === "string") {
    return { text: flag, severity: "medium" };
  }
  return {
    text: flag.description || flag.text || flag.flag || String(flag),
    severity: (flag.level || flag.severity || "medium").toLowerCase(),
    category: flag.category || "",
    recommendation: flag.recommendation || "",
  };
}

export default function RiskFlags({ intelligence }) {
  const rawFlags = intelligence?.risk_flags || [];
  const flags = rawFlags.map(normalize);

  if (flags.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Risk Flags</div>
        <div className="risk-empty">
          <span className="risk-empty-icon">✅</span>
          <span>No risk flags detected</span>
        </div>
        <RiskStyle />
      </div>
    );
  }

  const counts = {
    high: flags.filter(f => f.severity === "high").length,
    medium: flags.filter(f => f.severity === "medium").length,
    low: flags.filter(f => f.severity === "low").length,
  };

  return (
    <div className="card">
      <div className="card-title">Risk Flags</div>

      {/* Summary row */}
      <div className="risk-summary">
        {Object.entries(counts).map(([sev, count]) => count > 0 && (
          <div key={sev} className={`risk-count risk-count--${SEVERITY_MAP[sev].color}`}>
            <span className="risk-count-num">{count}</span>
            <span className="risk-count-label">{SEVERITY_MAP[sev].label}</span>
          </div>
        ))}
      </div>

      {/* Flag list */}
      <div className="risk-list">
        {flags.map((flag, i) => {
          const meta = SEVERITY_MAP[flag.severity] || SEVERITY_MAP.medium;
          return (
            <div key={i} className={`risk-item risk-item--${meta.color}`}>
              <span className="risk-item-icon">{meta.icon}</span>
              <div className="risk-item-body">
                <span className="risk-item-text">{flag.text}</span>
                {flag.recommendation && (
                  <span className="risk-item-rec">→ {flag.recommendation}</span>
                )}
              </div>
              <span className={`badge badge-${meta.color === "red" ? "red" : meta.color === "yellow" ? "yellow" : "green"} risk-badge`}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>

      <RiskStyle />
    </div>
  );
}

function RiskStyle() {
  return (
    <style>{`
      .risk-empty {
        display:     flex;
        align-items: center;
        gap:         10px;
        color:       var(--success);
        font-size:   14px;
        padding:     0.5rem 0;
      }

      .risk-empty-icon { font-size: 1.4rem; }

      .risk-summary {
        display:     flex;
        gap:         10px;
        margin-bottom: 1rem;
        flex-wrap:   wrap;
      }

      .risk-count {
        display:        flex;
        flex-direction: column;
        align-items:    center;
        padding:        10px 20px;
        border-radius:  var(--radius);
        min-width:      70px;
      }

      .risk-count--red    { background: rgba(239,68,68,0.1);   border: 1px solid rgba(239,68,68,0.25); }
      .risk-count--yellow { background: rgba(245,158,11,0.1);  border: 1px solid rgba(245,158,11,0.25); }
      .risk-count--green  { background: rgba(34,197,94,0.1);   border: 1px solid rgba(34,197,94,0.25); }

      .risk-count-num {
        font-size:   1.5rem;
        font-weight: 800;
      }

      .risk-count--red    .risk-count-num { color: #f87171; }
      .risk-count--yellow .risk-count-num { color: #fbbf24; }
      .risk-count--green  .risk-count-num { color: #4ade80; }

      .risk-count-label {
        font-size:  11px;
        color:      var(--text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .risk-list { display: flex; flex-direction: column; gap: 8px; }

      .risk-item {
        display:       flex;
        align-items:   center;
        gap:           10px;
        padding:       10px 14px;
        border-radius: var(--radius);
        background:    var(--bg-hover);
        border-left:   3px solid transparent;
      }

      .risk-item--red    { border-left-color: var(--danger); }
      .risk-item--yellow { border-left-color: var(--warning); }
      .risk-item--green  { border-left-color: var(--success); }

      .risk-item-icon { font-size: 14px; flex-shrink: 0; }

      .risk-item-text {
        flex:        1;
        font-size:   13px;
        color:       var(--text-secondary);
        line-height: 1.4;
      }
      .risk-item-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .risk-item-rec {
        font-size: 11px;
        color: var(--text-muted);
        font-style: italic;
      }

      .risk-badge { margin-left: auto; flex-shrink: 0; }
    `}</style>
  );
}
