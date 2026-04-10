// PipelineProgress.jsx
// Responsible for: Animated 8-stage pipeline tracker while backend processes
// Used by: App.jsx (Screen 2)

export default function PipelineProgress({ stages, activeStage, filename, uploadPct }) {
  const totalStages   = stages.length;
  const pct           = Math.round((activeStage / totalStages) * 100);
  const allDone       = activeStage >= totalStages;

  return (
    <div className="pipeline-page fade-in">

      {/* ── Header */}
      <div className="pipeline-header">
        <div className="pp-spinner-wrap">
          {allDone
            ? <div className="pp-done-icon">✓</div>
            : <div className="pp-spinner" />
          }
        </div>
        <h2 className="pp-title">
          {allDone ? "Analysis complete!" : "Analyzing document…"}
        </h2>
        <p className="pp-subtitle">
          {filename && <span className="pp-filename">📄 {filename}</span>}
          {!allDone && " — processing through AI pipeline"}
        </p>
      </div>

      {/* ── Progress bar */}
      <div className="pp-bar-wrap">
        <div className="pp-bar-track">
          <div className="pp-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="pp-bar-labels">
          <span className="pp-bar-label">
            Stage {Math.min(activeStage, totalStages)} of {totalStages}
          </span>
          <span className="pp-bar-pct">{pct}%</span>
        </div>
      </div>

      {/* ── Stage list */}
      <div className="pp-stages">
        {stages.map((stage, idx) => {
          const stageNum = idx + 1;
          const status =
            stageNum < activeStage  ? "done"
            : stageNum === activeStage ? "active"
            : "pending";

          return (
            <div key={stage.id} className={`pp-stage pp-stage--${status}`}>

              <div className="pp-stage-icon-col">
                <div className={`pp-stage-dot pp-stage-dot--${status}`}>
                  {status === "done"   && <span className="pp-dot-check">✓</span>}
                  {status === "active" && <div className="pp-dot-pulse" />}
                  {status === "pending" && <span className="pp-dot-num">{stageNum}</span>}
                </div>
                {idx < stages.length - 1 && (
                  <div className={`pp-connector ${status === "done" ? "pp-connector--done" : ""}`} />
                )}
              </div>

              <div className="pp-stage-body">
                <div className="pp-stage-label">{stage.label}</div>
                {status === "active" && (
                  <div className="pp-stage-status">
                    <div className="pp-loading-dots">
                      <span /><span /><span />
                    </div>
                    <span className="pp-running-text">running</span>
                  </div>
                )}
                {status === "done" && (
                  <div className="pp-stage-done-text">completed</div>
                )}
              </div>

              {status === "done" && (
                <div className="pp-stage-checkmark">✓</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Upload progress (if relevant) */}
      {uploadPct > 0 && uploadPct < 100 && (
        <div className="pp-upload-note">
          <span>Uploading file…</span>
          <span className="pp-upload-pct">{uploadPct}%</span>
        </div>
      )}

      <style>{`
        .pipeline-page {
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            2rem;
          padding:        2rem 0 4rem;
          max-width:      520px;
          margin:         0 auto;
        }

        /* Header */
        .pipeline-header {
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            0.5rem;
          text-align:     center;
        }

        .pp-spinner-wrap { margin-bottom: 0.5rem; }

        .pp-spinner {
          width:         48px;
          height:        48px;
          border:        3px solid var(--border);
          border-top:    3px solid var(--accent);
          border-radius: 50%;
          animation:     spin 0.9s linear infinite;
        }

        .pp-done-icon {
          width:         48px;
          height:        48px;
          border-radius: 50%;
          background:    rgba(34,197,94,0.15);
          border:        2px solid var(--success);
          display:       flex;
          align-items:   center;
          justify-content: center;
          color:         var(--success);
          font-size:     22px;
          font-weight:   700;
        }

        .pp-title {
          font-size:   1.6rem;
          font-weight: 800;
          color:       var(--text-primary);
          letter-spacing: -0.02em;
        }

        .pp-subtitle {
          font-size: 0.9rem;
          color:     var(--text-secondary);
        }

        .pp-filename {
          font-weight: 600;
          color:       var(--text-primary);
        }

        /* Progress bar */
        .pp-bar-wrap { width: 100%; }

        .pp-bar-track {
          height:        8px;
          background:    var(--border);
          border-radius: 4px;
          overflow:      hidden;
        }

        .pp-bar-fill {
          height:     100%;
          background: linear-gradient(90deg, var(--accent) 0%, #a78bfa 60%, #38bdf8 100%);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-bar-labels {
          display:         flex;
          justify-content: space-between;
          margin-top:      6px;
        }

        .pp-bar-label,
        .pp-bar-pct {
          font-size:   12px;
          font-weight: 600;
          color:       var(--text-muted);
        }

        .pp-bar-pct { color: var(--accent); }

        /* Stage list */
        .pp-stages {
          width:      100%;
          background: var(--bg-card);
          border:     1px solid var(--border);
          border-radius: var(--radius-lg);
          padding:    1.25rem 1.5rem;
          display:    flex;
          flex-direction: column;
          gap:        0;
        }

        .pp-stage {
          display:    flex;
          align-items: flex-start;
          gap:        14px;
          min-height: 52px;
          transition: opacity 0.3s;
        }

        .pp-stage--pending { opacity: 0.4; }
        .pp-stage--active  { opacity: 1; }
        .pp-stage--done    { opacity: 0.75; }

        /* Icon column */
        .pp-stage-icon-col {
          display:        flex;
          flex-direction: column;
          align-items:    center;
          flex-shrink:    0;
        }

        .pp-stage-dot {
          width:         28px;
          height:        28px;
          border-radius: 50%;
          display:       flex;
          align-items:   center;
          justify-content: center;
          flex-shrink:   0;
          font-size:     12px;
          font-weight:   700;
          transition:    all 0.3s;
        }

        .pp-stage-dot--done {
          background: rgba(34,197,94,0.15);
          border:     2px solid var(--success);
          color:      var(--success);
        }

        .pp-stage-dot--active {
          background: rgba(108,99,255,0.15);
          border:     2px solid var(--accent);
          position:   relative;
          overflow:   visible;
        }

        .pp-stage-dot--pending {
          background: var(--bg-hover);
          border:     2px solid var(--border-light);
          color:      var(--text-muted);
        }

        .pp-dot-check { color: var(--success); font-size: 14px; }
        .pp-dot-num   { color: var(--text-muted); font-size: 11px; }

        .pp-dot-pulse {
          width:         10px;
          height:        10px;
          border-radius: 50%;
          background:    var(--accent);
          animation:     pulse 1s ease-in-out infinite;
        }

        .pp-connector {
          width:      2px;
          flex:       1;
          min-height: 18px;
          background: var(--border);
          margin:     2px 0;
          transition: background 0.4s;
        }

        .pp-connector--done {
          background: var(--success);
        }

        /* Stage body */
        .pp-stage-body {
          flex:        1;
          padding:     4px 0 16px;
          display:     flex;
          flex-direction: column;
          gap:         4px;
        }

        .pp-stage-label {
          font-size:   14px;
          font-weight: 600;
          color:       var(--text-primary);
        }

        .pp-stage-status {
          display:     flex;
          align-items: center;
          gap:         8px;
        }

        .pp-loading-dots {
          display: flex;
          gap:     3px;
        }

        .pp-loading-dots span {
          width:         4px;
          height:        4px;
          border-radius: 50%;
          background:    var(--accent);
          animation:     pulse 1s ease-in-out infinite;
        }

        .pp-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .pp-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        .pp-running-text {
          font-size:   11px;
          color:       var(--accent);
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .pp-stage-done-text {
          font-size: 11px;
          color:     var(--success);
          font-weight: 500;
        }

        .pp-stage-checkmark {
          font-size:  13px;
          color:      var(--success);
          padding:    4px 0;
          flex-shrink: 0;
        }

        /* Upload note */
        .pp-upload-note {
          display:         flex;
          justify-content: space-between;
          width:           100%;
          padding:         10px 16px;
          background:      var(--bg-card);
          border:          1px solid var(--border);
          border-radius:   var(--radius);
          font-size:       13px;
          color:           var(--text-secondary);
        }

        .pp-upload-pct { font-weight: 700; color: var(--accent); }
      `}</style>
    </div>
  );
}
