/**
 * Módulo de chunking para dividir documentos en segmentos procesables
 */

import { RAG_CONFIG } from "../config";
import type { Chunk, ChunkMetadata } from "../types";

const { CHUNK_SIZE, CHUNK_OVERLAP } = RAG_CONFIG;

/**
 * Extrae el título de una sección del texto
 */
function extractSectionTitle(text: string): string {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 100) {
      return trimmed.replace(/^#+\s*/, "");
    }
  }
  return "General";
}

/**
 * Divide un documento en chunks con overlap
 */
export function chunkDocument(text: string, docId: string = "camaral"): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";
  let currentSection = "Introducción";
  let chunkIndex = 0;
  let charPosition = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Detectar headers de sección
    if (
      trimmed.startsWith("¿") ||
      trimmed.endsWith("?") ||
      (trimmed.length < 80 && !trimmed.includes("."))
    ) {
      currentSection = trimmed.slice(0, 60);
    }

    // Si excede el tamaño, guardar chunk actual y comenzar nuevo
    if (currentChunk.length + trimmed.length > CHUNK_SIZE && currentChunk.length > 0) {
      const charStart = charPosition - currentChunk.length;

      chunks.push(createChunk(docId, chunkIndex, currentChunk.trim(), currentSection, charStart, charPosition));
      chunkIndex++;

      // Mantener overlap del chunk anterior
      const overlapText = currentChunk.slice(-CHUNK_OVERLAP);
      currentChunk = overlapText + "\n\n" + trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }

    charPosition += trimmed.length + 2;
  }

  // No olvidar el último chunk
  if (currentChunk.trim()) {
    chunks.push(createChunk(
      docId,
      chunkIndex,
      currentChunk.trim(),
      currentSection,
      charPosition - currentChunk.length,
      charPosition
    ));
  }

  return chunks;
}

/**
 * Crea un objeto Chunk con metadata
 */
function createChunk(
  docId: string,
  index: number,
  text: string,
  section: string,
  charStart: number,
  charEnd: number
): Chunk {
  return {
    id: `${docId}-${index}`,
    text,
    metadata: {
      section,
      index,
      charStart,
      charEnd,
    },
  };
}

/**
 * Divide un documento por secciones semánticas
 */
export function chunkDocumentBySections(text: string, docId: string = "camaral"): Chunk[] {
  const sections = text.split(/(?=\n(?:¿|[A-Z][a-záéíóú]+\s))/);
  const chunks: Chunk[] = [];
  let charPosition = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const sectionTitle = extractSectionTitle(section);

    if (section.length > CHUNK_SIZE) {
      const subChunks = chunkDocument(section, `${docId}-s${i}`);
      for (const subChunk of subChunks) {
        subChunk.metadata.section = sectionTitle;
        chunks.push(subChunk);
      }
    } else {
      chunks.push(createChunk(docId, i, section, sectionTitle, charPosition, charPosition + section.length));
    }

    charPosition += section.length;
  }

  return chunks;
}

export type { Chunk, ChunkMetadata };
