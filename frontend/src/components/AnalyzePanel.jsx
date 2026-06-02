import { useState } from "react";

const PROGRESS_STEPS = [
  { id: "meta",    label: "Fetching video metadata"    },
  { id: "audio",   label: "Downloading audio"           },
  { id: "transcribe", label: "Transcribing with AssemblyAI" },
  { id: "embed",   label: "Generating embeddings"      },
  { id: "store",   label: "Storing in Pinecone"         },
];

/**
 * Left panel — URL inputs, analyze button, loading progress.
 *
 * Props:
 *  - onAnalyze(ytUrl, igUrl) → void
 *  - isLoading: bool
 *  - error: string | null
 *  - analysisData: object | null  (returned from backend)
 */
export default function AnalyzePanel({ onAnalyze, isLoading, error, analysisData }) {
  const [ytUrl, setYtUrl] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [step, setStep] = useState(0); // simulate progress during loading

  // Simulate step progression while loading
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ytUrl.trim() || !igUrl.trim()) return;
    setStep(0);
    onAnalyze(ytUrl.trim(), igUrl.trim());
  };

  // Auto-advance step every ~4s during loading (visual only — real progress is backend-side)
  // We just cycle through the 5 steps evenly over a ~20s estimated window
  useState(() => {
    if (!isLoading) { setStep(0); return; }
    const id = setInterval(() => {
      setStep((s) => (s < PROGRESS_STEPS.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(id);
  });

  const canSubmit = ytUrl.trim() && igUrl.trim() && !isLoading;

  return (
    <>
      {/* ── URL Input Form ── */}
      <div className="section-header">
        <span className="section-dot" />
        <span className="section-title">Video Sources</span>
      </div>

      <form className="analyze-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="yt-url">
            <span className="platform-badge youtube">▶ YouTube</span>
          </label>
          <input
            id="yt-url"
            className="url-input"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="ig-url">
            <span className="platform-badge instagram">◈ Instagram</span>
          </label>
          <input
            id="ig-url"
            className="url-input"
            type="url"
            placeholder="https://instagram.com/reel/..."
            value={igUrl}
            onChange={(e) => setIgUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button
          id="analyze-btn"
          type="submit"
          className="analyze-btn"
          disabled={!canSubmit}
        >
          {isLoading ? (
            <>
              <span className="step-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Analyzing…
            </>
          ) : (
            <>⚡ Analyze Videos</>
          )}
        </button>
      </form>

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner" style={{ margin: "0 1.5rem 1rem" }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Progress Steps ── */}
      {isLoading && (
        <div className="progress-panel">
          <div className="progress-title">
            <span className="step-spinner" />
            Processing…
          </div>
          {PROGRESS_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`progress-step ${i < step ? "done" : i === step ? "active" : ""}`}
            >
              <span className="step-icon">
                {i < step ? "✓" : i === step ? "›" : "·"}
              </span>
              {s.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
