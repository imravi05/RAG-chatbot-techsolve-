/**
 * Format a large number to a compact string.
 * e.g. 1234567 → "1.2M"
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return "—";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};

/**
 * Format seconds into mm:ss or h:mm:ss
 */
export const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * Format upload date from yt-dlp (YYYYMMDD) to readable string.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const str = String(dateStr);
  if (str.length === 8) {
    const y = str.slice(0, 4);
    const m = str.slice(4, 6);
    const d = str.slice(6, 8);
    return new Date(`${y}-${m}-${d}`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return dateStr;
};

/**
 * Classify engagement rate into tier.
 */
export const getEngagementTier = (rate) => {
  if (rate >= 5) return "high";
  if (rate >= 2) return "medium";
  return "low";
};

/**
 * Get current time string HH:MM
 */
export const getTimeString = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Scroll element to bottom
 */
export const scrollToBottom = (el) => {
  if (el) el.scrollTop = el.scrollHeight;
};
