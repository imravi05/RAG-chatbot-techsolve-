import {
  formatNumber,
  formatDuration,
  formatDate,
  getEngagementTier,
} from "../utils/format.js";

/**
 * A single video metadata card.
 *
 * Props:
 *  - data: { platform, title, creator, views, likes, comments,
 *            duration, uploadDate, thumbnail, engagementRate }
 *  - namespace: string — Pinecone namespace for this video
 */
function VideoCard({ data, namespace }) {
  const erTier = getEngagementTier(data.engagementRate || 0);
  const isYt = data.platform === "youtube";

  return (
    <div className={`video-card ${isYt ? "youtube" : "instagram"}`}>
      {/* Header row */}
      <div className="video-card-header">
        {data.thumbnail ? (
          <img
            className="video-thumbnail"
            src={data.thumbnail}
            alt={data.title}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling?.style?.removeProperty("display");
            }}
          />
        ) : null}
        <div
          className="video-thumb-placeholder"
          style={{ display: data.thumbnail ? "none" : "flex" }}
        >
          {isYt ? "▶" : "◈"}
        </div>

        <div className="video-info">
          <div className="video-title" title={data.title}>
            {data.title || "Untitled"}
          </div>
          <div className="video-creator">
            {data.creator || "Unknown"} · {formatDate(data.uploadDate)}
          </div>
        </div>

        <span className="platform-badge" style={{ flexShrink: 0 }} aria-label={data.platform}>
          {isYt ? "▶ YT" : "◈ IG"}
        </span>
      </div>

      {/* Stats grid */}
      <div className="video-stats">
        <div className="stat-item">
          <span className="stat-value">{formatNumber(data.views)}</span>
          <span className="stat-label">Views</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatNumber(data.likes)}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatNumber(data.comments)}</span>
          <span className="stat-label">Comments</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatDuration(data.duration)}</span>
          <span className="stat-label">Duration</span>
        </div>
        <div className="stat-item" style={{ gridColumn: "2 / -1" }}>
          <span className="stat-value">
            <span className={`engagement-badge ${erTier}`}>
              {data.engagementRate ?? "—"}% ER
            </span>
          </span>
          <span className="stat-label">Engagement</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats section rendered after successful analysis.
 *
 * Props:
 *  - analysisData: { youtube, instagram, namespaces }
 */
export default function StatsPanel({ analysisData }) {
  if (!analysisData) return null;

  const { youtube, instagram, namespaces } = analysisData;

  return (
    <>
      <hr className="divider" />

      <div className="section-header">
        <span className="section-dot" style={{ background: "var(--accent-green)" }} />
        <span className="section-title">Analysis Results</span>
      </div>

      <div className="stats-section">
        {youtube?.metadata && (
          <VideoCard data={youtube.metadata} namespace={namespaces?.youtube} />
        )}
        {instagram?.metadata && (
          <VideoCard data={instagram.metadata} namespace={namespaces?.instagram} />
        )}
      </div>

      {/* Pinecone namespace info */}
      {namespaces && (
        <div className="namespace-tag">
          <span>🗂</span>
          <span>
            Indexed as{" "}
            <code>{namespaces.youtube}</code> &amp;{" "}
            <code>{namespaces.instagram}</code>
          </span>
        </div>
      )}
    </>
  );
}
