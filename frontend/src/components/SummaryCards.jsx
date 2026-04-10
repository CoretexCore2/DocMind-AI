// SummaryCards.jsx
// Responsible for: Displaying brief / standard / detailed summaries
// Used by: ResultsDashboard.jsx

import { useState } from "react";

const TABS = [
  { key: "brief",    label: "Brief",    icon: "⚡" },
  { key: "standard", label: "Standard", icon: "📋" },
  { key: "detailed", label: "Detailed", icon: "🔍" },
];

export default function SummaryCards({ intelligence }) {
  const [activeTab, setActiveTab] = useState("brief");

  const summaries = intelligence?.summaries || {};
  const content   = summaries[activeTab] || summaries?.brief || "No summary available.";

  return (
    <div className="summary-wrap card">
      <div className="card-title">Summary</div>

      {/* Tab bar */}
      <div className="sum-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`sum-tab ${activeTab === t.key ? "sum-tab--active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="sum-content">
        {content.split("\n").filter(Boolean).map((para, i) => (
          <p key={i} className="sum-para">{para}</p>
        ))}
      </div>

      <style>{`
        .summary-wrap { display: flex; flex-direction: column; gap: 1rem; }

        .sum-tabs {
          display:       flex;
          gap:           6px;
          background:    var(--bg-hover);
          border-radius: var(--radius);
          padding:       4px;
          width:         fit-content;
        }

        .sum-tab {
          display:       flex;
          align-items:   center;
          gap:           6px;
          padding:       6px 16px;
          border-radius: 8px;
          border:        none;
          background:    transparent;
          color:         var(--text-secondary);
          font-size:     13px;
          font-weight:   600;
          cursor:        pointer;
          transition:    all 0.2s;
        }

        .sum-tab:hover { color: var(--text-primary); }

        .sum-tab--active {
          background: var(--bg-card);
          color:      var(--text-primary);
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
        }

        .sum-content { display: flex; flex-direction: column; gap: 0.75rem; }

        .sum-para {
          font-size:   0.925rem;
          color:       var(--text-secondary);
          line-height: 1.75;
        }
      `}</style>
    </div>
  );
}
