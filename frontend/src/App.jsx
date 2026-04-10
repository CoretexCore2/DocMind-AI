// App.jsx
// Responsible for: Main app, screen management, global state

import { useState } from "react";
import UploadZone from "./components/UploadZone";
import PipelineProgress from "./components/PipelineProgress";
import ResultsDashboard from "./components/ResultsDashboard";
import ChatBox from "./components/ChatBox";
import { analyzePDF } from "./services/api";
import "./App.css";

// ── Screens
const SCREENS = {
  UPLOAD: "upload",
  PIPELINE: "pipeline",
  RESULTS: "results",
};

// ── Pipeline stages
const STAGES = [
  { id: 1, label: "Reading file", key: "file_read" },
  { id: 2, label: "Validating PDF", key: "validation" },
  { id: 3, label: "Extracting text", key: "preprocessing" },
  { id: 4, label: "Classifying document", key: "classification" },
  { id: 5, label: "Selecting strategy", key: "strategy" },
  { id: 6, label: "Extracting fields", key: "extraction" },
  { id: 7, label: "Running intelligence", key: "intelligence" },
  { id: 8, label: "Generating summary", key: "summary" },
];

export default function App() {
  const [screen, setScreen] = useState(SCREENS.UPLOAD);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [filename, setFilename] = useState("");

  // ── Simulate pipeline stage progression
  const simulatePipeline = () => {
    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      setActiveStage(stage);
      if (stage >= STAGES.length) clearInterval(interval);
    }, 1800);
    return interval;
  };

  // ── Handle file upload + analysis
  const handleFileAccepted = async (file) => {
    setError(null);
    setFilename(file.name);
    setScreen(SCREENS.PIPELINE);
    setActiveStage(1);

    const interval = simulatePipeline();

    try {
      const data = await analyzePDF(file, setUploadPct);

      clearInterval(interval);
      setActiveStage(STAGES.length);

      if (data.status === "error") {
        setError(data.error || "Something went wrong.");
        setScreen(SCREENS.UPLOAD);
        return;
      }

      // Small delay so user sees all stages complete
      setTimeout(() => {
        setResult(data);
        setScreen(SCREENS.RESULTS);
      }, 800);

    } catch (err) {
      clearInterval(interval);
      setError(err.message || "Failed to connect to backend.");
      setScreen(SCREENS.UPLOAD);
    }
  };

  // ── Reset everything
  const handleReset = () => {
    setScreen(SCREENS.UPLOAD);
    setResult(null);
    setError(null);
    setActiveStage(0);
    setUploadPct(0);
    setFilename("");
  };

  return (
    <div className="app">

      {/* ── Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">PDF Intelligence Engine</span>
          </div>
          {screen === SCREENS.RESULTS && (
            <button className="new-btn" onClick={handleReset}>
              + Analyze New PDF
            </button>
          )}
        </div>
      </header>

      {/* ── Main content */}
      <main className="app-main">

        {/* Screen 1 — Upload */}
        {screen === SCREENS.UPLOAD && (
          <UploadZone
            onFileAccepted={handleFileAccepted}
            error={error}
          />
        )}

        {/* Screen 2 — Pipeline */}
        {screen === SCREENS.PIPELINE && (
          <PipelineProgress
            stages={STAGES}
            activeStage={activeStage}
            filename={filename}
            uploadPct={uploadPct}
          />
        )}

        {/* Screen 3 — Results */}
        {screen === SCREENS.RESULTS && result && (
          <>
            <ResultsDashboard result={result} />
            <ChatBox result={result} />
          </>
        )}

      </main>

    </div>
  );
}