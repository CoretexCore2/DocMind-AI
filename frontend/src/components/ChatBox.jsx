// ChatBox.jsx
// Responsible for: Fixed chat panel at bottom — ask anything about the PDF
// Used by: App.jsx (Screen 3, alongside ResultsDashboard)

import { useState, useRef, useEffect } from "react";
import { chatWithPDF } from "../services/api";

const STARTERS = [
  "Summarize the key points",
  "What are the main risks?",
  "Who are the parties involved?",
  "What are the important dates?",
];

export default function ChatBox({ result }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const data = await chatWithPDF(q, {
        doc_type: result?.classification?.doc_type || "general",
        extracted_fields: result?.extracted_fields || {},
        intelligence: result?.intelligence || {},
        raw_text: result?.raw_text_preview || "",
      });

      const answer = data.answer || data.response || "No answer returned.";
      setMessages(prev => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      setError("Failed to get answer. Is the backend running?");
      setMessages(prev => [...prev, {
        role: "ai",
        text: "⚠ Could not reach the backend. Please ensure it is running.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* ── Toggle button */}
      <button
        className={`chat-toggle ${open ? "chat-toggle--open" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="Chat with PDF"
      >
        {open
          ? <span className="chat-toggle-icon">✕</span>
          : <>
            <span className="chat-toggle-icon">💬</span>
            <span className="chat-toggle-label">Chat with PDF</span>
            {messages.length > 0 && (
              <span className="chat-toggle-badge">{messages.filter(m => m.role === "ai").length}</span>
            )}
          </>
        }
      </button>

      {/* ── Chat panel */}
      <div className={`chat-panel ${open ? "chat-panel--open" : ""}`}>

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🤖</div>
            <div>
              <div className="chat-title">Ask about this document</div>
              <div className="chat-subtitle">{result.doc_type || "Document"}</div>
            </div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Messages */}
        <div className="chat-messages">

          {/* Welcome */}
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">🧠</div>
              <p className="chat-welcome-text">
                I've analyzed your document. Ask me anything about it — clauses, amounts, dates, risks, parties.
              </p>
              <div className="chat-starters">
                {STARTERS.map((s) => (
                  <button key={s} className="chat-starter" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
              {msg.role === "ai" && (
                <div className="chat-msg-avatar">🤖</div>
              )}
              <div className={`chat-bubble chat-bubble--${msg.role} ${msg.isError ? "chat-bubble--error" : ""}`}>
                {msg.text.split("\n").map((line, j) => (
                  <p key={j} style={{ margin: j > 0 ? "0.5rem 0 0" : 0 }}>{line}</p>
                ))}
              </div>
              {msg.role === "user" && (
                <div className="chat-msg-avatar chat-msg-avatar--user">👤</div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="chat-msg chat-msg--ai">
              <div className="chat-msg-avatar">🤖</div>
              <div className="chat-bubble chat-bubble--ai chat-bubble--typing">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything about this document…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className={`chat-send ${loading || !input.trim() ? "chat-send--disabled" : ""}`}
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? <div className="chat-send-spinner" /> : "→"}
          </button>
        </div>

        {error && <div className="chat-error">{error}</div>}
      </div>

      <style>{`
        /* Toggle */
        .chat-toggle {
          position:      fixed;
          bottom:        24px;
          right:         24px;
          z-index:       200;
          display:       flex;
          align-items:   center;
          gap:           8px;
          padding:       12px 22px;
          background:    var(--accent);
          color:         white;
          border:        none;
          border-radius: 50px;
          font-size:     14px;
          font-weight:   700;
          cursor:        pointer;
          box-shadow:    0 4px 24px rgba(108,99,255,0.5);
          transition:    all 0.3s ease;
        }

        .chat-toggle:hover { background: var(--accent-hover); transform: translateY(-2px); }
        .chat-toggle--open {
          padding:       12px 16px;
          background:    var(--bg-card);
          border:        1px solid var(--border-light);
          color:         var(--text-secondary);
          box-shadow:    var(--shadow);
        }

        .chat-toggle-icon  { font-size: 16px; }
        .chat-toggle-label { letter-spacing: 0.01em; }

        .chat-toggle-badge {
          background:    rgba(255,255,255,0.25);
          border-radius: 20px;
          font-size:     11px;
          font-weight:   800;
          padding:       1px 7px;
        }

        /* Panel */
        .chat-panel {
          position:      fixed;
          bottom:        0;
          right:         24px;
          z-index:       190;
          width:         420px;
          max-width:     calc(100vw - 48px);
          height:        560px;
          max-height:    80vh;
          background:    var(--bg-card);
          border:        1px solid var(--border-light);
          border-bottom: none;
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          display:       flex;
          flex-direction: column;
          box-shadow:    var(--shadow-lg);
          transform:     translateY(100%);
          opacity:       0;
          pointer-events: none;
          transition:    transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
        }

        .chat-panel--open {
          transform:      translateY(0);
          opacity:        1;
          pointer-events: all;
        }

        /* Chat header */
        .chat-header {
          display:         flex;
          align-items:     center;
          justify-content: space-between;
          padding:         1rem 1.25rem;
          border-bottom:   1px solid var(--border);
          flex-shrink:     0;
        }

        .chat-header-left {
          display:     flex;
          align-items: center;
          gap:         10px;
        }

        .chat-avatar {
          width:         36px;
          height:        36px;
          background:    var(--accent-glow);
          border:        1px solid rgba(108,99,255,0.3);
          border-radius: 50%;
          display:       flex;
          align-items:   center;
          justify-content: center;
          font-size:     18px;
        }

        .chat-title    { font-size: 14px; font-weight: 700; color: var(--text-primary); }
        .chat-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

        .chat-close {
          background:    transparent;
          border:        none;
          color:         var(--text-muted);
          font-size:     16px;
          cursor:        pointer;
          padding:       4px 8px;
          border-radius: 6px;
          transition:    all 0.15s;
        }

        .chat-close:hover { background: var(--bg-hover); color: var(--text-primary); }

        /* Messages */
        .chat-messages {
          flex:       1;
          overflow-y: auto;
          padding:    1rem;
          display:    flex;
          flex-direction: column;
          gap:        12px;
          scroll-behavior: smooth;
        }

        /* Welcome */
        .chat-welcome {
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            0.75rem;
          padding:        1rem;
          text-align:     center;
        }

        .chat-welcome-icon  { font-size: 2rem; }

        .chat-welcome-text {
          font-size:   13px;
          color:       var(--text-secondary);
          line-height: 1.6;
          max-width:   280px;
        }

        .chat-starters {
          display:   flex;
          flex-wrap: wrap;
          gap:       6px;
          justify-content: center;
        }

        .chat-starter {
          padding:       6px 14px;
          background:    var(--bg-hover);
          border:        1px solid var(--border-light);
          border-radius: 20px;
          font-size:     12px;
          color:         var(--text-secondary);
          cursor:        pointer;
          transition:    all 0.15s;
        }

        .chat-starter:hover {
          border-color: var(--accent);
          color:        var(--text-primary);
          background:   var(--accent-glow);
        }

        /* Messages */
        .chat-msg {
          display:     flex;
          align-items: flex-end;
          gap:         8px;
        }

        .chat-msg--user { flex-direction: row-reverse; }

        .chat-msg-avatar {
          width:         28px;
          height:        28px;
          border-radius: 50%;
          background:    var(--bg-hover);
          border:        1px solid var(--border);
          display:       flex;
          align-items:   center;
          justify-content: center;
          font-size:     14px;
          flex-shrink:   0;
        }

        .chat-msg-avatar--user {
          background: var(--accent-glow);
          border-color: rgba(108,99,255,0.3);
        }

        .chat-bubble {
          max-width:     80%;
          padding:       10px 14px;
          border-radius: 14px;
          font-size:     13px;
          line-height:   1.55;
        }

        .chat-bubble--ai {
          background:         var(--bg-hover);
          border:             1px solid var(--border);
          border-bottom-left-radius: 4px;
          color:              var(--text-primary);
        }

        .chat-bubble--user {
          background:          var(--accent);
          border-bottom-right-radius: 4px;
          color:               white;
        }

        .chat-bubble--error {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }

        .chat-bubble--typing {
          padding: 14px 18px;
        }

        /* Typing dots */
        .typing-dots {
          display: flex;
          gap:     4px;
          align-items: center;
        }

        .typing-dots span {
          width:         7px;
          height:        7px;
          border-radius: 50%;
          background:    var(--accent);
          animation:     pulse 1s ease-in-out infinite;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* Input area */
        .chat-input-area {
          padding:       0.75rem 1rem;
          border-top:    1px solid var(--border);
          display:       flex;
          align-items:   flex-end;
          gap:           8px;
          flex-shrink:   0;
        }

        .chat-input {
          flex:          1;
          background:    var(--bg-hover);
          border:        1px solid var(--border);
          border-radius: var(--radius);
          color:         var(--text-primary);
          font-size:     13px;
          padding:       10px 14px;
          resize:        none;
          outline:       none;
          font-family:   var(--font);
          line-height:   1.5;
          max-height:    100px;
          overflow-y:    auto;
          transition:    border-color 0.2s;
        }

        .chat-input:focus        { border-color: var(--accent); }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-input:disabled     { opacity: 0.6; }

        .chat-send {
          width:         40px;
          height:        40px;
          background:    var(--accent);
          border:        none;
          border-radius: var(--radius);
          color:         white;
          font-size:     18px;
          font-weight:   700;
          cursor:        pointer;
          flex-shrink:   0;
          display:       flex;
          align-items:   center;
          justify-content: center;
          transition:    all 0.2s;
        }

        .chat-send:hover:not(:disabled) {
          background: var(--accent-hover);
          transform:  scale(1.05);
        }

        .chat-send--disabled { opacity: 0.4; cursor: not-allowed; }

        .chat-send-spinner {
          width:         16px;
          height:        16px;
          border:        2px solid rgba(255,255,255,0.3);
          border-top:    2px solid white;
          border-radius: 50%;
          animation:     spin 0.7s linear infinite;
        }

        .chat-error {
          padding:    8px 1rem;
          font-size:  12px;
          color:      #f87171;
          background: rgba(239,68,68,0.08);
          border-top: 1px solid rgba(239,68,68,0.15);
        }

        @media (max-width: 480px) {
          .chat-panel { right: 0; width: 100vw; max-width: 100vw; border-radius: 0; }
          .chat-toggle { right: 16px; bottom: 16px; }
        }
      `}</style>
    </>
  );
}
