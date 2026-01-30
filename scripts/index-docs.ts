import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables FIRST
config({ path: ".env.local" });

async function main() {
  console.log("🚀 Starting document indexing...\n");

  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!process.env.UPSTASH_VECTOR_REST_URL) {
    throw new Error("UPSTASH_VECTOR_REST_URL is not set");
  }

  // Dynamic import AFTER env vars are loaded
  const { chunkDocument, generateEmbeddings, upsertChunks, deleteAll, getStats } = await import(
    "../src/lib/rag"
  );

  // Read the document
  const docPath = join(process.cwd(), "investigacion.md");
  console.log(`📄 Reading document from: ${docPath}`);

  const document = readFileSync(docPath, "utf-8");
  console.log(`   Document length: ${document.length} characters\n`);

  // Chunk the document
  console.log("✂️  Chunking document...");
  const chunks = chunkDocument(document, "camaral");
  console.log(`   Created ${chunks.length} chunks\n`);

  // Show chunk preview
  console.log("📋 Chunk preview:");
  for (let i = 0; i < Math.min(3, chunks.length); i++) {
    console.log(
      `   [${i}] ${chunks[i].metadata.section.slice(0, 40)}... (${chunks[i].text.length} chars)`
    );
  }
  console.log();

  // Generate embeddings
  console.log("🧠 Generating embeddings with OpenAI...");
  const texts = chunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(texts);
  console.log(`   Generated ${embeddings.length} embeddings (dim: ${embeddings[0].length})\n`);

  // Clear and upsert
  console.log("🗑️  Clearing existing vectors...");
  await deleteAll();

  console.log("📤 Upserting vectors to Upstash...");
  await upsertChunks(chunks, embeddings);

  // Verify
  console.log("✅ Verifying...");
  // Wait a moment for Upstash to sync
  await new Promise((r) => setTimeout(r, 2000));
  const stats = await getStats();
  console.log(`   Vector count: ${stats.vectorCount}\n`);

  console.log("🎉 Indexing complete!");
  console.log(`   Total chunks indexed: ${chunks.length}`);
  console.log(`   Vectors in database: ${stats.vectorCount}`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
