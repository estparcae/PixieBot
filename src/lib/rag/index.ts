/**
 * Módulo RAG (Retrieval-Augmented Generation)
 *
 * Exporta funcionalidades para:
 * - Chunking de documentos
 * - Generación de embeddings
 * - Búsqueda vectorial
 */

export { chunkDocument, chunkDocumentBySections } from "./chunker";
export type { Chunk, ChunkMetadata } from "./chunker";

export { generateEmbedding, generateEmbeddings, EMBEDDING_DIMENSIONS } from "./embeddings";

export { upsertChunks, searchSimilar, deleteAll, getStats } from "./vectorStore";
