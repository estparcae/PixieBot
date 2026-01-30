import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import {
  chunkDocument,
  generateEmbeddings,
  upsertChunks,
  deleteAll,
  getStats,
} from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    // Check for API key authorization (simple security)
    const authHeader = req.headers.get("authorization");
    const expectedKey = process.env.OPENAI_API_KEY?.slice(0, 20);

    if (!authHeader || !authHeader.includes(expectedKey || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the document
    const docPath = join(process.cwd(), "investigacion.md");
    const document = readFileSync(docPath, "utf-8");

    // Chunk the document
    const chunks = chunkDocument(document, "camaral");

    console.log(`Created ${chunks.length} chunks`);

    // Generate embeddings for all chunks
    const texts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(texts);

    console.log(`Generated ${embeddings.length} embeddings`);

    // Clear existing vectors and upsert new ones
    await deleteAll();
    await upsertChunks(chunks, embeddings);

    // Get stats
    const stats = await getStats();

    return NextResponse.json({
      ok: true,
      message: "Document indexed successfully",
      chunks: chunks.length,
      vectorCount: stats.vectorCount,
    });
  } catch (error) {
    console.error("Indexing error:", error);
    return NextResponse.json(
      { error: "Failed to index document", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({
      ok: true,
      status: "Index endpoint ready",
      vectorCount: stats.vectorCount,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: String(error),
    });
  }
}
