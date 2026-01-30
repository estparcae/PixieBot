/**
 * Módulo de vector store para Upstash Vector
 */

import { Index } from "@upstash/vector";
import type { Chunk, VectorMetadata, SearchResult } from "../types";
import { RAG_CONFIG } from "../config";

const index = new Index<VectorMetadata>({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const BATCH_SIZE = 100;

/**
 * Inserta chunks con sus embeddings en el vector store
 */
export async function upsertChunks(chunks: Chunk[], embeddings: number[][]): Promise<void> {
  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: embeddings[i],
    metadata: {
      text: chunk.text,
      section: chunk.metadata.section,
      index: chunk.metadata.index,
    },
  }));

  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert(batch);
  }
}

/**
 * Busca chunks similares a un query embedding
 */
export async function searchSimilar(
  queryEmbedding: number[],
  topK: number = RAG_CONFIG.TOP_K_RESULTS
): Promise<SearchResult[]> {
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

/**
 * Elimina todos los vectores del índice
 */
export async function deleteAll(): Promise<void> {
  await index.reset();
}

/**
 * Obtiene estadísticas del índice
 */
export async function getStats(): Promise<{ vectorCount: number }> {
  const info = await index.info();
  return { vectorCount: info.vectorCount };
}

export { index };
