// ResultsDashboard.jsx
// Responsible for: Full results screen — doc type, confidence, summaries,
//                  extracted fields, risk flags, entities, health score
// Used by: App.jsx (Screen 3)

import SummaryCards from "./SummaryCards";
import RiskFlags from "./RiskFlags";
import ExtractedFields from "./ExtractedFields";

function HealthScore({ score }) {
  const pct = Math.min(100, Math.max(0, score || 0));
  const color = pct >= 75 ? "var(--success)"
    : pct >= 45 ? "var(--warning)"
      : "var(--danger)";
  const label = pct >= 75 ? "Good" : pct >= 45 ? "Fair" : "Poor";

  // SVG circle math
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="health-card card">
      <div className="card-title">Document Health</div>
      <div className="health-body">
        <svg className="health-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
          <text x="50" y="50" textAnchor="middle" dy="0.35em"
            fill={color} fontSize="20" fontWeight="800">
            {pct}
          </text>
        </svg>
        <div className="health-label" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

function DocTypeCard({ docType, confidence, strategy }) {
  const pct = Math.round((confidence || 0) * 100);
  const conf = pct >= 80 ? "green" : pct >= 50 ? "yellow" : "red";

  return (
    <div className="doctype-card card">
      <div className="card-title">Document Type</div>
      <div className="doctype-name">{docType || "Unknown"}</div>
      <div className="doctype-meta">
        <span className={`badge badge-${conf}`}>
          {pct}% confidence
        </span>
        {strategy && (
          <span className="badge badge-blue">⚙ {strategy}</span>
        )}
      </div>
    </div>
  );
}

function EntitiesSection({ intelligence }) {
  const entities = intelligence?.entities || {};
  const entries = Object.entries(entities).filter(([, v]) =>
    Array.isArray(v) ? v.length > 0 : v
  );

  if (entries.length === 0) return null;

  const ENTITY_ICONS = {
    persons: "👤",
    organizations: "🏢",
    dates: "📅",
    amounts: "💰",
    locations: "📍",
    emails: "📧",
    phones: "📞",
    urls: "🔗",
  };

  return (
    <div className="card">
      <div className="card-title">Detected Entities</div>
      <div className="entity-grid">
        {entries.map(([type, values]) => {
          const items = Array.isArray(values) ? values : [values];
          return (
            <div key={type} className="entity-group">
              <div className="entity-type">
                <span>{ENTITY_ICONS[type] || "•"}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
                <span className="entity-count">{items.length}</span>
              </div>
              <div className="entity-items">
                {items.slice(0, 8).map((item, i) => (
                  <span key={i} className="entity-chip">{item}</span>
                ))}
                {items.length > 8 && (
                  <span className="entity-chip entity-chip--more">+{items.length - 8}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KeyInsights({ intelligence }) {
  const insights = intelligence?.key_insights || intelligence?.insights || [];
  if (!insights.length) return null;

  return (
    <div className="card">
      <div className="card-title">Key Insights</div>
      <ul className="insights-list">
        {insights.map((ins, i) => (
          <li key={i} className="insight-item">
            <span className="insight-bullet">→</span>
            <span>{typeof ins === "string" ? ins : ins.text || ins.insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultsDashboard({ result }) {
  const doc_type = result?.classification?.doc_type || "Unknown";
  const confidence = result?.classification?.confidence || 0;
  const strategy = result?.classification?.strategy_used || "";
  const extracted_fields = result?.extracted_fields || {};
  const intelligence = {
    ...result?.intelligence,
    summaries: result?.summaries,
    risk_flags: result?.risks?.flags || [],
    key_entities: result?.entities || {},
    document_health_score: result?.intelligence?.completeness_score
      ? result.intelligence.completeness_score * 100
      : null,
  };
  const pages = result?.metadata?.page_count || null;
  const processing_time = null;

  const healthScore = intelligence?.document_health_score
    ?? intelligence?.health_score
    ?? null;

  return (
    <div className="results-page fade-in">

      {/* ── Top row: doc type + health */}
      <div className="results-top">
        <DocTypeCard
          docType={doc_type}
          confidence={confidence}
          strategy={strategy}
        />

        <div className="results-meta-row">
          {healthScore !== null && (
            <HealthScore score={healthScore} />
          )}

          {/* Quick stats */}
          <div className="stats-card card">
            <div className="card-title">Document Stats</div>
            <div className="stats-grid">
              {pages && (
                <div className="stat-item">
                  <div className="stat-val">{pages}</div>
                  <div className="stat-lbl">Pages</div>
                </div>
              )}
              {processing_time && (
                <div className="stat-item">
                  <div className="stat-val">{Number(processing_time).toFixed(1)}s</div>
                  <div className="stat-lbl">Process time</div>
                </div>
              )}
              {extracted_fields && (
                <div className="stat-item">
                  <div className="stat-val">{Object.keys(extracted_fields).length}</div>
                  <div className="stat-lbl">Fields found</div>
                </div>
              )}
              {intelligence?.risk_flags && (
                <div className="stat-item">
                  <div className="stat-val" style={{
                    color: intelligence.risk_flags.length > 0 ? "var(--warning)" : "var(--success)"
                  }}>
                    {intelligence.risk_flags.length}
                  </div>
                  <div className="stat-lbl">Risk flags</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summaries */}
      {intelligence?.summaries && (
        <SummaryCards intelligence={intelligence} />
      )}

      {/* ── Key Insights */}
      <KeyInsights intelligence={intelligence} />

      {/* ── Extracted Fields */}
      {extracted_fields && (
        <ExtractedFields fields={extracted_fields} />
      )}

      {/* ── Risk + Entities row */}
      <div className="results-bottom-row">
        <RiskFlags intelligence={intelligence} />
        <EntitiesSection intelligence={intelligence} />
      </div>

      <style>{`
        .results-page {
          display:        flex;
          flex-direction: column;
          gap:            1.25rem;
          padding-bottom: 12rem; /* space for ChatBox */
        }

        /* Top row */
        .results-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 768px) {
          .results-top { grid-template-columns: 1fr; }
        }

        /* Doc type card */
        .doctype-card { display: flex; flex-direction: column; gap: 0.75rem; }

        .doctype-name {
          font-size:      2rem;
          font-weight:    800;
          color:          var(--text-primary);
          letter-spacing: -0.02em;
          line-height:    1.2;
          word-break:     break-word;
        }

        .doctype-meta { display: flex; gap: 8px; flex-wrap: wrap; }

        /* Meta row (health + stats) */
        .results-meta-row {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Health */
        .health-card  { }
        .health-body  {
          display:     flex;
          align-items: center;
          gap:         1.25rem;
        }

        .health-svg {
          width:  90px;
          height: 90px;
          flex-shrink: 0;
        }

        .health-label {
          font-size:   1.5rem;
          font-weight: 800;
        }

        /* Stats */
        .stats-card { flex: 1; }

        .stats-grid {
          display:               grid;
          grid-template-columns: repeat(2, 1fr);
          gap:                   0.75rem;
        }

        .stat-item {
          background:    var(--bg-hover);
          border-radius: var(--radius);
          padding:       12px;
          text-align:    center;
        }

        .stat-val {
          font-size:   1.6rem;
          font-weight: 800;
          color:       var(--accent);
          line-height: 1;
        }

        .stat-lbl {
          font-size:  11px;
          color:      var(--text-muted);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Entities */
        .entity-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .entity-group { display: flex; flex-direction: column; gap: 6px; }

        .entity-type {
          display:     flex;
          align-items: center;
          gap:         6px;
          font-size:   12px;
          font-weight: 700;
          color:       var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .entity-count {
          display:       inline-flex;
          align-items:   center;
          justify-content: center;
          min-width:     18px;
          height:        18px;
          padding:       0 5px;
          background:    var(--bg-hover);
          border:        1px solid var(--border-light);
          border-radius: 10px;
          font-size:     10px;
          color:         var(--text-muted);
        }

        .entity-items { display: flex; flex-wrap: wrap; gap: 6px; }

        .entity-chip {
          padding:       4px 10px;
          background:    var(--bg-hover);
          border:        1px solid var(--border);
          border-radius: 20px;
          font-size:     12px;
          color:         var(--text-secondary);
          transition:    all 0.15s;
        }

        .entity-chip:hover { border-color: var(--accent); color: var(--text-primary); }
        .entity-chip--more { color: var(--text-muted); }

        /* Insights */
        .insights-list {
          list-style: none;
          display:    flex;
          flex-direction: column;
          gap:        10px;
        }

        .insight-item {
          display:     flex;
          align-items: flex-start;
          gap:         10px;
          font-size:   14px;
          color:       var(--text-secondary);
          line-height: 1.5;
        }

        .insight-bullet {
          color:       var(--accent);
          font-weight: 700;
          flex-shrink: 0;
          margin-top:  1px;
        }

        /* Bottom row */
        .results-bottom-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .results-bottom-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
