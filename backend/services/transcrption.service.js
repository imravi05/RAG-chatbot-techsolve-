import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export const transcribeAudio = async (audioUrl) => {
  try {
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
    });

    return {
      text: transcript.text,
      confidence: transcript.confidence,
      words: transcript.words,
    };
  } catch (error) {
    console.error("AssemblyAI Error:", error);
    throw error;
  }
};