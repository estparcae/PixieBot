import { Index } from "@upstash/vector";
import type { Chunk } from "./chunker";

export interface VectorMetadata {
  text: string;
  section: string;
  index: number;
  [key: string]: string | number;
}

const index = new Index<VectorMetadata>({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function upsertChunks(
  chunks: Chunk[],
  embeddings: number[][]
): Promise<void> {
  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: embeddings[i],
    metadata: {
      text: chunk.text,
      section: chunk.metadata.section,
      index: chunk.metadata.index,
    },
  }));

  // Upsert in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert(batch);
  }
}

export async function searchSimilar(
  queryEmbedding: number[],
  topK: number = 5
): Promise<{ text: string; section: string; score: number }[]> {
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results
    .filter((r) => r.metadata)
    .map((r) => ({
      text: r.metadata!.text as string,
      section: r.metadata!.section as string,
      score: r.score,
    }));
}

export async function deleteAll(): Promise<void> {
  await index.reset();
}

export async function getStats(): Promise<{ vectorCount: number }> {
  const info = await index.info();
  return { vectorCount: info.vectorCount };
}

export { index };
