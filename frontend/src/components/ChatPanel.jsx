import { useEffect, useRef, useState } from "react";
import { getTimeString, scrollToBottom } from "../utils/format.js";

// ── Suggested questions shown before first chat ──────────────────────────────
const SUGGESTIONS = [
  "What are the main topics covered in both videos?",
  "Which video has a stronger call to action?",
  "Summarize the YouTube video in 3 bullet points.",
  "Compare the content style of both creators.",
  "What tips or advice are mentioned in the Instagram video?",
];

// ── Single message bubble ─────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`message ${isUser ? "user" : "ai"}`}>
      <div className="message-avatar">{isUser ? "👤" : "🧠"}</div>
      <div className="message-content">
        <div className="message-bubble">{msg.content}</div>
        {msg.sources?.length > 0 && (
          <div className="message-sources">
            {msg.sources.slice(0, 4).map((s, i) => (
              <span key={i} className="source-chip" title={s.snippet}>
                {s.videoId} · chunk {s.chunkIndex}
              </span>
            ))}
          </div>
        )}
        <span className="message-time">{msg.time}</span>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message ai">
      <div className="message-avatar">🧠</div>
      <div className="message-content">
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

// ── Welcome / empty state ─────────────────────────────────────────────────────
function WelcomeState({ isReady, onSuggest }) {
  return (
    <div className="welcome-state">
      <div className="welcome-icon">🧠</div>

      <div>
        <h1 className="welcome-title">TechSolve AI</h1>
        <p className="welcome-subtitle">
          {isReady
            ? "Your videos are indexed! Ask me anything about their content."
            : "Paste your YouTube and Instagram URLs on the left, then click Analyze to get started."}
        </p>
      </div>

      {!isReady && (
        <div className="welcome-steps">
          <div className="welcome-step">
            <div className="welcome-step-num">1</div>
            Paste a YouTube URL in the left panel
          </div>
          <div className="welcome-step">
            <div className="welcome-step-num">2</div>
            Paste an Instagram Reel URL
          </div>
          <div className="welcome-step">
            <div className="welcome-step-num">3</div>
            Click Analyze — then ask questions here!
          </div>
        </div>
      )}

      {isReady && (
        <div className="welcome-steps" style={{ width: "100%", maxWidth: 520 }}>
          {SUGGESTIONS.map((q) => (
            <div
              key={q}
              className="welcome-step"
              style={{ cursor: "pointer" }}
              onClick={() => onSuggest(q)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSuggest(q)}
            >
              <div className="welcome-step-num">?</div>
              {q}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main chat interface component.
 *
 * Props:
 *  - messages: Array<{role, content, sources?, time}>
 *  - isTyping: bool
 *  - isReady: bool  (videos have been analyzed)
 *  - onSend(question: string): void
 */
export default function ChatPanel({ messages, isTyping, isReady, onSend }) {
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    scrollToBottom(messagesRef.current);
  }, [messages, isTyping]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || !isReady || isTyping) return;
    setInput("");
    onSend(q);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggest = (q) => {
    if (!isReady || isTyping) return;
    onSend(q);
  };

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const hasMessages = messages.length > 0;
  const canSend = input.trim() && isReady && !isTyping;

  return (
    <>
      {/* Chat header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className={`chat-status-dot ${isReady ? "" : "inactive"}`} />
          <div>
            <div className="chat-title">Chat with your Videos</div>
            <div className="chat-subtitle">
              {isReady
                ? "Videos indexed — ask anything!"
                : "Analyze videos to enable chat"}
            </div>
          </div>
        </div>
        <div className="chat-model-tag">
          ✦ Gemini 2.0 Flash
        </div>
      </div>

      {/* Messages area */}
      <div className="messages-area" ref={messagesRef}>
        {!hasMessages ? (
          <WelcomeState isReady={isReady} onSuggest={handleSuggest} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Suggestion chips (shown after analysis, before first message) */}
      {isReady && !hasMessages && (
        <div className="suggest-chips">
          {SUGGESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              className="suggest-chip"
              onClick={() => handleSuggest(q)}
              disabled={isTyping}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={
              isReady
                ? "Ask anything about the videos… (Enter to send)"
                : "Analyze videos first to enable chat"
            }
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={!isReady || isTyping}
          />
          <button
            id="send-btn"
            className="send-btn"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
        <div className="chat-input-hint">
          Shift + Enter for new line · Powered by Gemini 2.0 Flash + Pinecone RAG
        </div>
      </div>
    </>
  );
}
