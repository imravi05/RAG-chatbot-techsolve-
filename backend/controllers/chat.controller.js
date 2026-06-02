import { askQuestion } from "../services/rag.service.js";

/**
 * POST /api/v1/chat
 * Body: { question: string, namespace?: string }
 *
 * Accepts a natural language question and optional Pinecone namespace.
 * Runs the full RAG pipeline and returns the AI-generated answer + sources.
 */
export const chatWithVideos = async (req, res) => {
  try {
    const { question, namespace } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty 'question' field is required.",
      });
    }

    const { answer, sources } = await askQuestion(
      question.trim(),
      namespace || null
    );

    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer,
      sources,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
