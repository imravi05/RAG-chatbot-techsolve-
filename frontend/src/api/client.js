const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

/**
 * Analyze both videos — download, transcribe, embed, store in Pinecone.
 * @param {string} youtubeUrl
 * @param {string} instagramUrl
 * @returns {Promise<object>} - metadata, transcripts, namespaces
 */
export const analyzeVideos = async (youtubeUrl, instagramUrl) => {
  const res = await fetch(`${BASE_URL}/videos/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtubeUrl, instagramUrl }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to analyze videos");
  }

  return data;
};

/**
 * Ask a question and get a RAG-powered answer.
 * @param {string} question
 * @param {string|null} namespace - optional Pinecone namespace to scope search
 * @returns {Promise<{ answer: string, sources: object[], question: string }>}
 */
export const askQuestion = async (question, namespace = null) => {
  const body = { question };
  if (namespace) body.namespace = namespace;

  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to get answer");
  }

  return data;
};

/**
 * Health check
 */
export const healthCheck = async () => {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
};
