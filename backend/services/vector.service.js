import { index } from "./pinecone.service.js";
import { generateEmbedding } from "./embedding.service.js";

/**
 * Embeds each text chunk and upserts into Pinecone.
 *
 * Pinecone SDK v7 upsert API:
 *   index.upsert({ records: [...], namespace?: string })
 *
 * @param {Array<{text: string, metadata: {videoId: string, chunkIndex: number}}>} chunks
 * @param {string} namespace - Pinecone namespace to isolate this video's vectors
 */
export const storeChunks = async (chunks, namespace) => {
  console.log(`[vector] Storing ${chunks.length} chunks in namespace: "${namespace}"`);

  const vectors = [];

  for (const chunk of chunks) {
    console.log(`[vector] Embedding chunk ${chunk.metadata.chunkIndex}/${chunks.length}`);

    const embedding = await generateEmbedding(chunk.text);

    vectors.push({
      id: `${namespace}-chunk-${chunk.metadata.chunkIndex}`,
      values: Array.from(embedding), // ensure plain JS array, not typed array
      metadata: {
        text: chunk.text,
        videoId: chunk.metadata.videoId,
        chunkIndex: chunk.metadata.chunkIndex,
        namespace,
      },
    });
  }

  console.log(`[vector] Upserting ${vectors.length} vectors to Pinecone (namespace: "${namespace}")...`);

  // Upsert in batches of 100 to stay within Pinecone limits.
  // SDK v7 requires: index.upsert({ records: [...], namespace? })
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert({ records: batch, namespace });
  }

  console.log(`[vector] ✅ Upsert complete for namespace: "${namespace}"`);
};