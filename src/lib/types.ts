/**
 * Tipos centralizados para el bot de Camaral
 */

// Tipos para el historial de conversación
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export type ConversationHistory = ConversationMessage[];

// Tipos para RAG
export interface Chunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  section: string;
  index: number;
  charStart: number;
  charEnd: number;
}

export interface SearchResult {
  text: string;
  section: string;
  score: number;
}

// Tipos para el vector store
export interface VectorMetadata {
  text: string;
  section: string;
  index: number;
  [key: string]: string | number;
}

// Tipos para respuestas de la API
export interface WebhookResponse {
  ok: boolean;
  bot?: string;
  status?: string;
  timestamp?: string;
  error?: string;
  details?: string;
  env?: {
    telegram: boolean;
    openai: boolean;
    upstash: boolean;
  };
}

export interface IndexResponse {
  ok: boolean;
  message?: string;
  chunks?: number;
  vectorCount?: number;
  error?: string;
  details?: string;
}

// Tipos para Telegram
export interface TelegramFileInfo {
  ok: boolean;
  result?: {
    file_path?: string;
  };
}
