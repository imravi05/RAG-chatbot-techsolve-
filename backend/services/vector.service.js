import { randomUUID }
from "crypto";

import { index }
from "./pinecone.service.js";

import { generateEmbedding }
from "./embedding.service.js";

export const storeChunks = async (chunks) => {

  console.log("Chunks received:", chunks.length);

  const vectors = [];

  for (const chunk of chunks) {

    console.log(
      "Embedding chunk:",
      chunk.metadata.chunkIndex
    );

    const embedding =
      await generateEmbedding(
        chunk.text
      );

    console.log(
      "Embedding size:",
      embedding?.length
    );

    vectors.push({
      id: crypto.randomUUID(),
      values: embedding,
      metadata: {
        text: chunk.text,
        videoId: chunk.metadata.videoId,
        chunkIndex: chunk.metadata.chunkIndex
      }
    });
  }

  console.log(
    "Vectors created:",
    vectors.length
  );

  await index.upsert(vectors);
};