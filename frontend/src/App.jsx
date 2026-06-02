import { useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import AnalyzePanel from "./components/AnalyzePanel.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import { analyzeVideos, askQuestion } from "./api/client.js";
import { getTimeString } from "./utils/format.js";

export default function App() {
  // ── Analysis state ─────────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Derived: are videos indexed?
  const isReady = !!analysisData;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async (ytUrl, igUrl) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisData(null);
    setMessages([]);

    try {
      const data = await analyzeVideos(ytUrl, igUrl);
      setAnalysisData(data);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSend = useCallback(async (question) => {
    if (!isReady || isTyping) return;

    // Append user message immediately
    const userMsg = {
      role: "user",
      content: question,
      time: getTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { answer, sources } = await askQuestion(question, null);

      const aiMsg = {
        role: "ai",
        content: answer,
        sources,
        time: getTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        role: "ai",
        content: `⚠ Error: ${err.message}`,
        time: getTimeString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [isReady, isTyping]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <Header />

      <main className="main">
        {/* ── Left Panel ── */}
        <aside className="left-panel">
          <AnalyzePanel
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
            error={analyzeError}
            analysisData={analysisData}
          />
          <StatsPanel analysisData={analysisData} />
        </aside>

        {/* ── Right Panel / Chat ── */}
        <section className="chat-panel">
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            isReady={isReady}
            onSend={handleSend}
          />
        </section>
      </main>
    </div>
  );
}
