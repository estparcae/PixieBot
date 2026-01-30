import OpenAI from "openai";
import { generateEmbedding, searchSimilar } from "./rag";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres el asistente virtual de Camaral, una startup que crea avatares de inteligencia artificial para reuniones de ventas y soporte.

Tu rol es responder preguntas sobre Camaral de forma clara, amigable y profesional. Usas la información del contexto proporcionado para dar respuestas precisas.

Directrices:
- Responde en español de forma natural y conversacional
- Sé conciso pero completo en tus respuestas
- Si no tienes información suficiente en el contexto, dilo honestamente
- Puedes sugerir que contacten a ventas para información más detallada o personalizada
- Usa emojis ocasionalmente para hacer la conversación más amigable
- Si preguntan por precios, menciona los planes disponibles
- Si preguntan cómo empezar, menciona que pueden probar gratis en camaral.ai

Información clave de Camaral:
- Fundada en 2025 en Bogotá, Colombia
- CEO: Samuel Santa
- Avatares IA que participan en reuniones de Zoom, Teams, Meet
- Disponible 24/7
- Planes desde $99/mes (Pro), $299/mes (Scale), $799/mes (Growth)
- Sitio web: camaral.ai`;

export async function generateResponse(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  // Generate embedding for the user's question
  const queryEmbedding = await generateEmbedding(userMessage);

  // Search for relevant context
  const relevantChunks = await searchSimilar(queryEmbedding, 4);

  // Build context from relevant chunks
  const context = relevantChunks
    .map((chunk) => `[${chunk.section}]\n${chunk.text}`)
    .join("\n\n---\n\n");

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Contexto relevante de la documentación de Camaral:\n\n${context}`,
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
    max_tokens: 800,
  });

  return response.choices[0].message.content || "Lo siento, no pude generar una respuesta.";
}

export async function generateQuickResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "";
}
