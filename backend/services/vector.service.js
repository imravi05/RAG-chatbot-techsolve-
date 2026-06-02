import { index } from "./pinecone.service.js";
import { generateEmbedding } from "./embedding.service.js";

/**
 * Embeds each text chunk and upserts into Pinecone.
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
      values: embedding,
      metadata: {
        text: chunk.text,
        videoId: chunk.metadata.videoId,
        chunkIndex: chunk.metadata.chunkIndex,
        namespace,
      },
    });
  }

  console.log(`[vector] Upserting ${vectors.length} vectors to Pinecone...`);

  // Upsert in batches of 100 to stay within Pinecone limits
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.namespace(namespace).upsert(batch);
  }

  console.log(`[vector] ✅ Upsert complete for namespace: "${namespace}"`);
};