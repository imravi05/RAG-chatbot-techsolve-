import { GoogleGenAI } from "@google/genai";
import { generateEmbedding } from "./embedding.service.js";
import { index } from "./pinecone.service.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Query Pinecone for the top-k most similar chunks to the question.
 * If a namespace is provided, search only within that namespace.
 * Otherwise search across all vectors.
 *
 * @param {number[]} queryVector - The embedding of the user question
 * @param {string|null} namespace - Pinecone namespace (e.g. videoId)
 * @param {number} topK - Number of results to fetch
 */
export const searchVectors = async (queryVector, namespace = null, topK = 6) => {
  // Pinecone SDK v7 query options — namespace is an inline field
  const queryOptions = {
    vector: Array.from(queryVector), // ensure plain JS array
    topK,
    includeMetadata: true,
  };

  if (namespace) {
    queryOptions.namespace = namespace;
  }

  const results = await index.query(queryOptions);
  return results.matches || [];
};

/**
 * Build a prompt that instructs Gemini to answer only from the provided context.
 */
const buildPrompt = (question, contextChunks) => {
  const contextText = contextChunks
    .map((match, i) => {
      const src = match.metadata?.videoId || "unknown";
      return `[Chunk ${i + 1} | Source: ${src}]\n${match.metadata?.text || ""}`;
    })
    .join("\n\n---\n\n");

  return `You are TechSolve AI, an intelligent assistant that answers questions based exclusively on video transcript content.

CONTEXT (extracted from video transcripts):
${contextText}

---

USER QUESTION: ${question}

INSTRUCTIONS:
- Answer the question using ONLY the information in the context above.
- If the answer is not found in the context, say: "I couldn't find that information in the provided videos."
- Be concise, helpful, and conversational.
- If content from multiple videos is relevant, compare or reference both.
- Do NOT make up information not present in the context.

ANSWER:`;
};

/**
 * Main RAG function — orchestrates: embed → search → generate.
 *
 * @param {string} question - User's natural language question
 * @param {string|null} namespace - Optional Pinecone namespace to scope the search
 * @returns {{ answer: string, sources: object[] }}
 */
export const askQuestion = async (question, namespace = null) => {
  // 1. Embed the user's question
  const questionVector = await generateEmbedding(question);

  // 2. Retrieve top-k relevant chunks from Pinecone
  const matches = await searchVectors(questionVector, namespace, 6);

  if (!matches.length) {
    return {
      answer:
        "No relevant content found. Please make sure you've analyzed some videos first.",
      sources: [],
    };
  }

  // 3. Build prompt with retrieved context
  const prompt = buildPrompt(question, matches);

  // 4. Generate answer with Gemini
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const answer = response.text?.trim() || "Sorry, I could not generate an answer.";

  // 5. Return answer + deduplicated source metadata
  const sources = matches.map((m) => ({
    videoId: m.metadata?.videoId,
    chunkIndex: m.metadata?.chunkIndex,
    score: m.score,
    snippet: m.metadata?.text?.slice(0, 150) + "...",
  }));

  return { answer, sources };
};
