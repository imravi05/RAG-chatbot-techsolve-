import { getYoutubeMetadata } from "../services/youtube.service.js";
import { getInstagramMetadata } from "../services/instagram.service.js";
import { calculateEngagementRate } from "../services/engament.service.js";
import { getTranscript } from "../services/transcript.service.js";
import { chunkTranscript } from "../services/chunking.service.js";
import { storeChunks } from "../services/vector.service.js";

/**
 * Extract a short, filesystem-safe ID from a video URL for use as a
 * Pinecone namespace and download filename.
 *
 * Handles:
 *  - youtube.com/watch?v=ID          → "yt-ID"
 *  - youtube.com/shorts/ID           → "yt-ID"
 *  - youtu.be/ID                     → "yt-ID"
 *  - instagram.com/reel/SHORTCODE/   → "ig-SHORTCODE"
 *  - instagram.com/p/SHORTCODE/      → "ig-SHORTCODE"
 */
const extractVideoId = (url, platform) => {
  /** Strip characters that are unsafe in filenames / Pinecone namespaces */
  const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);

  try {
    const parsed = new URL(url);

    if (platform === "youtube") {
      // Standard watch URL: ?v=ID
      const v = parsed.searchParams.get("v");
      if (v) return `yt-${sanitize(v)}`;

      // YouTube Shorts: /shorts/ID
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?#]+)/);
      if (shortsMatch) return `yt-${sanitize(shortsMatch[1])}`;

      // Short link: youtu.be/ID
      if (parsed.hostname === "youtu.be") {
        const id = parsed.pathname.replace(/^\//, "").split("?")[0];
        if (id) return `yt-${sanitize(id)}`;
      }

      // Generic YouTube path fallback (e.g. embedded /v/ID)
      const ytPathMatch = parsed.pathname.match(/\/(?:v|e|embed)\/([^/?#]+)/);
      if (ytPathMatch) return `yt-${sanitize(ytPathMatch[1])}`;
    }

    if (platform === "instagram") {
      // /reel/SHORTCODE/ or /p/SHORTCODE/
      const match = parsed.pathname.match(/\/(reel|p)\/([^/?#]+)/);
      if (match) return `ig-${sanitize(match[2])}`;
    }
  } catch (_) { /* fall through to fallback */ }

  // Fallback: base64 of URL, stripped of non-filename-safe chars
  const b64 = Buffer.from(url).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  return `${platform}-${b64}`;
};

/**
 * POST /api/v1/videos/analyze
 * Body: { youtubeUrl: string, instagramUrl: string }
 *
 * Downloads, transcribes, embeds, and stores both videos.
 * Returns metadata, engagement rates, transcripts, and the
 * Pinecone namespaces to use for subsequent chat queries.
 */
export const analyzeVideos = async (req, res) => {
  try {
    const { youtubeUrl, instagramUrl } = req.body;

    if (!youtubeUrl || !instagramUrl) {
      return res.status(400).json({
        success: false,
        message: "Both 'youtubeUrl' and 'instagramUrl' are required.",
      });
    }

    // ── 1. Fetch metadata ──────────────────────────────────────────────────
    console.log("[analyze] Fetching metadata...");
    const [youtubeData, instagramData] = await Promise.all([
      getYoutubeMetadata(youtubeUrl),
      getInstagramMetadata(instagramUrl),
    ]);

    // ── 2. Engagement rates ────────────────────────────────────────────────
    youtubeData.engagementRate = calculateEngagementRate(
      youtubeData.views,
      youtubeData.likes,
      youtubeData.comments
    );
    instagramData.engagementRate = calculateEngagementRate(
      instagramData.views,
      instagramData.likes,
      instagramData.comments
    );

    // ── 3. Derive stable namespaces ────────────────────────────────────────
    const youtubeNS  = extractVideoId(youtubeUrl,  "youtube");
    const instagramNS = extractVideoId(instagramUrl, "instagram");

    console.log(`[analyze] Namespaces → youtube: ${youtubeNS}, instagram: ${instagramNS}`);

    // ── 4. Download + transcribe both videos ──────────────────────────────
    console.log("[analyze] Downloading & transcribing videos...");
    const [youtubeTranscript, instagramTranscript] = await Promise.all([
      getTranscript(youtubeUrl,   youtubeNS),
      getTranscript(instagramUrl, instagramNS),
    ]);

    // ── 5. Chunk transcripts ───────────────────────────────────────────────
    console.log("[analyze] Chunking transcripts...");
    const [youtubeChunks, instagramChunks] = await Promise.all([
      chunkTranscript(youtubeTranscript.text,   youtubeNS),
      chunkTranscript(instagramTranscript.text, instagramNS),
    ]);

    // ── 6. Store in Pinecone (namespaced) ─────────────────────────────────
    console.log("[analyze] Storing vectors in Pinecone...");
    await Promise.all([
      storeChunks(youtubeChunks,   youtubeNS),
      storeChunks(instagramChunks, instagramNS),
    ]);

    // ── 7. Respond ─────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      namespaces: {
        youtube:   youtubeNS,
        instagram: instagramNS,
      },
      youtube: {
        metadata:   youtubeData,
        transcript: youtubeTranscript,
        chunks:     youtubeChunks.length,
      },
      instagram: {
        metadata:   instagramData,
        transcript: instagramTranscript,
        chunks:     instagramChunks.length,
      },
    });

  } catch (error) {
    console.error("[analyze] Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};