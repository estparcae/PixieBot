/**
 * Módulo de embeddings para generación de vectores con OpenAI
 */

import OpenAI from "openai";
import { AI_CONFIG } from "../config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } = AI_CONFIG;
const BATCH_SIZE = 100;

/**
 * Genera un embedding para un texto individual
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

/**
 * Genera embeddings para múltiples textos en batches
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    for (const item of response.data) {
      embeddings.push(item.embedding);
    }
  }

  return embeddings;
}

export { EMBEDDING_DIMENSIONS };
