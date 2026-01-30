export interface Chunk {
  id: string;
  text: string;
  metadata: {
    section: string;
    index: number;
    charStart: number;
    charEnd: number;
  };
}

const CHUNK_SIZE = 1500; // ~375 tokens approx (4 chars per token)
const CHUNK_OVERLAP = 200;

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

export function chunkDocument(text: string, docId: string = "camaral"): Chunk[] {
  const chunks: Chunk[] = [];

  // Split by double newlines to preserve paragraph structure
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";
  let currentSection = "Introducción";
  let chunkIndex = 0;
  let charPosition = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Detect section headers (lines that look like titles)
    if (
      trimmed.startsWith("¿") ||
      trimmed.endsWith("?") ||
      (trimmed.length < 80 && !trimmed.includes("."))
    ) {
      currentSection = trimmed.slice(0, 60);
    }

    // If adding this paragraph exceeds chunk size, save current and start new
    if (currentChunk.length + trimmed.length > CHUNK_SIZE && currentChunk.length > 0) {
      const charStart = charPosition - currentChunk.length;
      chunks.push({
        id: `${docId}-${chunkIndex}`,
        text: currentChunk.trim(),
        metadata: {
          section: currentSection,
          index: chunkIndex,
          charStart,
          charEnd: charPosition,
        },
      });
      chunkIndex++;

      // Keep overlap from end of previous chunk
      const overlapText = currentChunk.slice(-CHUNK_OVERLAP);
      currentChunk = overlapText + "\n\n" + trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }

    charPosition += trimmed.length + 2;
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      id: `${docId}-${chunkIndex}`,
      text: currentChunk.trim(),
      metadata: {
        section: currentSection,
        index: chunkIndex,
        charStart: charPosition - currentChunk.length,
        charEnd: charPosition,
      },
    });
  }

  return chunks;
}

export function chunkDocumentBySections(text: string, docId: string = "camaral"): Chunk[] {
  const sections = text.split(/(?=\n(?:¿|[A-Z][a-záéíóú]+\s))/);
  const chunks: Chunk[] = [];
  let charPosition = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const sectionTitle = extractSectionTitle(section);

    // If section is too long, split it further
    if (section.length > CHUNK_SIZE) {
      const subChunks = chunkDocument(section, `${docId}-s${i}`);
      for (const subChunk of subChunks) {
        subChunk.metadata.section = sectionTitle;
        chunks.push(subChunk);
      }
    } else {
      chunks.push({
        id: `${docId}-${i}`,
        text: section,
        metadata: {
          section: sectionTitle,
          index: i,
          charStart: charPosition,
          charEnd: charPosition + section.length,
        },
      });
    }

    charPosition += section.length;
  }

  return chunks;
}
